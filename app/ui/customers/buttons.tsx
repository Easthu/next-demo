import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { deleteCustomer, deleteCustomerAndRedirect } from '@/app/lib/actions/customer';
import { Button } from '@/components/ui/button';

// 创建客户按钮
export function CreateCustomer() {
  return (
    <Button asChild variant="default">
      <Link href="/dashboard/customers/create">
        <span className="hidden md:block">创建客户</span>{' '}
        <PlusIcon className="h-5 md:ml-4" />
      </Link>
    </Button>
  );
}

// 编辑客户按钮
export function UpdateCustomer({ id }: { id: string }) {
  return (
    <Button asChild variant="outline" size="icon">
      <Link href={`/dashboard/customers/${id}/edit`}>
        <PencilIcon className="w-5" />
      </Link>
    </Button>
  );
}

// 删除客户按钮（列表页用，删完留在列表页刷新）
export function DeleteCustomer({ id }: { id: string }) {
  const deleteCustomerWithId = deleteCustomer.bind(null, id);
  return (
    <form action={deleteCustomerWithId}>
      <Button variant="outline" size="icon">
        <span className="sr-only">删除</span>
        <TrashIcon className="w-4" />
      </Button>
    </form>
  );
}

// 删除客户按钮（详情页用，删完跳回列表页）
export function DeleteDetailCustomer({ id }: { id: string }) {
  const deleteWithRedirect = deleteCustomerAndRedirect.bind(null, id);
  return (
    <form action={deleteWithRedirect}>
      <Button variant="outline" size="icon">
        <span className="sr-only">删除</span>
        <TrashIcon className="w-4" />
      </Button>
    </form>
  );
}
