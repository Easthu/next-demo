# Prisma 入门指南

> 本项目从"手写 SQL（postgres.js + @vercel/postgres）"迁移到了 Prisma ORM。
> 这份文档从头讲解 Prisma 是什么、怎么用，假设你完全没用过 Prisma。

---

## 一、Prisma 是什么

把它想成一个**翻译官**。你用 JS 对象告诉它"我要查什么"，它翻译成 SQL，发给数据库，拿到结果再还给你。

```
你的代码            Prisma（翻译官）              数据库
prisma.invoice  →  翻译成 SQL        →  执行查询
.findMany()     ←  把结果翻译成 JS    ←  返回数据
```

你以前是自己写 SQL 直接和数据库对话（`await sql\`SELECT * FROM invoices\``），现在中间加了 Prisma 这个翻译官。你不再说"SQL 语"了，改说"JS 语"，Prisma 帮你翻译。

---

## 二、三个核心文件

要让翻译官干活，得先告诉它三件事。这就是三个文件的作用——**它们是给翻译官的三份资料**：

| 文件 | 角色 | 一句话说明 |
|------|------|-----------|
| `prisma/schema.prisma` | 数据库地图 | "数据库里有哪些表、长什么样、表之间什么关系" |
| `prisma.config.ts` | 数据库地址 | "数据库在哪、怎么连" |
| `app/lib/prisma.ts` | 翻译官实例 | "一个准备好的、能干活的翻译官" |

### 资料 1：`prisma/schema.prisma`——"数据库地图"

翻译官要翻译，得先知道数据库里有什么表。这个文件就是**数据库的地图**。

核心内容是 4 个 model，每个 model 描述一张表：

```prisma
model Customer {        // ← 表的"代号"，代码里用这个名（大写）
  id        String
  name      String
  email     String
  image_url String
  @@map("customers")    // ← 但数据库里实际表名叫 customers（小写）
}
```

比喻：**model 就像数据库表的一个"名片"**。
- 名片上的名字（`Customer`）是给代码看的——大写、单数，符合编程习惯
- `@@map("customers")` 是名片背面的备注——"我对应的真实表叫 customers"

**为什么需要两套名字？** 因为代码想用规范的名字（`Customer`），但数据库里表早就建好了（叫 `customers`）。`@@map` 就是让两边对得上。

#### @@map 深入理解

用一张表理清三个名字的关系：

| 名字 | 位置 | 能改吗 | 干什么用 |
|------|------|--------|---------|
| `Customer`（model 名） | schema 里的 `model Customer` | **能改**，纯代码层面 | 当类型用（`import type { Customer }`）、查询时变小写（`prisma.customer`） |
| `customers`（@@map 里的） | `@@map("customers")` | **基本不改**，是数据库真实表名，改了就对不上数据 | Prisma 生成 SQL 时找的表名 |
| `customer`（prisma 属性） | 代码里 `prisma.customer` | 跟着 model 名走（自动首字母小写） | 查询入口 |

**核心理解**：
- `@@map("customers")` 里的 `customers` 是数据库的真实表名，**是定死了基本不改的**（表已经存在，改了就对不上数据）
- model 名 `Customer` 是你自己取的，**可以随意改**——改成 `Receipt` 都行，只要 `@@map("invoices")` 不变，Prisma 就知道去数据库找 `invoices` 表
- `prisma.invoice` 找的是**模型名称**（Invoice 首字母变小写），不是表名。Prisma 通过 model 定义里的 `@@map` 知道该去数据库找哪张表

**查询时 @@map 是怎么起作用的？** 每次查询都用到了，只是你感知不到：

```
你写：prisma.invoice.findMany()
        ↓
Prisma 查 schema：model Invoice 里 @@map("invoices")
        ↓
生成 SQL：SELECT * FROM invoices    ← 用 @@map 里的名字
```

如果没有 `@@map`，Prisma 会默认用 model 名当表名，去数据库找 `Invoice`（大写），但数据库里只有 `invoices`（小写），就会报错 `relation "Invoice" does not exist`。

### 资料 2：`prisma.config.ts`——"数据库地址"

告诉翻译官"数据库在哪"：

```ts
datasource: {
  url: env('POSTGRES_URL_NON_POOLING'),  // 数据库的连接地址
}
```

这是 Prisma 7 新增的配置文件。配好就不用动了。

### 资料 3：`app/lib/prisma.ts`——"翻译官本人"

