# 13. SSE 实战指南

> 本项目在 `/dashboard/sse-demo` 搭了一个可运行的 SSE 演示页。
> 这份文档从零讲解 SSE 是什么、协议怎么工作、服务端和前端怎么写，假设你只写过普通的 `fetch` 接口，没接触过服务器推送。
> 风格和前 12 篇一致：前端类比 + 表格 + 逐段代码导览。

---

## 一、SSE 是什么

**一句话：服务器通过一条「永远不结束的 HTTP 响应」单向把数据推给浏览器。**

先和你最熟悉的两种方式对比。假设要做「订单通知」——有新订单时页面实时刷新：

### 方式 1：轮询（Polling）

前端用 `setInterval` 每隔几秒主动问一次：

```js
setInterval(async () => {
  const res = await fetch('/api/orders/latest');
  const data = await res.json();
  if (data.newOrder) updateUI(data.newOrder);
}, 3000);
```

- 优点：超简单，就是普通 HTTP 请求，前后端都没新东西。
- 缺点：**有延迟**（最坏要等一个完整轮询周期）、**浪费请求**（90% 的请求返回「没新数据」）。

### 方式 2：SSE（Server-Sent Events）

服务器有新数据时**主动推**过来：

```js
const source = new EventSource('/api/orders/stream');
source.onmessage = (e) => {
  const data = JSON.parse(e.data);
  updateUI(data); // 服务器主动推，几乎零延迟
};
```

- 优点：**实时**、省请求、浏览器**自动重连**。
- 缺点：**单向**（只能服务器→客户端）、后端要维护长连接、实现比轮询复杂。

### 前端类比

| 方式 | 类比 |
|------|------|
| 轮询 | 你每 5 分钟主动打电话问快递员「到了吗」 |
| SSE | 快递员到了**主动打电话给你** |

核心区别就是**谁主动**。

### SSE 的三个关键词

| 关键词 | 含义 |
|--------|------|
| 基于 HTTP | 不像 WebSocket 搞新协议，就是普通 HTTP，只是响应「不结束」 |
| 单向 | 只能服务器→客户端（客户端要发消息得另开 `fetch`） |
| 推送 | 服务器有数据时主动写，客户端被动收 |

---

## 二、SSE 协议详解

SSE 之所以能工作，靠的是**一个响应头** + **一种消息格式**。这两样是浏览器和服务器之间的「约定」。

### 1. 响应头：`Content-Type: text/event-stream`

服务器返回这个头，浏览器就知道「这是个 SSE 流」，用 `EventSource` 的解析器去拆消息。写成 `text/plain` 浏览器就当普通文本，不会触发 `onmessage`。

**这是 SSE 和普通接口最直观的区别。**

### 2. 消息格式：`data: <内容>\n\n`

每条消息长这样：

```
data: {"id":1,"amount":44800}\n\n
```

- `data: ` 是协议规定的**前缀**（告诉浏览器「这是数据」）。
- `\n\n` 是**消息结束符**——浏览器看到两个换行，才知道「这条消息完了」，然后触发 `onmessage`。

> ⚠️ **漏掉 `\n\n` 是新手写 SSE 不工作的头号原因**。浏览器会一直攒着数据不触发回调，你以为接口坏了，其实只是少了结束符。

### 3. 五种字段全表

SSE 消息除了 `data`，还有 4 个可选字段。本项目端点①（`app/api/sse/invoices/route.ts`）把 5 种全用上了，是完整参考样本：

| 字段 | 例子 | 浏览器怎么处理 | 端点② | 端点① |
|------|------|----------------|-------|-------|
| `data:` | `data: {"x":1}` | 触发 `onmessage` 或命名事件回调 | ✅ | ✅ |
| `event:` | `event: invoice` | 改走 `addEventListener('invoice')` | ❌ | ✅ |
| `id:` | `id: 42` | 记住「最后 id」，重连时带上 `Last-Event-ID` | ❌ | ✅ |
| `retry:` | `retry: 3000` | 设定重连等待毫秒数 | ❌ | ✅ |
| `:` (注释) | `: ping` | 忽略（用于心跳） | ❌ | ✅ |

### 4. 一条完整的 SSE 消息长什么样

端点①推出去的真实内容（你可以用 `curl -N http://localhost:3000/api/sse/invoices` 看到）：

