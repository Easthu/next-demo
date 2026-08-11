import Table from '@/app/ui/customers/table';
import { Suspense } from 'react';
 import { fetchFilteredCustomers } from '@/app/lib/data';

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params?.query || '';
  const customers = await fetchFilteredCustomers(query);

  return (
    <div className="w-full">
      <Suspense fallback={<div>Loading...</div>}>
        <Table customers={customers} />
      </Suspense>
    </div>
  );
}
