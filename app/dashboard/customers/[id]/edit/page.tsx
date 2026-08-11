import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import EditCustomerForm from '@/app/ui/customers/edit-form';
import { fetchCustomerById } from '@/app/lib/data';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await fetchCustomerById(id);

  if (!customer) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '客户', href: '/dashboard/customers' },
          {
            label: '编辑客户',
            href: '#',
            active: true,
          },
        ]}
      />
      <EditCustomerForm customer={customer} />
    </main>
  );
}
