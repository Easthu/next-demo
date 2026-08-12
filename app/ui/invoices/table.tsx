import Image from 'next/image';
import Link from 'next/link';
import { UpdateInvoice, DeleteInvoice } from '@/app/ui/invoices/buttons';
import InvoiceStatus from '@/app/ui/invoices/status';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { fetchFilteredInvoices } from '@/app/lib/data';
import { auth } from '@/auth';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default async function InvoicesTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const invoices = await fetchFilteredInvoices(query, currentPage);
  // 取当前用户角色，传给删除按钮决定显隐（方式 A：服务端自己调 auth()）
  const session = await auth();
  const role = session?.user?.role;

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <Table className="min-w-full text-gray-900">
              <TableHeader className="rounded-lg text-left text-sm font-normal">
                <TableRow className="hover:bg-transparent">
                  {/* 复选框列 */}
                  <TableHead scope="col" className="px-4 py-5 font-medium sm:pl-6">
                    <span className="sr-only">选择</span>
                  </TableHead>
                  <TableHead scope="col" className="px-4 py-5 font-medium">
                    客户
                  </TableHead>
                  <TableHead scope="col" className="px-3 py-5 font-medium">
                    邮箱
                  </TableHead>
                  <TableHead scope="col" className="px-3 py-5 font-medium">
                    金额
                  </TableHead>
                  <TableHead scope="col" className="px-3 py-5 font-medium">
                    日期
                  </TableHead>
                  <TableHead scope="col" className="px-3 py-5 font-medium">
                    状态
                  </TableHead>
                  <TableHead scope="col" className="relative py-3 pl-6 pr-3">
                    <span className="sr-only">操作</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white">
                {invoices?.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="w-full border-b py-3 text-sm last-of-type:border-none hover:bg-transparent [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                  >
                    {/* 每行的复选框 */}
                    <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                      <input
                        type="checkbox"
                        name="selectedIds"
                        value={invoice.id}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </TableCell>

                    <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                      <Link href={`/dashboard/invoices/${invoice.id}`} className="flex items-center gap-3 hover:bg-gray-100 rounded-md">
                        <Image
                          src={invoice.image_url}
                          className="rounded-full"
                          width={28}
                          height={28}
                          alt={`${invoice.name}'s profile picture`}
                        />
                        <p>{invoice.name}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">
                      {invoice.email}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">
                      {formatCurrency(invoice.amount)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">
                      {formatDateToLocal(invoice.date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap px-3 py-3">
                      <InvoiceStatus status={invoice.status} />
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                      <div className="flex justify-end gap-3">
                        <UpdateInvoice id={invoice.id} />
                        <DeleteInvoice id={invoice.id} role={role} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        </div>
      </div>
    </div>
  );
}
