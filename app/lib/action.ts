"use server";
// Server Actions —— 处理写操作（增删改）和登录
// 全部使用 Prisma ORM

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { signIn } from '@/auth';
import { AuthError } from 'next-auth';
import { prisma } from '@/app/lib/prisma';

// 表单校验规则（金额是"元"，落库前会 *100 转成"分"）
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: '请选择客户。',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: '请输入大于 $0 的金额。' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: '请选择发票状态。',
  }),
  date: z.string(),
});

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

/**
 * 创建发票
 * 流程：Zod 校验 → 元转分 → 写库 → 清缓存 → 跳转
 */
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写，创建发票失败。',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100; // 元 → 分
  const date = new Date().toISOString().split('T')[0];

  try {
    await prisma.invoice.create({
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status,
        date: new Date(date),
      },
    });
  } catch (error) {
    return {
      message: '数据库错误：创建发票失败。',
    };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 * 更新发票
 * 流程：Zod 校验 → 元转分 → 写库 → 清缓存 → 跳转
 */
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100; // 元 → 分

  try {
    await prisma.invoice.update({
      where: { id },
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：更新发票失败。');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 * 删除发票
 */
export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：删除发票失败。');
  }
}

// 删除发票并跳转（详情页用）
export async function deleteInvoiceAndRedirect(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：删除发票失败。');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

/**
 * 处理登录请求（包装 NextAuth 的 signIn）
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return '账号或密码错误。';
        default:
          return '发生未知错误。';
      }
    }
    throw error;
  }
}