前两份只是资料，这个才是**真正能干活的翻译官**：

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
export const prisma = new PrismaClient({ adapter });
```

这两行就是"创造一个翻译官实例，并给它数据库地址"。创造好后导出（`export const prisma`），全项目都能用它。

> **为什么用单例模式（globalForPrisma）？** Next.js dev 模式热更新时会反复重新加载文件，每次都 `new PrismaClient()` 会开几十个连接把数据库搞崩。把实例存到 `global` 上，保证全局只有一个。

---

## 三、所有查询都是同一个套路

**这是最重要的部分。** 不管查什么，都是这个固定格式：

```
prisma.表名.方法(参数)
```

就这三个部分。

### 第 1 部分：`prisma`

就是上面创建的翻译官实例。每个文件开头 import 进来：

```ts
import { prisma } from '@/app/lib/prisma';
```

### 第 2 部分：表名（小写！）

`prisma.` 后面跟表名。**注意是小写**——这是唯一的坑：

```ts
prisma.customer    // ✅ 小写
prisma.invoice
prisma.user
prisma.revenue

prisma.Customer    // ❌ 错！这是 model 名（大写），查询时不能用
```

为什么是小写？因为这是"对象的属性"，JS 的属性习惯小写。Prisma 自动把 model 名（`Customer`）首字母变小写，挂成 `prisma.customer`。

### 第 3 部分：方法名

`表名.` 后面跟"你想做什么操作"。最常用的就 7 个，记这几个够了：

| 方法 | 干什么 | 对应的 SQL |
|------|--------|-----------|
| `findMany()` | 查多条（返回**数组**） | `SELECT * FROM ...` |
| `findFirst({ where, orderBy })` | 按条件查**第一条**（返回单条或 null） | `SELECT ... WHERE ... ORDER BY ... LIMIT 1` |
| `findUnique({ where: { id } })` | 按**唯一字段**查一条（返回单条或 null） | `SELECT ... WHERE id = ...` |
| `create({ data })` | 新增一条 | `INSERT INTO ...` |
| `update({ where, data })` | 修改一条 | `UPDATE ... SET ... WHERE ...` |
| `delete({ where })` | 删除一条 | `DELETE FROM ... WHERE ...` |
| `count()` | 数数 | `SELECT COUNT(*)` |

### 拼起来看

```ts
prisma.invoice.findMany()
//  翻译官   发票表  查多条
//  → "SELECT * FROM invoices"

prisma.invoice.findUnique({ where: { id: 'xxx' } })
//                  按主键查一条     条件：id 等于 xxx
//  → "SELECT * FROM invoices WHERE id = 'xxx'"

