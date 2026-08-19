"use server";
// 认证相关的 Server Action（登录、退出）

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

// 退出登录
export async function logout() {
  await signOut();
}

// 处理登录请求（登录表单的 useActionState 模式，签名 (prevState, formData)）
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
    // ⚠️ 非 AuthError 的错误必须原样重抛：登录成功后的跳转靠 throw NEXT_REDIRECT 工作，
    // 吞掉它就会变成"登录成功却不跳转"（和 redirect 被 catch 截胡是同一族坑）
    throw error;
  }
}
