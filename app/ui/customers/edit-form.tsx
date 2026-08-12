'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useActionState } from 'react';
import { updateCustomer, type CustomerState } from '@/app/lib/actions/customer';
import type { Customer } from '@prisma/client';

export default function EditCustomerForm({ customer }: { customer: Customer }) {
  const initialState: CustomerState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(updateCustomer, initialState);

  return (
    <form action={dispatch}>
      {/* 隐藏字段：id 随表单提交传给 Server Action */}
      <input type="hidden" name="id" value={customer.id} />
      <Card>
        <CardHeader>
          <CardTitle>编辑客户信息</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 客户名 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">客户名称</Label>
            <Input
              id="name"
              name="name"
              type="text"
              defaultValue={customer.name}
              placeholder="请输入客户名称"
              required
            />
            <div id="name-error" aria-live="polite" aria-atomic="true">
              {state.errors?.name &&
                state.errors.name.map((error: string) => (
                  <p className="text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* 邮箱 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={customer.email}
              placeholder="请输入邮箱地址"
              required
            />
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {state.errors?.email &&
                state.errors.email.map((error: string) => (
                  <p className="text-sm text-destructive" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>

          {/* 头像路径 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="image_url">头像路径</Label>
            <Input
              id="image_url"
              name="image_url"
              type="text"
              defaultValue={customer.image_url}
              placeholder="请输入头像路径"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers">取消</Link>
        </Button>
        <Button type="submit">保存修改</Button>
      </div>
    </form>
  );
}
