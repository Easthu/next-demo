import { notFound } from 'next/navigation';

import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import TransactionForm from '@/app/ui/transactions/transaction-form';
import {
  fetchCategories,
  fetchTransactionById,
} from '@/app/lib/data/transaction';

// 编辑账单：服务端查原数据 + 分类下拉数据 → 经 props 传给 client 表单回填
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Transaction 的 id 是 UUID 字符串，路由参数天生 string，不用转类型（对照分类的 id 要 Number）

  const [transaction, categories] = await Promise.all([
    fetchTransactionById(id),
    fetchCategories(),
  ]);

  if (!transaction) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '账单', href: '/dashboard/transactions' },
          { label: '编辑账单', href: '#', active: true },
        ]}
      />
      {/* 传了 transaction = 编辑模式。
          type 断言：数据库字段是 String（宽），表单 schema 已收紧成联合（窄）——
          值域实际由写入时的 z.enum 保证，这里 as 只是替编译器补上这层知识；
          万一库里有脏数据，后面 safeParse 也会兜住 */}
      <TransactionForm
        transaction={{ ...transaction, type: transaction.type as 'income' | 'expense' }}
        categories={categories}
      />
    </main>
  );
}
