// 记账本域的 Server Actions：交易（增/改/删）+ 分类（增/改/删）
// 组织方式是按业务域一个文件——分类和交易互相牵连（改分类要 revalidate 记账表单的分类下拉），
// 放一个文件里顺手；系统级错误统一走 db-error.ts 的 handleDbError
// ⚠️ 顶层 'use server' 的文件只能 export async 函数——Zod schema 放 definitions.ts，表单和 action 两边共用
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma } from '@prisma/client';

import {
  createTransactionSchema,
  createCategoriesSchema,
  type CreateCategoryInput,
  type CreateTransactionInput,
} from '@/app/lib/definitions';
import { prisma } from '@/app/lib/prisma';
import { handleDbError } from '@/app/lib/actions/db-error';

// 新增一笔交易：服务端校验 → 元转分 → 写库 → 刷新列表缓存 → 跳回列表页
export async function createTransaction(input: CreateTransactionInput) {
  // 服务端再校验一遍——客户端校验可被绕过，服务端才是法律
  const validatedFields = createTransactionSchema.safeParse(input);

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写，创建交易失败。',
    };
  }

  const { amount, type, categoryId, date, description } = validatedFields.data;
  // 元转分用 round 收口浮点（12.34 * 100 = 1233.999…，floor 会吃掉用户 1 分钱）
  const amountInCents = Math.round(amount * 100);

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
    // 交易没有唯一约束/被引用，没有业务码要认，全部交给系统级兜底
    return handleDbError(error, '创建交易失败');
  }

  // redirect 必须在 try 外面：它靠 throw NEXT_REDIRECT 工作，被 catch 截胡就变成"创建成功却报数据库错误"
  revalidatePath('/dashboard/transactions');
  redirect('/dashboard/transactions');
}


// ---- 分类：对外两个 action（create/update 接口语义），对内共用一个实现 ----

// 公共骨架（不 export——它是实现细节，不是"接口"）：
// create/update 的差异全部收在 id 参数上——没 id 走 create，有 id 走 update
async function saveCategory(input: CreateCategoryInput, id?: number) {
  // 客户端校验可被绕过（Server Action 是 RPC 端点，参数可伪造），服务端才是法律
  const validatedFields = createCategoriesSchema.safeParse(input);
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写或格式不对，保存分类失败。',
    };
  }

  try {
    if (id === undefined) {
      await prisma.transactionCategory.create({
        data: validatedFields.data,
      });
    } else {
      await prisma.transactionCategory.update({
        where: { id },
        data: validatedFields.data,
      });
    }
  } catch (error) {
    // 业务错误码就地判（消息随实体变），系统级的尾部统一交给 handleDbError
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // @@unique([name, type])：同类型下重名，create 和 update 都可能撞上
        return { success: false, message: '该类型下已存在同名分类' };
      }
      if (error.code === 'P2025') {
        // update 的 where 没匹配到行：id 不存在（比如编辑页开着，这条分类已被删掉）
        return { success: false, message: '该分类不存在，可能已被删除' };
      }
    }
    return handleDbError(error, '保存分类失败');
  }

  // redirect 必须在 try 外：它靠 throw NEXT_REDIRECT 工作，被 catch 截胡就变成"保存成功却报数据库错误"
  revalidatePath('/dashboard/transactions/categories'); // 分类列表页
  revalidatePath('/dashboard/transactions/create'); // 记账表单的分类下拉也要更新
  redirect('/dashboard/transactions/categories');
}

// 新增分类（薄壳：保留"接口"语义——对照 Java 的 Controller 两个方法 → Service 一个私有 doSave）
export async function createCategory(input: CreateCategoryInput) {
  return saveCategory(input);
}

// 编辑分类（同款骨架，只是多带一个 id）
export async function updateCategory(id: number, input: CreateCategoryInput) {
  return saveCategory(input, id);
}

