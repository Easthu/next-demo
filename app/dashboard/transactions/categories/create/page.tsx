import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import CategoryForm from '@/app/ui/transactions/category-form';

export default function CreateCategory() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '账单', href: '/dashboard/transactions' },
          { label: '分类管理', href: '/dashboard/transactions/categories' },
          { label: '新增分类', href: '#', active: true },
        ]}
      />
      {/* 不传 category = 新增模式 */}
      <CategoryForm />
    </main>
  );
}
