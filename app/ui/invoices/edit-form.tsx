'use client';
import { updateInvoice } from '@/app/lib/actions/invoice';
import { CustomerField, InvoiceForm } from '@/app/lib/definitions';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function EditInvoiceForm({
  invoice,
  customers,
}: {
  invoice: InvoiceForm;
  customers: CustomerField[];
}) {
  const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

  return (
    <form action={updateInvoiceWithId}>
      <Card>
        <CardHeader>
          <CardTitle>编辑发票</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 选择客户 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="customer">选择客户</Label>
            <div className="relative">
              <select
                id="customer"
                name="customerId"
                defaultValue={invoice.customer_id}
                className="peer flex h-10 w-full cursor-pointer rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="" disabled>
                  请选择客户
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-foreground" />
            </div>
          </div>

          {/* 填写金额 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">填写金额</Label>
            <div className="relative">
              <Input
                className="peer pl-10"
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                defaultValue={invoice.amount}
                placeholder="请输入金额（美元）"
              />
              <CurrencyDollarIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-foreground" />
            </div>
          </div>

          {/* 设置发票状态 */}
          <div className="flex flex-col gap-2">
            <Label>设置发票状态</Label>
            <RadioGroup
              name="status"
              defaultValue={invoice.status}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label
                  htmlFor="pending"
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  Pending（待处理） <ClockIcon className="h-4 w-4" />
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label
                  htmlFor="paid"
                  className="flex cursor-pointer items-center gap-1.5 rounded-full bg-green-500 px-3 py-1.5 text-xs font-medium text-white"
                >
                  Paid（已支付） <CheckIcon className="h-4 w-4" />
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/invoices">取消</Link>
        </Button>
        <Button type="submit">编辑发票</Button>
      </div>
    </form>
  );
}