```
id: 1
event: invoice
data: {"id":"e6fe...","amount":44800,"status":"paid","date":"2023-09-10...","customerName":"Michael Novotny"}

```

- 三个字段各占一行，用单个 `\n` 分隔。
- 最后 `data:` 那行结尾是 `\n\n`（两个换行）——第二个 `\n` 就是消息结束符。
- 字段顺序无所谓，但 `\n\n` 必须在最后。

---

## 三、服务端怎么写（Next.js Route Handler）

### 1. `ReadableStream` 是 SSE 的心脏

**前端类比**：你用 `fetch()` 时，`res.body` 就是一个 `ReadableStream`——数据一段段流过来，你用 `getReader()` 一段段读。

SSE 干的是**相反方向**：服务器 `new ReadableStream()`，往里「塞」数据，Next.js 把这个流作为响应 body 发出去，浏览器一段段收到。

| 角色 | 普通 fetch 响应 | SSE |
|------|----------------|-----|
| 谁创建流 | 服务器 | 服务器（`new ReadableStream`） |
| 谁往里塞数据 | 服务器（一次性） | 服务器（多次，`controller.enqueue`） |
| 谁读数据 | 浏览器（`res.body.getReader()`） | 浏览器（`EventSource` 帮你读好了） |
| 何时结束 | 塞完就结束 | 不主动结束，保持连接 |

### 2. 最小骨架：端点②（打字机）

`app/api/sse/ai-stream/route.ts` 是 SSE 的最小可运行样本，30 行：

```ts
export async function GET() {
  const encoder = new TextEncoder();        // 字符串→字节（网络只传字节）
  const chars = [...ANSWER];                 // 按字符切（[... ] 能正确处理中文）
  let i = 0;
  let timer: ReturnType<typeof setInterval>; // 放外面，cancel() 才能清理

  const stream = new ReadableStream({
    start(controller) {                      // 流创建时执行一次
      timer = setInterval(() => {
        if (i < chars.length) {
          // ⭐ 核心一行：SSE 消息格式 data: ...\n\n
          const payload = `data: ${JSON.stringify({ delta: chars[i] })}\n\n`;
          controller.enqueue(encoder.encode(payload));  // 塞进流→立刻流向浏览器
          i += 1;
        } else {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          clearInterval(timer);
          controller.close();                // 关闭流，响应结束
        }
      }, 50);
    },
    cancel() {                               // 客户端断开时触发
      clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',   // ⭐ SSE 的身份证
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
```

**四件套**：流（ReadableStream）+ 塞数据（controller.enqueue）+ 格式（`data: ...\n\n`）+ 响应头（`text/event-stream`）。记住这四个，SSE 就懂了一半。

几个关键点：

- `controller.enqueue(encoder.encode(payload))` —— `enqueue` 是「往流塞数据」，塞进去的数据立刻顺着 HTTP 响应流向浏览器。`encode` 是字符串转字节。
- `controller.close()` —— 关闭流。端点②推完文本就 close（响应结束）。**端点①不会主动 close**（一直推，除了断线演示）。
- `cancel()` —— 客户端断开（关页面、`source.close()`）时触发，清理定时器防泄漏。

### 3. 完整版：端点①（invoices）

`app/api/sse/invoices/route.ts` 在端点②基础上加了 4 个协议要素。重点看新增部分：

