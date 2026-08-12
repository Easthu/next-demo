"use server";
// 客户相关的 Server Actions（创建、更新、删除）

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';

const AVATARS = [
  '/customers/evil-rabbit.png',
  '/customers/delba-de-oliveira.png',
  '/customers/lee-robinson.png',
  '/customers/michael-novotny.png',
  '/customers/amy-burns.png',
  '/customers/balazs-orban.png',
];

const CustomerSchema = z.object({
  id: z.string(),
  name: z.string({ required_error: '请输入客户名称。' }),
  email: z.string({ required_error: '请输入客户邮箱。' }).email({
    message: '请输入有效的邮箱地址。',
  }),
});

const CreateCustomer = CustomerSchema.omit({ id: true });
const UpdateCustomer = CustomerSchema.omit({ id: true });

export type CustomerState = {
  errors?: {
    name?: string[];
    email?: string[];
  };
  message?: string | null;
  rawInput?: {
    name?: string | null;
    email?: string | null;
  };
};

// 创建客户
export async function createCustomer(prevState: CustomerState, formData: FormData) {
  const validatedFields = CreateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写或格式不正确，创建客户失败。',
      rawInput: {
        name: formData.get('name') as string | null,
        email: formData.get('email') as string | null,
      },
    };
  }

  const { name, email } = validatedFields.data;
  const image_url = AVATARS[Math.floor(Math.random() * AVATARS.length)];

  try {
    await prisma.customer.create({ data: { name, email, image_url } });
  } catch (error) {
    return { message: '数据库错误：创建客户失败。' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// 更新客户
export async function updateCustomer(prevState: CustomerState, formData: FormData) {
  const id = formData.get('id') as string;

  const validatedFields = UpdateCustomer.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写或格式不正确，更新客户失败。',
      rawInput: {
        name: formData.get('name') as string | null,
        email: formData.get('email') as string | null,
      },
    };
  }

  const { name, email } = validatedFields.data;
  const image_url = formData.get('image_url') as string;

  try {
    await prisma.customer.update({
      where: { id },
      data: { name, email, image_url },
    });
  } catch (error) {
    return { message: '数据库错误：更新客户失败。' };
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}

// 删除客户（列表页用，先检查有没有发票）
export async function deleteCustomer(id: string) {
  const invoiceCount = await prisma.invoice.count({ where: { customer_id: id } });
  if (invoiceCount > 0) {
    throw new Error('该客户还有发票，请先删除或转移发票。');
  }

  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：删除客户失败。');
  }

  revalidatePath('/dashboard/customers');
}

// 删除客户并跳转（详情页用）
export async function deleteCustomerAndRedirect(id: string) {
  const invoiceCount = await prisma.invoice.count({ where: { customer_id: id } });
  if (invoiceCount > 0) {
    throw new Error('该客户还有发票，请先删除或转移发票。');
  }

  try {
    await prisma.customer.delete({ where: { id } });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：删除客户失败。');
  }

  revalidatePath('/dashboard/customers');
  redirect('/dashboard/customers');
}
