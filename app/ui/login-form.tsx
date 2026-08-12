'use client';

import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
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
import { useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions/auth';

export default function LoginForm() {
  const [errorMessage, dispatch] = useActionState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle className={`${lusitana.className} text-2xl`}>
            请登录以继续。
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* 邮箱 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Input
                className="peer pl-10"
                id="email"
                type="email"
                name="email"
                placeholder="请输入邮箱地址"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-foreground" />
            </div>
          </div>

          {/* 密码 */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">密码</Label>
            <div className="relative">
              <Input
                className="peer pl-10"
                id="password"
                type="password"
                name="password"
                placeholder="请输入密码"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground peer-focus:text-foreground" />
            </div>
          </div>

          <LoginButton />
          
          <div
            className="flex h-8 items-end space-x-1"
            aria-live="polite"
            aria-atomic="true"
          >
            {errorMessage && (
              <>
                <ExclamationCircleIcon className="h-5 w-5 text-destructive" />
                <p className="text-sm text-destructive">{errorMessage}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      登录 <ArrowRightIcon className="ml-auto h-5 w-5 text-primary-foreground" />
    </Button>
  );
}
