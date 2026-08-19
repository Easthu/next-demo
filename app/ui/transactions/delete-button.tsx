'use client';

// 删除按钮（client 组件）：列表页是 Server Component，接 useActionState 必须有个 client 壳。
// 额外参数（id）走 .bind：action 签名把 id 放最前，bind(null, id) 之后剩下
// (prevState, formData)，正好是 useActionState 要的形状。
// bind 只能预填"前面"的参数——把 id 绑到 (prevState, formData) 两参签名上会顶掉 prevState
// 的位置、整个错位崩溃。和 hidden input 是等价的两条路：bind 类型不丢（number 进 number 出），
// hidden input 换来的是全项目 action 签名统一

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { deleteTransaction } from '@/app/lib/actions/transaction';
import { Button } from '@/components/ui/button';

// 和 deleteTransaction 的 state/返回类型对齐
const initialState = { success: false, message: '' };

export function DeleteTransactionButton({ id }: { id: string }) {
  const [state, formAction, isPending] = useActionState(
    deleteTransaction.bind(null, id), // ← id 预填进第一个参数位
    initialState,
  );

  // 失败 toast 报错；成功不吭声——action 里 revalidatePath 会原地刷新列表，无需跳转
  useEffect(() => {
    if(state.success){
      toast.success('删除成功')
    }
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // 原生 confirm 拦一道：不同意就阻止表单提交（onSubmit 先于 action 跑）
        if (!window.confirm('确定删除这笔账单吗？')) e.preventDefault();
      }}
    >
      <Button
        type="submit"
        variant="ghost"
        className="h-auto p-0 text-red-500 hover:text-red-600"
        disabled={isPending}
      >
        {isPending ? '删除中…' : '删除'}
      </Button>
    </form>
  );
}
