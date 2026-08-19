// 此文件包含数据类型的定义。
// 它描述了数据的结构，以及每个属性应接受的数据类型。
// 为了教学简单，我们手动定义了这些类型。
// 如果使用 ORM（如 Prisma），这些类型会自动生成。
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

// 记账本表单校验 schema（create-form 客户端 和 createTransaction action 服务端共用一份，双保险）
export const createTransactionSchema = z.object({
  amount: z.coerce.number().min(0.01, { message: '金额必须大于 0' }), // coerce：number 输入框给的是字符串，先转再验
  type: z.string({ message: '请选择类型' }),
  categoryId: z.number().int().positive({ message: '请选择分类' }),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: '请输入有效的日期',
  }),
  description: z.string().optional(),
});
export const createCategoriesSchema = z.object({
  
})
// 表单值的 TS 类型——由 schema 推导，不手写（手写会漂移）
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// TODO(你)：把上面 createCategoriesSchema 的字段补齐（name 非空、type 限定 'income' | 'expense'、
// description 非必填 → z.string().optional()），然后删掉下面手写类型，
// 换成 z.infer 推导的写法（和 CreateTransactionInput 同款）——分类表单和两个 action 用的就是它
export type CreateCategoryInput = {
  name: string;
  type: string;
  description?: string;
};