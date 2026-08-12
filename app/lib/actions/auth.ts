"use server";
// 认证相关的 Server Action（登录、退出）

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

// 退出登录
export async function logout() {
  await signOut();
}

// 处理登录请求（包装 NextAuth 的 signIn）
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
