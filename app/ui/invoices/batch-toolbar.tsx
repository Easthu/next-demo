'use client';

// 批量操作工具栏（简化版）
// 全选 checkbox + 批量按钮
// 批量操作通过 onClick 调用 Server Action，不用 form 提交

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { bulkUpdateInvoiceStatus } from '@/app/lib/actions/invoice';
import { useTransition } from 'react';

export function BatchToolbar() {
  const [count, setCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // 全选/取消全选
  const toggleSelectAll = (checked: boolean) => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="selectedIds"]'
    );
    checkboxes.forEach((cb) => (cb.checked = checked));
    setCount(checked ? checkboxes.length : 0);
  };

  // 批量更新状态：读取选中的 checkbox → 构造 formData → 调用 Server Action
  const handleBulkUpdate = (status: 'paid' | 'pending') => {
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      'input[name="selectedIds"]:checked'
    );
    const ids = Array.from(checkboxes).map((cb) => cb.value);
    if (ids.length === 0) return;

    const formData = new FormData();
    ids.forEach((id) => formData.append('ids', id));
    formData.append('status', status);

    startTransition(async () => {
      await bulkUpdateInvoiceStatus(formData);
    });
  };

  return (
    <div className="mb-4 flex items-center gap-4">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          onChange={(e) => toggleSelectAll(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300"
        />
        全选
      </label>

      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => handleBulkUpdate('paid')}
      >
        批量标记为已支付
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={() => handleBulkUpdate('pending')}
      >
        批量标记为待处理
      </Button>
    </div>
  );
}
