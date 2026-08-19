# 14 - Next.js 闭环练习：个人记账本

> 切 Java（hqq-api）前的"毕业考"。用一周时间，**脱离任何提示独立做出**一个完整的记账本，把学过的概念从"跟着能做"变成"自己能做"。

---

## 一、为什么做这个

学完进阶功能（RBAC、PDF、SSE……）后，真实状态是：

- ✅ 概念有印象（知道 Server Action、Zod、Prisma 这些是干嘛的）
- ❌ 脱离提示写不出（语法、单词、顺序记不住）

根因不是记性差，而是那些代码都是"跟着抄"的，大脑没经过**主动检索**。主动回忆一次，胜过被动看十遍。这一周就是逼自己主动检索。

**这周不学任何新概念**，目的只有一个：把学过的东西彻底变成自己的。

---

## 二、毕业标准（什么算成功）

一周后，**不看任何参考**，你能做到：

1. **写得出** —— 从零写出一个 CRUD 完整链路：Prisma 模型 → 迁移 → Server Action → Zod 校验 → shadcn 表单 → 列表展示 → 错误处理
2. **讲得清** —— 对每一块说得出"为什么这么写"（不是"教程这么写"，而是"它解决了 X 问题"）

满足这两点，Next.js 闭环完成，正式切 Java。

---

## 三、闭环练习 4 条规则（这是它起效的关键）

| 规则 | 内容 | 为什么 |
|---|---|---|
| **1. 从空文件开始** | 不许打开 `customers` / `invoices` 的代码当模板抄。卡住了回忆，回忆不起来查文档——而不是查"上次怎么写的" | 照抄 = 零练习。最关键的一条 |
| **2. 查语法可以，问思路不行** | ✅ 可查："prisma findMany 的 where 怎么写""Zod min 怎么写" ❌ 不可问："下一步做什么""这功能怎么实现" | 查 API 是资深工程师日常；问思路等于不练 |
| **3. 卡 15 分钟再求助，求助会被反问** | 真卡住别硬扛两小时。但求助时，AI **不丢代码**，反问"你觉得数据该从哪来？""报错读到哪行了？" | 逼自己想通，记忆才扎根 |
| **4. 每块做完讲一遍"为什么"** | 做完新增表单，口头讲："Server Action 是因为……Zod 是因为……cents 是因为……" | 讲不出 = 没真懂 |

> ⚠️ 心态崩了可以破例。心态比纪律重要，别练到厌恶。告诉 AI，它会给更多提示甚至代码。

---

## 四、项目设定

- **在哪儿做**：在 `next-demo` 里新增 `/transactions` 路由 + 一张 `Transaction` 表。复用已配好的 Prisma / shadcn / NextAuth 环境（配环境不是练习目的）。
- **红线**：**绝不看 `customers` / `invoices` 的实现代码**。需要时查官方文档，不查自己的老代码。
- **环境**：`fnm use 20.20.2` → `pnpm dev`（参考 `08-开发踩坑实录`、`12-shadcn` 文档里关于工具链的说明）。

---

## 五、数据模型 —— Day 1 动键盘前先想清楚

拿出纸或记事本，回答这些问题。想清楚再写代码。

**业务问题：**
- [ ] 一笔交易需要记录哪些信息？（至少：金额、类型、分类、日期、备注。还要不要别的？）
- [ ] 收入和支出这两种"类型"，你打算怎么表示？（字符串 `"income"/"expense"`？数字？枚举？各有什么 trade-off？）

**技术决策（每个都要给理由）：**
- [ ] **金额字段用什么类型？为什么？**（⚠️ 第一个大坑。想想浮点数为什么不行。）
- [ ] 日期字段用什么类型？
- [ ] 分类（餐饮/交通/工资……）怎么实现？写死一组字符串、用枚举、还是单独建一张 `Category` 表？1 周练习建议先简单。
- [ ] 需要关联关系吗？还是单表先做？

**思考完跟 AI 对一下思路**（只对思路，不贴代码）。

---

