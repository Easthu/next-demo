import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import CreateCustomerForm from '@/app/ui/customers/create-form';

export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '客户', href: '/dashboard/customers' },
          {
            label: '创建客户',
            href: '/dashboard/customers/create',
            active: true,
          },
        ]}
      />
      <CreateCustomerForm />
    </main>
  );
}
