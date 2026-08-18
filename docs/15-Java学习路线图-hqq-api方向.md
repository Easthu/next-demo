# 15 - Java 学习路线图（hqq-api 方向）

> 从 Next.js 全栈过渡到公司 Java 后端 `hqq-api` 的 3-6 个月学习计划。
>
> 本文档是**路线图**：指方向、给里程碑、列知识点清单。具体每个知识点的教学，在学到对应阶段时再单独整理（避免一口吃成胖子）。
>
> 📅 执行计划（精确到每周）见 [17-Java四个月周计划](./17-Java四个月周计划.md)。

---

## 一、目标

| 项 | 内容 |
|---|---|
| **最终目标** | 3-6 个月内能介入 `hqq-api`（公司 Java 后端）开发，从小需求/bug 修复开始 |
| **起点** | Java 零基础；已完成 Next.js 全栈学习（CRUD/Prisma/Zod/Server Action/RBAC/PDF/SSE），前后端概念地图已建立 |
| **时间** | 每天 2-3 小时，窗口 3-6 个月（中期） |
| **公司代码** | 本地 `/Users/huhejie/CODE/hqq-api`，技术栈详见 [16-hqq-api技术栈速查](./16-hqq-api技术栈速查.md) |

---

## 二、核心方法（三原则，比计划本身更重要）

1. **用 hqq-api 真实代码当教材**
   每学一个概念，立刻去公司代码里 `grep` 看真实用法。比如学完 Stream，去搜 `\.stream\(\)`；学完 `@Service`，去看一个真实的 ServiceImpl。**看真东西比看网课快 10 倍。**

2. **翻译式学习（你独有的优势）**
   你已经有一张 Next.js 概念地图。每学一个 Java 概念，**先找它的 Next.js 对应**（见下方对照表）。比如学 `LambdaQueryWrapper` 时想"这就是 Prisma 的 `where` 条件"。这种"翻译"让你学得比纯后端新手快得多。

3. **只学用得到的**
   hqq-api 用 MyBatis-Plus → **不学 JPA/Hibernate**；用自定义 JWT → **不学 Spring Security**；Java 8 红线 → **不学 9+ 新语法**。把精力全压在项目真用到的技术上。

---

## 三、hqq-api 技术栈速览

> 完整版见 [16-hqq-api技术栈速查](./16-hqq-api技术栈速查.md)。这张表先建立印象。

| 维度 | hqq-api 用什么 | 学习影响 |
|---|---|---|
| JDK | **Java 8（红线）** | 禁学 9+ 特性 |
| 框架 | Spring Boot 2.3.4 | 学 Spring Boot 2.x |
| 构建 | Maven 多模块 | 学 Maven |
| ORM | **MyBatis-Plus** | 不学 JPA |
| 数据库 | MySQL + 分库分表 | 学 MySQL，分库分表后期再补 |
| 缓存 | Redis | 学 Redis 基础 |
| MQ | RabbitMQ | 后期补 |
| 鉴权 | **自定义拦截器 + JWT** | 不学 Spring Security |
| 架构 | **单体（非微服务）** | 不学 Spring Cloud 那一套 |

---

## 四、6 阶段学习路径

> 总时长约 3-4 个月（阶段 1-4）+ 1-2 个月缓冲（阶段 5）。

### ✅ 阶段 0：Next.js 闭环（1 周）

- 详见 [14-NextJS闭环练习-个人记账本](./14-NextJS闭环练习-个人记账本.md)
- 目的：把全栈概念变成肌肉记忆，再切 Java
- 完成后才进入阶段 1

---

### 阶段 1：Java 8 地基（3-4 周）

**目标**：能用 Java 写基本程序，理解它的类型系统和异常机制。

**知识点清单**
- [ ] 基本语法（vs TS 的差别：强类型、基本类型 `int/long` vs 包装类 `Integer/Long`）
- [ ] 集合框架（`List` / `Map` / `Set`，对应 JS 的数组/对象/Set）
- [ ] 泛型（`List<String>` 为什么必要）
- [ ] **Stream + Lambda**（对应 JS 的 `map/filter/reduce`，hqq-api 大量用）
- [ ] **异常体系**：受检异常 vs 运行时异常（⚠️ 和 TS 最大差别，hqq-api 的 `BizException` 就是受检的）
- [ ] `Optional`（对应 JS 可选链 `?.`）
- [ ] ⚠️ **不学** Java 9+：`var` / `record` / 文本块 / `Stream.toList()`