prisma.invoice.create({ data: { amount: 100, status: 'paid', ... } })
//                 新增     数据：这些字段
//  → "INSERT INTO invoices (amount, status, ...) VALUES (100, 'paid', ...)"
```

**就这么简单。三部分拼起来，Prisma 帮你翻译。**

### 三个 find 怎么选（最容易混）

上面表里有三个 `find`，初学者常搞混。记住一句话：**返回数组还是单条？条件必须是唯一字段吗？**

| 方法 | 返回 | 条件要求 | 什么时候用 |
|------|------|---------|-----------|
| `findMany()` | **数组** `[]` | 任意条件 | 查多条（列表页） |
| `findFirst()` | **单条** 或 `null` | **任意条件** | 按条件查一条（最新一条、随机一条） |
| `findUnique()` | **单条** 或 `null` | **只能唯一字段**（id 或 @unique） | 按主键精确查 |

**关键区别**：

- `findUnique` **只能用唯一字段**（id、email 这种标了 `@unique` 的）。写 `findUnique({ where: { status: 'paid' } })` 会**直接报错**——status 不是唯一字段。
- `findFirst` 能用**任意条件**，返回第一条匹配。配合 `orderBy` 就是"查最新一条 / 最旧一条"。

**真实例子（本项目 SSE 端点 `app/api/sse/invoices/route.ts`）**：

```ts
// 查最新一张发票——没有唯一字段可用（不是按 id 查），用 findFirst + orderBy
const latest = await prisma.invoice.findFirst({
  orderBy: { date: 'desc' },
});
// → SELECT * FROM invoices ORDER BY date DESC LIMIT 1
```

如果用 `findMany`，会返回数组，你还得写 `result[0]`，多此一举。`findFirst` 就是为这种场景设计的。

> **经验法则**：能按 id 查就用 `findUnique`（性能最好，Prisma 知道最多一条不用遍历）；按其他条件查一条才用 `findFirst`。

---

### 写入操作全家桶（create / update / delete 及变体）

查询有三个 `find`，写入也有一整套。一次列全，别再漏：

**单条写入**：

| 方法 | 干什么 | 找不到时 |
|------|--------|---------|
| `create({ data })` | 新增一条 | — |
| `update({ where, data })` | 改一条 | **抛错**（where 必须能找到） |
| `delete({ where })` | 删一条 | **抛错**（where 必须能找到） |
| `upsert({ where, create, update })` | 存在则改，不存在则建 | — |

**批量写入**：

| 方法 | 干什么 |
|------|--------|
| `createMany({ data: [...] })` | 一次插入多条 |
| `updateMany({ where, data })` | 改所有匹配的（本项目 `bulkUpdateInvoiceStatus` 用了） |
| `deleteMany({ where })` | 删所有匹配的 |

挑几个容易混的讲：

#### `upsert`——存在则更新，不存在则创建

很常用。比如"记录用户登录：有就更新时间，没有就新建"：

```ts
await prisma.user.upsert({
  where: { email: 'a@b.com' },
  update: { lastLogin: new Date() },                    // 已存在 → 执行这个
  create: { email: 'a@b.com', name: 'A', lastLogin: new Date() },  // 不存在 → 执行这个
});
```

比"先 `findUnique` 再判断 `create`/`update`"简洁，而且是**原子操作**（不会并发冲突）。

#### `createMany`——批量插入

```ts
await prisma.invoice.createMany({
  data: [
    { amount: 100, status: 'paid', customerId: 'c1', date: new Date() },
    { amount: 200, status: 'pending', customerId: 'c2', date: new Date() },
  ],
});
```

⚠️ `createMany` **不支持嵌套创建**（不能 `include` 关联数据），只能插单表批量。要连同关联数据一起建，用多个 `create` + `$transaction`。

#### `*OrThrow` 系列——找不到就抛错

`findUnique` 默认找不到返回 `null`。如果你**确信数据该存在**、不存在就是 bug，用 `OrThrow` 变体让它尽早抛错：

```ts
const inv = await prisma.invoice.findUniqueOrThrow({ where: { id } });
// 找不到 → 抛错（而不是返回 null，让后续代码崩在别处）
```

变体：`findFirstOrThrow`、`findUniqueOrThrow`、`updateManyOrThrow`、`deleteManyOrThrow` 等。**适用**：查必须存在的记录时，让错误尽早暴露。

#### `$transaction`——事务（多条要么全成，要么全废）

```ts
await prisma.$transaction([
  prisma.invoice.update({ where: { id: '1' }, data: { status: 'paid' } }),
  prisma.customer.update({ where: { id: 'c1' }, data: { paidCount: { increment: 1 } } }),
]);
// 任一失败 → 全部回滚
```

**适用**：转账、扣库存等"多步必须同时成功"的场景。还有 `$queryRaw`（直接写原生 SQL），偶尔需要绕过 Prisma 时用。

---

## 四、查询时加"条件"

光 `findMany()` 会查出全部，你通常要加条件。条件写在参数对象里：

### 排序

```ts
prisma.invoice.findMany({
  orderBy: { date: 'desc' },    // 按日期倒序（最新的在前）
})
// → ORDER BY date DESC
```

### 取前 N 条（分页）

```ts
prisma.invoice.findMany({
  take: 5,         // 只要 5 条（LIMIT 5）
  skip: 6,         // 跳过 6 条（OFFSET 6，分页用）
})
// → LIMIT 5 OFFSET 6
```

### 条件筛选（WHERE）

**最简单的条件：精确匹配**

```ts
prisma.invoice.findMany({
  where: { status: 'paid' },    // 只要已支付的
})
// → WHERE status = 'paid'
```

`where` 里直接写 `字段: 值`，意思是"这个字段等于这个值"。

**模糊搜索：用 contains**

```ts
prisma.customer.findMany({
  where: { name: { contains: 'lee', mode: 'insensitive' } },
})
// → WHERE name ILIKE '%lee%'
```

为什么 `name` 的值从字符串变成了对象？因为模糊搜索有额外参数（搜索词 + 是否区分大小写），所以要用对象描述：

```ts
name: {
  contains: 'lee',           // 包含 'lee'（相当于 SQL 的 ILIKE '%lee%'）
  mode: 'insensitive',       // 不区分大小写（相当于 ILIKE 而不是 LIKE）
}
```

> **`mode: 'insensitive' as const` 里的 `as const` 是什么？** 这是 TypeScript 语法，告诉编译器"这个值就是字面量 `'insensitive'`"。Prisma 要求 mode 是具体的值而不是任意字符串，所以加 `as const` 让类型匹配。写代码时照抄即可。

### 多个条件（AND / OR）

实际查询经常要组合多个条件。Prisma 用 `AND` 和 `OR` 两个关键字。

**AND（同时满足所有条件，默认就是 AND）**

```ts
prisma.invoice.findMany({
  where: {
    status: 'paid',          // 条件1：已支付
    amount: { gt: 1000 },    // 条件2：金额大于 1000
  },
})
// → WHERE status = 'paid' AND amount > 1000
```

多个条件直接写在 `where` 对象里，**默认就是 AND 关系**（同时满足）。

**OR（满足任意一个就行）**

```ts
prisma.invoice.findMany({
  where: {
    OR: [                              // "满足以下任意一个"
      { status: 'paid' },              // 条件1：已支付
      { status: 'pending' },           // 条件2：待处理
    ],
  },
})
// → WHERE status = 'paid' OR status = 'pending'
```

`OR` 是个数组，数组里每个元素是**一个完整的条件对象**。Prisma 把它们用 OR 连起来。

### 复杂条件：项目里的真实例子（三层嵌套）

项目里 `fetchFilteredInvoices` 的搜索条件是三个 OR，而且其中两个还要查关联表的字段。这个最复杂，我逐层拆：

```ts
where: {
  OR: [
    { customer: { name:  { contains: query, mode: 'insensitive' } } },
    { customer: { email: { contains: query, mode: 'insensitive' } } },
    { status: { contains: query, mode: 'insensitive' } },
  ],
}
```

单独看最复杂的第一个条件，它是三层嵌套：

```ts
{ customer: { name: { contains: query, mode: 'insensitive' } } }
```

由外到内拆：

```
第 1 层：customer: { ... }
         "我要查的是关联的 customer 的字段"
         （因为发票本身没有 name 字段，name 在 customer 表里）

