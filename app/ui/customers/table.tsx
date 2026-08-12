import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import Search from '@/app/ui/search';
import {
  CustomersTableType,
  FormattedCustomersTable,
} from '@/app/lib/definitions';
import Link from 'next/link';
import { CreateCustomer, UpdateCustomer, DeleteCustomer } from '@/app/ui/customers/buttons';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
export default  function CustomersTable({
  customers,
}: {
  customers: FormattedCustomersTable[];
}) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
          客户
        </h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="搜索客户..." />
        <CreateCustomer />
      </div>
      <div className="mt-6 flow-root">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <div className="overflow-hidden rounded-md bg-gray-50 p-2 md:pt-0">
              <Table className="min-w-full rounded-md text-gray-900">
                <TableHeader className="rounded-md bg-gray-50 text-left text-sm font-normal">
                  <TableRow className="hover:bg-transparent">
                    <TableHead scope="col" className="px-4 py-5 font-medium sm:pl-6">
                      姓名
                    </TableHead>
                    <TableHead scope="col" className="px-3 py-5 font-medium">
                      邮箱
                    </TableHead>
                    <TableHead scope="col" className="px-3 py-5 font-medium">
                      发票数
                    </TableHead>
                    <TableHead scope="col" className="px-3 py-5 font-medium">
                      待处理
                    </TableHead>
                    <TableHead scope="col" className="px-4 py-5 font-medium">
                      已支付
                    </TableHead>
                    <TableHead scope="col" className="relative py-3 pl-6 pr-3">
                      <span className="sr-only">编辑</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-200 text-gray-900">
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="group hover:bg-transparent">
                      <TableCell className="whitespace-nowrap bg-white py-5 pl-4 pr-3 text-sm text-black group-first-of-type:rounded-md group-last-of-type:rounded-md sm:pl-6">
                        <div className="flex items-center gap-3">
                          <Link href={`/dashboard/customers/${customer.id}`} className="flex items-center gap-3 hover:bg-gray-100 rounded-md">
                          
                          <Image
                            src={customer.image_url}
                            className="rounded-full"
                            alt={`${customer.name}'s profile picture`}
                            width={28}
                            height={28}
                          />
                          <p>{customer.name}</p>
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_invoices}
                      </TableCell>
                      <TableCell className="whitespace-nowrap bg-white px-4 py-5 text-sm">
                        {customer.total_pending}
                      </TableCell>
                      <TableCell className="whitespace-nowrap bg-white px-4 py-5 text-sm group-first-of-type:rounded-md group-last-of-type:rounded-md">
                        {customer.total_paid}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-3 pl-6 pr-3">
                        <div className="flex justify-end gap-3">
                          <UpdateCustomer id={customer.id} />
                          <DeleteCustomer id={customer.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
