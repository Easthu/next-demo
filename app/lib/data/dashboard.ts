// 仪表盘相关的查询函数（统计、排行）
import { prisma } from '@/app/lib/prisma';
import { formatCurrency } from '@/app/lib/utils';
import type { LatestInvoice } from '../definitions';

// 获取全部月度收入数据（仪表盘收入柱状图）
export async function fetchRevenue() {
  try {
    const revenue = await prisma.revenue.findMany();
    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

// 获取最新 5 条发票（仪表盘"最新发票"列表）
export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    const latestInvoices: LatestInvoice[] = data.map((invoice) => ({
      id: invoice.id,
      name: invoice.customer.name,
      image_url: invoice.customer.image_url,
      email: invoice.customer.email,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

// 获取仪表盘顶部 4 个统计卡片的数据
export async function fetchCardData() {
  try {
    const [invoiceCount, customerCount, paidSum, pendingSum] = await Promise.all([
      prisma.invoice.count(),
      prisma.customer.count(),
      prisma.invoice.aggregate({
        where: { status: 'paid' },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'pending' },
        _sum: { amount: true },
      }),
    ]);

    return {
      numberOfCustomers: customerCount,
      numberOfInvoices: invoiceCount,
      totalPaidInvoices: formatCurrency(paidSum._sum.amount ?? 0),
      totalPendingInvoices: formatCurrency(pendingSum._sum.amount ?? 0),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

// 客户消费排行榜（groupBy 按客户分组算总消费，再查客户名）
export async function fetchTopCustomers(limit: number = 5) {
  const res = await prisma.invoice.groupBy({
    by: ['customer_id'],
    where: { status: 'paid' },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: limit,
  });
  const customers = await prisma.customer.findMany({
    where: { id: { in: res.map((r) => r.customer_id) } },
  });

  type TopCustomer = {
    id: string;
    name: string;
    amount: number;
    total_paid: string;
  };

  const result: TopCustomer[] = res.map((r) => {
    const customer = customers.find((c) => c.id === r.customer_id);
    return {
      id: r.customer_id,
      name: customer?.name || '',
      amount: r._sum.amount || 0,
      total_paid: formatCurrency(r._sum.amount || 0),
    };
  });
  return result;
}