**对标 hqq-api**：项目天天用 Stream、到处 `throws BizException`

**毕业标志**：能读懂 hqq-api 里一段 Service 方法，知道每一行在干嘛、为什么 throws。

---

### 阶段 2：Spring Boot + Maven 多模块（2-3 周）

**目标**：理解 Spring 的 IoC/DI 思维和注解驱动开发。**这是最大的思维转折点。**

**知识点清单**
- [ ] **IoC / DI**：为什么要把对象交给 Spring 管理，而不是自己 `new`（这是从"函数式/Server Action 思维"转到"容器托管思维"的关键）
- [ ] 核心注解：`@RestController` `@Service` `@Autowired` `@Configuration` `@Component`
- [ ] Spring MVC：一个请求怎么从 URL 到达方法（`@GetMapping`/`@PostMapping`/`@RequestParam`/`@RequestBody`）
- [ ] Bean 生命周期（简单了解）
- [ ] Maven：`pom.xml`、多模块依赖、`<dependencyManagement>`、父 POM
- [ ] 配置文件 `application.yml`

**对标 hqq-api**：整个项目的骨架——`com-api` ← `com-service` ← `com-common` 三模块依赖

**毕业标志**：能看懂 hqq-api 里一个 Controller 类的注解、依赖注入、请求映射。

---

### 阶段 3：MyBatis-Plus（2 周）

**目标**：会日常 CRUD（这是以后 80% 的工作内容）。

**知识点清单**
- [ ] `BaseMapper` / `IService` / `ServiceImpl`（继承就能 CRUD）
- [ ] **`LambdaQueryWrapper`**（条件构造，**直接对应 Prisma 的 `where`**）
- [ ] `@TableName` / `@TableField`（实体到表的映射，对应 Prisma 的 `@@map`/`@map`）
- [ ] 分页插件
- [ ] 什么时候写 XML（复杂 SQL），什么时候用 Wrapper（简单查询）

**Next.js 对应**
| Prisma | MyBatis-Plus |
|---|---|
| `findMany({where})` | `dao.selectList(new LambdaQueryWrapper<>()...)` |
| `create()` | `service.save()` |
| `update()` | `service.updateById()` |
| `delete()` | `service.removeById()` |

**毕业标志**：能用 MyBatis-Plus 独立写出一个完整 CRUD（对标你在 Next.js 里做过的事）。

---

### 阶段 4：真实链路实战（2-3 周）

**目标**：仿着 hqq-api 真实代码，独立做出一个完整功能。**这是从"会语法"到"会做项目"的跨越。**

**任务**
- [ ] 在 hqq-api 里找一个**简单的 admin 接口**（比如商品分类 CRUD：`AdminProductClassifyController`）
- [ ] 新建一个**独立的 Spring Boot 练习项目**，仿照它的风格重写一遍
- [ ] 完整用上：Controller + Service + Dao + `Result<T>` 返回 + `BizException` + 参数校验 + 鉴权思路
- [ ] 连本地 MySQL，跑通完整链路

**对标 hqq-api**：`AdminProductClassifyController` → `ProductClassifyService` → `ProductClassifyDao` 这条链路

**毕业标志**：独立用 Spring Boot 做出一个带鉴权、带校验、带异常处理的完整 CRUD。

---

### 阶段 5：介入公司代码

- [ ] 从小需求或 **bug 修复**切入（不要一上来做新功能）
- [ ] 找一个老员工带你**过一遍项目结构**（比自己看一周都管用）
- [ ] **通读 hqq-api 的 `AGENTS.md`**（项目工作指南，74KB，是事实单一来源，含业务词典/速查表/代码定位口诀）
- [ ] 提交第一个 PR

---

## 五、Next.js → Java 对照表（翻译式学习的钥匙）

