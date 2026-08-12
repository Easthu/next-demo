# shadcn/ui 组件库入门指南

> 本项目引入了 shadcn/ui 作为 UI 组件库，替代手写 HTML + Tailwind class。
> 这份文档从零讲解 shadcn/ui 是什么、怎么用，假设你完全没用过。

---

## 一、shadcn/ui 是什么

**一句话：它是一个"组件代码库"，你把组件代码复制到自己项目里，而不是 npm 安装。**

这和你用过的 Vue 组件库（Element Plus、Ant Design Vue）有个根本区别：

| | Element Plus（Vue 里你用的） | shadcn/ui（这个项目用的） |
|---|---|---|
| 怎么装 | `npm install element-plus` | `npx shadcn add button`（复制代码到项目） |
| 组件代码在哪 | `node_modules/` 里（看不到源码） | **你项目的 `components/ui/` 里**（完全可见） |
| 能改吗 | 不能（改了升级会覆盖） | **能，随便改**（代码就在你项目里） |
| 样式怎么改 | 穿透 CSS / 覆盖类名 | 直接改组件源码 |

打开项目的 `components/ui/button.tsx`——这就是 shadcn 的 Button 组件，**它就在你项目里**，不是在 node_modules 里。你可以打开它随便改。

---

## 二、为什么是"复制代码"而不是 npm 包

因为传统的 npm 组件库有个痛点——**你想改一个小样式，改不了**。

比如 Element Plus 的按钮圆角太大，你想改成 `rounded-sm`：
```vue
<!-- Element Plus：只能覆盖样式，很费劲 -->
<el-button class="!rounded-sm">按钮</el-button>
```

shadcn/ui 的做法——**代码在你手里，直接改**：
```tsx
// components/ui/button.tsx —— 打开这个文件，直接改
// 把 rounded-md 改成 rounded-sm，搞定
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-sm ...',  // ← 直接改这里
)
```

---

## 三、核心技术概念

### 1. variants（变体）

这是 shadcn 组件最重要的特性。看 Button 组件的定义：

```tsx
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',  // 所有按钮共有的基础样式
  {
    variants: {
      variant: {           // 变体：不同"风格"的按钮
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {              // 尺寸
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
  }
)
```

**用的时候选 variant**：

```tsx
<Button type="submit">创建客户</Button>           // 默认 variant="default"（深色背景）
<Button variant="outline">取消</Button>            // 描边按钮（透明 + 边框）
<Button variant="destructive">删除</Button>        // 红色危险按钮
<Button size="sm">小按钮</Button>                  // 小尺寸
```

对比 Element Plus：

```vue
<!-- Element Plus 的 type 就是 shadcn 的 variant -->
<el-button type="primary">主要按钮</el-button>
<el-button type="danger">危险按钮</el-button>
```

**一模一样的思路**——`variant` 就是 Element Plus 的 `type`。

### 2. cn() 函数——合并 class

shadcn 组件都有默认样式，你可以通过 `className` **追加或覆盖**。`cn()` 就是干这个的：

```tsx
import { cn } from '@/app/lib/utils';

// 合并多个 class
cn('px-2 py-1', 'bg-blue-500')
// → 'px-2 py-1 bg-blue-500'

// 条件 class（对比 Vue 的 :class）
cn('base', isActive && 'active')
// → isActive 为 true: 'base active'

// 冲突时后面的覆盖前面的（tailwind-merge 的作用）
cn('px-2', 'px-4')
// → 'px-4'    ← px-4 覆盖了 px-2
```

对比 Vue 的写法：

```vue
<!-- Vue 里你用 :class 或 clsx 做条件 class -->
<div :class="['px-2 py-1', { 'bg-blue-500': isActive }]">
```

```tsx
// shadcn 用 cn() 做同样的事
<div className={cn('px-2 py-1', isActive && 'bg-blue-500')}>
```

### 3. CSS 变量——主题系统

shadcn/ui 的颜色不用硬编码（如 `bg-blue-500`），而是用 **CSS 变量**：

```css
/* app/ui/global.css 里定义的变量 */
:root {
  --primary: 222.2 47.4% 11.2%;        /* 主色调 */
  --destructive: 0 84.2% 60.2%;        /* 危险色（红） */
  --muted: 210 40% 96.1%;              /* 静音色（灰） */
  --border: 214.3 31.8% 91.4%;         /* 边框色 */
  ...
}
```