```ts
export async function GET(request: Request) {       // ← 多了 request 参数
  const encoder = new TextEncoder();

  // ⭐ Last-Event-ID：浏览器断线重连时自动带上「最后收到的 id」
  const lastEventId = Number(request.headers.get('Last-Event-ID') || 0);
  let messageId = lastEventId;                        // 从断点续上
  let pushedSinceReconnect = 0;
  let heartbeat: ReturnType<typeof setInterval>;
  let businessTimer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      // ⭐ retry：告诉浏览器「断了之后等 3000ms 再连」
      controller.enqueue(encoder.encode('retry: 3000\n\n'));

      // ⭐ 心跳：每 25s 发注释行，防代理掐断
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 25000);

      // 业务循环：每 4s 查最新发票并推送
      businessTimer = setInterval(async () => {
        try {
          const latest = await prisma.invoice.findFirst({
            include: { customer: true },
            orderBy: { date: 'desc' },
          });
          messageId += 1;
          pushedSinceReconnect += 1;

          const data = { /* id, amount, status, date, customerName */ };

          // ⭐ 完整消息：id + event + data 三字段
          const payload =
            `id: ${messageId}\n` +
            `event: invoice\n` +
            `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));

          // ⭐ 断线演示：每推 3 条主动 close，触发浏览器自动重连
          if (pushedSinceReconnect >= 3) {
            pushedSinceReconnect = 0;
            clearInterval(heartbeat);
            clearInterval(businessTimer);
            controller.close();
          }
        } catch (err) {
          console.error('[sse/invoices] 推送失败:', err);
        }
      }, 4000);
    },
    cancel() {
      clearInterval(heartbeat);
      clearInterval(businessTimer);
    },
  });

  return new Response(stream, { /* 同端点②的三个头 */ });
}
```

新增的 4 个东西下面第四章详解。

### 4. 为什么定时器要放 `ReadableStream` 外面

`heartbeat` / `businessTimer` 声明在 `new ReadableStream(...)` **外面**，是因为 `start` 和 `cancel` 是两个不同的函数，只有外层变量两边都能访问。如果声明在 `start` 里，`cancel` 就清不到——客户端断开时定时器继续空跑，**每 4 秒查一次数据库却没人接收，这就是资源泄漏**。

> 这不是 SSE 协议要求，是 JS 闭包的常识，但 SSE 场景下特别容易踩（因为定时器是常态）。

---

## 四、四个核心机制（深入）

### 1. 心跳——防代理掐断

你的服务器和浏览器之间通常隔着 nginx、Cloudflare 等反向代理。这些代理有个习惯：**一条连接 60~100 秒没数据流过，就认为「卡死了」，主动掐断**。

但 SSE 的特点是「没新数据时就静静的」——可能 2 分钟没新发票。于是代理掐断你的连接，浏览器疯狂重连。**这是 SSE 上线后最常见的「莫名其妙断连」**。

解法：定时发「废话」保持活跃：

```ts
heartbeat = setInterval(() => {
  controller.enqueue(encoder.encode(': ping\n\n'));  // : 开头是注释，浏览器忽略
}, 25000);
```

- `:` 开头的行是 SSE 注释，浏览器直接忽略，不触发任何回调。
- 但它**走了网络**，代理看到「有数据流过」就不掐了。

**前端类比**：打电话沉默太久怕对方挂掉，你每隔一会儿说句「嗯」「啊」——内容没意义，但维持了通话。

### 2. 自动重连——浏览器内置

SSE 相比 WebSocket 的一大优势：**断线后浏览器自动重连，你几乎不用写代码**。

连接断了 → 浏览器等几秒 → 自动重新 `new EventSource(url)` → 重新订阅。本 demo 端点①每推 3 条故意 `controller.close()`，就是为了让你肉眼看到这个过程（页面徽章「已连接」→「连接中…」→「已连接」）。

> 真实项目**不会**故意 close，这里纯粹是演示。

### 3. Last-Event-ID——断点续传

连接断了，断线期间服务器推的消息客户端没收到，怎么办？SSE 的巧妙约定：

1. 服务器给每条消息带递增 `id:`。
2. 浏览器**自动记住**最后收到的 id（你不用写代码记）。
3. 重连时浏览器**自动**在新请求头里带 `Last-Event-ID: <最后那个id>`。
4. 服务器读这个头，从 id+1 续上。

端点①的开头就是这么做的：

```ts
const lastEventId = Number(request.headers.get('Last-Event-ID') || 0);
let messageId = lastEventId;  // 第一次是 0；重连带 3 就从 3 续
```

**前端类比**：像翻页加载的 cursor——「我已读到第 50 条，从 51 开始给我」。只不过这个 cursor 浏览器自动管理。

> ⚠️ 本 demo **没有真正补发漏掉的消息**（消息是循环生成的，没存储），只是让 id 连续演示机制。要真正补发，得把漏掉的消息存数据库，按 lastEventId 查出来重推。

### 4. 命名事件——一条连接传多种消息

端点②没有 `event:` 字段 → 所有消息走前端默认的 `source.onmessage`。
端点①有 `event: invoice` → 前端要用 `source.addEventListener('invoice', fn)` 才能收到。

**前端类比**：Element Plus 一个组件能发 `@change`、`@blur`、`@focus` 多种事件。`event:` 字段让一条 SSE 连接能传**多种类型**消息（`event: invoice`、`event: payment`、`event: system`），前端分流处理。如果全走 onmessage，前端得自己判断「这条是啥」，麻烦。

---

## 五、前端怎么用 EventSource

浏览器原生提供 `EventSource`，这是接触 SSE 的**唯一入口**。

### 1. 基本订阅

```js
const source = new EventSource('/api/sse/ai-stream');

