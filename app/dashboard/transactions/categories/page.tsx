// 账单分类管理：列表页（分页）+ 新增/编辑入口（表单页在 create/ 和 [id]/edit/ 下）
import Link from 'next/link';

import { fetchCategoriesPage, PAGE_SIZE } from '@/app/lib/data/transaction';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DeleteCategoryButton } from '@/app/ui/transactions/delete-category-button'
export default async function Page({
  searchParams,
}: {
  // Next 15：searchParams 是 Promise，要 await（和交易列表页同款）
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { page: pageParam } = await searchParams;
  // URL 参数天生是字符串：转数字，NaN（没传/乱填）和负数都兜回第 1 页
  const page = Math.max(1, Number(pageParam) || 1);

  const { data: categories, total } = await fetchCategoriesPage({ page });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 分类页没有筛选参数，翻页链接只带页码（对照交易列表页：那里还要带 categoryId）
  const pageHref = (target: number) =>
    `/dashboard/transactions/categories?page=${target}`;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">分类管理</h1>
        <Link
          href="/dashboard/transactions/categories/create"
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          新增分类
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>名称</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>来源</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                还没有分类
              </TableCell>
            </TableRow>
          )}
          {categories.map((category) => (
            <TableRow key={category.id}>
              <TableCell>{category.id}</TableCell>
              <TableCell>{category.name}</TableCell>
              <TableCell>
                {category.type === 'income' ? '收入' : '支出'}
              </TableCell>
              <TableCell>{category.description || '无'}</TableCell>
              <TableCell>{category.is_system ? '系统预设' : '自定义'}</TableCell>
              <TableCell className="flex items-center ">
                <Link
                  href={`/dashboard/transactions/categories/${category.id}/edit`}
                  className="text-blue-500 hover:underline mr-3"
                >
                  编辑
                </Link>
                {/* UI 层不给系统预设分类删除入口；action 里的 is_system 复查才是法律——
                    这行只是体验优化，防不住绕过 UI 直接调 action */}
                {!category.is_system && (
                  <DeleteCategoryButton id={category.id} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 分页条：点 Link = 改 URL = 服务端重查，和交易列表同一条链路 */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          共 {total} 条 · 第 {page} / {totalPages} 页
        </span>
        <div className="flex gap-2">
          {page > 1 && (
            <Link
              href={pageHref(page - 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-100"
            >
              上一页
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={pageHref(page + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-100"
            >
              下一页
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
