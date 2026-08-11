# Zod 表单验证入门指南

> 本项目用 Zod 做表单数据校验（检查用户提交的数据是否合法）。
> 这份文档从零讲解 Zod 是什么、怎么用，假设你完全没用过 Zod。

---

## 一、Zod 是什么

**一句话：Zod 是一个数据校验库，你定义"数据应该长什么样"，Zod 帮你检查实际数据符不符合。**

你在 Vue 里肯定写过表单验证规则（比如 Element Plus 的 rules）：

```js
// Vue 里你可能这样写验证规则
const rules = {
  amount: [{ required: true, message: '请输入金额' }],
  email: [{ type: 'email', message: '邮箱格式不对' }],
}
```

Zod 干的是同样的事，只是它**用 JS 对象描述规则**，而且类型推导更强大。你定义一个"规则对象"（Schema），然后用它来检验实际数据。

---

## 二、最基本的概念：Schema（规则）

Schema 就是"数据应该长什么样"的描述。看项目的实际例子：

```ts
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: '请选择客户。' }),
  amount: z.coerce.number().gt(0, { message: '请输入大于 $0 的金额。' }),
  status: z.enum(['pending', 'paid'], { invalid_type_error: '请选择发票状态。' }),
  date: z.string(),
});
```

`z.object({...})` 定义了一个"对象的规则"——这个对象应该有哪些字段、每个字段是什么类型。

**逐行拆解：**

| 代码 | 含义 |
|------|------|
| `z.string()` | 必须是字符串 |
| `z.string({ invalid_type_error: '请选择客户。' })` | 必须是字符串，类型不对时显示自定义错误 |
| `z.coerce.number()` | 先尝试转成数字，再校验（表单提交的都是字符串） |
| `.gt(0, { message: '...' })` | 必须大于 0 |
| `z.enum(['pending', 'paid'])` | 只能是这几个值中的一个 |
| `.gt(0)` | 必须大于 0（greater than） |

**链式调用**：`.gt()` 这种叫"链式调用"，像流水线一样一层层加规则：

```ts
z.coerce.number().gt(0)
//  先转数字 → 再要求大于 0
```

---

## 三、常用校验规则速查

### 字符串 `z.string()`

```ts
z.string()                          // 必须是字符串
z.string().min(2)                   // 最少 2 个字符
z.string().max(100)                 // 最多 100 个字符
z.string().min(2).max(100)          // 2-100 个字符
z.string().email()                  // 必须是合法邮箱
z.string().url()                    // 必须是合法 URL
z.string().uuid()                   // 必须是 UUID 格式
z.string().optional()              // 可选（可以不填）
z.string({ invalid_type_error: '请输入客户名。' })  // 自定义错误信息
```

### 数字 `z.number()`

```ts
z.number()                          // 必须是数字
z.number().gt(0)                    // 必须大于 0
z.number().gte(0)                   // 必须大于等于 0
z.number().lt(100)                  // 必须小于 100
z.number().int()                    // 必须是整数
z.number().positive()               // 必须是正数
z.number().min(0).max(100)          // 0-100 之间
```

### 数字（从字符串转换）`z.coerce.number()`

HTML 表单提交的所有值都是字符串！用户输入 `100`，你拿到的是 `"100"`（字符串）。`z.coerce` 会自动转换：

```ts
// 没有 coerce：表单提交的 "100" 是字符串，类型不匹配
z.number()                          // "100" ❌（字符串不是数字）

// 有 coerce：自动把 "100" 转成数字 100
z.coerce.number()                   // "100" → 100 ✅
```

### 枚举 `z.enum()`

只允许特定的几个值：

```ts
z.enum(['pending', 'paid'])         // 只能是 'pending' 或 'paid'
z.enum(['red', 'green', 'blue'])    // 只能是这三个颜色
```

### 布尔值 `z.boolean()`

```ts
z.boolean()                         // 必须是 true 或 false
```

---

## 四、怎么用 Schema 校验数据

定义好 Schema 后，有两种方式校验：

### 方式 1：`safeParse`——校验但不抛异常（推荐）

```ts
const result = FormSchema.safeParse({
  customerId: 'abc-123',
  amount: 100,
  status: 'paid',
});

if (result.success) {
  // 校验通过，用 result.data 拿到已校验的数据
  const { customerId, amount, status } = result.data;
} else {
  // 校验失败，用 result.error 看哪里错了
  result.error.flatten().fieldErrors;
  // { amount: ['请输入大于 $0 的金额。'], status: ['请选择发票状态。'] }
}
```

**`safeParse` 的返回值**：

```ts
// 校验成功时
{
  success: true,
  data: { customerId: 'abc-123', amount: 100, status: 'paid' }
}

// 校验失败时
{
  success: false,
  error: ZodError  // 里面包含所有错误信息
}
```

### 方式 2：`parse`——校验，失败就抛异常

```ts
// 校验通过 → 返回数据
// 校验失败 → 抛出异常（需要 try/catch）
const data = FormSchema.parse({ ... });
```

### 两种方式的区别

