import { notFound } from 'next/navigation';

import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import CategoryForm from '@/app/ui/transactions/category-form';
import { fetchCategoryById } from '@/app/lib/data/transaction';

// 编辑分类：服务端查原数据 → 经 props 传给 client 表单回填（server → client 唯一通道）
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // 路由参数天生是字符串，分类的 id 是自增 Int，转一下
  const category = await fetchCategoryById(Number(id));

  if (!category) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '账单', href: '/dashboard/transactions' },
          { label: '分类管理', href: '/dashboard/transactions/categories' },
          { label: '编辑分类', href: '#', active: true },
        ]}
      />
      {/* 传了 category = 编辑模式 */}
      <CategoryForm category={category} />
    </main>
  );
}
