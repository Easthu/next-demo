'use client';

import Link from 'next/link';
import {
  UserCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { useActionState } from 'react';
import { createCustomer, type CustomerState } from '@/app/lib/customer-action';

export default function CreateCustomerForm() {
  const initialState: CustomerState = { message: null, errors: {} };
  const [state, dispatch] = useActionState(createCustomer, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">
        {/* 客户名 */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            客户名称
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="请输入客户名称"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {/* TODO: 显示 name 的校验错误信息（参考 invoices/create-form.tsx 里 customer-error 的写法）*/}
          {/* 提示：用 state.errors?.name */}
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {state.errors?.name &&
              state.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* 邮箱 */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            邮箱
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="请输入邮箱地址"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
                required
              />
              <EnvelopeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          {/* TODO: 显示 email 的校验错误信息 */}
          <div id="email-error" aria-live="polite" aria-atomic="true">
            {state.errors?.email &&
              state.errors.email.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* 头像路径 —— 不需要用户填！创建时系统会随机分配一个 */}

      </div>

      <div className="mt-6 flex justify-end gap-4">
        <Link
          href="/dashboard/customers"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          取消
        </Link>
        <Button type="submit">创建客户</Button>
      </div>
    </form>
  );
}
