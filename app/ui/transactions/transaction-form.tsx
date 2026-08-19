'use client';

// 账单表单（新增/编辑共用一个组件）——对照 CategoryForm 同款模式：
// 不传 transaction = 新增（调 createTransaction），传了 = 编辑（调 updateTransaction）。
// 单独文件的原因：create/edit 的 page.tsx 都是 async 服务端组件（要查数据），'use client' 不能共存，
// 数据在 server 查、交互在 client 做，中间走 props

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  MyInput,
  MyRadioGroup,
  MySelect,
  MyTextarea,
} from '@/components/my-form';
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from '@/app/lib/definitions';
import {
  createTransaction,
  updateTransaction,
} from '@/app/lib/actions/transaction';

// 服务端查好的分类经 props 传入（server → client 唯一通道）
type FormCategory = {
  id: number;
  name: string;
  type: string;
};

// 编辑对象的最小形状——注意 amount 是"分"、date 是 Date 对象，和表单值不是一套单位/类型；
// type 用联合：数据库存 'income'/'expense'（z.enum 同款），回填时直接对得上 schema 的收紧
type EditTransaction = {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  date: Date;
  description: string | null;
};

// 库里的 Date → input[type=date] 要的 'YYYY-MM-DD'
// ⚠️ 不能图省事用 toISOString().split('T')[0]：toISOString 是 UTC，
// 东八区凌晨存的日期会被回填成"前一天"。按本地时区手动拼才安全（所有日期回填场景通用）
function dateToLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export default function TransactionForm({
  categories,
  transaction,
}: {
  categories: FormCategory[];
  transaction?: EditTransaction;
}) {
  const isEdit = transaction !== undefined;

  // defaultValues 只在挂载时生效；两个页面都是独立路由、各自挂载，
  // 不存在"props 变了表单不刷新"的问题
  const form = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: transaction
      ? {
          // 编辑：回填 + 两处反向转换（分→元、Date→本地日期串）；
          // 入库方向在 action 里转回去（Math.round(x*100)、new Date(date)）
          amount: transaction.amount / 100,
          type: transaction.type,
          categoryId: transaction.category_id,
          date: dateToLocalInput(transaction.date),
          description: transaction.description ?? '', // 库里 null，表单要空字符串
        }
      : {
          // 新增：全空起步
          amount: 0,
          type: 'expense',
          categoryId: undefined,
          date: '',
          description: '',
        },
  });

  // 类型一变，已选分类可能不再匹配（如"工资"是收入类），要把 categoryId 真正清掉。
  // ⚠️ 不能用 resetField：它的语义是"重置回表单初始值"——新增模式初始是 undefined 看似清空，
  // 编辑模式初始是回填的 category_id，resetField 等于没清，还会造成"下拉看着空、
  // 值还在表单里"的视觉欺骗（options 变了显示不出旧 id 的 label，校验却通过）。
  // reset 的参数是"新的默认值"：categoryId 设 undefined 是合法的（DefaultValues 是 DeepPartial），
  // 其余字段用 getValues() 原样带过。
  // "和初始类型不同才重置"是防挂载时 effect 误伤回填值（新增模式 initialType 为 undefined 跳过）
  const watchedType = form.watch('type');
  const initialType = transaction?.type;
  useEffect(() => {
    if (initialType !== undefined && watchedType !== initialType) {
      form.reset({ ...form.getValues(), categoryId: undefined });
    }
  }, [watchedType, initialType, form]);

  const onSubmit = async (values: CreateTransactionInput) => {
    // 成功的跳转在 action 里（redirect 回列表）；失败 toast 给用户
    const result = isEdit
      ? await updateTransaction(transaction.id, values)
      : await createTransaction(values);  
    if (!result?.success && result?.message) {
      toast.error(result.message);
    }
  };

  return (
    // shadcn Form 两层结构：外层 <Form> 把 form 实例 provide 进 Context，内层 <form> 才是真 DOM
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-6">
        {/* 金额：用户看到/输入的是"元"，出入库的换算都在 action 里做 */}
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

        {/* 备注：可选（schema 里 optional()，数据库 String? 可空） */}
        <MyTextarea
          name="description"
          label="备注（可选）"
          placeholder="例如：季度绩效奖金"
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? '保存中…' : '保存'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/transactions">取消</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
