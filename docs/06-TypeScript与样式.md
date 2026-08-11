# TypeScript 类型、Tailwind CSS 与字体图片优化

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