第 2 层：name: { ... }
         "customer 的 name 字段"

第 3 层：contains: query, mode: 'insensitive'
         "包含搜索词，不区分大小写"
```

**为什么要嵌套到 customer 里？** 因为你在查发票（`prisma.invoice`），但想按**客户名**搜索。客户名不在发票表里，在客户表里。Prisma 通过 schema 里的关系声明，知道"发票关联了客户"，所以你写 `customer: { name: ... }`，Prisma 自动 JOIN 到 customers 表去搜。

对比条件 3，它**没有嵌套**：

```ts
{ status: { contains: query, mode: 'insensitive' } }
```

因为 `status` 就在发票表本身，不需要去关联表查，所以不用嵌套到 `customer` 里。

**规则总结**：
- 条件字段在**本表** → 直接写 `{ status: { ... } }`
- 条件字段在**关联表** → 嵌套写 `{ customer: { name: { ... } } }`

### 常用的条件操作符

除了 `contains`（模糊搜索），还有这些：

| 操作符 | 含义 | SQL 对应 | 例子 |
|--------|------|---------|------|
| `contains` | 包含（模糊） | `ILIKE '%x%'` | `name: { contains: 'lee' }` |
| `equals` | 等于（默认） | `= ` | `status: { equals: 'paid' }` |
| `gt` / `gte` | 大于 / 大于等于 | `>` / `>=` | `amount: { gt: 1000 }` |
| `lt` / `lte` | 小于 / 小于等于 | `<` / `<=` | `amount: { lt: 500 }` |
| `in` | 在某个集合里 | `IN (...)` | `status: { in: ['paid', 'pending'] }` |
| `startsWith` | 以...开头 | `ILIKE 'x%'` | `name: { startsWith: 'A' }` |

这些条件**都可以组合**：

```ts
prisma.invoice.findMany({
  where: { status: 'paid' },        // WHERE status = 'paid'
  orderBy: { date: 'desc' },        // ORDER BY date DESC
  take: 5,                          // LIMIT 5
})
// → SELECT * FROM invoices WHERE status = 'paid' ORDER BY date DESC LIMIT 5
```

---

## 五、关联查询（JOIN）——用 include

查询发票时想顺便拿到客户信息，不用手写 JOIN。这是 Prisma 最实用的功能之一。

### 为什么需要关联查询

发票表和客户表是**分开的两张表**。发票表里只有 `customer_id`（一串 UUID），没有客户名字：

```
invoices 表                              customers 表
┌──────────┬──────────────┬────────┐    ┌──────────┬───────────┐
│ id       │ customer_id  │ amount │    │ id       │ name      │
├──────────┼──────────────┼────────┤    ├──────────┼───────────┤
│ 发票1     │ 客户A         │ 100    │    │ 客户A     │ 张三       │
│ 发票2     │ 客户B         │ 200    │    │ 客户B     │ 李四       │
└──────────┴──────────────┴────────┘    └──────────┴───────────┘
            发票只存了 customer_id，不存客户名字
```

但你在页面上显示发票时，想显示**客户名字**。发票表里没有名字，得把两张表"拼"起来——这就是 JOIN / 关联查询。

### 前提：schema 里声明了关系

要让 Prisma 自动 JOIN，必须先在 schema 里**声明两张表的关系**。关系声明涉及两个 model **互相引用对方**：

```prisma
model Customer {
  id        String    @id
  name      String
  invoices  Invoice[]    // ← "一"的方向：一个客户有多张发票（用数组）
}