## 六、Day 1-7 详细计划

> 每天 2-3 小时。每天结束对照"当日产出"自检。
>
> 每个 Day 附了 **📁 文件清单**：标明这一步要**新建/修改哪些文件、每个文件干什么**。
> ⚠️ 它是**路标不是答案**——告诉你动哪里，不告诉你怎么写（规则 1"从空文件开始"依然生效）。

### 📅 Day 1 —— 数据层打通

**目标**：数据能写进库、能看见。

**任务**
- [ ] 在 `prisma/schema.prisma` 写 `Transaction` 模型（字段、类型自己定）
- [ ] 跑迁移（`prisma` 的迁移命令自己查）
- [ ] 写第一个 Server Action：`createTransaction`，先不接 UI
- [ ] 用 `prisma studio` 或手写 seed 塞 2-3 条测试数据，验证写库成功

**📁 文件清单**
| 动作 | 文件 | 干什么 |
|---|---|---|
| 修改 | `prisma/schema.prisma` | 新增 `Transaction` 模型；分类建议独立建 `TransactionCategory` 表（外键关联），别写死字符串 |
| 修改 | seed 脚本（`prisma/` 下） | 塞一组分类 + 2-3 条测试交易 |
| 新建 | `app/lib/actions/transaction.ts` | 第一个 Server Action：`createTransaction`（Zod 校验 + 元转分 + 写库） |

**🤔 该想的坑**
- 金额字段类型定了吗？为什么？

**✅ 当日产出**：数据库里能看到 3 条测试交易。

---

### 📅 Day 2 —— 读：列表页 + 汇总卡

**目标**：打开 `/transactions` 能看见交易列表 + 当月汇总。

**任务**
- [ ] `/transactions` 页面，服务端取数据（按日期倒序）
- [ ] 用 shadcn `Table` 展示列表
- [ ] 金额列怎么显示？（**复习**：金额在库里是整数，展示时怎么变成 `¥12.34`？）
- [ ] 顶部加 3 张汇总卡：当月收入、当月支出、结余（收入−支出）

**📁 文件清单**
| 动作 | 文件 | 干什么 |
|---|---|---|
| 新建 | `app/lib/data/transaction.ts` | 查询层：`fetchTransactions`（列表，include 分类）、`fetchMonthlySummary`（aggregate 汇总） |
| 新建 | `app/dashboard/transactions/page.tsx` | 列表页：async 服务端组件，Table + 汇总卡 |
| 修改 | `components/app-sidebar.tsx` | 左侧导航加"账单"入口 |
| 复用 | `app/lib/utils.ts` | `formatCurrency`（分→元显示，不要自己再写一个） |

**🤔 该想的坑（高频坑 #2）**
- 列表页是 `async` 服务端组件（要取数），但里面的"新增""删除"按钮要 `onClick`（client）。**这两个能放同一个文件吗？怎么拆？**

**✅ 当日产出**：页面显示交易列表 + 3 张汇总卡（数字正确）。

---

### 📅 Day 3 —— 写：新增交易表单

**目标**：能通过表单新增一笔交易。

**任务**
- [ ] 用 react-hook-form + zodResolver + shadcn `Form` 做新增表单（金额/类型/分类/日期/备注）
- [ ] 写 Zod schema：金额必填且 > 0、类型只能两个值、日期必填
- [ ] 表单提交接到 Day 1 的 Server Action
- [ ] 提交成功后列表自动刷新（查 `revalidatePath` 怎么用）

**📁 文件清单**
| 动作 | 文件 | 干什么 |
|---|---|---|
| 修改 | `app/lib/definitions.ts` | `createTransactionSchema`（Zod）+ `z.infer` 推导表单类型（不手写） |
| 新建 | `app/ui/transactions/transaction-form.tsx` | 表单组件（client）：RHF + zodResolver + `my-form` 封装（MyInput/MyRadioGroup/MySelect） |
| 新建 | `app/dashboard/transactions/create/page.tsx` | 新增页：Breadcrumbs + 服务端查分类下拉 → props 传给表单 |
| 修改 | `app/lib/actions/transaction.ts` | `createTransaction` 完善：失败返回错误对象、成功 revalidatePath + redirect（⚠️ redirect 在 try 外） |

