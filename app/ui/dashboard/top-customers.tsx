import { lusitana } from '@/app/ui/fonts';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { fetchTopCustomers } from '@/app/lib/data';

// 客户消费排行榜（纵向柱状图，样式参照 revenue-chart）
export default async function TopCustomers() {
  const customers = await fetchTopCustomers(5);
  const chartHeight = 350;

  if (!customers || customers.length === 0) {
    return <p className="mt-4 text-gray-400">暂无数据</p>;
  }

  // 找最大金额（分），向上取整到 100 美元的倍数作为 Y 轴顶部
  const maxAmount = Math.max(...customers.map((c) => c.amount));
  const topAmount = Math.ceil(maxAmount / 10000) * 10000; // 10000 分 = $100

  // 生成 Y 轴刻度（每 $100 一个刻度，从上到下）
  const yAxisLabels: string[] = [];
  for (let i = topAmount; i >= 0; i -= 10000) {
    yAxisLabels.push(`$${i / 100 / 1000}K`); // 分转元再转 K
  }

  return (
    <div className="w-full md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        客户消费排行榜
      </h2>

      <div className="rounded-xl bg-gray-50 p-4">
        <div className="sm:grid-cols-13 mt-0 grid grid-cols-12 items-end gap-2 rounded-md bg-white p-4 md:gap-4">
          {/* Y 轴刻度 */}
          <div
            className="mb-6 hidden flex-col justify-between text-sm text-gray-400 sm:flex"
            style={{ height: `${chartHeight}px` }}
          >
            {yAxisLabels.map((label, i) => (
              <p key={i}>{label}</p>
            ))}
          </div>

          {/* 柱状图 */}
          {customers.map((customer) => (
            <div key={customer.id} className="flex flex-col items-center gap-2">
              <div
                className="w-full rounded-md bg-blue-300"
                style={{
                  height: `${(chartHeight / topAmount) * customer.amount}px`,
                }}
              ></div>
              <p className="-rotate-90 text-sm text-gray-400 sm:rotate-0">
                {customer.name.split(' ')[0]}
              </p>
            </div>
          ))}
        </div>
        <div className="flex items-center pb-2 pt-6">
          <BanknotesIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500">
            已支付金额统计
          </h3>
        </div>
      </div>
    </div>
  );
}
