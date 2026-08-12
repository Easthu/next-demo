"use server";
// 用户相关的 Server Action（注册、改角色）

import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";

const RegisterSchema = z.object({
  name: z.string().min(2, "姓名至少为 2 个字符"),
  email: z.string().email("邮箱格式不正确"),
  password: z.string().min(6, "密码至少为 6 位"),
});

export type RegisterState = {
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function registerUser(prevState: RegisterState, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "有字段未填写或格式不正确。",
    };
  }

  const { name, email, password } = validatedFields.data;

  // 检查邮箱是否已注册
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return {
      errors: { email: ["该邮箱已被注册"] },
      message: "该邮箱已被注册。",
    };
  }

  // 创建新用户
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });

  redirect("/login");
}

// ───────────────────────────────────────────────────────────
// 修改用户角色（用户管理页用，仅 admin 可调用）
// ───────────────────────────────────────────────────────────
// 用 bind 调用：updateUserRole.bind(null, userId, newRole) —— 和 deleteInvoice 同款模式
export async function updateUserRole(userId: string, role: string) {
  // ⭐ TODO（你来填）：权限校验 —— 只有 admin 能改别人的角色
  // 这是 RBAC 的「第三层」Server Action 校验，最关键的安全闸
  // 提示（两行）：
    const session = await auth();
    if (session?.user?.role !== 'admin') throw new Error('无权限修改用户角色');
  // （auth 已经在文件顶部 import 好了）

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role },
    });
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('数据库错误：更新用户角色失败。');
  }

  revalidatePath('/dashboard/users');
}
