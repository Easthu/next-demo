// lib/actions/db-error.ts —— 注意：不是 'use server' 文件！
// 纯工具函数不是 action；'use server' 文件里 export 必须是 async 函数（文件头那条规则的另一面）

import { Prisma } from '@prisma/client';

// 数据库错误的"系统级兜底"：业务无关的错误统一转成用户能看懂的一句话。
// 详细的 error 记进服务端日志（console.error），只把友好消息还给前端——
// 堆栈和 error.message 暴露给用户没有意义，还可能泄漏内部信息
export function handleDbError(
  error: unknown,
  fallbackMessage: string,
): { success: false; message: string } {
  console.log('handleDbError error :>> ', error);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error('数据库错误:', error.code, error.message);
    return { success: false, message: `数据库错误（${error.code}），请稍后再试` };
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error('数据库连接失败:', error.message);
    return { success: false, message: '数据库暂时不可用，请稍后再试' };
  }
  if (error instanceof Error) {
    console.error(fallbackMessage, error);
    return { success: false, message: `${fallbackMessage}，请稍后再试` };
  }
  console.error('未知错误:', error);
  return { success: false, message: '未知错误' };
}