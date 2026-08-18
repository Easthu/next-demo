// 记账本的 Server Actions（按功能分文件：交易的新增/编辑/删除都放这）
// ⚠️ 顶层 'use server' 的文件只能 export async 函数——Zod schema 放 definitions.ts，表单和 action 两边共用
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createTransactionSchema, type CreateTransactionInput } from '@/app/lib/definitions';
import { prisma } from '@/app/lib/prisma';

// 新增一笔交易：服务端校验 → 元转分 → 写库 → 刷新列表缓存 → 跳回列表页
export async function createTransaction(input: CreateTransactionInput) {
  // 服务端再校验一遍——客户端校验可被绕过，服务端才是法律
  const validatedFields = createTransactionSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写，创建交易失败。',
    };
  }

  const { amount, type, categoryId, date, description } = validatedFields.data;
  // ⚠️ 待修（问题 #6）：浮点风险，12.34 * 100 = 1233.999…，Prisma 的 Int 字段会拒收 Float，需取整
  const amountInCents = amount * 100;

  try {
    await prisma.transaction.create({
      data: {
        amount: amountInCents,
        type,
        category_id: categoryId,
        date: new Date(date), // date 输入框给的是 'YYYY-MM-DD' 字符串，库里要 Date 对象
        description,
      },
    });
  } catch (error) {
    console.error('创建交易失败:', error);
    return { message: '数据库错误：创建交易失败。' };
  }

  // redirect 必须在 try 外面：它靠 throw NEXT_REDIRECT 工作，被 catch 截胡就变成"创建成功却报数据库错误"
  revalidatePath('/dashboard/transactions');
  redirect('/dashboard/transactions');
}
