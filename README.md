# Next.js 全栈学习项目（next-demo）

基于 [Next.js App Router 官方课程](https://nextjs.org/learn) 起步，逐步扩展成的一个**全栈 CRUD 练习项目**：从原生 SQL 迁移到 Prisma、接入 NextAuth v5 认证与 RBAC 权限、引入 shadcn/ui 与 react-hook-form，并加了 CSV / PDF 导出、SSE 流式输出等进阶功能。

## 技术栈

| 分类 | 选型 |
| --- | --- |
| 框架 | Next.js 16（App Router + Turbopack）、React 19、TypeScript |
| 数据库 | PostgreSQL（Neon），Prisma 7（`@prisma/adapter-pg` 适配器模式） |
| 认证 | NextAuth v5（beta，JWT Session）+ `middleware.ts` 路由保护 + RBAC（user / admin） |
| UI | Tailwind CSS v3 + shadcn/ui（Radix）+ lucide-react + recharts |
| 表单 | react-hook-form + Zod（`@hookform/resolvers`）+ Server Actions |
| 导出 | CSV（Route Handler）、PDF（`@react-pdf/renderer`） |
| 其他 | dnd-kit 拖拽、SSE 流式响应、sonner 通知 |
| 工具链 | pnpm、fnm（Node ≥ 20，Prisma 7 要求） |

## 功能模块

- **登录 / 注册**：NextAuth v5 凭证登录，JWT Session，middleware 拦截未登录访问 `/dashboard`
- **总览页 `/dashboard`**：统计卡片 + recharts 图表
- **客户管理 `/dashboard/customers`**：搜索、分页、详情、创建 / 编辑 / 删除（含删除确认）、CSV 导出、批量操作
- **发票管理 `/dashboard/invoices`**：搜索、分页、详情、创建 / 编辑 / 删除、CSV 导出、PDF 导出（`@react-pdf/renderer` 服务端渲染，支持中文字体）
- **记账本 `/dashboard/transactions`**：交易列表（分页 / 按类型筛选）、记一笔（react-hook-form + Zod，金额元转分）、分类管理（`/transactions/categories` CRUD，含系统预设与用户自定义分类）
- **用户管理 `/dashboard/users`**：RBAC 权限练习（仅 admin 可见）
- **SSE 演示 `/dashboard/sse-demo`**：`/api/sse/ai-stream` 流式输出

## 目录结构

```
app/
├── api/                  # Route Handlers
│   ├── auth/[...nextauth]/   # NextAuth
│   ├── invoices/{csv, [id]/pdf}/  # CSV / PDF 导出
│   └── sse/              # SSE 流式接口
├── dashboard/            # 业务页面（customers / invoices / transactions / users / sse-demo）
├── lib/
│   ├── data/             # 数据查询层（Prisma 读）
│   ├── actions/          # Server Actions（Zod 校验 + Prisma 写）
│   ├── definitions.ts    # 类型与 Zod Schema
│   └── prisma.ts         # Prisma Client 单例
├── ui/                   # 业务组件（按模块分目录）
├── login/ · register/ · query/
components/               # shadcn/ui 组件 + 通用组件（my-form 等）
docs/                     # 学习文档（见下方索引）
prisma/                   # schema.prisma + seed.ts
scripts/                  # 一次性 DB 脚本
middleware.ts             # NextAuth 路由保护
auth.ts · auth.config.ts  # NextAuth v5 配置（JWT 回调注入 role）
```

**分层约定**：`lib/data/*` 只读（页面渲染取数），`lib/actions/*` 只写（表单提交，`"use server"`），页面组件做展示与交互。

## 快速开始

```bash
# 1. Node 版本（Prisma 7 要求 ≥ 20）
fnm use 20.20.2

# 2. 安装依赖（务必用 pnpm）
pnpm install

# 3. 配置环境变量（见下节），然后建表 + 灌数据
pnpm exec prisma db push
pnpm exec prisma db seed

# 4. 启动开发服务器
pnpm dev
```

种子账号：`user@nextmail.com` / `123456`（admin 账号见 `prisma/seed.ts`）。

## 环境变量

`.env` 最小配置：

```bash
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
DATABASE_URL_UNPOOLED="postgresql://..."   # Neon 直连（非池化）地址，Prisma Client 用
AUTH_SECRET="xxx"                          # openssl rand -base64 32 生成
AUTH_URL="http://localhost:3000"
```

Neon 项目另有一组 `POSTGRES_*` / `PG*` 变量（Vercel Postgres 兼容），供 seed 脚本与排查使用。

## 常用脚本

| 命令 | 说明 |
| --- | --- |
| `pnpm dev` | 开发服务器（Turbopack） |
| `pnpm build` | 生产构建（含 `prisma generate`） |
| `pnpm exec prisma db push` | 同步 schema 到数据库 |
| `pnpm exec prisma db seed` | 灌种子数据（`prisma/seed.ts`，Prisma API 版） |
| `pnpm seed` | 旧版种子脚本（`scripts/seed.js`，原生 SQL） |
| `pnpm exec prisma studio` | 数据库可视化管理 |

## 关键约定

- **金额一律存"分"（Int）**：发票、交易金额在数据库中均为整数分，展示时 `/100` 转元（`formatCurrency`）
- **服务端校验是法律**：所有 Server Actions 先 `schema.safeParse`，客户端校验只是体验
- **`redirect()` 必须在 try/catch 之外**：它以抛错方式实现跳转，被 catch 吞掉会导致"数据已存但页面不跳"
- **修改 NextAuth 回调后**：需完整重启 dev server 并重新登录，热更新不会重跑 JWT 回调

## 学习文档（docs/）

| 文档 | 内容 |
| --- | --- |
| 01-06 | 官方课程六步笔记：项目概览、路由与组件、数据与表单、搜索分页与认证、错误处理与渲染优化、TypeScript 与样式 |
| 07-08 | 打包错误排错实录、开发踩坑实录 |
| 09-13 | Prisma 入门、Zod 表单验证、进阶功能（CSV / PDF / 批量操作）、shadcn-ui 组件库、SSE 实战 |
| 14 | NextJS 闭环练习：个人记账本（本项目 transactions 模块的练习手册） |
| 15-17 | Java 学习路线图（hqq-api 方向）、hqq-api 技术栈速查、Java 四个月周计划 |
