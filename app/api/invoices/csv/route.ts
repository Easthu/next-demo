import { prisma } from '@/app/lib/prisma';

// 处理金额：分转元，保留两位小数
const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2);
};

// 处理状态：数据库里是小写 'paid'/'pending'
const formatStatus = (status: string) => {
  switch (status) {
    case 'paid':
      return '已支付';
    case 'pending':
      return '待处理';
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

  const header = '客户名称,邮箱,金额(美元),状态,日期\n';
  const csvRows = invoices.map((invoice: {
    amount: number;
    status: string;
    date: Date;
    customer: { name: string; email: string };
  }) => {
    const { amount, status, date, customer } = invoice;
    return `${customer.name},${customer.email},${formatAmount(amount)},${formatStatus(status)},${date.toISOString().split('T')[0]}`;
  });
  const BOM = '\uFEFF'; // BOM 标记，让 Excel 正确识别 UTF-8，避免中文乱码
  const csvContent = BOM + header + csvRows.join('\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invoices.csv"',
    },
  });
}