**🤔 该想的坑（高频坑 #3）**
- `<form action={fn}>` 里的 `fn` 如果 `return { message: "..." }` 会怎样？为什么必须返回 `void`？校验失败想给用户看错误，应该用什么机制？

**✅ 当日产出**：表单能提交、校验生效、提交后列表刷新看到新数据。

---

### 📅 Day 4 —— 改 + 删 + 错误处理

**目标**：完整 CRUD 闭环。

**任务**
- [ ] 编辑交易（复用 Day 3 的表单，但要传"正在编辑哪条"的 id）
- [ ] 删除交易（带确认对话框，防误删）
- [ ] 错误处理：校验失败怎么显示？删除失败/数据库报错怎么办？
- [ ] 边界：空列表状态、金额输入非数字、日期格式错

**📁 文件清单**
| 动作 | 文件 | 干什么 |
|---|---|---|
| 修改 | `app/ui/transactions/transaction-form.tsx` | 改造成新增/编辑**共享**：props 传不传 `transaction` 区分模式；编辑回填注意**分→元、Date→本地 YYYY-MM-DD** 两处转换 |
| 新建 | `app/dashboard/transactions/[id]/edit/page.tsx` | 编辑页：查原数据 + 分类下拉 → props 传给表单 |
| 修改 | `app/lib/data/transaction.ts` | 加 `fetchTransactionById` |
| 修改 | `app/lib/actions/transaction.ts` | 加 `updateTransaction`（差异：where + P2025）、`deleteTransaction`（id 放签名最前给 bind 留位） |
| 新建 | `app/ui/transactions/delete-button.tsx` | 删除按钮（client）：`useActionState` + `action.bind(null, id)` + confirm + toast |
| 修改 | `app/dashboard/transactions/page.tsx` | 加操作列：编辑 Link + 删除按钮 |

**🤔 该想的坑（高频坑 #4、#5）**
- 编辑表单要把记录 id 传给 action——用 `.bind(id)` 还是 hidden `<input>`？为什么其中一个会让 `useActionState` 出问题？
- 打开编辑弹窗改了一条，又打开另一条，表单数据为什么没跟着变？（`defaultValue` 的什么特性？）

**✅ 当日产出**：增、删、改、查全部可用，错误有合理反馈。

---

### 📅 Day 5 —— 聚合统计

**目标**：练 Prisma 的聚合查询。

**任务**
- [ ] 月份切换器（上个月/下个月），汇总卡跟着变
- [ ] 支出按分类分组（哪个分类花最多）—— 用 Prisma 的 `groupBy` / `aggregate`
- [ ] 简单展示分类统计（表格或进度条都行）

**📁 文件清单**
| 动作 | 文件 | 干什么 |
|---|---|---|
| 修改 | `app/lib/data/transaction.ts` | `fetchMonthlySummary` 加月份范围参数（`where: { date: { gte, lte } }`）；新增分类分组统计查询（`groupBy`） |
| 修改 | `app/dashboard/transactions/page.tsx` | 月份切换器（URL 参数驱动，和筛选/分页同一条链路）+ 分类统计展示 |

**🤔 该想的坑**
- 汇总数据从哪算最快——在 JS 里把列表循环累加，还是让数据库直接算？为什么？哪种在大数据量下差别大？

**✅ 当日产出**：切月汇总正确 + 分类统计展示。

---

### 📅 Day 6 —— 打磨 + 自测

**目标**：完整可用 + 自我检验。

**任务**
- [ ] UI 收尾（不用花哨，但完整、不丑）
- [ ] 完整走一遍流程：增删改查、切月、看统计、空数据、错误输入
- [ ] **🎯 核心自测**：对着代码，每块讲一遍"为什么这么写"，讲不出的标出来回去想