model Invoice {
  id          String   @id
  amount      Int
  customer_id String                                      // ← 真实的外键列（数据库里有）
  customer    Customer @relation(fields: [customer_id], references: [id])  // ← "多"的方向
}
```

**关系声明两边都要写**，但角色不同：

| | Customer 里的声明 | Invoice 里的声明 |
|---|---|---|
| 写法 | `invoices Invoice[]` | `customer Customer @relation(...)` |
| 含义 | "一个客户**有**多张发票" | "一张发票**属于**一个客户" |
| 方向 | "一"（一个客户对多张发票） | "多"（多张发票对一个客户） |
| 有 `@relation` 吗 | 没有 | **有**（指定关联细节） |
| 数据库里有对应列吗 | 没有（虚拟字段） | `customer_id` 有（真实外键），`customer` 没有（虚拟字段） |

**`@relation` 只写在持有外键的那一方**（Invoice），因为它需要告诉 Prisma"我用哪个字段关联到谁"。Customer 那边不需要 `@relation`，因为它不持有外键，只是"被别人引用"。

`@relation(fields: [customer_id], references: [id])` 逐个拆：

```
@relation(           ← 这是个"关系声明"
  fields: [customer_id],      ← 用本表（Invoice）的 customer_id 字段来关联
  references: [id]             ← 对应对方表（Customer）的 id 字段
)
```

翻译成人话：**"这张发票通过 customer_id 字段，关联到 Customer 表的 id 字段"**。和你原来手写 SQL JOIN 时写的 ON 条件一模一样：

```sql
-- SQL 的 JOIN 条件
JOIN customers ON invoices.customer_id = customers.id
                ^^^^^^^^^^^^^^^^         ^^^^^^^^^^^^
                fields: [customer_id]    references: [id]
```

### 查询时：加一个 `include`

声明了关系后，查询只要加 `include`，Prisma 自动 JOIN：

```ts
prisma.invoice.findMany({
  include: { customer: true },     // ← 顺便把客户信息也查出来
})
```

`include: { customer: true }` 的意思：**"查发票时，把每条发票关联的客户也一起查出来"**。

Prisma 底层自动生成 JOIN：

```sql
SELECT invoices.*, customers.*
FROM invoices
JOIN customers ON invoices.customer_id = customers.id
```

你不用写 `JOIN ... ON ...`，Prisma 根据 schema 里的关系声明自动拼。

### 结果是嵌套结构（和 SQL JOIN 的关键区别）

SQL JOIN 和 Prisma include 的**最大区别在结果的形状**：

**SQL JOIN 的结果：扁平的**（两张表的字段混在一行）

```ts
{
  amount: 15795,
  name: 'Evil Rabbit',        // ← 客户名字直接在顶层
  image_url: '/customers/evil-rabbit.png',
  email: 'evil@rabbit.com',
  id: '发票的id'
}
```

**Prisma include 的结果：嵌套的**（客户信息在 customer 子对象里）

```ts
{
  id: '发票id',
  amount: 15795,
  customer_id: '客户的id',
  customer: {              // ← 客户信息嵌套在这里
    name: 'Evil Rabbit',
    email: 'evil@rabbit.com',
    image_url: '/customers/evil-rabbit.png',
  }
}
```

**区别就是**：SQL 把两张表的字段混在一起（扁平），Prisma 把关联的数据放在一个嵌套对象里。

取客户名字的方式不同：

```ts
// SQL 版（扁平，直接取）
invoice.name          // 客户名字
invoice.image_url     // 客户头像

// Prisma 版（嵌套，通过 customer 取）
invoice.customer.name       // 客户名字
invoice.customer.image_url  // 客户头像
```

> **这就是为什么 data.ts 里有些函数要做"扁平化"**：Prisma 给的是嵌套结构（`invoice.customer.name`），但页面组件期望扁平结构（`invoice.name`），所以用 `.map()` 转换一下。

### include 是双向的

`include` 不只能"查发票带客户"，也能"查客户带发票"——取决于你从哪边查：

**查发票时带出客户（发票 → 客户）**

```ts
const invoice = await prisma.invoice.findUnique({
  where: { id: '发票id' },
  include: { customer: true },    // ← 用 Invoice model 里的 customer 字段名
});
// 结果：invoice.customer.name 拿到客户名
```

**查客户时带出他的所有发票（客户 → 发票）**

```ts
const customer = await prisma.customer.findUnique({
  where: { id: '客户id' },
  include: { invoices: true },    // ← 用 Customer model 里的 invoices 字段名
});
// 结果：customer.invoices 是一个发票数组
```

`include` 里写的名字，就是你在 schema 里给关系字段取的名字（`customer` 或 `invoices`）。

> **项目里的实际用法**：`fetchFilteredCustomers` 用 `include: { invoices: true }` 查出每个客户的所有发票，然后在 JS 里用 `.length` / `.reduce` 算统计（发票数、待处理金额、已支付金额）。这替代了原来 SQL 的 `LEFT JOIN + GROUP BY + COUNT + SUM`。

### 三种关系的写法对照

本项目用的是"一对多"。Prisma 还支持其他关系，写法有区别：

**一对多（本项目用的）**

```prisma
model Customer {
  invoices Invoice[]    // "一"方用数组
}
model Invoice {
  customer_id String
  customer    Customer @relation(fields: [customer_id], references: [id])  // "多"方用 @relation
}
```

**一对一**（比如用户和用户详情）

```prisma
model User {
  profile UserProfile?    // ? 表示可选，一个用户有零或一个详情
}
model UserProfile {
  user_id String
  user    User @relation(fields: [user_id], references: [id])
}
```

**多对多**（比如文章和标签）

```prisma
model Post {
  tags Tag[]    // 不需要外键，Prisma 自动建中间表
}
model Tag {
  posts Post[]
}
```

本项目只用到一对多，把这一种搞懂就够用。

---

## 五点五、聚合查询（统计）

普通查询返回**一条条数据**，聚合查询返回**统计结果**（总和、平均、最大、计数）。

### 三个聚合方法

| 方法 | 干什么 | SQL 对应 | 返回什么 |
|------|--------|---------|---------|
| `count()` | 数数 | `COUNT(*)` | 一个数字 |
| `aggregate()` | 全表统计（总和/平均/最大/最小） | `SUM/AVG/MAX/MIN` | 一个统计对象 |
| `groupBy()` | 分组统计（按某个字段分组后再算） | `GROUP BY + SUM/COUNT` | 多个组的统计 |

### `count()`——数数（最简单）

```ts
// 总共有多少条发票
const total = await prisma.invoice.count();
// → 24（一个数字）

