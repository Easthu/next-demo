"use server";
// 发票相关的 Server Actions（创建、更新、删除、批量更新）

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { prisma } from '@/app/lib/prisma';

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

// 创建发票
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
  const amountInCents = amount * 100;
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
    return { message: '数据库错误：创建发票失败。' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 更新发票
export async function updateInvoice(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

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

// 删除发票（列表页用）—— 仅 admin
export async function deleteInvoice(id: string) {
  // ⭐ TODO（你来填）：权限校验 —— 只有 admin 能删除发票
  // 提示（两行）：
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error('无权限删除发票');
  try {
    await prisma.invoice.delete({ where: { id } });
    revalidatePath('/dashboard/invoices');
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：删除发票失败。');
  }
}

// 删除发票并跳转（详情页用）—— 仅 admin
export async function deleteInvoiceAndRedirect(id: string) {
  // ⭐ TODO（你来填）：权限校验 —— 只有 admin 能删除发票
  // 提示（两行）：
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error('无权限删除发票');
  try {
    await prisma.invoice.delete({ where: { id } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：删除发票失败。');
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// 批量更新发票状态
export async function bulkUpdateInvoiceStatus(formData: FormData) {
  const ids = formData.getAll('ids') as string[];
  const status = formData.get('status') as 'pending' | 'paid';

  try {
    await prisma.invoice.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：批量更新发票状态失败。');
  }

  revalidatePath('/dashboard/invoices');
}
