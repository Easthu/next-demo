'use client';

// 表单字段封装层 —— 相当于给自己造的 el-form-item
// 用法约束：必须在 <Form {...form}> 内部使用。
// 原理：wrapper 通过 useFormContext() 从 Context 拿 form 实例（≈ Vue 的 inject），
// 所以调用方不需要一层层传 control——外层 <Form {...form}> 已经把它 provide 进去了

import * as React from 'react';
import { useFormContext } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// 文本/数字/日期输入：name 对应 Zod schema 的字段名，其余 props 原样透传给 Input
export function MyInput({
  name,
  label,
  ...rest
}: {
  name: string;
  label: string;
} & React.ComponentProps<typeof Input>) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} {...rest} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 单选组：options 传 { value, label } 数组，className 控制排布（如 "flex gap-6" 横排）
export function MyRadioGroup({
  name,
  label,
  options,
  className,
}: {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className={className}
            >
              {options.map((option) => (
                <FormItem
                  key={option.value}
                  className="flex items-center gap-2 space-y-0"
                >
                  <FormControl>
                    <RadioGroupItem value={option.value} />
                  </FormControl>
                  <FormLabel className="font-normal">{option.label}</FormLabel>
                </FormItem>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 下拉选择：options 的 value 允许 number 或 string。
// Radix Select 内部只认字符串，这里进出自动转换——调用方拿到的还是原类型（number id 进，number id 出）
export function MySelect({
  name,
  label,
  placeholder,
  options,
}: {
  name: string;
  label: string;
  placeholder?: string;
  options: { value: string | number; label: string }[];
}) {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {/* key：值一变就重挂载。Radix Select 把 value=undefined 理解为"非受控"而非"清空"，
              从有值清回 undefined 时它的内部记忆残留、placeholder 不恢复——重挂载是唯一归零手段 */}
          <Select
            key={field.value !== undefined ? String(field.value) : 'empty'}
            value={field.value !== undefined ? String(field.value) : undefined}
            onValueChange={(value) => {
              // 从 options 里找回原类型的值
              const matched = options.find(
                (option) => String(option.value) === value,
              );
              field.onChange(matched ? matched.value : value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={String(option.value)} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