source.onmessage = (e) => {       // 收到消息（默认事件）
  if (e.data === '[DONE]') {
    source.close();                // 主动关闭
    return;
  }
  const { delta } = JSON.parse(e.data);
  setText(prev => prev + delta);   // 拼接显示
};

source.onerror = () => { /* 浏览器会自动重连，这里通常只做 UI 提示 */ };
```

### 2. 命名事件

```js
const source = new EventSource('/api/sse/invoices');

// 端点①用 event: invoice 发送，所以用 addEventListener
source.addEventListener('invoice', (e) => {
  const msg = JSON.parse(e.data);
  console.log(msg.customerName, msg.amount);
  console.log('最后 id:', e.lastEventId);   // 浏览器自动维护
});
```

### 3. `readyState` 状态

```js
source.readyState
// 0 = CONNECTING  正在连接（或重连中）
// 1 = OPEN        连接已打开
// 2 = CLOSED      已关闭
```

本 demo 页面用轮询定时读 `readyState` 更新状态徽章（因为 `close()`/重连时 `onopen`/`onerror` 不一定触发）。

### 4. `close()` 清理

```js
source.close();   // 主动断开，不再重连
```

组件卸载时**必须**调，否则连接泄漏。

---

## 六、React 集成的坑

本项目的 `app/dashboard/sse-demo/page.tsx` 是 `'use client'` 组件，订阅两个端点。三个 React 特有的坑：

### 1. `'use client'` 不能 async

`EventSource` 是浏览器 API，只能在客户端跑 → 必须 `'use client'`。但 `'use client'` 组件**不能是 async**（Next.js 限制）。所以数据不能在组件顶部 await，要走 EventSource 在 `useEffect` 里拿。

### 2. `useRef` 防 StrictMode 双连接

React 19 开发模式下 `useEffect` 会执行两次（mount → unmount → mount），可能导致开两条 SSE 连接（第二条会卡住）。用 `useRef` 持有 EventSource 防护：

```ts
const sourceRef = useRef<EventSource | null>(null);

