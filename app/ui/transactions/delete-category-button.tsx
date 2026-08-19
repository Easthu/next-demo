'use client';

// 删除分类按钮（client 组件）：列表页是 Server Component，接 useActionState 必须有个 client 壳。
// 额外参数（id）走 .bind：action 签名把 id 放最前，bind(null, id) 之后剩下
// (prevState, formData)，正好是 useActionState 要的形状——与 DeleteTransactionButton 同款。
// 之前 buttons.tsx 里那个 <form action={deleteCategory}> 裸绑的写法，FormData 会顶进 id 参数位，
// 这就是"删除分类失败"报错的根源

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { deleteCategory } from '@/app/lib/actions/transaction';
import { Button } from '@/components/ui/button';

const initialState = { success: false, message: '' };

export function DeleteCategoryButton({ id }: { id: number }) {
  // id 是 number（分类 Int 主键）：bind 的类型红利——原样进原样出，不用从 FormData 转回
  const [state, formAction, isPending] = useActionState(
    deleteCategory.bind(null, id),
    initialState,
  );

  // 失败 toast（系统预设/被账单引用/不存在）；成功不吭声——revalidatePath 原地刷新列表
  useEffect(() => {
    if (!state.success && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        // 原生 confirm 拦一道：不同意就阻止表单提交（onSubmit 先于 action 跑）
        if (!window.confirm('确定删除该分类吗？')) e.preventDefault();
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
