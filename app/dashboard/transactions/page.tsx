// 账单列表：URL 驱动的分类筛选 + 分页
// 筛选条件和页码都在 searchParams（?categoryId=3&page=2），URL 变 → 服务端重新查库。
// 好处：筛选结果可分享、可刷新、可回退（对照 Vue：相当于把筛选条件同步到路由 query）
import Link from 'next/link';

import {
  fetchCategories,
  fetchMonthlySummary,
  fetchTransactions,
  PAGE_SIZE,
} from '@/app/lib/data/transaction';
import { formatDateToLocal, formatCurrency } from '@/app/lib/utils';
import { DeleteTransactionButton } from '@/app/ui/transactions/delete-button';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// income/expense → 中文（以后类型变多，就换成对象映射 { income: '收入', ... }）
function formatType(type: string) {
  return type === 'income' ? '收入' : '支出';
}

export default async function Page({
  searchParams,
}: {
  // Next 15：searchParams 和编辑页的 params 一样是 Promise，要 await
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { categoryId: categoryIdParam } = await searchParams;
  // URL 参数天生是字符串：转数字；没选（''）或乱填 → NaN → undefined = 不筛选
  // （注意不能用 ?? ''：Number('') 是 0 不是 NaN，靠 || 的 falsy 判断正好把 0 也兜掉）
  const categoryId = Number(categoryIdParam) || undefined;

  // 页码同理，NaN/负数都兜回第 1 页
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  // 三个查询互不依赖，并行发出去，总耗时 ≈ 最慢那个
  const [{ data: transactions, total }, monthlySummary, categories] =
    await Promise.all([
      fetchTransactions({ page, categoryId }),
      fetchMonthlySummary(),
      fetchCategories(), // 筛选下拉的选项（服务端查好，直接在 JSX 里 map）
    ]);

  // 总页数：总数 ÷ 每页条数向上取整；至少 1 页（空列表也显示"第 1 / 1 页"）
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // 分页链接要"带着筛选条件走"，否则翻到第 2 页筛选就丢了
  const pageHref = (target: number) => {
    const params = new URLSearchParams();
    if (categoryId !== undefined) params.set('categoryId', String(categoryId));
    params.set('page', String(target));
    return `/dashboard/transactions?${params.toString()}`;
  };

  // 分页条里显示"当前筛的是哪个分类"用
  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/dashboard/transactions/create"
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          新增账单
        </Link>
        <Link
          href="/dashboard/transactions/categories"
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
        >
          分类管理
        </Link>
      </div>

      {/* 筛选：原生 GET form——选完分类点按钮 = 把 name="categoryId" 的值拼进 URL 发起导航，
          不需要 client 组件（渐进增强：JS 没加载也能筛）。
          form 里没有 page 字段：提交新筛选时 URL 不带 page，自然回到第 1 页。
          select 用原生的而不是 shadcn Select：Radix Select 是 client 组件且不走原生表单提交 */}
      <form
        action="/dashboard/transactions"
        method="get"
        className="mb-4 flex max-w-md gap-2"
      >
        <select
          name="categoryId"
          defaultValue={categoryId !== undefined ? String(categoryId) : ''}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">全部分类</option>
          {/* optgroup：原生 HTML 的选项分组，对应 el-option 的分组 */}
          <optgroup label="支出">
            {categories
              .filter((c) => c.type === 'expense')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </optgroup>
          <optgroup label="收入">
            {categories
              .filter((c) => c.type === 'income')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
          </optgroup>
        </select>
        <Button type="submit" variant="outline">
          筛选
        </Button>
      </form>

      {/* 汇总：数字来自 aggregate（单位"分"，formatCurrency 转元显示） */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">交易记录</h1>
        <div className="text-lg font-semibold">
          收入: {formatCurrency(monthlySummary.income)} |
          支出: {formatCurrency(monthlySummary.expense)} |
          结余: {formatCurrency(monthlySummary.balance)}
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>交易ID</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>类别</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>类型</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                {selectedCategory
                  ? `分类「${selectedCategory.name}」下还没有账单`
                  : '还没有账单'}
              </TableCell>
            </TableRow>
          )}
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell>{transaction.category.name}</TableCell>
              <TableCell>{formatDateToLocal(transaction.date)}</TableCell>
              <TableCell>{formatType(transaction.type)}</TableCell>
              <TableCell>{transaction.description || '无'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/dashboard/transactions/${transaction.id}/edit`}
                    className="text-blue-500 hover:underline"
                  >
                    编辑
                  </Link>
                  <DeleteTransactionButton id={transaction.id} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 分页条：上一页/下一页用 Link（不是 button）——点链接 = 改 URL = 服务端重查，
          和筛选走的是同一条链路 */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {selectedCategory ? `「${selectedCategory.name}」` : '共 '}
          {total} 条 · 第 {page} / {totalPages} 页
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