useEffect(() => {
  if (sourceRef.current) return;     // ← 已存在则不再建
  const source = new EventSource('/api/sse/invoices');
  sourceRef.current = source;
  // ...
  return () => {
    source.close();
    sourceRef.current = null;
  };
}, []);
```

### 3. `useEffect` return 里必须 close

```ts
useEffect(() => {
  const source = new EventSource(...);
  return () => source.close();   // ← 组件卸载必须关，否则内存泄漏
}, []);
```

---

## 七、坑点实录（本 demo 真实踩到的）

搭这个 demo 时遇到的真实问题，记下来避免重复踩：

1. **`cancel()` 不清理定时器 → 资源泄漏**
   定时器声明在 `ReadableStream` 外面，`cancel()` 才能 `clearInterval`。第一版写在 `start` 闭包里，客户端断开后定时器继续每 4s 查库。

2. **`fnm use` 不改 PATH → next dev 用了旧 Node**
   `fnm use 20.20.2` 切了版本但 PATH 没生效，`next dev` 仍用 Node 18 报错（Next 16 要 ≥20.9）。必须 `eval "$(fnm env)" && fnm use 20.20.2`。详见 [[project-toolchain-pnpm-fnm]]。

3. **DB 冷启动慢 → curl 6 秒没数据**
   端点①首次 `prisma.invoice.findFirst` 跨太平洋查询慢，`curl --max-time 6` 只收到 `retry` 行，延长到 15s 才看到 invoice 事件。详见 [[gotcha-non-pooling-connection-slow-render]]。

4. **端点①推同一条发票**
   `findFirst(orderBy date desc)` 永远返回 seed 里最新那条（Michael Novotny），所以页面上发票重复。这是用「最新发票」模拟的副作用，演示的是推送机制而非真实增量。想看不同数据可改成随机查询。

5. **端点①和端点②的「断开」要区分**
   - 端点①的 `controller.close()`（断线演示）：服务端主动关，触发浏览器重连。
   - `cancel()`：客户端主动断（关页面等），服务端收到通知去清理。方向相反。

---

## 八、SSE vs WebSocket vs 轮询

| 维度 | 轮询 | SSE | WebSocket |
|------|------|-----|-----------|
| 方向 | 双向（都是普通请求） | 单向（服务器→客户端） | 双向 |
| 实时性 | 差（有间隔延迟） | 好（实时推） | 好 |
| 实现难度 | ⭐ 简单 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐ 复杂 |
| 断线重连 | 每次都是新请求 | 浏览器自动 | 自己写 |
| 走 HTTP 基础设施 | ✅ | ✅ | ⚠️ 需特殊配置 |
| 适用 | 低频更新、可接受延迟 | 通知、消息流、AI 流式输出 | 聊天室、游戏、协同编辑 |

**经验法则**：只要单向推送够用，优先 SSE。WebSocket 是「必须双向」时的最后选择。

> 💡 **AI 流式输出就是 SSE**：ChatGPT、Cursor 的「打字机效果」，底层就是 `data: {"delta":"字"}\n\n` 一段段推。本 demo 端点②正是这个原理的简化版。

---

## 九、限制

- **浏览器同域连接数上限**：HTTP/1.1 约 6 个（开第 7 个会卡住），HTTP/2 共享连接通常够用。
- **只能 GET**：`EventSource` 不能传 POST body、不能自定义 header（鉴权用 Cookie 或 query string）。
- **只能传文本**：二进制得 Base64 编码，或用 WebSocket。
- **Serverless 部署不行**：Vercel 等平台函数有执行时间上限（10~60s），SSE 跑不久就被杀。生产 SSE 要部署在长连接友好的环境（VPS、容器）。本 demo 仅本地 `next dev` 演示。

---

## 十、对照本项目

### 文件清单

| 文件 | 作用 |
|------|------|
| `app/api/sse/invoices/route.ts` | 端点①：每 4s 推最新 Invoice，含 id/event/retry/心跳/断线演示 |
| `app/api/sse/ai-stream/route.ts` | 端点②：模拟 AI 打字机，逐字 push + `[DONE]` 收尾 |
| `app/dashboard/sse-demo/page.tsx` | 演示页：发票通知 + AI 流 + 概念说明三区块 |

### 演示页现象（访问 `/dashboard/sse-demo`，需登录）

- **区块① 实时发票通知**：约 4s 出现第一条；每 3 条后状态徽章「连接中…」→「已连接」（自动重连）；「最后消息 id」递增且重连后连续（体现 Last-Event-ID）。
- **区块② AI 流式回答**：点「生成回答」，文字逐字蹦出（50ms/字），结束光标消失。
- **区块③ 概念说明**：静态卡片，点出心跳/自动重连/Last-Event-ID/单向推送。

### 怎么本地跑

```bash
cd /Users/huhejie/CODE/next-demo/next-demo
eval "$(fnm env)" && fnm use 20.20.2 && pnpm dev
# 访问 http://localhost:3000/dashboard/sse-demo（需先登录）
```

### 怎么单独测端点（curl）

```bash
# 端点②：2 秒内能看到逐字推送
curl -N --max-time 2 http://localhost:3000/api/sse/ai-stream

# 端点①：15 秒能看到 retry + 3 条 invoice（DB 冷启动慢，要等）
curl -N --max-time 15 http://localhost:3000/api/sse/invoices
```

---

## 速查：SSE 协议字段全表

| 字段 | 例子 | 作用 |
|------|------|------|
| `data:` | `data: {"x":1}` | 消息内容（必填），触发前端回调 |
| `event:` | `event: invoice` | 命名事件，前端用 `addEventListener` 收 |
| `id:` | `id: 42` | 消息编号，重连时浏览器带 `Last-Event-ID` |
| `retry:` | `retry: 3000` | 告诉浏览器重连等待毫秒数 |
| `:` (注释) | `: ping` | 浏览器忽略，用于心跳保活 |

**响应头**：`Content-Type: text/event-stream`（SSE 身份证）+ `Cache-Control: no-cache, no-transform`（禁缓存禁代理压缩）+ `Connection: keep-alive`。