// 带条件：有多少条已支付的
const paidCount = await prisma.invoice.count({
  where: { status: 'paid' },
});
// → 15
```

对应 SQL：
```sql
SELECT COUNT(*) FROM invoices;
SELECT COUNT(*) FROM invoices WHERE status = 'paid';
```

> **项目里已用**：`fetchCardData` 和 `fetchInvoicesPages` 都用了 `count()`。

### `aggregate()`——全表统计

`aggregate` 可以算总和、平均、最大、最小，全表范围：

```ts
const result = await prisma.invoice.aggregate({
  where: { status: 'paid' },      // 只算已支付的
  _sum: { amount: true },          // 求和
});
// → { _sum: { amount: 157952 } }    所有已支付发票的金额总和
```

可以同时算多种统计：

```ts
const result = await prisma.invoice.aggregate({
  _sum: { amount: true },      // 总和
  _avg: { amount: true },      // 平均
  _max: { amount: true },      // 最大值
  _min: { amount: true },      // 最小值
  _count: { _all: true },      // 总条数
});
// → {
//   _sum: { amount: 157952 },
//   _avg: { amount: 6581 },
//   _max: { amount: 54246 },
//   _min: { amount: 500 },
//   _count: { _all: 24 }
// }
```

对应 SQL：
```sql
SELECT
  SUM(amount) AS "sum",
  AVG(amount) AS "avg",
  MAX(amount) AS "max",
  MIN(amount) AS "min",
  COUNT(*) AS "count"
FROM invoices;
```

#### `_sum: { amount: true }` 为什么这么写

```ts
_sum: { amount: true }
```

意思是"对 amount 字段求和"。写成 `{ amount: true }` 是因为 Prisma 允许你**选择对哪些字段做统计**——你可能只想对 amount 求和，不想对别的字段（比如 id）求和：

```ts
_sum: { amount: true }        // 只对 amount 求和
_sum: { amount: true, tax: true }  // 对 amount 和 tax 都求和
```

> **项目里已用**：`fetchCardData` 用 `aggregate` 算已支付和待处理的金额总和。

### `groupBy()`——分组统计（最强大）

按某个字段**分组**，每组分别统计。

#### 场景 1：按状态分组，算每种状态的总金额

```ts
const result = await prisma.invoice.groupBy({
  by: ['status'],                    // 按状态分组
  _sum: { amount: true },            // 每组算金额总和
});
// → [
//   { status: 'paid', _sum: { amount: 120000 } },     已支付组：总金额 120000
//   { status: 'pending', _sum: { amount: 37952 } },   待处理组：总金额 37952
// ]
```

对应 SQL：
```sql
SELECT status, SUM(amount)
FROM invoices
GROUP BY status;
```

#### 场景 2：按客户分组，算每个客户的总消费（排行榜）

```ts
const result = await prisma.invoice.groupBy({
  by: ['customer_id'],               // 按客户分组
  where: { status: 'paid' },          // 只算已支付的
  _sum: { amount: true },             // 每个客户花了多少
  orderBy: {                          // 按消费金额倒序排
    _sum: { amount: 'desc' },
  },
  take: 5,                            // 只取前 5 名（消费最多的 5 个客户）
});
// → [
//   { customer_id: 'A', _sum: { amount: 80000 } },
//   { customer_id: 'B', _sum: { amount: 50000 } },
//   ...
// ]
```

对应 SQL：
```sql
SELECT customer_id, SUM(amount)
FROM invoices
WHERE status = 'paid'
GROUP BY customer_id
ORDER BY SUM(amount) DESC
LIMIT 5;
```

#### `orderBy: { _sum: { amount: 'desc' } }` 为什么这么写

不能简写成 `orderBy: { amount: 'desc' }`，因为 **groupBy 返回的数据结构和普通查询不同**。

普通查询返回的数据，`amount` 在顶层：
```ts
// findMany 返回：amount 在顶层
{ id: 'xxx', amount: 80000, status: 'paid', ... }
//             ↑ 顶层字段，orderBy: { amount: 'desc' } 就能找到
```

groupBy 返回的数据，`amount` 被包在 `_sum` 容器里：
```ts
// groupBy 返回：amount 在 _sum 容器里
{ customer_id: 'A', _sum: { amount: 80000 } }
//                    ↑         ↑
//                    统计容器    具体值在更里面
```

因为 groupBy 可能同时算多种统计（sum、avg、max...），每种都用容器包起来防止混淆：
```ts
// 如果同时算 sum 和 avg
{ customer_id: 'A', _sum: { amount: 80000 }, _avg: { amount: 4000 } }
```

所以排序时要**穿透到容器里指定哪个字段**：
```ts
// ❌ amount 不是顶层字段，Prisma 找不到
orderBy: { amount: 'desc' }

