// 用户管理页 —— admin 专属
// 列出所有用户 + 可改角色（升/降管理员）
//
// 双重保护：
//  ① middleware 的 authorized 回调已挡住非 admin 访问此路由
//  ② 这里再查一次 session.user.role（防御性，防止绕过 middleware）
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchUsers } from '@/app/lib/data';
import { updateUserRole } from '@/app/lib/actions/user';
import { lusitana } from '@/app/ui/fonts';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export default async function UsersPage() {
  // 防御性校验：非 admin 直接踢回首页
  const session = await auth();
  if (session?.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  const users = await fetchUsers();

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-2xl`}>用户管理</h1>
      <p className="mt-2 text-sm text-gray-500">
        管理系统用户的角色。管理员可查看所有用户、调整角色权限。
      </p>

      <div className="mt-6 rounded-lg bg-gray-50 p-2">
        <Table className="text-gray-900">
          <TableHeader className="text-left text-sm font-normal">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 py-5 font-medium">姓名</TableHead>
              <TableHead className="px-4 py-5 font-medium">邮箱</TableHead>
              <TableHead className="px-4 py-5 font-medium">角色</TableHead>
              <TableHead className="relative py-3 pl-6 pr-3">
                <span className="sr-only">操作</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="border-b text-sm last-of-type:border-none"
              >
                <TableCell className="whitespace-nowrap px-4 py-3 font-medium">
                  {user.name}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {user.email}
                </TableCell>
                <TableCell className="whitespace-nowrap px-4 py-3">
                  {user.role === 'admin' ? (
                    <Badge>管理员</Badge>
                  ) : (
                    <Badge variant="outline">普通用户</Badge>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap py-3 pl-6 pr-3 text-right">
                  {/* 不允许 admin 把自己降级（避免系统一个管理员都不剩） */}
                  {/* 用 email 比对：session.user.email 一定有，id 默认没映射进 session */}
                  {user.email === session.user?.email ? (
                    <span className="text-xs text-gray-400">当前账号</span>
                  ) : (
                    <form
                      action={updateUserRole.bind(
                        null,
                        user.id,
                        user.role === 'admin' ? 'user' : 'admin',
                      )}
                    >
                      <Button type="submit" variant="outline" size="sm">
                        {user.role === 'admin' ? '降为普通用户' : '升为管理员'}
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