| | `safeParse` | `parse` |
|---|------------|---------|
| 失败时 | 返回 `{ success: false, error }` | **抛出异常** |
| 要不要 try/catch | 不需要 | 需要（或者让它崩） |
| 适用场景 | **表单提交**（要给用户显示错误） | **简单场景**（数据基本可信，错了直接崩） |

**项目里的用法**：
- `createInvoice` / `createCustomer` 用 `safeParse`（要把错误信息显示给用户）
- `updateInvoice` / `updateCustomer` 用 `parse`（出错直接崩，由 error.tsx 兜底）

---

## 五、`.omit()`——排除不需要的字段

创建发票时，`id` 由数据库自动生成，`date` 由代码生成——所以表单里不需要这两个字段。用 `.omit()` 排除：

```ts
// 完整的 Schema
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number().gt(0),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

// 创建用的：排除 id 和 date
const CreateInvoice = FormSchema.omit({ id: true, date: true });
// 现在 CreateInvoice 只要求：customerId, amount, status

// 更新用的：一样排除 id 和 date
const UpdateInvoice = FormSchema.omit({ id: true, date: true });
```

`.omit({ 字段名: true })` 的意思是"去掉这个字段"。去掉后的新 Schema 只校验剩下的字段。

---

## 六、项目里的完整用法（真实代码）

以发票的 `createInvoice` 为例，完整走一遍流程：

```ts
// 1. 定义 Schema
const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ invalid_type_error: '请选择客户。' }),
  amount: z.coerce.number().gt(0, { message: '请输入大于 $0 的金额。' }),
  status: z.enum(['pending', 'paid'], { invalid_type_error: '请选择发票状态。' }),
  date: z.string(),
});

// 2. 派生出创建用的 Schema（去掉 id 和 date）
const CreateInvoice = FormSchema.omit({ id: true, date: true });

// 3. State 类型（存错误信息，给前端显示）
export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

// 4. Server Action 里用 safeParse 校验
export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // 校验失败 → 返回错误信息给前端
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: '有字段未填写，创建发票失败。',
    };
  }

  // 校验成功 → 用校验过的数据写库
  const { customerId, amount, status } = validatedFields.data;
  // ... 写库
}
```

### 在前端表单显示错误信息

```tsx
// create-form.tsx 里（客户端组件）
const [state, dispatch] = useActionState(createInvoice, initialState);

// 显示某个字段的错误信息
{state.errors?.amount &&
  state.errors.amount.map((error: string) => (
    <p className="mt-2 text-sm text-red-500" key={error}>
      {error}    {/* 显示：请输入大于 $0 的金额。 */}
    </p>
  ))}
```

**完整流程**：

```
用户在表单输入金额 -10
       ↓
点击提交
       ↓
Server Action 调用 safeParse
       ↓ Zod 检查：-10 不大于 0
       ↓
return { errors: { amount: ['请输入大于 $0 的金额。'] } }
       ↓
前端拿到 state.errors.amount，显示红字提示
       ↓
用户看到"请输入大于 $0 的金额。"
```

---

## 七、自定义错误信息

每个校验规则都可以自定义错误信息：

```ts
// 类型错误（数据类型不对时）
z.string({ invalid_type_error: '请输入文本。' })
z.number({ invalid_type_error: '请输入数字。' })

// 校验错误（数据类型对但值不满足条件时）
z.number().gt(0, { message: '金额必须大于 0。' })
z.string().min(2, { message: '至少输入 2 个字符。' })
z.string().email({ message: '邮箱格式不正确。' })
```

两种错误的区别：

| | invalid_type_error | message |
|---|---|---|
| 什么时候触发 | 数据**类型**完全不对（该传数字传了 undefined） | 数据类型对但**值**不满足条件 |
| 例子 | `formData.get('amount')` 是 undefined | amount 是 -10（不大于 0） |

---

## 八、速查总结

```
Zod = 用 JS 对象描述"数据应该长什么样"，然后校验实际数据。

定义规则（Schema）：
  z.string()         字符串
  z.number()         数字
  z.coerce.number()  自动把字符串转数字（表单必用）
  z.enum(['a','b'])  只允许特定值
  z.boolean()        布尔值
  z.string().email() 合法邮箱

加约束（链式调用）：
  .min(n) / .max(n)  长度限制（字符串）
  .gt(n) / .lt(n)    大于/小于（数字）
  .optional()        可选字段

排除字段：
  .omit({ id: true })  去掉 id 字段

校验数据：
  schema.safeParse(data)  → { success, data } 或 { success, error }
  schema.parse(data)      → 成功返回数据，失败抛异常

取错误信息：
  result.error.flatten().fieldErrors  → { 字段名: ['错误信息'] }
```

---

## 九、本项目涉及的 Zod 文件

| 文件 | 内容 |
|------|------|
| `app/lib/action.ts` | 发票的 FormSchema + CreateInvoice + UpdateInvoice |
| `app/lib/customer-action.ts` | 客户的 CustomerSchema + CreateCustomer + UpdateCustomer |
| `auth.ts` | 登录时校验邮箱密码（`z.object({ email, password })`）|

Zod 只管"校验"这一件事，不管数据库、不管 UI。它通常用在 Server Action 的开头，先校验再写库。