**📁 文件清单**
| 动作 | 文件 | 干什么 |
|---|---|---|
| 修改 | 各表单组件 | 失败提示接 toast（sonner，layout 已挂 Toaster）——别只 console.error，用户看不到控制台 |
| 可选新建 | `app/lib/actions/db-error.ts` | 数据库错误统一兜底 `handleDbError`：业务错误码（P2002/P2003/P2025）各 action 就地判，系统错误统一收口（练横切提取） |

**✅ 当日产出**：一个完整能用的记账本 + 一份"哪块讲不清"的清单。

---

### 📅 Day 7 —— 缓冲 + 总结

**任务**
- [ ] 补 Day 1-6 没做完的
- [ ] 写一段总结（写下来，不是想想）：
  - 哪块最卡？为什么卡？
  - 哪块最熟？
  - 5 个高频坑里，哪几个又踩了？
  - 下次（切 Java 后）想注意什么

**✅ 当日产出**：练习收尾 + 一篇反思笔记。

---

### 🗺️ 附：文件全景图（实战复盘）

只走 Day 1-6 基础链路约 **15 个文件**。实际做完（含下面的扩展子模块）触达 **25+ 个文件**——"感觉改了二三十个文件"不是错觉，一个完整 CRUD 闭环的体量就是这样。

**新建（14 个）**

| 文件 | 职责 |
|---|---|
| `app/lib/data/transaction.ts` | 交易 + 分类的查询层（列表/分页/筛选/单查/聚合，7 个函数 + PAGE_SIZE） |
| `app/lib/actions/transaction.ts` | 记账本域全部 Server Action（交易增删改 3 + 分类增删改 3 + 共享实现 1） |
| `app/lib/actions/db-error.ts` | 数据库错误统一兜底 `handleDbError`（横切提取） |
| `app/dashboard/transactions/page.tsx` | 交易列表（表格 + 汇总 + 分类筛选 + 分页 + 操作列） |
| `app/dashboard/transactions/create/page.tsx` | 新增交易页 |
| `app/dashboard/transactions/[id]/edit/page.tsx` | 编辑交易页（查原数据回填） |
| `app/dashboard/transactions/categories/page.tsx` | 分类列表（分页）※扩展 |
| `app/dashboard/transactions/categories/create/page.tsx` | 新增分类页 ※扩展 |
| `app/dashboard/transactions/categories/[id]/edit/page.tsx` | 编辑分类页 ※扩展 |
| `app/ui/transactions/transaction-form.tsx` | 交易表单（新增/编辑共享，含类型联动） |
| `app/ui/transactions/category-form.tsx` | 分类表单（新增/编辑共享）※扩展 |
| `app/ui/transactions/delete-button.tsx` | 交易删除按钮（useActionState + bind） |
| `app/ui/transactions/delete-category-button.tsx` | 分类删除按钮（同款模式）※扩展 |
| `components/ui/textarea.tsx` | shadcn 组件（`pnpm dlx shadcn@latest add textarea`） |

**修改（8 个）**

| 文件 | 改了什么 |
|---|---|
| `prisma/schema.prisma` | `Transaction` + `TransactionCategory` 两张表（含 `@@unique`、外键） |
| seed 脚本 | 分类 + 交易测试数据 |
| `app/lib/definitions.ts` | 两个 Zod schema + `z.infer` 类型（一份规则三处消费） |
| `components/my-form.tsx` | 新增 `MyTextarea` 封装 |
| `components/app-sidebar.tsx` | 侧边栏入口（账单 / 分类管理） |
| `app/dashboard/transactions/page.tsx`（多轮迭代） | 汇总卡 → 分页 → 分类筛选 → 操作列 |
| `app/ui/transactions/transaction-form.tsx`（多轮迭代） | 新增版 → 编辑合并版（回填转换 + 联动坑修复） |
| `app/lib/actions/transaction.ts`（多轮迭代） | 每个 action：校验 → 错误码分支 → handleDbError 接线 |

**复用（只 import，0 修改）——表单和列表页依赖的现成 UI 组件**

