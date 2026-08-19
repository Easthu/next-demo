'use client';

// 分类表单（新增/编辑共用一个组件——就是 Vue 里"新增弹窗和编辑弹窗共用一个 el-form"的复用思路）
// 不传 category = 新增（调 createCategory），传了 = 编辑（调 updateCategory）
// 单独文件的原因和 create-form 一样：编辑页的 page.tsx 是 async 服务端组件，'use client' 不能共存

import { useForm } from 'react-hook-form';
import Link from 'next/link';

import { MyInput, MyRadioGroup, MyTextarea } from '@/components/my-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  createCategory,
  updateCategory,
} from '@/app/lib/actions/transaction';
import type { CreateCategoryInput } from '@/app/lib/definitions';

// 编辑时由服务端查好传下来的最小形状（完整 TransactionCategory 也兼容，TS 结构类型只认形状）
type FormCategory = {
  id: number;
  name: string;
  type: string;
  description: string | null;
};

export default function CategoryForm({
  category,
}: {
  category?: FormCategory;
}) {
  const isEdit = category !== undefined;

  // defaultValues 只在挂载时生效；编辑页每次进入都是新路由、组件重新挂载，
  // 不存在"props 变了表单不刷新"的问题（对照 Vue：等于每次 route 变化重建 form）
  const form = useForm<CreateCategoryInput>({
    defaultValues: category
      ? {
          name: category.name,
          type: category.type,
          description: category.description ?? '', // 库里是 null，表单要空字符串
        }
      : { name: '', type: 'expense', description: '' },
    // TODO(你)：definitions.ts 里 createCategoriesSchema 字段补齐后，接上
    // resolver: zodResolver(createCategoriesSchema)（import 也别忘了）
  });

  const onSubmit = async (values: CreateCategoryInput) => {
    // 成功的跳转在 action 里（redirect 回分类列表）；失败返回 { success: false, message }
    const result = isEdit
      ? await updateCategory(category.id, values)
      : await createCategory(values);

    if (!result.success) {
      // TODO(#7 同款)：换 toast.error(result.message)，和 create-form 的 TODO 一起做
      console.error('保存分类失败:', result.message);
    }
  };

  return (
    // shadcn Form 两层结构：外层 <Form> 把 form 实例 provide 进 Context，内层 <form> 才是真 DOM
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-md space-y-6">
        <MyInput name="name" label="分类名" placeholder="如：餐饮" />

        <MyRadioGroup
          name="type"
          label="类型"
          className="flex gap-6"
          options={[
            { value: 'expense', label: '支出' },
            { value: 'income', label: '收入' },
          ]}
        />

        {/* 描述：非必填（库里 String? 可空；schema 里记得 optional()） */}
        <MyTextarea
          name="description"
          label="描述（可选）"
          placeholder="例如：外卖、聚餐都算这类"
          rows={3}
        />

        <div className="flex gap-3">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? '保存中…' : '保存'}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/transactions/categories">取消</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