// ✅ 指定 _sum 容器里的 amount 字段
orderBy: { _sum: { amount: 'desc' } }
//         ↑    ↑
//         哪个容器  容器里的哪个字段
```

规则：**orderBy 要对应数据的实际结构。数据在哪层，orderBy 就写到哪层。**

#### groupBy 的一个坑：不返回关联数据

```ts
const result = await prisma.invoice.groupBy({
  by: ['customer_id'],
  _sum: { amount: true },
});
// → [{ customer_id: 'uuid-xxx', _sum: { amount: 80000 } }]
//    只有 customer_id，没有客户名字！
```

groupBy 不支持 `include`，所以你拿到了 customer_id 但**没有客户名字**。要拿名字得**再查一次**：

```ts
// 第一步：groupBy 算出每个客户的消费总额
const topCustomers = await prisma.invoice.groupBy({
  by: ['customer_id'],
  _sum: { amount: true },
  orderBy: { _sum: { amount: 'desc' } },
  take: 5,
});

// 第二步：再查这些客户的姓名
const customers = await prisma.customer.findMany({
  where: { id: { in: topCustomers.map(r => r.customer_id) } },
  select: { id: true, name: true },
});

// 第三步：拼在一起
const result = topCustomers.map(r => ({
  name: customers.find(c => c.id === r.customer_id)?.name,
  total: r._sum.amount,
}));
```

### 四个统计操作符

`aggregate` 和 `groupBy` 里都能用这四个：

| 操作符 | 含义 | SQL 对应 | 例子 |
|--------|------|---------|------|
| `_sum` | 求和 | `SUM` | `_sum: { amount: true }` |
| `_avg` | 平均 | `AVG` | `_avg: { amount: true }` |
| `_max` | 最大 | `MAX` | `_max: { amount: true }` |
| `_min` | 最小 | `MIN` | `_min: { amount: true }` |

### 三个方法的快速选择

```
"有多少条？"           → count()
"总共多少钱？"         → aggregate({ _sum: { amount: true } })
"每种状态各多少钱？"    → groupBy({ by: ['status'], _sum: { amount: true } })
```

---

## 六、大小写规则（容易搞混，单独记）

| 你在写什么 | 用什么大小写 | 例子 |
|-----------|------------|------|
| 定义 model（schema.prisma） | 首字母**大写** | `model Invoice { }` |
| 查询数据库（data.ts/action.ts） | 首字母**小写** | `prisma.invoice.findMany()` |
| 引用类型（import type） | 首字母**大写** | `import type { Invoice } from '@prisma/client'` |
| 表里的列名 | **snake_case** | `customer_id`、`image_url` |
| 关系字段（虚拟） | **小写**（单数或复数） | `customer`（一个）/ `invoices`（多个） |

**最核心的一句**：**定义用大写，使用用小写**。就像你写 TS 时 `type User = {...}`（大写定义），但用的时候 `const user: User = ...`（小写变量名）。

### `@@map` 和 `@map` 的区别

- **`@@map`（两个 @）**：映射**表名**。`model Customer { @@map("customers") }`——代码里叫 `Customer`，数据库里叫 `customers`
- **`@map`（一个 @）**：映射**字段名**（列名）。本项目列名一致，用不到

---

## 七、CRUD 完整对照表

| 你想做的事 | 原来的 SQL | Prisma |
|-----------|-----------|--------|
| 查全部 | `SELECT * FROM invoices` | `prisma.invoice.findMany()` |
| 按 id 查一条 | `SELECT * FROM invoices WHERE id='x'` | `prisma.invoice.findUnique({ where: { id } })` |
| 按条件查一条（如最新一条） | `SELECT * FROM invoices ORDER BY date DESC LIMIT 1` | `prisma.invoice.findFirst({ orderBy: { date: 'desc' } })` |
| 条件查询 | `SELECT * FROM invoices WHERE status='paid'` | `prisma.invoice.findMany({ where: { status: 'paid' } })` |
| 排序 | `...ORDER BY date DESC` | `orderBy: { date: 'desc' }` |
| 取前 N 条 | `...LIMIT 5` | `take: 5` |
| 分页 | `...LIMIT 6 OFFSET 6` | `take: 6, skip: 6` |
| 数数 | `SELECT COUNT(*) FROM invoices` | `prisma.invoice.count()` |
| 求和 | `SELECT SUM(amount) ... WHERE status='paid'` | `prisma.invoice.aggregate({ where: {status:'paid'}, _sum: { amount: true } })` |
| 关联查询（JOIN） | `JOIN customers ON...` | `include: { customer: true }` |
| 新增 | `INSERT INTO invoices (...) VALUES (...)` | `prisma.invoice.create({ data: {...} })` |
| 批量新增 | `INSERT INTO invoices (...) VALUES (...),(...)` | `prisma.invoice.createMany({ data: [...] })` |
| 存在则改/不存在则建 | `INSERT ... ON CONFLICT ... DO UPDATE` | `prisma.invoice.upsert({ where, update, create })` |
| 修改 | `UPDATE invoices SET ... WHERE id='x'` | `prisma.invoice.update({ where: { id }, data: {...} })` |
| 批量修改 | `UPDATE invoices SET status='paid' WHERE id IN (...)` | `prisma.invoice.updateMany({ where: { id: { in: ids } }, data: { status } })` |
| 删除 | `DELETE FROM invoices WHERE id='x'` | `prisma.invoice.delete({ where: { id } })` |
| 批量删除 | `DELETE FROM invoices WHERE status='pending'` | `prisma.invoice.deleteMany({ where: { status: 'pending' } })` |

---

## 八、改表结构怎么办

以后要加字段（比如给发票加个"备注"字段），流程是：

1. 改 `prisma/schema.prisma`，给 Invoice model 加一行 `note String?`
2. 跑 `npx prisma db push`——把改动同步到数据库（自动执行 `ALTER TABLE`）
3. 跑 `npx prisma generate`——更新 PrismaClient 的类型

不需要手写 `ALTER TABLE`，Prisma 自动算出差异并执行。

---

## 九、本项目涉及的文件

| 文件 | 作用 |
|------|------|
| `prisma/schema.prisma` | 数据库表结构定义（4 个 model + 关系） |
| `prisma.config.ts` | Prisma 7 配置（datasource URL + seed 命令） |
| `app/lib/prisma.ts` | PrismaClient 单例（用 PrismaPg adapter） |
| `prisma/seed.ts` | seed 脚本（用 Prisma API 灌初始数据） |
| `app/lib/data/invoice.ts` | 发票相关查询（findMany / findUnique） |
| `app/lib/data/customer.ts` | 客户相关查询 |
| `app/lib/data/dashboard.ts` | 仪表盘统计查询（count / aggregate / groupBy） |
| `app/lib/data/index.ts` | 统一导出所有查询函数 |
| `app/lib/actions/invoice.ts` | 发票写操作（create / update / delete） |
| `app/lib/actions/customer.ts` | 客户写操作 |
| `app/lib/actions/auth.ts` | 登录（authenticate） |
| `auth.ts` | getUser 函数（用 `prisma.user.findUnique`） |

---

## 十、速查总结

```
Prisma 是翻译官，你说 JS，它翻译成 SQL。