| 文件 | 用在哪 |
|---|---|
| `components/my-form.tsx` 的 `MyInput` / `MyRadioGroup` / `MySelect` | 两个表单的字段封装（自己造的 el-form-item 等价物，基于 `useFormContext` 从 Context 拿 form 实例） |
| `components/ui/form.tsx` | RHF 的桥：`<Form {...form}>` provide 实例 + `FormMessage` 显示校验错误 |
| `components/ui/table.tsx` 系 | 两个列表页的表格 |
| `components/ui/button.tsx` / `input.tsx` / `radio-group.tsx` / `select.tsx` | 表单与按钮的基础件（封装层下面那层） |
| `components/ui/sonner.tsx` | toast 提示（Toaster 挂在根 layout，失败提示用它） |
| `app/ui/invoices/breadcrumbs.tsx` | 四个 create/edit 页的面包屑（跨模块复用） |

**另有 3 个走过弯路后删除的文件**（新增分类弹窗 ×1、拆开的两个表单 ×2）——方案演进（弹窗 → 独立页面；分开 → 共享）的正常代价，复盘时反而最有讲头。弯路期还 `shadcn add` 过 `dialog.tsx`，装了最终没用上，文件留在 `components/ui/` 里。

> ※扩展 = **分类管理子模块**：练习时自然会冒出来的需求（分类不能只有写死的几个），
> 它是 Day 1-4 全套流程的**第二次独立练习**——同样的 schema/action/表单/删除再来一遍，
> 但多了两个新知识点：业务规则校验（is_system 系统预设不许删）和外键约束错误（P2003）。
> 时间够建议做，这是"从能做一遍到能做第二遍"的质变。

---

## 七、高频坑清单

### 预设的 5 个（练习前就知道会踩）

这 5 个都踩过。这次遇到**先自己想**，想不通再问 AI（会被反问）。

| # | 坑 | 自问 |
|---|---|---|
| 1 | **金额类型** | 钱在库里该存什么类型？为什么浮点不行？（提示：`0.1 + 0.2 !== 0.3`） |
| 2 | **async 服务端组件里的交互按钮** | 列表要 async 取数，按钮要 client onClick，能放一个文件吗？怎么拆？ |
| 3 | **`<form action>` 的返回值** | action `return { message }` 会怎样？为什么必须 void？错误怎么显示？ |
| 4 | **编辑表单传 id** | `useActionState` + 已有记录 id，用 `.bind()` 还是 hidden input？为什么 bind 会出问题？ |
| 5 | **编辑表单 defaultValue 不更新** | 改一条又打开另一条，表单为啥没变？`defaultValue` 的什么特性？怎么解？ |

### 实战追加的 10 个（真做完才知道的）

编号接着上面。前三个是本次实战中**重复率最高**的（抄漏改栽了三次、FormData 顶参数位排查了一整轮）。

