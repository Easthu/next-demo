import Link from 'next/link';

import { fetchMonthlySummary, fetchTransactions } from '@/app/lib/data/transaction';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default async function Page() {
  const transactions = await fetchTransactions();
  const monthlySummary = await fetchMonthlySummary();

  return (
    <div className="w-full">
      <Link
        href="/dashboard/transactions/create"
        className="mb-4 inline-block rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        新增账单
      </Link>

      {/* 汇总：数字来自 aggregate（单位"分"，formatCurrency 转元显示） */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">交易记录</h1>
        <div className="text-lg font-semibold">
          收入: {formatCurrency(monthlySummary.income)} |
          支出: {formatCurrency(monthlySummary.expense)} |
          结余: {formatCurrency(monthlySummary.balance)}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>交易ID</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>类别</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>描述</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>{transaction.category.name}</TableCell>
              <TableCell>{formatDateToLocal(transaction.date)}</TableCell>
              {/* TODO：类型列还是英文 income/expense，待映射成 收入/支出 */}
              <TableCell>{transaction.type}</TableCell>
              <TableCell>{transaction.description || '无'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
