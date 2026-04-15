# Next.js Dashboard 项目 · 新手完全学习指南

> 这份文档假设你是一个前端新手。每个知识点都会从"是什么"、"为什么需要它"、"怎么用"三个角度讲透。
> 建议配合项目代码一起看，遇到不懂的随时回来查。

---

## 目录

- [第 0 章：先搞懂这个项目在做什么](#第-0-章先搞懂这个项目在做什么)
- [第 1 章：路由系统 —— 网址是怎么对应到页面的](#第-1-章路由系统--网址是怎么对应到页面的)
- [第 2 章：服务端组件 vs 客户端组件 —— 代码在哪跑](#第-2-章服务端组件-vs-客户端组件--代码在哪跑)
- [第 3 章：布局系统 layout.tsx —— 页面的公共骨架](#第-3-章布局系统-layouttsx--页面的公共骨架)
- [第 4 章：数据库操作 —— 数据从哪来](#第-4-章数据库操作--数据从哪来)
- [第 5 章：Server Actions —— 不写 API 也能提交数据](#第-5-章server-actions--不写-api-也能提交数据)
- [第 6 章：表单验证 Zod —— 别让脏数据进来](#第-6-章表单验证-zod--别让脏数据进来)
- [第 7 章：搜索与分页 —— 用 URL 管状态](#第-7-章搜索与分页--用-url-管状态)
- [第 8 章：身份认证 —— 谁能进这个系统](#第-8-章身份认证--谁能进这个系统)
- [第 9 章：中间件 Middleware —— 门卫系统](#第-9-章中间件-middleware--门卫系统)
- [第 10 章：错误处理 —— 出错了怎么办](#第-10-章错误处理--出错了怎么办)
- [第 11 章：流式渲染与 Suspense —— 别让用户干等](#第-11-章流式渲染与-suspense--别让用户干等)
- [第 12 章：TypeScript 类型系统](#第-12-章typescript-类型系统)
- [第 13 章：Tailwind CSS 样式](#第-13-章tailwind-css-样式)
- [第 14 章：字体与图片优化](#第-14-章字体与图片优化)
- [附录：名词解释速查表](#附录名词解释速查表)

---

## 第 0 章：先搞懂这个项目在做什么

### 这个项目是什么？

想象你开了一家小公司，需要一个后台管理系统来管理发票（invoice）。这个项目就是一个**发票管理仪表盘**：

```
你（用户）打开浏览器
  → 看到登录页面，输入账号密码登录
  → 进入仪表盘首页，看到各种统计数字和图表
  → 可以查看发票列表，搜索、翻页
  → 可以创建新发票、编辑已有发票、删除发票
  → 可以查看客户列表
```

### 用了哪些技术？

| 技术 | 一句话解释 |
|------|-----------|
| **Next.js** | 一个 React 框架，帮你做路由、渲染、数据获取这些事 |
| **React** | 写 UI 界面的库，用组件拼出页面 |
| **TypeScript** | 带类型检查的 JavaScript，写错类型会报错 |
| **Tailwind CSS** | 一种写样式的方式，直接在 class 里写 CSS |
| **PostgreSQL** | 一个关系型数据库，存发票、客户等数据 |
| **NextAuth** | 身份认证库，处理登录/登出 |
| **Zod** | 数据验证库，检查用户提交的数据是否合法 |

### 项目的文件夹结构（简化版）

```
next-demo/
├── app/                      ← 所有页面和路由都在这里
│   ├── layout.tsx            ← 全局布局（每个页面都有的部分）
│   ├── page.tsx              ← 首页 /
│   ├── login/page.tsx        ← 登录页 /login
│   └── dashboard/            ← 仪表盘相关页面
│       ├── layout.tsx        ← 仪表盘布局（侧边栏）
│       ├── (overview)/       ← 仪表盘首页
│       ├── invoices/         ← 发票相关页面
│       └── customers/        ← 客户页面
├── app/lib/                  ← 工具函数、数据库操作、Server Actions
├── app/ui/                   ← 可复用的 UI 组件
├── auth.ts                   ← 登录认证配置
├── auth.config.ts            ← 认证基础配置
├── middleware.ts             ← 路由守卫
└── scripts/seed.js           ← 初始化数据库的脚本
```

---

## 第 1 章：路由系统 —— 网址是怎么对应到页面的

### 是什么？

**路由**就是 URL（网址）和页面之间的映射关系。用户访问一个网址，框架需要知道该显示哪个页面。

### 传统方式 vs Next.js 方式

在传统开发中，你可能需要手动配置路由：

```js
// 传统方式：手动配置每个路由
app.get('/', homePage);
app.get('/dashboard', dashboardPage);
app.get('/dashboard/invoices', invoicesPage);
```

Next.js 用了一种更直觉的方式：**文件结构就是路由结构**。你创建什么文件夹，就自动产生什么网址。

### 文件夹和网址的对应关系

```
app/
  page.tsx                     → 访问 /           显示首页
  login/
    page.tsx                   → 访问 /login       显示登录页
  dashboard/
    page.tsx                   → 访问 /dashboard   显示仪表盘
    layout.tsx                 → 不是页面，是布局（下面会讲）
    invoices/
      page.tsx                 → 访问 /dashboard/invoices  显示发票列表
      create/
        page.tsx               → 访问 /dashboard/invoices/create  创建发票页
      [id]/
        edit/
          page.tsx             → 访问 /dashboard/invoices/abc123/edit  编辑发票页
```

规则很简单：
- **每个文件夹**代表 URL 的一层路径
- **`page.tsx`** 文件存在才会产生可访问的页面
- **`[id]`** 这种带方括号的文件夹是**动态路由**（下面详解）

### 动态路由 [id] —— 一个页面模板匹配无数个网址

假设你有 1000 条发票，不可能为每条发票建一个文件夹。所以用 `[id]` 来表示"这里是变化的"：

```
app/dashboard/invoices/[id]/edit/page.tsx

这个页面模板可以匹配：
/dashboard/invoices/abc-123/edit      ← id = "abc-123"
/dashboard/invoices/xyz-789/edit      ← id = "xyz-789"
/dashboard/invoices/任何字符串/edit     ← id = "任何字符串"
```

在页面代码里，你可以拿到这个 `id` 的值：

```tsx
// app/dashboard/invoices/[id]/edit/page.tsx

// Next.js 16 的写法：params 是一个 Promise，需要 await
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // 拿到 id 的值，比如 "abc-123"

  // 然后用这个 id 去数据库查对应的发票数据
  const invoice = await fetchInvoiceById(id);

  return <div>编辑发票 {id}</div>;
}
```

> **为什么要 await？** 在 Next.js 15 之前，`params` 是一个普通对象，直接 `params.id` 就行。
> 从 Next.js 15 开始，`params` 变成了 Promise（异步的），必须 `await` 才能拿到值。
> 这是因为 Next.js 在底层需要异步处理路由参数，比如验证、转换等。

### 路由组 (overview) —— 括号文件夹不影响网址

你可能会注意到一个奇怪的文件夹 `(overview)`，名字外面有括号：

```
app/dashboard/
  (overview)/
    page.tsx       → 网址是 /dashboard（不是 /dashboard/(overview)/）
    loading.tsx    → 这个 loading 只对这个 page 生效
```

**括号文件夹的作用**：把相关文件组织在一起，但不影响网址。这里把 `page.tsx` 和它的 `loading.tsx` 放在同一个文件夹里，代码更清晰，但网址不会有 `(overview)` 这个层级。

### 这一章你需要记住的

1. `page.tsx` = 可访问的页面
2. 文件夹结构 = URL 结构
3. `[xxx]` = 动态路由，可以在代码里拿到 `xxx` 的值
4. `(xxx)` = 路由组，只管组织代码，不影响网址
5. Next.js 16 里 `params` 要 `await`

---

## 第 2 章：服务端组件 vs 客户端组件 —— 代码在哪跑

### 先理解一个根本问题

当用户打开你的网页时，有两台电脑在工作：

```
服务端（你的服务器）                    客户端（用户的浏览器）
├── 运行 Node.js                       ├── 运行 Chrome/Safari
├── 可以直接查数据库                    ├── 不能直接查数据库
├── 可以读文件系统                      ├── 不能读服务器的文件
└── 用户看不到这里的代码                └── 用户可以看到和交互
```

### 两种组件的区别

**服务端组件**（Server Component）—— 默认就是这种

```
代码在服务器上运行
→ 可以直接查数据库
→ 可以直接读文件
→ 不能用 useState、useEffect 等 hooks（因为这些需要浏览器）
→ 不能监听 onClick 等用户事件（因为运行在服务器，用户点不到）
→ 生成的 HTML 发送到浏览器展示
```

**客户端组件**（Client Component）—— 需要手动声明 `'use client'`

```
代码在浏览器里运行
→ 可以用 useState、useEffect 等 hooks
→ 可以监听 onClick、onChange 等用户事件
→ 不能直接查数据库（浏览器的 JavaScript 没有数据库连接）
→ 代码会打包发送到浏览器（用户可以在 DevTools 里看到）
```

### 怎么判断用哪种？

问自己一个问题：**这个组件需要和用户交互吗？**

- 需要监听点击、输入、hover → 客户端组件，加 `'use client'`
- 需要用 useState/useEffect → 客户端组件，加 `'use client'`
- 只是展示数据，不需要交互 → 服务端组件（默认，不用加任何东西）

### 项目中的实际例子

**服务端组件**—— 只展示数据，不需要交互：

```tsx
// app/ui/dashboard/revenue-chart.tsx
// 注意：没有 'use client'，所以是服务端组件

export default async function RevenueChart() {
  // ✅ 可以直接调数据库函数！因为代码在服务器上运行
  const revenue = await fetchRevenue();

  return (
    <div>
      {revenue.map((item) => (
        <div style={{ height: item.revenue / 50 }}>{item.month}</div>
      ))}
    </div>
  );
}
```

**客户端组件**—— 需要监听用户的输入：

```tsx
// app/ui/search.tsx
'use client';  // ← 这行告诉 Next.js：这个组件在浏览器里运行

import { useSearchParams, usePathname, useRouter } from 'next/navigation';

export default function Search() {
  // ✅ 可以用 hooks，因为运行在浏览器
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  return <input onChange={(e) => {
    // ✅ 可以监听用户输入事件
    // 更新 URL 的搜索参数...
  }} />;
}
```

### 一个常见的坑

```tsx
// ❌ 错误：在服务端组件里用了 useState
export default function MyComponent() {
  const [count, setCount] = useState(0);  // 报错！服务端组件不能用 hooks
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}

// ✅ 正确：加上 'use client'
'use client';
import { useState } from 'react';
export default function MyComponent() {
  const [count, setCount] = useState(0);  // 现在可以了
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 服务端组件也可以是 async 函数

```tsx
// ✅ 服务端组件可以是 async 的，直接 await 数据
export default async function DashboardPage() {
  const invoices = await fetchInvoices();  // 直接查数据库
  return <div>{invoices.length} invoices</div>;
}

// ❌ 客户端组件不能这样写
'use client';
export default async function MyPage() {
  const data = await fetch('/api/data');  // 必须通过 API 请求
}
```

### 这一章你需要记住的

1. 默认是服务端组件，加 `'use client'` 才是客户端组件
2. 需要交互、hooks、事件监听 → 客户端组件
3. 需要查数据库、读文件 → 服务端组件
4. 服务端组件可以是 `async` 函数，客户端不行
5. 尽量用服务端组件（性能更好，代码不发给浏览器）

---

## 第 3 章：布局系统 layout.tsx —— 页面的公共骨架

### 是什么？

你有没有注意到，网站的不同页面通常有相同的部分（比如顶部导航栏、侧边栏）？**layout.tsx** 就是放这些公共部分的。

### 它是怎么工作的？

想象一个相框：

```
┌─────────────────────────────────────┐
│  layout.tsx（相框）                    │
│  ┌─────────────────────────────────┐ │
│  │  顶部导航栏（每个页面都有）        │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  │   {children}                    │ │
│  │   这里放不同页面的内容            │ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────┐ │
│  │  底部版权（每个页面都有）          │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

`{children}` 就是当前页面组件。用户访问 `/dashboard` 时，`children` 就是仪表盘首页；访问 `/dashboard/invoices` 时，`children` 就是发票列表页。

### 项目中有两层 layout

**第一层：根布局** `app/layout.tsx` —— 所有页面共享

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}  {/* 所有页面内容都插在这里 */}
      </body>
    </html>
  );
}
```

**第二层：仪表盘布局** `app/dashboard/layout.tsx` —— 只有仪表盘页面共享

```
┌── 根布局 (app/layout.tsx) ────────────────┐
│                                            │
│  ┌── 仪表盘布局 (app/dashboard/layout.tsx) ┐│
│  │  ┌──────┐  ┌────────────────────────┐  ││
│  │  │侧边栏 │  │    {children}          │  ││
│  │  │      │  │  仪表盘首页/发票列表/... │  ││
│  │  │导航   │  │                        │  ││
│  │  └──────┘  └────────────────────────┘  ││
│  └─────────────────────────────────────────┘│
└────────────────────────────────────────────┘
```

嵌套关系是：`根布局` 包裹 `仪表盘布局`，仪表盘布局包裹具体页面。

### 布局不会重新加载

当用户从 `/dashboard/invoices` 跳转到 `/dashboard/customers` 时：
- `app/layout.tsx` 不会重新渲染（保持不变）
- `app/dashboard/layout.tsx` 不会重新渲染（侧边栏保持不变）
- 只有 `{children}` 部分会切换到新页面

这就是为什么侧边栏在页面切换时不会闪烁——它一直都在。

### 这一章你需要记住的

1. `layout.tsx` 是页面的公共外壳，`{children}` 是页面内容
2. 布局可以嵌套（根布局 → 仪表盘布局 → 页面）
3. 布局在页面切换时不会重新渲染
4. 每个路由段最多一个 `layout.tsx`

---

## 第 4 章：数据库操作 —— 数据从哪来

### 是什么？

页面上显示的发票、客户、收入数据不是写死的，而是存在一个叫 PostgreSQL 的数据库里。页面加载时，从数据库查出来显示。

### 怎么连接数据库？

```tsx
// app/lib/data.ts
import postgres from 'postgres';

// 创建数据库连接
// POSTGRES_URL 是一个环境变量，存在 .env 文件里，值类似：
// postgres://username:password@host:5432/database?sslmode=require
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });
```

这里用的是 **postgres.js** 库，它让你用 JavaScript 模板字符串写 SQL：

````tsx
// 写 SQL 查询就像写模板字符串一样
const data = await sql`SELECT * FROM invoices`;
// data 就是查询结果，一个数组
````

### 数据库里有哪些表？

```
┌─────────────┐   ┌─────────────────┐   ┌──────────────┐
│  customers   │   │    invoices      │   │   revenue    │
├─────────────┤   ├─────────────────┤   ├──────────────┤
│ id (UUID)    │←──│ customer_id     │   │ month        │
│ name         │   │ id (UUID)       │   │ revenue      │
│ email        │   │ amount          │   └──────────────┘
│ image_url    │   │ status          │
└─────────────┘   │ date            │
                  └─────────────────┘

一条发票属于一个客户（通过 customer_id 关联）
```

### 项目中定义了 8 个查询函数

每个函数做一件事：

```tsx
// 1. 获取所有收入数据（画图表用）
export async function fetchRevenue() {
  const data = await sql<Revenue[]>`SELECT * FROM revenue`;
  return data;
}

// 2. 获取最新的 5 条发票（首页展示用）
export async function fetchLatestInvoices() {
  const data = await sql`
    SELECT invoices.amount, customers.name, customers.image_url
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id  -- 联表查
    ORDER BY invoices.date DESC  -- 按日期倒序
    LIMIT 5  -- 只要 5 条
  `;
  return data;
}

// 3. 获取统计卡片数据（发票数、客户数、收入）
// 这个函数展示了「并行查询」的技巧
export async function fetchCardData() {
  // 三个查询互不依赖，可以同时执行！
  const [invoiceCount, customerCount, statusSum] = await Promise.all([
    sql`SELECT COUNT(*) FROM invoices`,
    sql`SELECT COUNT(*) FROM customers`,
    sql`SELECT SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) FROM invoices`,
  ]);
  // Promise.all 让三个查询同时跑，比一个一个查快很多
  return { invoiceCount, customerCount, statusSum };
}

// 4. 搜索 + 分页查询发票
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * 6;  // 每页 6 条，计算跳过多少条

  const invoices = await sql`
    SELECT * FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE customers.name ILIKE ${`%${query}%`}   -- 模糊搜索
    ORDER BY invoices.date DESC
    LIMIT 6 OFFSET ${offset}  -- 分页：跳过 offset 条，取 6 条
  `;
  return invoices;
}

// 5. 根据 ID 查单个发票（编辑页面用）
export async function fetchInvoiceById(id: string) {
  const data = await sql`
    SELECT id, customer_id, amount, status FROM invoices
    WHERE invoices.id = ${id}  -- 按主键查
  `;
  return data[0];  // 返回第一条（应该只有一条）
}
```

### 几个重要的 SQL 概念

**JOIN —— 联表查询**
```sql
-- 发票表只有 customer_id，想要客户名字就要 JOIN 客户表
SELECT invoices.amount, customers.name
FROM invoices
JOIN customers ON invoices.customer_id = customers.id
```

**ILIKE —— 模糊搜索**
```sql
-- % 是通配符，%lee% 匹配任何包含 "lee" 的字符串
WHERE name ILIKE '%lee%'
```

**LIMIT / OFFSET —— 分页**
```sql
-- 第 1 页：取前 6 条
LIMIT 6 OFFSET 0

-- 第 2 页：跳过前 6 条，取接下来的 6 条
LIMIT 6 OFFSET 6

-- 第 3 页：跳过前 12 条，取接下来的 6 条
LIMIT 6 OFFSET 12
```

**Promise.all —— 并行执行**
```tsx
// ❌ 慢：一个查完再查下一个（串行）
const a = await query1();  // 等 1 秒
const b = await query2();  // 等 1 秒
const c = await query3();  // 等 1 秒
// 总共等 3 秒

// ✅ 快：同时发起三个查询（并行）
const [a, b, c] = await Promise.all([query1(), query2(), query3()]);
// 总共等 1 秒
```

### 数据库是怎么初始化的？

项目有一个种子脚本 `scripts/seed.js`，运行 `pnpm seed` 会：
1. 创建 4 张表（users、customers、invoices、revenue）
2. 插入示例数据（6 个客户、13 条发票、12 个月收入）

### 这一章你需要记住的

1. 数据库连接字符串存在 `.env` 文件的 `POSTGRES_URL` 里
2. 用 `sql` 模板字符串写 SQL 查询
3. `Promise.all()` 让多个查询并行跑，更快
4. `LIMIT/OFFSET` 实现分页
5. `ILIKE` 实现模糊搜索
6. `JOIN` 联表查询关联数据

---

## 第 5 章：Server Actions —— 不写 API 也能提交数据

### 传统做法：写 API 路由

在以前，前端提交数据到后端需要：
1. 写一个 API 路由（比如 `/api/invoices`）
2. 前端用 `fetch('/api/invoices', { method: 'POST' })` 调用
3. 后端处理请求、操作数据库、返回结果

```
前端页面 → fetch 请求 → API 路由 → 数据库
```

### Server Actions 做了什么？

**Server Actions 让你跳过中间步骤**，直接从前端表单调用后端函数：

```
前端表单 <form action={createInvoice}> → Server Action 函数 → 数据库
```

不需要写 API 路由，不需要写 fetch，简单直接。

### 怎么定义一个 Server Action？

```tsx
// app/lib/action.ts
"use server";  // ← 这一行告诉 Next.js：这个文件里的函数都是服务端函数

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// 定义一个 Server Action
export async function createInvoice(prevState: State, formData: FormData) {
  //         函数名可以随意取       ↑ 第一个参数是上一次的状态（用于 useFormState）
  //                                        ↑ 第二个参数是表单数据

  // 1. 从表单数据中提取值
  const customerId = formData.get('customerId');  // 对应 <input name="customerId">
  const amount = formData.get('amount');           // 对应 <input name="amount">
  const status = formData.get('status');           // 对应 <input name="status">

  // 2. 写入数据库
  await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amount}, ${status}, ${new Date().toISOString()})
  `;

  // 3. 清除缓存（让页面显示最新数据）
  revalidatePath('/dashboard/invoices');

  // 4. 跳转到发票列表页
  redirect('/dashboard/invoices');
}
```

### 怎么在表单里使用？

**方式一：直接绑定到 form 的 action**

```tsx
// 最简单的用法：表单提交时自动调用 Server Action
import { deleteInvoice } from '@/app/lib/action';

export function DeleteButton({ id }: { id: string }) {
  const deleteWithId = deleteInvoice.bind(null, id);
  //                          ↑ .bind(null, id) 把 id 预先传进去

  return (
    <form action={deleteWithId}>
      <button type="submit">删除</button>
    </form>
    // 点击按钮 → 表单提交 → 自动调用 deleteInvoice(id, formData)
  );
}
```

**方式二：配合 useFormState 管理表单状态**

```tsx
'use client';
import { useFormState } from 'react-dom';
import { createInvoice } from '@/app/lib/action';

export default function CreateForm() {
  // useFormState 返回两个东西：
  // state：Server Action 的返回值（比如错误信息）
  // dispatch：触发函数，绑到 form 的 action 上
  const [state, dispatch] = useFormState(createInvoice, initialState);

  return (
    <form action={dispatch}>
      <select name="customerId">...</select>
      <input name="amount" type="number" />
      <button type="submit">创建发票</button>

      {/* 显示 Server Action 返回的错误信息 */}
      {state.message && <p className="text-red-500">{state.message}</p>}
    </form>
  );
}
```

### 三个重要的辅助函数

| 函数 | 作用 | 什么时候用 |
|------|------|-----------|
| `revalidatePath('/dashboard/invoices')` | 清除指定页面的缓存，让它重新从数据库获取数据 | 写入数据后（创建/更新/删除） |
| `redirect('/dashboard/invoices')` | 跳转到另一个页面 | 操作完成后 |
| `.bind(null, id)` | 给 Server Action 预传参数 | 需要传额外参数时 |

### .bind() 是怎么回事？

Server Action 接收的参数格式是 `(prevState, formData)`。如果你想传额外的参数（比如发票 ID），可以用 `.bind()`：

```tsx
// 原始函数签名：updateInvoice(id: string, formData: FormData)
//                   参数1: id    参数2: formData

// 用 .bind(null, invoice.id) 把 id 预先绑定
const updateWithId = updateInvoice.bind(null, invoice.id);

// 现在 updateWithId 签名变成：(formData: FormData)
// 绑定后只有 formData 一个参数了，符合 form action 的要求
<form action={updateWithId}>
```

`bind` 的第一个参数是 `null`（忽略 this 指向），第二个参数开始就是要预传的值。

### 这一章你需要记住的

1. `"use server"` 标记文件为 Server Actions
2. `<form action={serverAction}>` 绑定 Server Action
3. `formData.get('字段名')` 获取表单数据
4. `.bind(null, 额外参数)` 预传参数
5. `revalidatePath()` 清缓存，`redirect()` 跳转
6. `useFormState` 管理 Server Action 的返回状态

---

## 第 6 章：表单验证 Zod —— 别让脏数据进来

### 为什么需要验证？

用户可能在金额框里输入负数、不选客户就提交、状态选了一个非法值。你不能信任任何用户输入，必须在服务端验证。

### Zod 是什么？

Zod 是一个数据验证库。你定义一个"规则"（Schema），然后用它来验证数据是否符合规则。

### 基本用法

```tsx
import { z } from 'zod';

// 1. 定义规则（Schema）
const FormSchema = z.object({
  id: z.string(),                    // 必须是字符串
  customerId: z.string({             // 必须是字符串
    invalid_type_error: '请选择客户',   // 自定义错误消息
  }),
  amount: z.coerce                    // 自动把字符串转成数字
    .number()                         // 必须是数字
    .gt(0, { message: '金额必须大于 0' }),  // 必须大于 0
  status: z.enum(['pending', 'paid'], {   // 只能是这两个值
    invalid_type_error: '请选择状态',
  }),
  date: z.string(),
});
```

### 几个 Zod 核心概念

**z.coerce —— 自动类型转换**

```tsx
// HTML 表单提交的所有值都是字符串！
formData.get('amount')  // 用户输入 100，但得到的是 "100"（字符串）

// z.coerce.number() 会自动把字符串 "100" 转成数字 100
amount: z.coerce.number()  // "100" → 100 ✅
```

**.safeParse() —— 验证但不报错**

```tsx
const result = FormSchema.safeParse({
  customerId: '',
  amount: -10,
  status: 'unknown',
});

if (result.success) {
  // 验证通过，用 result.data 获取已验证的数据
  const { customerId, amount, status } = result.data;
} else {
  // 验证失败，用 result.error 看哪里错了
  result.error.flatten().fieldErrors;
  // {
  //   customerId: ['请选择客户'],
  //   amount: ['金额必须大于 0'],
  //   status: ['请选择状态'],
  // }
}
```

**.omit() —— 排除不需要的字段**

```tsx
// 创建发票时，id 由数据库自动生成，date 由代码生成
// 所以表单里不需要这两个字段
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// 现在 CreateInvoice 只要求：customerId, amount, status
```

### 在 Server Action 中使用

```tsx
export async function createInvoice(prevState: State, formData: FormData) {
  // 验证
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // 如果验证失败，返回错误信息给前端
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '请填写所有必填字段',
    };
  }

  // 验证通过，继续写入数据库
  const { customerId, amount, status } = validatedFields.data;
  // ...
}
```

### 在前端显示错误

```tsx
{state.errors?.amount && (
  <p className="text-red-500">{state.errors.amount[0]}</p>
  // 显示: "金额必须大于 0"
)}
```

### 这一章你需要记住的

1. Zod 用 `z.object()` 定义数据规则
2. `z.coerce.number()` 自动把字符串转数字
3. `.gt(0)` 大于 0 验证
4. `.enum(['a', 'b'])` 只允许特定值
5. `.safeParse()` 验证数据，不抛异常
6. `.omit()` 排除不需要的字段
7. `.error.flatten().fieldErrors` 获取按字段分组的错误

---

## 第 7 章：搜索与分页 —— 用 URL 管状态

### 核心思想：URL 就是状态

很多新手会用 `useState` 来存搜索词：

```tsx
// ❌ 常见做法：用 state 存搜索词
const [search, setSearch] = useState('');
// 问题：用户刷新页面后搜索词没了，也不能分享带搜索词的链接给别人
```

这个项目用了一种更好的方式：**把搜索词和页码放在 URL 里**。

```
/dashboard/invoices?query=lee&page=2
                 ↑ 搜索词    ↑ 页码
```

好处：
- 用户刷新页面，搜索状态还在
- 可以把链接分享给别人，别人看到一样的结果
- 浏览器前进/后退按钮可以工作

### 搜索的工作流程

```
用户在搜索框输入 "lee"
       ↓
防抖 300ms（等用户停下手再搜索，避免每个字母都查一次）
       ↓
更新 URL：/dashboard/invoices?query=lee
       ↓
页面组件读取 URL 参数 query="lee"
       ↓
用 query 去数据库搜索
       ↓
显示结果
```

### 搜索组件代码解析

```tsx
// app/ui/search.tsx
'use client';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();  // 获取当前 URL 参数
  const pathname = usePathname();           // 获取当前路径，比如 "/dashboard/invoices"
  const { replace } = useRouter();          // 路由器，用来更新 URL

  // useDebouncedCallback：等用户停止输入 300ms 后才执行
  const handleSearch = useDebouncedCallback((term: string) => {
    // 创建 URL 参数的操作对象
    const params = new URLSearchParams(searchParams);

    if (term) {
      params.set('query', term);   // 设置搜索词
    } else {
      params.delete('query');      // 清空搜索词
    }
    params.delete('page');  // 搜索时重置到第 1 页

    // 更新 URL（replace 不会在浏览器历史里加记录）
    replace(`${pathname}?${params.toString()}`);
    // 结果：/dashboard/invoices?query=lee
  }, 300);  // ← 300ms 防抖

  return <input onChange={(e) => handleSearch(e.target.value)} />;
}
```

### 页面组件怎么读取 URL 参数？

```tsx
// app/dashboard/invoices/page.tsx
export default async function InvoicesPage({
  searchParams,  // Next.js 自动把 URL 参数传进来
}: {
  searchParams: Promise<{ query?: string; page?: string }>;
}) {
  const { query = '', page = '1' } = await searchParams;
  //                                   ↑ Next.js 16 中 searchParams 也是 Promise

  // 用 query 和 page 去查数据库
  const invoices = await fetchFilteredInvoices(query, Number(page));
  const totalPages = await fetchInvoicesPages(query);

  return (
    <div>
      <Search />              {/* 搜索框 */}
      <Table query={query} currentPage={Number(page)} />  {/* 表格 */}
      <Pagination totalPages={totalPages} />               {/* 分页 */}
    </div>
  );
}
```

### 防抖（Debounce）是什么？

想象你在搜索框快速输入 "hello"：

```
无防抖：h → 搜一次 → he → 搜一次 → hel → 搜一次 → hell → 搜一次 → hello → 搜一次
（5 次数据库查询，太浪费了）

有防抖（300ms）：h → he → hel → hell → hello → 停了 300ms → 搜一次
（只查 1 次数据库）
```

### 这一章你需要记住的

1. 搜索词和页码放在 URL 参数里，不用 `useState`
2. `useSearchParams()` 读 URL 参数
3. `URLSearchParams` 操作参数（set/delete）
4. `useRouter().replace()` 更新 URL
5. `useDebouncedCallback()` 防抖，减少不必要的查询
6. Next.js 16 中 `searchParams` 是 Promise

---

## 第 8 章：身份认证 —— 谁能进这个系统

### 是什么？

身份认证就是确认"你是谁"。这个项目使用用户名+密码登录。

### 涉及三个文件，各有分工

```
auth.config.ts  →  基础配置（哪些页面需要登录）
                    不含数据库操作（因为 middleware 在 Edge 运行，不支持某些库）

auth.ts         →  完整配置（包含密码验证逻辑）
                    含数据库查询和 bcrypt 密码比对

middleware.ts   →  每次请求前检查：你登录了吗？
```

### 为什么分成两个文件？

```
middleware.ts 运行在 Edge Runtime（一个轻量运行环境）
  → Edge Runtime 不支持 bcrypt（密码加密库）
  → 所以 middleware 只能用 auth.config.ts（轻量版）

auth.ts 运行在 Node.js Runtime（完整的服务端环境）
  → Node.js 支持 bcrypt
  → 所以 auth.ts 可以用完整版配置，包含密码验证
```

### 登录流程

```
1. 用户在 /login 页面输入邮箱和密码，点击登录
   ↓
2. 表单提交 → 调用 authenticate() Server Action
   ↓
3. authenticate() 调用 signIn('credentials', formData)
   ↓
4. NextAuth 的 Credentials Provider 启动 authorize() 函数
   ↓
5. authorize() 做了这些事：
   a. 用 Zod 验证邮箱和密码格式
   b. 根据邮箱从数据库查出用户
   c. 用 bcrypt.compare() 比对密码哈希
   d. 密码匹配 → 返回用户对象（登录成功）
   e. 密码不匹配 → 返回 null（登录失败）
   ↓
6. 登录成功 → 跳转到 /dashboard
   登录失败 → 显示 "Invalid credentials"
```

### 路由保护逻辑

```tsx
// auth.config.ts
callbacks: {
  authorized({ auth, request: { nextUrl } }) {
    const isLoggedIn = !!auth?.user;                            // 用户已登录？
    const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');  // 在仪表盘？

    // 规则 1：访问仪表盘但没登录 → 拦截，跳转登录页
    if (isOnDashboard && !isLoggedIn) return false;

    // 规则 2：已登录但访问登录页 → 跳转仪表盘（不用再登录了）
    if (isLoggedIn && !isOnDashboard) {
      return Response.redirect(new URL('/dashboard', nextUrl));
    }

    // 规则 3：其他情况放行
    return true;
  },
}
```

### 密码是怎么存的？

数据库里存的不是明文密码，而是用 bcrypt 加密后的**哈希值**：

```
用户设置的密码：123456
bcrypt 哈希后：$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

验证时：bcrypt.compare("123456", 哈希值) → true
```

这样即使数据库泄露，攻击者也看不到用户的原始密码。

### 这一章你需要记住的

1. NextAuth v5 处理登录认证
2. Credentials Provider = 用户名密码登录
3. 密码用 bcrypt 哈希存储，不明文保存
4. `authorized` 回调控制谁能访问什么页面
5. 分两个配置文件是因为 Edge Runtime 限制

---

## 第 9 章：中间件 Middleware —— 门卫系统

### 是什么？

Middleware 是在每个请求到达页面**之前**运行的代码。就像小区的门卫：你想进入某栋楼，门卫先检查你的通行证。

```
用户请求 /dashboard/invoices
       ↓
  Middleware 检查：你登录了吗？
       ↓ 是                ↓ 否
  放行，显示页面       跳转到 /login
```

### middleware.ts 代码

```tsx
// middleware.ts（放在项目根目录）
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export const middleware = auth;  // 用 auth 作为中间件函数

export const config = {
  // matcher 指定哪些 URL 需要经过中间件
  // 这个正则表达式的意思是：匹配所有 URL，但排除以下几类：
  //   api        → API 路由不需要认证检查
  //   _next/static → 静态资源（JS、CSS 文件）
  //   _next/image  → 图片优化接口
  //   *.png       → PNG 图片文件
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
```

### middleware.ts 的位置很重要

```
middleware.ts 放在项目根目录 → 对所有路由生效
middleware.ts 放在 app/dashboard/ 下 → 只对 /dashboard/* 生效
```

### 为什么用 auth.config.ts 而不是 auth.ts？

```
middleware.ts
  → 运行在 Edge Runtime（轻量级，启动快）
  → 不支持 Node.js 的完整 API
  → 不支持 bcrypt、postgres 等重量级库
  → 所以只能用 auth.config.ts（只有配置，没有数据库操作）

auth.ts
  → 运行在 Node.js Runtime（完整功能）
  → 支持 bcrypt、postgres
  → 在 Server Actions 和 API 路由中使用
```

### 这一章你需要记住的

1. Middleware 在请求到达页面前执行
2. 必须导出 `middleware` 命名函数或默认函数
3. `matcher` 配置哪些 URL 经过中间件
4. 文件位置决定作用范围
5. Middleware 运行在 Edge Runtime，有功能限制

---

## 第 10 章：错误处理 —— 出错了怎么办

### Next.js 提供三种特殊文件来处理异常情况

```
error.tsx       → 程序出错了，显示错误页面
not-found.tsx   → 页面不存在（404）
loading.tsx     → 页面正在加载，显示加载动画
```

### error.tsx —— 运行时错误兜底

```tsx
// app/dashboard/invoices/error.tsx
'use client';  // 必须！因为需要交互（点击重试按钮）

import { useEffect } from 'react';

export default function Error({
  error,       // 错误对象
  reset,       // 重试函数，调用后会重新执行出错的页面
}: {
  error: Error & { digest?: string };  // digest 是 Next.js 生成的错误 ID
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);  // 在控制台打印详细错误
  }, [error]);

  return (
    <main>
      <h2>出错了！</h2>
      <button onClick={() => reset()}>重试</button>
    </main>
  );
}
```

**error.tsx 的作用范围**：只对同级和子级路由生效。

```
app/dashboard/invoices/error.tsx
  → 只捕获 /dashboard/invoices/* 的错误
  → 不会影响 /dashboard/customers 等其他路由
```

### not-found.tsx —— 404 页面

```tsx
// app/dashboard/invoices/[id]/edit/page.tsx
export default async function Page({ params }) {
  const { id } = await params;
  const invoice = await fetchInvoiceById(id);

  // 如果数据库里找不到这个 id 的发票
  if (!invoice) {
    notFound();  // ← 主动触发 404，显示最近的 not-found.tsx
  }

  return <Form invoice={invoice} />;
}
```

```tsx
// app/dashboard/invoices/[id]/edit/not-found.tsx
export default function NotFound() {
  return (
    <main>
      <h2>发票不存在</h2>
      <Link href="/dashboard/invoices">返回发票列表</Link>
    </main>
  );
}
```

### loading.tsx —— 加载中的占位显示

```tsx
// app/dashboard/(overview)/loading.tsx
// 这个文件会在仪表盘首页数据加载期间自动显示

export default function Loading() {
  return <DashboardSkeleton />;  // 骨架屏组件
}
```

Next.js 自动把 `loading.tsx` 包裹在 `<Suspense>` 里：

```
页面加载中 → 显示 loading.tsx 的内容
页面加载完 → 自动替换为真实内容
```

### 骨架屏（Skeleton）是什么？

骨架屏是内容还没加载出来时，显示的灰色占位块，形状和真实内容一样。让用户知道"内容正在加载"而不是"页面坏了"。

```
加载中：                    加载完成：
┌──────────────┐          ┌──────────────┐
│ ▓▓▓▓▓▓▓▓    │          │ 总收入       │
│ ▓▓▓▓ ▓▓▓▓▓  │   →      │ $45,231.89   │
│ ▓▓▓▓▓▓▓▓▓▓  │          │ +20.1%       │
└──────────────┘          └──────────────┘
```

### 这一章你需要记住的

1. `error.tsx` 捕获运行时错误，必须是客户端组件
2. `notFound()` 主动触发 404
3. `loading.tsx` 自动显示加载状态
4. 这些特殊文件只对同级和子级路由生效
5. 骨架屏提升加载体验

---

## 第 11 章：流式渲染与 Suspense —— 别让用户干等

### 问题：慢数据拖慢整个页面

仪表盘首页要加载三种数据：统计卡片、收入图表、最新发票。

```
普通做法：等所有数据都加载完，才显示整个页面

时间线：|---卡片(2s)---|---图表(3s)---|---发票(1s)---| 显示页面
        用户等了 6 秒才看到任何东西
```

### 解决方案：Suspense + 流式渲染

```tsx
// app/dashboard/(overview)/page.tsx
import { Suspense } from 'react';

export default function DashboardPage() {
  return (
    <main>
      {/* 卡片区域：独立加载，加载完就显示 */}
      <Suspense fallback={<CardsSkeleton />}>
        <CardWrapper />
      </Suspense>

      <div className="grid">
        {/* 收入图表：独立加载 */}
        <Suspense fallback={<RevenueChartSkeleton />}>
          <RevenueChart />
        </Suspense>

        {/* 最新发票：独立加载 */}
        <Suspense fallback={<LatestInvoicesSkeleton />}>
          <LatestInvoices />
        </Suspense>
      </div>
    </main>
  );
}
```

```
流式做法：每个部分独立加载，加载完就显示

时间线：
|---卡片(2s)---|  ← 2 秒后卡片出现
|---图表(3s)--------|  ← 3 秒后图表出现
|---发票(1s)-|  ← 1 秒后发票出现

用户 1 秒后就看到发票，2 秒后看到卡片，3 秒后看到图表
体验比等 6 秒好多了
```

### Suspense 的 fallback 是什么？

`fallback` 是在内容加载期间显示的替代内容（通常是骨架屏）。

```tsx
<Suspense fallback={<div>加载中...</div>}>  {/* 加载时显示这个 */}
  <AsyncComponent />                         {/* 加载完显示这个 */}
</Suspense>
```

### 用 key 触发重新加载

搜索发票时，需要重新加载数据。通过改变 `key` 来触发：

```tsx
// key 变了 → React 认为这是新组件 → 重新挂载 → 重新触发 Suspense
<Suspense key={query + currentPage} fallback={<InvoicesTableSkeleton />}>
  <Table query={query} currentPage={currentPage} />
</Suspense>
```

### 这一章你需要记住的

1. `<Suspense>` 包裹异步组件，实现独立加载
2. `fallback` 指定加载期间显示什么
3. 流式渲染让页面分块到达，不用等全部加载完
4. 改变 `key` 可以触发重新 Suspense

---

## 第 12 章：TypeScript 类型系统

### 是什么？

TypeScript 是 JavaScript 加了类型检查。它在你写代码时就告诉你哪里可能出错了，而不是等运行时才发现。

### 这个项目中用到的类型

**基本类型定义**

```tsx
// app/lib/definitions.ts

// 一条发票的数据长什么样
export type Invoice = {
  id: string;           // UUID 字符串
  customer_id: string;  // 客户 UUID
  amount: number;       // 金额（数字）
  date: string;         // 日期字符串
  status: 'pending' | 'paid';  // 只能是这两个值之一
};
```

**字符串联合类型 `'pending' | 'paid'`**

```tsx
// 这不是普通字符串，是"只能是这两个值"的字符串
status: 'pending' | 'paid'

// ✅ 正确
status = 'pending'
status = 'paid'

// ❌ 编译报错
status = 'cancelled'  // Type '"cancelled"' is not assignable to type '"pending" | "paid"'
```

**Omit —— 从类型中去掉某些字段**

```tsx
// LatestInvoice 的 amount 是 string（已经格式化为 "$1,234.56"）
export type LatestInvoice = {
  id: string;
  name: string;
  amount: string;  // 格式化后的字符串
};

// 但数据库返回的 amount 是 number（原始数字 123456）
// 所以需要一个"除 amount 外和 LatestInvoice 一样，但 amount 是 number"的类型：

export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;  // 覆盖 amount 为 number
};
// Omit<LatestInvoice, 'amount'> 意思是"LatestInvoice 但去掉 amount"
// & { amount: number } 意思是"再加上 amount: number"
```

**泛型查询**

```tsx
// sql<InvoiceForm[]> 告诉 TypeScript：这个查询返回 InvoiceForm 数组
const data = await sql<InvoiceForm[]>`
  SELECT id, customer_id, amount, status FROM invoices WHERE id = ${id}
`;

// data 的类型自动推导为 InvoiceForm[]
// 你可以直接用 data[0].customer_id，TypeScript 知道这个字段存在
```

### 这一章你需要记住的

1. `type` 关键字定义自定义类型
2. `'a' | 'b'` 是联合类型，只允许特定的值
3. `Omit<T, K>` 从类型中排除字段
4. `&` 合并多个类型
5. 泛型 `sql<Type[]>` 让查询结果有类型提示

---

## 第 13 章：Tailwind CSS 样式

### 是什么？

传统 CSS 是这样的：

```css
/* 传统 CSS：给元素起类名，然后在 CSS 文件里写样式 */
.my-button {
  background-color: blue;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```

Tailwind 不用起类名，直接在 `className` 里写样式：

```tsx
// Tailwind：每个样式对应一个简短的类名
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
  点击我
</button>

// bg-blue-500   → 背景色蓝色
// text-white    → 文字白色
// px-4 py-2     → 上下内边距 2，左右内边距 4
// rounded-lg    → 大圆角
```

### clsx —— 条件样式

当样式需要根据条件变化时（比如导航高亮当前页面），用 `clsx`：

```tsx
import clsx from 'clsx';

// clsx 接受一个普通类名字符串和一个对象
// 对象的 key 是类名，value 是条件（true 就加上，false 就不加）
className={clsx(
  'flex h-10 items-center rounded-lg px-4',  // 这些始终生效
  {
    'bg-blue-100 text-blue-600': isActive,     // isActive 为 true 时生效
    'text-gray-500 hover:bg-gray-100': !isActive,  // isActive 为 false 时生效
  }
)}
```

### 响应式设计

Tailwind 用前缀处理不同屏幕尺寸：

```tsx
<div className="md:hidden">       {/* 手机上显示，平板以上隐藏 */}
  手机版布局
</div>
<table className="hidden md:table"> {/* 手机上隐藏，平板以上显示 */}
  电脑版表格
</table>
```

| 前缀 | 含义 | 屏幕宽度 |
|------|------|---------|
| 无前缀 | 所有尺寸 | 任何 |
| `sm:` | 小屏及以上 | ≥ 640px |
| `md:` | 中屏及以上 | ≥ 768px |
| `lg:` | 大屏及以上 | ≥ 1024px |

### 这一章你需要记住的

1. Tailwind 用简短类名直接在元素上写样式
2. `clsx` 处理条件样式
3. `md:` `lg:` 前缀处理响应式
4. `sr-only` 类隐藏文字但屏幕阅读器可见（无障碍）

---

## 第 14 章：字体与图片优化

### 字体优化 next/font

直接在 CSS 里引入 Google 字体有问题：
- 字体文件需要额外下载，页面加载时会"闪烁"（先显示默认字体，再切换）
- 每次加载都向 Google 服务器请求，有隐私问题

`next/font` 解决了这些问题：

```tsx
// app/ui/fonts.ts
import { Inter, Lusitana } from 'next/font/google';

// next/font 在构建时自动下载字体文件，放在你自己的服务器上
export const inter = Inter({ subsets: ['latin'] });
export const lusitana = Lusitana({ subsets: ['latin'], weight: ['400', '700'] });
```

```tsx
// 在 layout.tsx 中使用
export default function RootLayout({ children }) {
  return (
    <body className={`${inter.className} antialiased`}>
      {children}
    </body>
  );
}
```

### 图片优化 next/image

直接用 `<img>` 的问题：
- 不会自动压缩和调整尺寸
- 加载时会导致页面布局抖动

`next/image` 解决了这些问题：

```tsx
import Image from 'next/image';

<Image
  src="/customers/evil-rabbit.png"  // 图片路径
  alt="Evil Rabbit"                  // 无障碍描述
  width={32}                         // 宽度（防止布局抖动）
  height={32}                        // 高度
  className="rounded-full"           // 圆形头像
/>
```

为什么要提供 `width` 和 `height`？因为浏览器在图片加载完之前不知道它多大，可能导致页面内容突然移动。提前告诉浏览器尺寸，它就能预留空间。

### 这一章你需要记住的

1. `next/font` 自动优化字体，避免闪烁
2. `next/image` 自动优化图片大小和格式
3. `width`/`height` 防止布局抖动

---

## 附录：名词解释速查表

| 术语 | 解释 |
|------|------|
| **App Router** | Next.js 的新路由系统，用 `app/` 文件夹组织页面 |
| **Server Component** | 在服务器上运行的组件，可以直接查数据库 |
| **Client Component** | 在浏览器运行的组件，用 `'use client'` 标记 |
| **Server Action** | 服务端函数，客户端可以直接调用，不用写 API |
| **Middleware** | 请求到达页面前执行的代码，用于路由守卫 |
| **Suspense** | React 组件，显示加载占位符直到内容准备好 |
| **流式渲染** | 页面分块发送到浏览器，不用等全部加载完 |
| **骨架屏** | 加载时显示的灰色占位块，形状和真实内容一样 |
| **Zod** | 数据验证库，定义数据应该长什么样 |
| **bcrypt** | 密码加密库，把明文密码变成不可逆的哈希值 |
| **防抖 (Debounce)** | 停止操作一段时间后才执行，避免频繁触发 |
| **revalidatePath** | 清除某个页面缓存，下次访问时重新获取数据 |
| **redirect** | 在 Server Action 中跳转到另一个页面 |
| **Promise.all** | 同时执行多个异步操作，等全部完成 |
| **UUID** | 通用唯一标识符，比如 `e08d612e-30a5-47c3-892e-49db89c3f6e4` |
| **ORM** | 对象关系映射，用代码操作数据库而不用写 SQL |
| **Edge Runtime** | 轻量运行环境，启动快但功能有限 |
| **Node.js Runtime** | 完整的服务端运行环境，支持所有 Node.js API |
