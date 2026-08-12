'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { createCustomer, type CustomerState } from '@/app/lib/actions/customer';

// shadcn/ui 组件（从 components/ui/ 导入）
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function CreateCustomerForm() {
  const initialState: CustomerState = { message: null, errors: {}, rawInput: { name: null, email: null } };
  const [state, dispatch] = useActionState(createCustomer, initialState);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>客户信息</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 客户名 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">客户名称</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="请输入客户名称"
              required
              defaultValue={state.rawInput?.name ?? ''}
            />
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>

          {/* 邮箱 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="请输入邮箱地址"
              required
              defaultValue={state.rawInput?.email ?? ''}
            />
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/dashboard/customers">取消</Link>
        </Button>
        <Button type="submit">创建客户</Button>
      </div>
    </form>
  );
}
