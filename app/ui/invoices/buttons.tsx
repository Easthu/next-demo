import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteInvoice, deleteInvoiceAndRedirect } from '@/app/lib/actions/invoice';
import { Button } from '@/components/ui/button';

export function CreateInvoice() {
  return (
    <Button asChild variant="default">
      <Link href="/dashboard/invoices/create">
        <span className="hidden md:block">创建发票</span>{' '}
        <PlusIcon className="h-5 md:ml-4" />
      </Link>
    </Button>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Button asChild variant="outline" size="icon">
      <Link href={`/dashboard/invoices/${id}/edit`}>
        <PencilIcon className="w-5" />
      </Link>
    </Button>
  );
}

// 列表页删除按钮 —— 仅 admin 渲染
// role 从父组件（table.tsx，服务端）通过 prop 传入（方式 B）
export function DeleteInvoice({ id, role }: { id: string; role?: string }) {
  // 普通 user：按钮压根不渲染（UI 层第一道）
  if (role !== 'admin') return null;

  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  return (
    <form action={deleteInvoiceWithId}>
      <Button variant="outline" size="icon">
        <span className="sr-only">删除</span>
        <TrashIcon className="w-4" />
      </Button>
    </form>
  );
}

// 详情页删除按钮（删完跳回列表）—— 仅 admin 渲染
export function DeleteDetailInvoice({ id, role }: { id: string; role?: string }) {
  if (role !== 'admin') return null;

  const deleteWithRedirect = deleteInvoiceAndRedirect.bind(null, id);
  return (
    <form action={deleteWithRedirect}>
      <Button variant="destructive">
        <TrashIcon className="mr-2 h-4" />
        删除发票
      </Button>
    </form>
  );
}
