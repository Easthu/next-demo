// 类型和校验规则的单一来源，分两个世界：
// ① Zod schema（下半部分）——表单输入的"契约"：客户端 zodResolver + 服务端 safeParse 共用一份，
//    TS 类型由 z.infer 推导，不手写（手写会跟规则漂移）
// ② 手写类型（上半部分）——Next.js 官方教程的前 Prisma 时代遗产，描述"数据库行"，
//    部分页面 props 还在引用；数据库行的类型正确来源是 @prisma/client 的生成类型，
//    这部分属于待清理的旧世界，新的表单输入一律走 ① 的路线
import { z } from 'zod';
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // 在 TypeScript 中，这被称为字符串联合类型。
  // 它表示 "status" 属性只能是这两个字符串之一：'pending' 或 'paid'。
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// 数据库返回的 amount 是数字，但我们之后会用 formatCurrency 函数把它格式化成字符串
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};

// 交易表单的校验规则（TransactionForm 客户端 和 create/updateTransaction 服务端共用，双保险）
export const createTransactionSchema = z.object({
  amount: z.coerce.number().min(0.01, { message: '金额必须大于 0' }), // coerce：number 输入框给的是字符串，先转再验
  type: z.enum(['income', 'expense'], { message: '请选择类型' }),
  categoryId: z.number().int().positive({ message: '请选择分类' }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: '请输入有效的日期',
  }),
  description: z.string().optional(),
});
// 分类表单的校验规则（CategoryForm + saveCategory 共用；name 的 trim 让首尾空格存不进库）
export const createCategoriesSchema = z.object({
  name: z.string().trim().min(1, '请输入名称'),
  type: z.enum(['income', 'expense']),
  description: z.string().optional(),
})

// 表单值的 TS 类型——由 schema 推导，不手写（手写会漂移）
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type CreateCategoryInput = z.infer<typeof createCategoriesSchema>
