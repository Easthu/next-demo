// 发票相关的查询函数
import { prisma } from '@/app/lib/prisma';
import type { InvoiceForm, InvoicesTable } from '../definitions';

// 发票列表每页显示的条数
const ITEMS_PER_PAGE = 6;

// 构建发票搜索的 where 条件（搜索和分页计数共用）
function buildInvoiceWhere(query: string) {
  if (!query) return {};
  return {
    OR: [
      { customer: { name: { contains: query, mode: 'insensitive' as const } } },
      { customer: { email: { contains: query, mode: 'insensitive' as const } } },
      { status: { contains: query, mode: 'insensitive' as const } },
    ],
  };
}

// 分页 + 搜索查询发票（发票列表页表格数据）
export async function fetchFilteredInvoices(query: string, currentPage: number) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await prisma.invoice.findMany({
      where: buildInvoiceWhere(query),
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    const invoices: InvoicesTable[] = data.map((invoice) => ({
      id: invoice.id,
      customer_id: invoice.customer_id,
      amount: invoice.amount,
      date: invoice.date.toISOString().split('T')[0],
      status: invoice.status as 'pending' | 'paid',
      name: invoice.customer.name,
      email: invoice.customer.email,
      image_url: invoice.customer.image_url,
    }));

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

// 根据搜索词计算发票总页数
export async function fetchInvoicesPages(query: string) {
  try {
    const totalCount = await prisma.invoice.count({
      where: buildInvoiceWhere(query),
    });
    return Math.ceil(totalCount / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

// 按 id 查单条发票（编辑页回填表单用，amount 转元）
export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return undefined;

    const result: InvoiceForm = {
      id: invoice.id,
      customer_id: invoice.customer_id,
      amount: invoice.amount / 100,
      status: invoice.status as 'pending' | 'paid',
    };
    return result;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

// 按 id 查单条发票（详情页用，含客户信息和原始金额）
export async function fetchInvoiceDetailById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { customer: true },
    });
    return invoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice detail.');
  }
}