| # | 坑 | 提示 |
|---|---|---|
| 6 | **抄模板漏改实体** | 从别的模块抄代码，结构不会抄错，**实体绑定**最容易被漏。抄完必查四件套：模型名（`transaction` ≠ `transactionCategory`）、错误文案（"删除分类失败"出现在交易 action 里）、revalidatePath 路径、业务错误码 |
| 7 | **form action 裸绑带参 action** | `<form action={fn}>` 提交时把 **FormData 传给第一个参数**——签名是 `(id)` 的 action 拿到 FormData 当 id 用，报一堆莫名其妙的错。修法：id 放签名最前 + `.bind(null, id)`（bind 只能预填前面的参数），或 hidden input 从 FormData 取 |
| 8 | **useActionState 的 action 必须返回 state** | 成功路径跑完不写 `return`，TS 报 `No overload matches`；补 `return { success: true, message: '' }`——按钮的 useEffect 也靠它区分成败 |
| 9 | **resetField ≠ 清空** | 它的语义是"重置回**表单初始值**"——新增模式初始是 undefined，看起来是清空；编辑模式初始是回填值，**等于没清**，还会造成"下拉看着空、值还在"的视觉欺骗（options 变了显示不出旧 id，校验却通过）。编辑场景用 `form.reset({ ...form.getValues(), field: undefined })` |
| 10 | **Radix Select 的 value=undefined 是"非受控"** | 从有值清回 undefined，placeholder 不恢复（内部记忆残留）——封装层用 `key` 强制重挂载解决 |
| 11 | **日期回填用 toISOString() 会差一天** | 它是 UTC：东八区凌晨存的日期回填成前一天。按本地时区手动拼 `YYYY-MM-DD`（`getFullYear/getMonth/getDate`） |
| 12 | **z.string() 裸奔** | 值域固定的字段写 `z.string()` 等于没约束（`'abc'` 也能过）。该用 `z.enum(['income', 'expense'])`；写完 schema 扫一遍：每个字段的约束是否表达了真实业务规则 |
| 13 | **数据库错误码三兄弟** | P2002 唯一约束重名 / P2003 外键被引用 / P2025 目标不存在——catch 里 `instanceof Prisma.PrismaClientKnownRequestError` + `error.code` 分支，转成用户能看懂的话；系统级错误统一收口到 `handleDbError`，别每个 action 抄一遍 |
| 14 | **手写类型和 schema 漂移** | 表单值类型用 `z.infer` 推导，不手写——schema 一改类型自动跟。收紧 `z.string()` → `z.enum()` 时编译器会把所有受影响处揪出来（典型：Prisma 的宽 `String` 撞表单的窄联合，在数据边界 `as` 一次收掉） |

---

## 八、允许查的文档（查语法不算作弊）

| 概念 | 官方文档 |
|---|---|
| Prisma 查询/聚合 | `prisma.io/docs`（`findMany` / `aggregate` / `groupBy`） |
| Zod 校验 | `zod.dev` |
| react-hook-form | `react-hook-form.com` |
| shadcn 组件 | `ui.shadcn.com` |
| Next.js Server Actions / revalidate | `nextjs.org/docs` |

> 红线：查这些**语法/API**可以；去翻 `customers` / `invoices` 的**实现**不行。

---

## 九、怎么用 AI 助手

| 情况 | 怎么做 |
|---|---|
| 忘了某个 API 怎么写 | ✅ 直接问"prisma groupBy 怎么用"，AI 答 |
| 不知道下一步做什么 | ❌ 别问。回去看本文档的 Day 计划 |
| 卡了 15 分钟以上 | ✅ 来问。**格式**："我试了 X，报了 Y 错，我猜是 Z 原因，对吗？" AI 会反问确认 |
| 想确认思路对不对 | ✅ 完成一个 Day 后，跟 AI 说"Day X 我的思路是……"，AI 校验思路（不看代码细节） |
| 心态崩了 | ✅ 直说，AI 会破例给更多提示甚至代码 |

---

## 十、节奏总览

```
Day 1  数据层    ████░░░░░░░░░░░░  模型 + 迁移 + createTransaction
Day 2  列表页    ██████░░░░░░░░░░  读 + 汇总卡（坑#2）
Day 3  新增表单  ████████░░░░░░░░  RHF + Zod（坑#3）
Day 4  改删错    ██████████░░░░░░  CRUD 闭环（坑#4 #5）
Day 5  聚合统计  ████████████░░░░  groupBy / aggregate
Day 6  打磨自测  ██████████████░░  讲一遍"为什么"
Day 7  缓冲总结  ████████████████  反思笔记
```

---

## 十一、完成后

毕业标准达标 → 进入 Java 学习路径（参考学习规划）：

```
0. 本闭环（1周）✅
1. Java 8 地基（3-4 周）
2. Spring Boot + Maven 多模块（2-3 周）
3. MyBatis-Plus（2 周）
4. 仿 hqq-api 真实链路实战（2-3 周）
5. 介入公司代码
```

---

**最后一句**：Day 1 第一件事不是写代码，是回答"五、数据模型"里的问题。想清楚再动键盘。想好了可以跟 AI 对一下思路。
