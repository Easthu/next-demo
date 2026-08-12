import Image from 'next/image';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import InvoiceStatus from '@/app/ui/invoices/status';
import { lusitana } from '@/app/ui/fonts';
import {
  fetchCustomerById,
  fetchInvoicesByCustomer,
} from '@/app/lib/data';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { DeleteDetailCustomer } from '@/app/ui/customers/buttons';
import { Card, CardContent } from '@/components/ui/card';
import type { Customer, Invoice } from '@prisma/client';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 并行查询：客户信息 + 该客户的发票列表
  const [customerData, invoicesData] = await Promise.all([
    fetchCustomerById(id),
    fetchInvoicesByCustomer(id),
  ]);
  const customer: Customer | null = customerData;
  const invoices: Invoice[] = invoicesData;

  // 客户不存在 → 404（先判断，再算统计）
  if (!customer) {
    notFound();
  }

  // 统计用 JS 算（发票列表已经在手，不必再用 SQL 聚合）
  // 注意：invoice.amount 在数据库里存的是"分"，求和后还是"分"
  // 显示时必须用 formatCurrency 除以 100 转成"元"，否则会显示成一长串数字
  const total_invoices = invoices.length;
  const total_pending = invoices
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + i.amount, 0);
  const total_paid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '客户', href: '/dashboard/customers' },
          {
            label: customer.name,
            href: `/dashboard/customers/${id}`,
            active: true,
          },
        ]}
      />

      {/* 操作栏 */}
      <div className="mb-4 flex justify-end">
        <DeleteDetailCustomer id={customer.id} />
      </div>

      {/* 客户信息卡片 */}
      <Card className="p-6">
        <div className="flex flex-col items-center gap-4 md:flex-row md:items-center">
          <Image
            src={customer.image_url}
            alt={`${customer.name}'s profile picture`}
            width={96}
            height={96}
            className="rounded-full"
          />
          <div>
            <h2 className={`${lusitana.className} text-2xl`}>
              {customer.name}
            </h2>
            <p className="text-sm text-gray-500">{customer.email}</p>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">总发票数</p>
            <p className={`${lusitana.className} mt-1 text-xl`}>
              {total_invoices}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">待处理</p>
            <p className={`${lusitana.className} mt-1 text-xl`}>
              {formatCurrency(total_pending)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">已收款</p>
            <p className={`${lusitana.className} mt-1 text-xl`}>
              {formatCurrency(total_paid)}
            </p>
          </div>
        </div>
      </Card>

      {/* 该客户的发票列表 */}
      <div className="mt-6">
        <h3 className={`${lusitana.className} mb-4 text-xl`}>
          发票记录（{invoices.length}）
        </h3>

        {invoices.length === 0 ? (
          <p className="rounded-lg bg-gray-50 p-6 text-center text-gray-400">
            该客户暂无发票记录
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg bg-gray-50 p-2">
            <table className="hidden min-w-full rounded-md text-gray-900 md:table">
              <thead className="rounded-md bg-gray-50 text-left text-sm font-normal">
                <tr>
                  <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    金额
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    日期
                  </th>
                  <th scope="col" className="px-3 py-5 font-medium">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                      {formatCurrency(invoice.amount)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {formatDateToLocal(invoice.date)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <InvoiceStatus status={invoice.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