```tsx
// 组件里用语义色名，不是硬编码颜色
<Button variant="default">        // 自动用 --primary 的颜色
<Button variant="destructive">    // 自动用 --destructive 的颜色（红色）
```

**好处**：改主题色只要改 CSS 变量，所有组件自动更新。将来做暗色模式只要加个 `.dark` 变量集。

---

## 四、怎么用 shadcn 组件

### 引入新组件

```bash
# 引入一个组件
npx shadcn@latest add select

# 引入多个
npx shadcn@latest add select dialog tabs badge

# 引入一个 Block（预制页面区块）
npx shadcn@latest add dashboard-01
```

它会自动：
1. 把组件代码复制到 `components/ui/`
2. 安装缺少的底层依赖（Radix UI 包）
3. 更新 `tailwind.config.ts` 和 `global.css`（如果需要）

### 在代码里使用

```tsx
// shadcn 组件从 components/ui/ 导入
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// 对比：旧的自定义组件从 app/ui/ 导入（两者不冲突）
import { Button } from '@/app/ui/button';
import { Search } from '@/app/ui/search';
```

### 组件套组件——Card 的用法

shadcn 有些组件是"组合式"的——一个 Card 由多个子组件拼成：

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>客户信息</CardTitle>
    <CardDescription>填写客户的基本信息</CardDescription>
  </CardHeader>
  <CardContent>
    <Input placeholder="客户名称" />
  </CardContent>
  <CardFooter>
    <Button type="submit">保存</Button>
  </CardFooter>
</Card>
```

像搭积木一样——Card 是外壳，CardHeader/Content/Footer 是内部区域，你在各区域里放内容。

---

## 五、改造前后对比（客户创建表单）

### 改造前（手写 HTML）

```tsx
<div className="rounded-md bg-gray-50 p-4 md:p-6">
  <label htmlFor="name" className="mb-2 block text-sm font-medium">
    客户名称
  </label>
  <input
    id="name"
    name="name"
    type="text"
    placeholder="请输入客户名称"
    className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
    required
  />
</div>
<Button type="submit">创建客户</Button>
// ↑ 旧的自定义 Button（app/ui/button.tsx，不支持 variant）
```

### 改造后（shadcn 组件）

```tsx
<Card>
  <CardHeader><CardTitle>客户信息</CardTitle></CardHeader>
  <CardContent className="flex flex-col gap-4">
    <div className="flex flex-col gap-2">
      <Label htmlFor="name">客户名称</Label>
      <Input id="name" name="name" placeholder="请输入客户名称" required />
    </div>
  </CardContent>
