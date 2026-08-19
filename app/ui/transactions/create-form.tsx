'use client';

// 新增交易表单（client 组件）
// 为什么单独一个文件：page.tsx 是 async 服务端组件（要 fetchCategories），
// 'use client' 和 async 不能共存——数据在 server 查，交互在 client 做，中间走 props

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MyInput, MyRadioGroup, MySelect } from '@/components/my-form';
import { createTransactionSchema, type CreateTransactionInput } from '@/app/lib/definitions';
import { createTransaction } from '@/app/lib/actions/transaction';

// 服务端查好的分类经 props 传入（server → client 唯一通道）
type FormCategory = {
  id: number;
  name: string;
  type: string;
};

export default function CreateTransactionForm({
  categories,
}: {
  categories: FormCategory[];
}) {
  const form = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      amount: 0,
      type: 'expense',
      categoryId: undefined,
      date: '',
      description: '',
    },
  });

  // 类型一变，已选分类可能不再匹配（如"工资"是收入类），重置回未选状态
  const watchedType = form.watch('type');
  useEffect(() => {
    form.resetField('categoryId');
  }, [watchedType]);

  // TODO(#7)：接住 createTransaction 的返回值，失败时 toast.error(result.message) 给用户提示
  const onSubmit = async (values: CreateTransactionInput) => {
    try {
      await createTransaction(values);
      // 成功后的跳转由 action 里的 redirect 处理
    } catch (error) {
      console.error('创建交易失败:', error);
    }
  };

  return (
    // shadcn Form 两层结构：外层 <Form> 把 form 实例 provide 进 Context，内层 <form> 才是真 DOM
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-6">
        {/* 金额：用户输入"元"，提交后在 action 里转"分"存库 */}
        <MyInput
          name="amount"
          label="金额（元）"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
        />

        <MyRadioGroup
          name="type"
          label="类型"
          className="flex gap-6"
          options={[
            { value: 'income', label: '收入' },
            { value: 'expense', label: '支出' },
          ]}
        />

        {/* 分类选项跟随类型联动：只显示与当前账单类型匹配的分类 */}
        <MySelect
          name="categoryId"
          label="分类"
          placeholder="选择分类"
          options={categories
            .filter((category) => category.type === watchedType)
            .map((category) => ({
              value: category.id,
              label: category.name,
            }))}
        />

        {/* 日期：type="date" 的 value 是 'YYYY-MM-DD' 字符串，转 Date 在 action 里做 */}
        <MyInput name="date" label="日期" type="date" />

        {/* 备注：可选。components/ui 暂无 textarea，先用 Input；要多行就 pnpm dlx shadcn@latest add textarea */}
        <MyInput name="description" label="备注（可选）" placeholder="例如：季度绩效奖金" />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? '保存中…' : '保存'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/transactions">取消</Link>
          </Button>
          {/* TODO：取消按钮接返回列表的跳转（想想 client 组件里跳转用哪个 API） */}
        </div>
      </form>
    </Form>
  );
}
