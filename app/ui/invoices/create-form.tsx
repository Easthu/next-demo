'use client';

import { CustomerField } from '@/app/lib/definitions';
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
import { createInvoice, type State } from '@/app/lib/actions/invoice';
import { useActionState } from 'react';

export default function Form({ customers }: { customers: CustomerField[] }) {
  const initialState: State = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createInvoice, initialState);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>创建发票</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 选择客户 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="customerId">选择客户</Label>
            <select
              id="customerId"
              name="customerId"
              defaultValue=""
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>请选择客户</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {state.errors?.customerId &&
              state.errors.customerId.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>{error}</p>
              ))}
          </div>

          {/* 填写金额 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">填写金额</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              placeholder="请输入金额（美元）"
              required
            />
            {state.errors?.amount &&
              state.errors.amount.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>{error}</p>
              ))}
          </div>

          {/* 设置发票状态 */}
          <div className="flex flex-col gap-2">
            <Label>设置发票状态</Label>
            <RadioGroup name="status" className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="pending" id="pending" />
                <Label htmlFor="pending">待处理</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="paid" id="paid" />
                <Label htmlFor="paid">已支付</Label>
              </div>
            </RadioGroup>
            {state.errors?.status &&
              state.errors.status.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>{error}</p>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/invoices">取消</Link>
        </Button>
        <Button type="submit">创建发票</Button>
      </div>
    </form>
  );
}
