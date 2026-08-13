import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import InvoiceStatus from '@/app/ui/invoices/status';
import { DeleteDetailInvoice, ExportInvoicePdf } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { Card } from '@/components/ui/card';
import { fetchInvoiceDetailById } from '@/app/lib/data';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';
import { auth } from '@/auth';
import { PencilIcon } from '@heroicons/react/24/outline';

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const invoice = await fetchInvoiceDetailById(id);

  if (!invoice) {
    notFound();
  }

  // 取当前用户角色，传给删除按钮决定显隐
  const session = await auth();
  const role = session?.user?.role;

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: '发票', href: '/dashboard/invoices' },
          {
            label: '发票详情',
            href: `/dashboard/invoices/${id}`,
            active: true,
          },
        ]}
      />

      {/* 操作栏：导出 PDF + 编辑 + 删除 */}
      <div className="mb-4 flex justify-end gap-3">
        <ExportInvoicePdf id={invoice.id} />
        <Link
          href={`/dashboard/invoices/${id}/edit`}
          className="flex h-10 items-center rounded-lg border px-4 text-sm font-medium hover:bg-gray-100"
        >
          <PencilIcon className="mr-2 h-4" />
          编辑
        </Link>
        <DeleteDetailInvoice id={invoice.id} role={role} />
      </div>

      {/* 发票信息卡片 */}
      <Card className="p-6">
        {/* 客户信息 */}
        <div className="flex items-center gap-4">
          <Image
            src={invoice.customer.image_url}
            alt={`${invoice.customer.name}'s profile picture`}
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <p className="text-lg font-medium">{invoice.customer.name}</p>
            <p className="text-sm text-gray-500">{invoice.customer.email}</p>
          </div>
        </div>

        {/* 发票详情 */}
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">金额</p>
            <p className={`${lusitana.className} mt-1 text-xl`}>
              {formatCurrency(invoice.amount)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">日期</p>
            <p className={`${lusitana.className} mt-1 text-xl`}>
              {formatDateToLocal(invoice.date)}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 text-center">
            <p className="text-xs text-gray-500">状态</p>
            <div className="mt-2 flex justify-center">
              <InvoiceStatus status={invoice.status} />
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}
