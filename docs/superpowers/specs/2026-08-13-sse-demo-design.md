# SSE 实战 Demo 设计文档

> 创建日期:2026-08-13
> 目的:配合「轮询 vs SSE」学习,在 next-demo 项目中搭建一个可运行的 SSE 演示页

---

## 1. 目标与范围

### 目标
做一个**可运行的 SSE 学习页**,放在现有 dashboard 布局里,让学习者能边跑边对照 SSE 协议。包含两个真实 SSE 端点 + 一个演示页 + 一份中文讲解文档。

### 在范围内
- SSE 端点①:复用 Invoice 数据,模拟「最新发票到达」通知
- SSE 端点②:模拟 AI 打字机流式输出
- 演示页:订阅两个端点,展示实时数据 + 连接状态
- 配套文档 `docs/13-SSE实战指南.md`

### 不在范围内(明确排除)
- 真接大模型 API(改用模拟打字机)
- WebSocket
- 移动端/响应式适配(遵循「只做桌面」偏好)
- 生产部署(Serverless 连接会被限时杀掉,仅本地 `next dev` 演示)

---

## 2. 文件结构

```
app/api/sse/invoices/route.ts     ← SSE 端点①:Invoice 通知(复用 Prisma)
app/api/sse/ai-stream/route.ts    ← SSE 端点②:模拟打字机
app/dashboard/sse-demo/page.tsx   ← 演示页('use client')
docs/13-SSE实战指南.md             ← 配套中文讲解
```

- 路由 `/dashboard/sse-demo`,继承现有 `app/dashboard/layout.tsx` 的 sidebar + header 布局
- 导航入口**暂不加**(避免改动现有 `nav-links.tsx`),直接访问 URL

---

## 3. SSE 端点①:`/api/sse/invoices`(复用 Invoice)

### 职责
每隔约 4 秒查一次最新 Invoice 并 push,模拟「新发票到达」通知。

### 技术要点
- `export async function GET()` 返回 `new Response(ReadableStream, { headers })`
- headers:`Content-Type: text/event-stream` / `Cache-Control: no-cache, no-transform` / `Connection: keep-alive`
- 用 `prisma.invoice.findFirst({ orderBy: { createdAt: 'desc' }})` 取最新发票

### SSE 协议要素(留 TODO 给学习者填)
- `data: ${JSON.stringify(...)}\n\n` —— 核心消息格式
- `id: <自增序号>\n` —— 用于演示 Last-Event-ID 重连补发
- `retry: 3000\n` —— 服务器指定重连间隔
- 心跳注释行 `: ping\n\n`(每 ~25 秒,防代理超时断连)

### 断线演示
每推 3 条主动 `controller.close()` 一次 → 浏览器自动重连 → UI 上可观察到状态 OPEN→CONNECTING→OPEN;因消息带 `id:`,可演示 Last-Event-ID 补发机制。

### 资源清理
`ReadableStream` 的 `cancel()` 中 `clearInterval` 所有定时器(防内存泄漏)。

---

## 4. SSE 端点②:`/api/sse/ai-stream`(模拟打字机)

### 职责
预设一段中文回答,按字符(或词)每 ~50ms push 一次,呈现打字机效果。

### 技术要点
- 同样返回 `text/event-stream` 流
- 预设文本存为常量
- 切片循环逐字 push:`data: {"delta":"字"}\n\n`
- 结束推 `data: [DONE]\n\n`(致敬 OpenAI 流式格式)

### 留 TODO
- 字符切片循环 + delta JSON 格式拼装

---

## 5. 演示页 `app/dashboard/sse-demo/page.tsx`

### 整体
`'use client'`(EventSource 只能在浏览器跑),使用 shadcn Card 划分三个区块。

### 区块 1:实时发票通知
- `useRef` 持有 EventSource(StrictMode 双连接防护)
- `useEffect` 建连,`return () => source.close()` 清理
- 展示:收到的发票列表 + 连接状态徽章(OPEN 绿 / CONNECTING 黄 / CLOSED 灰)+ 最后消息 id
- `onmessage` 解析数据并 setState(留 TODO)

### 区块 2:AI 流式回答
- 「生成回答」按钮 → 开 EventSource 订阅端点②
- 打字机效果:每收到 delta 就 append
- 收到 `[DONE]` 后显示完整文本 + 停止指示

### 区块 3:说明卡
简短点出本页演示的 4 个概念:心跳 / 自动重连 / Last-Event-ID / 单向推送,引导对照代码。

---

## 6. TODO 划分(遵循「脚手架 + 学习者填逻辑」偏好)

### 我(助手)写
- 全部文件骨架
- UI:Card / 按钮 / 状态徽章 / 列表渲染
- EventSource 建连与 `close()` 清理
- StrictMode 双连接防护(useRef)
- ReadableStream 框架、定时器、`cancel()` 清理
- Prisma 查询调用

### 留给学习者填(SSE 核心知识点,配中文注释提示)
- 端点①:`data:\n\n` 格式、`id:`、`retry:`、心跳注释行
- 端点②:字符切片 + delta JSON
- 页面:`onmessage` 里解析数据并 setState

---

## 7. 已识别的坑及规避

| 坑 | 规避方式 |
|----|---------|
| Route Handler 含 JSX 需 `.tsx` | SSE 端点无 JSX,用 `.ts` |
| `'use client'` 不能 async | 页面同步,数据走 EventSource |
| React 19 StrictMode 双连接 | `useRef` 持有 EventSource |
| Serverless 连接限时 | 仅本地 `next dev` 演示,文档说明 |
| 文档命名/位置 | 中文命名放 `docs/`(贴合现有 12 篇指南) |
| 内存泄漏 | `cancel()` + `useEffect` return 清理定时器 |

---

## 8. 验收标准

1. `pnpm tsc` 无类型错误
2. 访问 `/dashboard/sse-demo` 能看到三块卡片
3. 区块 1 每 ~4 秒出现新发票,状态徽章随断线演示变色
4. 区块 2 点按钮后呈现打字机效果,结束显示完整文本
5. 学习者按 TODO 提示填完核心协议代码后,功能正常
