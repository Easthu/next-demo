import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteInvoice, deleteInvoiceAndRedirect } from '@/app/lib/action';

export function CreateInvoice() {
  return (
    <Link
      href="/dashboard/invoices/create"
      className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
    >
      <span className="hidden md:block">创建发票</span>{' '}
      <PlusIcon className="h-5 md:ml-4" />
    </Link>
  );
}

export function UpdateInvoice({ id }: { id: string }) {
  return (
    <Link
      href={`/dashboard/invoices/${id}/edit`}
      className="rounded-md border p-2 hover:bg-gray-100"
    >
      <PencilIcon className="w-5" />
    </Link>
  );
}

export function DeleteInvoice({ id }: { id: string }) {
  const deleteInvoiceWithId = deleteInvoice.bind(null, id);

  return (
    <form action={deleteInvoiceWithId}>
      <button className="rounded-md border p-2 hover:bg-gray-100">
        <span className="sr-only">删除</span>
        <TrashIcon className="w-4" />
      </button>
    </form>
  );
}

// 详情页删除按钮（删完跳回列表）
export function DeleteDetailInvoice({ id }: { id: string }) {
  const deleteWithRedirect = deleteInvoiceAndRedirect.bind(null, id);
  return (
    <form action={deleteWithRedirect}>
      <button className="flex h-10 items-center rounded-lg bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100">
        <TrashIcon className="mr-2 h-4" />
        删除发票
      </button>
    </form>
  );
}