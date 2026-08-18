import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCategories } from '@/app/lib/data/transaction';
import CreateTransactionForm from '@/app/ui/transactions/create-form';

export default async function CreateTransaction() {
  // 分类数据在服务端查好，经 props 传给 client 表单（server → client 唯一通道）
  const categories = await fetchCategories();

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '账单', href: '/dashboard/transactions' },
          { label: '创建账单', href: '/dashboard/transactions/create', active: true },
        ]}
      />
      <CreateTransactionForm categories={categories} />
    </main>
  );
}