三个文件：
  schema.prisma  → 数据库地图（有哪些表、表之间什么关系）
  prisma.config  → 数据库地址
  prisma.ts      → 翻译官实例（import 它就能查）

查询套路（永远是这个格式）：
  prisma.表名(小写).方法({
    where:  { ... },     // 条件
    include: { ... },    // 关联
    orderBy: { ... },    // 排序
    take: 数字,          // 限制条数
  })

七个方法：
  findMany  查多条（返回数组）
  findFirst  按条件查一条（最新/最旧一条）
  findUnique  按唯一字段查一条（id/@unique）
  create  新增
  update  修改
  delete  删除
  count  数数
  批量：updateMany（批量改）/ deleteMany（批量删）/ createMany（批量插，不支持嵌套）
  upsert  存在则改，不存在则建
  *OrThrow  findUniqueOrThrow / findFirstOrThrow 等，找不到就抛错
  $transaction  事务（多条要么全成要么全废）
  $queryRaw  原生 SQL（偶尔绕过 Prisma 时用）

聚合查询（统计）：
  count()      数数（COUNT）
  aggregate()  全表统计（SUM/AVG/MAX/MIN）
  groupBy()    分组统计（GROUP BY）
  groupBy 不返回关联数据，要单独再查一次

大小写规则：
  model 定义用大写（Customer）
  查询时用小写（prisma.customer）
  @@map 桥接代码名和数据库表名

关联查询（JOIN）：
  schema 里声明关系（一对多：一用 []，多用 @relation）
  查询时 include: { customer: true }
  结果是嵌套结构：invoice.customer.name
```