</Card>
<Button type="submit">创建客户</Button>
<Button variant="outline" asChild><Link href="/dashboard/customers">取消</Link></Button>
// ↑ shadcn 的 Button（支持 variant）
```

**核心区别**：
- 不用手写一大堆 Tailwind class（`peer block w-full rounded-md border border-gray-200 py-2 pl-10 ...`）
- `<Input />` 一行搞定，样式在 `components/ui/input.tsx` 里定义好了
- Button 支持 `variant="outline"`、`variant="destructive"` 等变体

---

## 六、本项目当前的 shadcn 配置

### 涉及的文件

| 文件 | 作用 |
|------|------|
| `components.json` | shadcn 配置（告诉 CLI 组件放哪、别名怎么映射） |
| `components/ui/*.tsx` | shadcn 组件代码（6 个基础组件） |
| `app/lib/utils.ts` | `cn()` 函数（合并 Tailwind class） |
| `tailwind.config.ts` | shadcn 语义色映射 + animate 插件 |
| `app/ui/global.css` | CSS 变量（`:root` + `.dark`） |

### 已引入的组件

| 组件 | 路径 | 作用 |
|------|------|------|
| Button | `components/ui/button.tsx` | 按钮（支持 variant） |
| Input | `components/ui/input.tsx` | 输入框 |
| Label | `components/ui/label.tsx` | 标签 |
| Checkbox | `components/ui/checkbox.tsx` | 复选框 |
| Card | `components/ui/card.tsx` | 卡片容器 |
| Table | `components/ui/table.tsx` | 表格 |

### dashboard-01 Block 引入的组件

| 组件 | 路径 | 作用 |
|------|------|------|
| app-sidebar | `components/app-sidebar.tsx` | 侧边栏（带折叠） |
| site-header | `components/site-header.tsx` | 顶部导航栏 |
| section-cards | `components/section-cards.tsx` | 数据卡片区域 |
| chart-area-interactive | `components/chart-area-interactive.tsx` | 交互式图表 |
| data-table | `components/data-table.tsx` | 数据表格 |
| nav-* | `components/nav-*.tsx` | 各种导航菜单 |

> dashboard-01 的页面代码在 `app/dashboard/_dashboard-01/page.tsx`（下划线前缀，Next.js 忽略，不产生路由）。可以打开参考它怎么用组件拼页面。

---

## 七、Blocks（区块）和模板

### 三个层次

```
组件（Components）→ 单个元素：Button、Input、Checkbox
区块（Blocks）    → 一组组合好的区域：登录卡片、仪表盘卡片、数据表格
模板（Templates） → 完整页面：整个登录页、整个仪表盘页
```

### 免费资源

| 来源 | 免费吗 | 内容 |
|------|--------|------|
| shadcn 官方组件 | ✅ 完全免费 | 40+ 组件 |
| shadcn 官方 Blocks | ✅ 完全免费 | 登录页、仪表盘等 |
| [awesome-shadcn-ui](https://github.com/birobirobiro/awesome-shadcn-ui) | ✅ 免费 | 社区资源列表 |

第三方模板库（shadcnblocks.com 等）部分收费，学习阶段不需要。

### 怎么安装 Block

```bash
npx shadcn@latest add dashboard-01    # 仪表盘
npx shadcn@latest add login-03        # 登录页
```

安装后代码在 `components/` 下，不会自动替换现有页面——它是参考代码，你把数据塞进去。

---

## 八、import 路径区分（重要！）

现在项目里有两套 UI 组件，别搞混：

```tsx
// shadcn 组件（新的，从 components/ui/ 导入）
import { Button } from '@/components/ui/button';      // 支持 variant
import { Input } from '@/components/ui/input';         // 自带样式
import { Card } from '@/components/ui/card';

// 旧的自定义组件（从 app/ui/ 导入）
import { Button } from '@/app/ui/button';              // 旧版，不支持 variant
import { Search } from '@/app/ui/search';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
```

**新功能用 shadcn（`@/components/ui/`），旧功能逐步迁移**。两条路径不冲突。

---

## 九、常用组件速查

### Button

```tsx
import { Button } from '@/components/ui/button';

<Button>默认按钮</Button>
<Button variant="destructive">删除</Button>
<Button variant="outline">取消</Button>
<Button variant="ghost">幽灵</Button>
<Button size="sm">小按钮</Button>
<Button size="lg">大按钮</Button>
<Button asChild><Link href="/">跳转</Link></Button>  {/* asChild：让 Link 用 Button 样式 */}
```

### Input

```tsx
import { Input } from '@/components/ui/input';

<Input placeholder="请输入" />
<Input type="email" name="email" />
<Input defaultValue="张三" />
<Input className="border-red-500" />  {/* 追加/覆盖样式 */}
```

### Label

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="name">客户名称</Label>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>内容</CardContent>
  <CardFooter>底部</CardFooter>
</Card>
```

### Checkbox

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox id="agree" name="agree" />
```

### Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>列名</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>数据</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 十、速查总结

```
shadcn/ui = 组件代码复制到项目里（不是 npm 安装）
  代码完全可见可改
  基于 Radix UI（无障碍）+ Tailwind CSS（样式）

核心概念：
  variant  = 按钮的"风格"（default/destructive/outline/ghost/link）
  size     = 尺寸（default/sm/lg/icon）
  cn()     = 合并 Tailwind class（后面的覆盖前面的）
  CSS 变量 = 主题系统（改 :root 变量就改了全局配色）

引入组件/Block：
  npx shadcn@latest add select dialog tabs     # 组件
  npx shadcn@latest add dashboard-01            # Block

import 路径：
  shadcn 组件 → @/components/ui/xxx
  旧自定义组件 → @/app/ui/xxx
  两者不冲突，新功能用 shadcn，旧的逐步迁移
```