> 每学一个 Java 概念，先回来查这张表找它的 Next.js 亲戚。

| 你在 Next.js 学过的 | hqq-api 里的对应 | 备注 |
|---|---|---|
| Server Action | `@PostMapping` 的 Controller 方法 | 都是"服务端跑的函数" |
| Prisma `findMany({where})` | `LambdaQueryWrapper` + `dao.selectList()` | 条件查询 |
| Prisma `create/update/delete` | `ServiceImpl` 的 `save/updateById/removeById` | 单表 CRUD |
| Prisma 聚合 `_sum/_count` | MyBatis-Plus `aggregate` / 写 XML | 统计 |
| Zod 校验 | `@Validated` + Param 上的 `@NotNull` 等注解 | 入参校验 |
| `data/` `actions/` 分文件 | `controller/service/dao` 分层 | 代码组织 |
| NextAuth session | JWT + `@Login` 注解 + `getUser()` | 鉴权 |
| `error.tsx` 错误边界 | `@ControllerAdvice` 全局异常 + `BizException` | 错误处理 |
| `revalidatePath` 刷新 | （Java 无状态 API，无直接对应） | 心智模型差异 |
| `async` 服务端组件 | Controller 方法（天然在服务端） | Java 没有"组件是客户端还是服务端"的纠结 |
| `pg` Postgres | MySQL | 数据库 |
| 金额存 cents（int） | 同样适用，Java 用 `long` 存分 | 跨语言通用约定 |
| react-hook-form / shadcn | （前端，Java 不管） | 全栈分离后前端另算 |

---

## 六、关键红线与坑（来自 hqq-api 约定）

学的时候随时回来对照，别踩：

1. **Java 8 红线** —— 公司禁用 9+ 特性。写代码前确认特性是否 Java 8 支持（`var`/`record`/文本块都不能用）。
2. **`BizException` 是受检异常** —— Controller 方法签名必须 `throws BizException`，不能吞。这和 TS/Next.js 里随手 `try/catch` 的习惯完全不同。
3. **`Result<T>` 字段不能删** —— 冗余字段是历史对外接口契约，删了会让前端/外部调用方故障。
4. **Dao 命名不是 Mapper** —— hqq-api 的数据访问接口叫 `*Dao`（如 `ProductClassifyDao`），不叫 `*Mapper`，别被外部教程带偏。
5. （学到新阶段时在这里继续补充踩到的坑）

---

## 七、怎么用 AI 辅助

- **每学一个概念** → 让 AI 在 hqq-api 里找 2-3 个真实使用例子，对着真代码学
- **读不懂某段公司代码** → 贴给 AI，让它逐行讲解（"这段 ServiceImpl 在干嘛"）
- **AGENTS.md 读到不懂的业务词** → 问 AI（"权益核销是什么意思"）
- **想确认学习重点** → 问 AI"hqq-api 用到 X 吗？用到什么程度？要不要深学"

---

## 八、毕业标准（能介入公司代码的标志）

全部满足，就可以开始接公司需求了：

- [ ] 能独立用 Spring Boot + MyBatis-Plus 做出带鉴权、校验、异常处理的完整 CRUD
- [ ] 能读懂 hqq-api 里**一个完整业务模块**的代码（Controller → Service → Dao → XML）
- [ ] 能根据一个需求，**定位到**该改哪个 Controller / Service / Dao
- [ ] 通读过 hqq-api 的 `AGENTS.md`，知道业务词典和代码定位口诀
- [ ] 能在本地把 hqq-api 跑起来（连上内网/Nacos）

---

## 九、阶段进度追踪

| 阶段 | 内容 | 状态 | 完成日期 |
|---|---|---|---|
| 0 | Next.js 闭环（记账本） | 🔄 进行中 | |
| 1 | Java 8 地基 | ⬜ 未开始 | |
| 2 | Spring Boot + Maven 多模块 | ⬜ | |
| 3 | MyBatis-Plus | ⬜ | |
| 4 | 真实链路实战 | ⬜ | |
| 5 | 介入公司代码 | ⬜ | |

> 每完成一阶段回来更新这张表。看着状态从 ⬜ 变 ✅，是最实在的正反馈。
