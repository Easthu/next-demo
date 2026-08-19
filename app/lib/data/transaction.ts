// 记账本的查询层：账单列表（分页/筛选）、分类（全量/分页/单查）、月度汇总。
// 分工约定：页面组件只管调用这些函数拿数据，Prisma 查询细节都收在这一层
import { prisma } from '@/app/lib/prisma';
import {
  Prisma,
  type Transaction,
  type TransactionCategory,
} from '@prisma/client';

// "带分类对象"的交易类型：由 include 定义反推，与 fetchTransactions 的实际查询保持一致
type TransactionWithCategory = Prisma.TransactionGetPayload<{
  include: { category: true };
}>;

// 月度汇总（列表页顶部汇总卡用；单位是"分"，展示时由 formatCurrency 转元）
export type MonthlySummary = {
  income: number;
  expense: number;
  balance: number;
};

// 每页条数：查询里的 take 和页面算总页数都用它，从这导出——两处各写一个 10，
// 将来只改一处就会出现"第 2 页其实是第 3 页"的错位 bug
export const PAGE_SIZE = 10;

// 查账单（按日期倒序 + 分页 + 按分类筛选）——列表页用
// 返回 { data, total }：分页 UI 要拿到"总数"才能算总页数，只返回列表不够
export async function fetchTransactions(params?: {
  page?: number;
  categoryId?: number;
}): Promise<{ data: TransactionWithCategory[]; total: number }> {
  try {
    const { page = 1, categoryId } = params || {};

    // where 提取成变量：findMany 和 count 必须共用同一个条件，否则 total 是全表数、页数算错。
    // categoryId 为 undefined（选"全部分类"）时 Prisma 忽略该字段 = 不筛选
    const where = {
      category_id: categoryId, // 模型字段名 category_id（数据库风格），参数名是驼峰，注意区分
    };

    // findMany 取当前页，count 算总数，互不依赖——Promise.all 并行，总耗时 ≈ 较慢那个
    const [data, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        include: {
          category: true, // 带出关联的分类对象（列表页显示分类名用）
        },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.transaction.count({ where }),
    ]);

    return { data, total };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transactions.');
  }
}

// 查全部分类——下拉框用（记账表单、列表页筛选），不分页直接全量
export async function fetchCategories(): Promise<TransactionCategory[]> {
  try {
    return await prisma.transactionCategory.findMany({
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
  }
}

// 分页查分类——分类管理列表页用
// 和 fetchCategories（全量版）并存：一个给下拉框、一个给分页表格，返回形状不同，不硬合成一个
export async function fetchCategoriesPage(params?: {
  page?: number;
}): Promise<{ data: TransactionCategory[]; total: number }> {
  try {
    const { page = 1 } = params || {};

    // 排序和全量版保持一致：同一份数据的两个入口，顺序不该不一样
    const [data, total] = await Promise.all([
      prisma.transactionCategory.findMany({
        orderBy: { name: 'asc' },
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
      }),
      prisma.transactionCategory.count(),
    ]);

    return { data, total };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories page.');
  }
}

// 查单笔交易——编辑页回填表单用（不带 category include：表单只要 category_id 字段，够用）
export async function fetchTransactionById(
  id: string,
): Promise<Transaction | null> {
  try {
    return await prisma.transaction.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transaction.');
  }
}

// 查单个分类——编辑页回填表单用
export async function fetchCategoryById(
  id: number,
): Promise<TransactionCategory | null> {
  try {
    return await prisma.transactionCategory.findUnique({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch category.');
  }
}

// 收入/支出/结余汇总（aggregate 让数据库直接算，不把明细拉回 JS 累加）
// ⚠️ 目前是全量汇总、还没按月过滤——切月是 Day 5 的任务
export async function fetchMonthlySummary(): Promise<MonthlySummary> {
  try {
    const incomeResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'income' },
    });
    const expenseResult = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { type: 'expense' },
    });
    const income = incomeResult._sum.amount || 0;
    const expense = expenseResult._sum.amount || 0;
    const balance = income - expense;

    return { income, expense, balance };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch monthly summary.');
  }
}
