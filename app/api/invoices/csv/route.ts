import { prisma } from '@/app/lib/prisma';

// 处理金额
const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2);
};
// 处理状态
const formatStatus = (status: string) => {
  switch (status) {
    case 'PAID':
      return '已支付';
    case 'PENDING':
      return '待支付';
    case 'CANCELLED':
      return '已取消';
    default:
      return status;
  }
};

export async function GET(request: Request) {
  const invoices = await prisma.invoice.findMany({
    include: {
      customer: true,
    },
    orderBy: { date: 'desc' },
  });

    const header = '客户名称,邮箱,金额(分),状态,日期\n';
    const csvRows = invoices.map((invoice) => {
        const {  amount, status, date, customer } = invoice;
        return `${customer.name},${customer.email},${formatAmount(amount)},${formatStatus(status)},${date.toISOString().split('T')[0]}`;
    });
    const BOM = '\uFEFF';   // ← BOM 标记，告诉 Excel 这是 UTF-8
    const csvContent = BOM + header + csvRows.join('\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="invoices.csv"',
    },
  });
}