// 删除一个分类（分类列表页删除按钮调用）
// 签名 (id, prevState, formData)：id 放最前给 .bind 留位——组件里
// deleteCategory.bind(null, id) 之后剩下 (prevState, formData)，正好是 useActionState 要的形状
// ⚠️ id 类型是 number：TransactionCategory 的主键是 Int 自增（交易的 id 才是 UUID 字符串）
// 规则判断以服务端查库为准，不信前端传参：系统预设分类（is_system）不允许删
export async function deleteCategory(
  id: number,
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  const category = await prisma.transactionCategory.findUnique({ where: { id } });
  if (!category) {
    return { success: false, message: '该分类不存在，可能已被删除' };
  }
  if (category.is_system) {
    return { success: false, message: '系统预设分类不能删除' };
  }

  try {
    await prisma.transactionCategory.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        // 外键约束：还有账单引用着这个分类，删了账单就成孤儿
        return { success: false, message: '该分类下还有账单，无法删除' };
      }
      if (error.code === 'P2025') {
        return { success: false, message: '该分类不存在，可能已被删除' };
      }
    }
    return handleDbError(error, '删除分类失败');
  }

  revalidatePath('/dashboard/transactions/categories');
  revalidatePath('/dashboard/transactions/create'); // 记账表单的分类下拉也要更新
  // 成功路径必须显式 return：useActionState 要求 action 返回 state（返回 undefined 会 TS 报错），
  // 按钮的 useEffect 也靠它区分成败——成功静默，失败才 toast
  return { success: true, message: '' };
}

// 编辑一笔交易（编辑页表单调用）：校验 → 元转分 → update → 刷新缓存 → 跳回列表
// 和 createTransaction 只差两处：update 带 where；catch 多认 P2025（id 不存在）
export async function updateTransaction(
  id: string,
  input: CreateTransactionInput,
) {
  console.log('updateTransaction action called', id, input);
  const validatedFields = createTransactionSchema.safeParse(input)
  if(!validatedFields.success){
    return {
    success: false,
    errors: validatedFields.error.flatten().fieldErrors,
    message: '有字段未填写，更新交易失败。',
  };
  }
  try{
  const { amount, type, categoryId, date, description } = validatedFields.data;

  const amountInCents = Math.round(amount * 100);

    await prisma.transaction.update({
      data:{
         amount: amountInCents,
        type,
        category_id: categoryId,
        date: new Date(date), // date 输入框给的是 'YYYY-MM-DD' 字符串，库里要 Date 对象
        description,
      },
      where:{
        id
      }
    })
  }
  catch(error){
 if (error instanceof Prisma.PrismaClientKnownRequestError) {
     
      if (error.code === 'P2025') {
        return { success: false, message: '该账单不存在，可能已被删除' };
      }
    }
    return handleDbError(error, '更新交易失败');
  }
  revalidatePath('/dashboard/transactions')
  redirect('/dashboard/transactions')
}

// 删除一笔交易（列表页删除按钮调用）
// 签名 (id, prevState, formData)：id 放最前是给 .bind 留位——按钮组件里
// deleteTransaction.bind(null, id) 之后剩下 (prevState, formData)，正好是 useActionState 要的形状
// 交易没有表引用它、也没有业务规则，错误码只有 P2025；成功后 revalidatePath 原地刷新，
// 不 redirect——删除是原地操作，跳转反而丢滚动位置
export async function deleteTransaction(
  id: string,
  prevState: { success: boolean; message: string },
  formData: FormData,
) {
  try {
    await prisma.transaction.delete({
      where: { id },
    });
  } catch (error) {
    console.log('error :>> ', error);
    return handleDbError(error, '删除交易失败');
  }
  revalidatePath('/dashboard/transactions');
  // 成功路径必须显式 return：useActionState 要求 action 返回 state，
  // 不写的话返回 undefined，TS 报 No overload matches；按钮的 useEffect 也靠它区分成败
  return { success: true, message: '' };
}