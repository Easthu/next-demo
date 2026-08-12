'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerUser, type RegisterState } from '@/app/lib/actions/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterForm() {
  const initialState: RegisterState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(registerUser, initialState);

  return (
    <form action={dispatch}>
      <Card>
        <CardHeader>
          <CardTitle>注册</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 名称 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">名称</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="请输入名称"
              required
            />
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>{error}</p>
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
            />
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>{error}</p>
              ))}
          </div>

          {/* 密码 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="至少 6 位"
              required
            />
            {state.errors?.password &&
              state.errors.password.map((error: string) => (
                <p className="text-sm text-destructive" key={error}>{error}</p>
              ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link href="/login">取消</Link>
        </Button>
        <Button type="submit">注册</Button>
      </div>
    </form>
  );
}
