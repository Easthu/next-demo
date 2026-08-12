// 用户相关的查询函数（用户管理页用，admin 专属）
import { prisma } from '@/app/lib/prisma';

// 用户管理页表格展示用的用户类型
export type UsersTable = {
  id: string;
  name: string;
  email: string;
  role: string; // 'admin' | 'user'
};

// 查所有用户（用户管理页用）
// omit：只排除 password（密码哈希永远不该带出来给前端），其余字段全要
export async function fetchUsers() {
  try {
    const users = await prisma.user.findMany({
      omit: { password: true },
      orderBy: { name: 'asc' },
    });
    return users;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}
