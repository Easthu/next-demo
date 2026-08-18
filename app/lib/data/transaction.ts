// 交易相关的查询函数（记账本：列表页 / 汇总卡 / 表单分类下拉）
import { prisma } from '@/app/lib/prisma';
import { Prisma, type Transaction, type TransactionCategory } from '@prisma/client';

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

// 查所有账单（按日期倒序，分页）
export async function fetchTransactions(params?: {
  page?: number;
  limit?: number;
}): Promise<TransactionWithCategory[]> {
  try {
    const { page = 1, limit = 10 } = params || {};
    const transactions = await prisma.transaction.findMany({
      orderBy: { date: 'desc' },
      include: {
        category: true, // 带出关联的分类对象（列表页显示分类名用）
      },
      take: limit,
      skip: (page - 1) * limit,
    });
    return transactions;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch transactions.');
  }
}

// 查全部分类（新增/编辑表单的分类下拉用）
export async function fetchCategories(): Promise<TransactionCategory[]> {
  try {
    const categories = await prisma.transactionCategory.findMany({
      orderBy: { name: 'asc' },
    });
    return categories;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch categories.');
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
