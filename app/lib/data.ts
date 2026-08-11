// 数据查询层 —— 所有从数据库读取数据的函数都在这里
// 全部使用 Prisma ORM，不再手写 SQL
//
// 设计原则：
// 1. 查询函数只返回原始数据（金额是"分"），格式化交给调用方
// 2. 但为了兼容现有页面（页面期望拿到已格式化的字符串），部分函数仍在此处做 formatCurrency

import { prisma } from '@/app/lib/prisma';
import { formatCurrency } from '@/app/lib/utils';
import type {
  CustomerField,
  FormattedCustomersTable,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
} from './definitions';

// 发票列表每页显示的条数
const ITEMS_PER_PAGE = 6;

/**
 * 获取全部月度收入数据
 * 用途：仪表盘首页的收入柱状图
 */
export async function fetchRevenue() {
  try {
    const revenue = await prisma.revenue.findMany();
    return revenue;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

/**
 * 获取最新 5 条发票（附带客户信息）
 * 用途：仪表盘首页的"最新发票"列表
 * 要点：用 include 自动 JOIN customers，不用手写 JOIN
 */
export async function fetchLatestInvoices() {
  try {
    const data = await prisma.invoice.findMany({
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    // 格式化金额（分 → 元，带 $ 符号）
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

/**
 * 获取仪表盘顶部 4 个统计卡片的数据
 * 用途：仪表盘首页的卡片（发票总数 / 客户数 / 已收款 / 待处理）
 * 要点：四个查询互不依赖，用 Promise.all 并行执行
 */
export async function fetchCardData() {
  try {
    // 并行查询：发票数、客户数、已收款总额、待处理总额
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

    const numberOfInvoices = invoiceCount;
    const numberOfCustomers = customerCount;
    const totalPaidInvoices = formatCurrency(paidSum._sum.amount ?? 0);
    const totalPendingInvoices = formatCurrency(pendingSum._sum.amount ?? 0);

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

/**
 * 构建发票搜索的 where 条件（搜索和分页计数共用，保证结果一致）
 * 搜索范围：客户名 / 客户邮箱 / 状态
 * 注意：原项目还能搜金额和日期，但 Prisma 不好把数字/日期转成文本做模糊匹配
 *       这里的搜索够用了（实际用户主要搜客户名和状态）
 */
function buildInvoiceWhere(query: string) {
  if (!query) return {}; // 空搜索 → 返回全部
  return {
    OR: [
      { customer: { name: { contains: query, mode: 'insensitive' as const } } },
      { customer: { email: { contains: query, mode: 'insensitive' as const } } },
      { status: { contains: query, mode: 'insensitive' as const } },
    ],
  };
}

/**
 * 分页 + 搜索查询发票（附带客户信息）
 * 用途：发票列表页 /dashboard/invoices 的表格数据
 * @param query        搜索词
 * @param currentPage  当前页码（从 1 开始）
 */
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const data = await prisma.invoice.findMany({
      where: buildInvoiceWhere(query),
      include: { customer: true },
      orderBy: { date: 'desc' },
      take: ITEMS_PER_PAGE,
      skip: offset,
    });

    // 把 Prisma 的嵌套结构扁平化成页面期望的 InvoicesTable 形状
    // customer.name → name，customer.email → email，Date → string
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

/**
 * 根据搜索词计算发票总页数
 * 用途：发票列表页底部分页器显示"共几页"
 */
export async function fetchInvoicesPages(query: string) {
  try {
    const totalCount = await prisma.invoice.count({
      where: buildInvoiceWhere(query),
    });

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

/**
 * 按 id 查单条发票（编辑页用）
 * 用途：发票编辑页 /dashboard/invoices/[id]/edit 回填表单
 * 要点：数据库存"分"，读出后 /100 转成"元"给表单显示
 */
export async function fetchInvoiceById(id: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
    });

    if (!invoice) return undefined;

    // 分 → 元（编辑表单要的是数字，不是 $ 字符串）
    // 返回 InvoiceForm 类型（status 断言成联合类型）
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

/**
 * 按 id 查单条发票（详情页用，含客户信息和日期）
 * 和 fetchInvoiceById 的区别：这个返回原始 amount（分）+ date + 客户信息
 * fetchInvoiceById 是给编辑表单用的（amount 转元、没 date）
 */
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

/**
 * 获取全部客户（精简版，只要 id 和 name）
 * 用途：创建/编辑发票表单里的"客户下拉框"选项
 */
export async function fetchCustomers() {
  try {
    const customers = await prisma.customer.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

/**
 * 搜索 + 聚合统计客户列表
 * 用途：客户列表页 /dashboard/customers 的表格数据
 * @param query 搜索词（匹配客户名或邮箱）
 * 要点：
 *   1) 用 include 拿到每个客户的所有发票，统计在 JS 里算（不用 SQL GROUP BY）
 *   2) 金额用 formatCurrency 格式化成字符串（带 $ 符号）
 */
export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await prisma.customer.findMany({
      include: { invoices: true },
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' as const } },
          { email: { contains: query, mode: 'insensitive' as const } },
        ],
      },
      orderBy: { name: 'asc' },
    });

    // 在 JS 里算统计（替代 SQL 的 COUNT/SUM + GROUP BY）
    const customers = data.map((customer) => {
      const totalInvoices = customer.invoices.length;
      const totalPending = customer.invoices
        .filter((inv) => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const totalPaid = customer.invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

      // 删掉 invoices 数组，只保留统计数字 + 格式化金额
      const { invoices, ...rest } = customer;
      return {
        ...rest,
        total_invoices: totalInvoices,
        total_pending: formatCurrency(totalPending),
        total_paid: formatCurrency(totalPaid),
      };
    });

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

/**
 * 按 id 查单个客户（只取基本信息）
 * 用途：客户详情页 /dashboard/customers/[id] 的客户信息卡片
 */
export async function fetchCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id },
    });
    return customer;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer by ID.');
  }
}

/**
 * 获取某个客户的所有发票
 * 用途：客户详情页 /dashboard/customers/[id] 的发票记录列表
 * @param customerId 客户的主键 UUID
 */
export async function fetchInvoicesByCustomer(customerId: string) {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { customer_id: customerId },
      orderBy: { date: 'desc' },
    });
    return invoices;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch invoices for customer.');
  }
}
