// 客户相关的查询函数
import { prisma } from '@/app/lib/prisma';
import { formatCurrency } from '@/app/lib/utils';

// 获取全部客户（精简版，给发票表单的客户下拉框用）
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

// 搜索 + 聚合统计客户列表（客户列表页表格数据）
// 聚合在 JS 层做：include 出全部发票再 reduce——对照记账本 fetchMonthlySummary 的
// aggregate（数据库聚合）：数据量小练 include 够用，量大时聚合该下沉给数据库
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

    const customers = data.map((customer) => {
      const totalInvoices = customer.invoices.length;
      const totalPending = customer.invoices
        .filter((inv) => inv.status === 'pending')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const totalPaid = customer.invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amount, 0);

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

// 按 id 查单个客户（客户详情页信息卡片）
export async function fetchCustomerById(id: string) {
  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    return customer;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer by ID.');
  }
}

// 获取某个客户的所有发票（客户详情页发票记录列表）
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
