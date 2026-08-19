# 17 - Java 四个月周计划

> 本文档是**日程表**：精确到每周学什么、产出什么、去 hqq-api 里 grep 什么。
> 与 [15-Java学习路线图](./15-Java学习路线图-hqq-api方向.md) 的关系：15 号讲"为什么学、学什么"（路线图），本篇讲"什么时候学"（执行计划）。三原则（真实代码当教材 / 翻译式学习 / 只学用得到的）继续生效。
>
> 本篇的"前端对照"是**双轨**的：以 **Vue / JS 日常视角**为主（axios、Element Plus、Vite、Vue Router），并在关键处补 **Next.js 视角**（组员先学 Next 建立后端思维，可直接映射）。两个类比都出现时，哪个熟看哪个。

---

## 一、总体安排

- **周期**：17 周（约 4 个月）。周序号是**相对进度**：从你启动的那一周记为 W1，各组员按自己的节奏走，互不对表
- **时间预算**：工作日每天 1.5～2h + 周末一个半天 3～4h ≈ **每周 11～14 小时**，总计约 200h
- **阶段划分**：

| 周次 | 阶段 | 主题 |
|---|---|---|
| W1 | 0 收尾 + 1 起步 | 阶段 0 收尾 + 环境搭建 |
| W2 | 阶段 1 | 基础语法与类型系统 |
| W3 | 阶段 1 | OOP 上：继承与多态 |
| W4 | 阶段 1 | OOP 下 + 集合 + 泛型 |
| W5 | 阶段 1 | 异常 + Stream + 常用 API 🏁里程碑1 |
| W6 | 阶段 2 | Maven + Spring Boot 起步 |
| W7 | 阶段 2 | Spring MVC 写 REST API |
| W8 | 阶段 2 | 校验 + 全局异常 + 日志 🏁里程碑2 |
| W9 | 阶段 3 | MyBatis-Plus 上：CRUD 落库 |
| W10 | 阶段 3 | MyBatis-Plus 下：条件/分页/XML 🏁里程碑3 |
| W11 | 阶段 4 | JWT 鉴权全链路 |
| W12 | 阶段 4 | 事务 + AOP + 权限注解 |
| W13 | 阶段 4 | 仿 hqq-api 综合实战 🏁里程碑4 |
| W14 | 阶段 5 | hqq-api 精读一：跑起来 + 读链路 |
| W15 | 阶段 5 | hqq-api 精读二：鉴权/配置/规范 |
| W16 | 阶段 5 | 第一个真实任务（小需求/bug） |
| W17 | 收尾 | 独立需求 + 总复盘 |

---

## 二、每周详细计划

### W1：收尾阶段 0 + Java 起步

**🎯 目标**：Java 环境就绪、写出第一行代码（如有未收尾的前置练习，前半周先收尾）。

- [ ] 前半周：收尾阶段 0——如有未完成的练习项，修完并闭环验收；已完成的人直接进入后半周，把时间全投入环境搭建
- [ ] 安装 **JDK 8**（⚠️ 对齐公司红线，不装 17/21）+ IntelliJ IDEA（社区版即可）
- [ ] 理解编译模型：`javac` 编译成 `.class` → `java` 运行（对比 Node 直接解释执行 `.js`）
- [ ] Hello World + 用 IDEA 创建第一个项目、认识项目结构
- [ ] `main` 方法签名为什么长那样（`public static void main(String[] args)`）

**🔗 前端对照**：`.class` 文件 ≈ 构建产物（`dist/`）；JDK ≈ Node 运行时；IDEA ≈ VS Code（但重得多）。

**🏁 产出**：阶段 0 闭环 + 一个能跑的 Hello World。

---

### W2：基础语法与类型系统

**🎯 目标**：适应"一切都要声明类型"的强类型世界，避开第一批经典坑。

- [ ] 8 大基本类型（`int/long/double/boolean/char`...）vs 包装类（`Integer/Long`），自动装箱拆箱
- [ ] ⚠️ `Integer` 缓存坑：`==` 比较包装类不可靠，必须 `equals`（类似 JS `==` vs `===` 的坑换了形态）
- [ ] `String` 不可变性、`StringBuilder`、常用方法（`split/substring/trim/equals`）
- [ ] 数组 `int[]` 与字符串格式化 `String.format`
- [ ] 流程控制（`if/switch/for/while`）——和 JS 几乎一致，快速过
- [ ] `final` 关键字（≈ `const`）
- [ ] 类型转换：隐式 widening / 显式强转 `(int) x`

**🔗 前端对照**：JS 里 `let a = 1; a = 'x'` 完全合法，Java 里变量类型出生即定死、不能换——这是和 JS 最大的心智差异。学过 TS 的：Java 的类型标注长得像 TS，但**运行时真实存在**（TS 编译完就擦了），所以有反射这类能力。

**🔍 hqq-api grep 任务**：`grep -r "Integer" --include="*.java" | head`，看实体字段用的是 `int` 还是 `Integer`，想想为什么（null 语义）。

**🏁 产出**：一个练习文件，覆盖当天学的每个语法点各一个小例子。

---

### W3：OOP 上——继承与多态

**🎯 目标**：理解 Java 是"一切皆对象"，掌握类之间的纵向关系。

- [ ] 类 / 属性 / 方法、构造器（重载）、`this`
- [ ] 封装：`private` + getter/setter（对比 JS class 的 `#` 私有字段）
- [ ] 包 `package` / `import`（对比 ES Module import / Vite 的 `@` 别名）
- [ ] `static`：类变量、类方法（属于类不属于实例）
- [ ] 继承 `extends`、`super`、方法重写 `@Override`、重载 Overload
- [ ] **多态**：父类引用指向子类对象，运行时决定调谁的方法（⚠️ JS 没有真多态，重点理解）
- [ ] `Object` 三件套：`toString()` / `equals()` / `hashCode()`

**🔗 前端对照**：JS 也有 class 语法（`constructor/extends/super` 长得几乎一样，Vue 项目里少见但看得懂），真正的新东西是 Java 的**重载**（同名不同参共存）和**真多态**。

**🏁 产出**：用"用户/管理员继承自人员"写一个小继承体系，多态调用演示。

---

### W4：OOP 下 + 集合 + 泛型

**🎯 目标**：掌握接口思维（Spring 的地基）和数据容器（业务代码天天用）。

- [ ] 抽象类 `abstract` vs 接口 `interface`，怎么选
- [ ] 接口的 `default` 方法（Java 8 特性，hqq-api 会遇到）
- [ ] **面向接口编程**：变量声明用接口类型（`List<String> list = new ArrayList<>()`）——为什么 Spring 处处是接口
- [ ] 内部类 / 匿名内部类（→ 下周 Lambda 的前身）
- [ ] 枚举 `enum`（状态机、错误码定义）
- [ ] 集合三件套：`List/ArrayList`、`Map/HashMap`、`Set/HashSet`；遍历方式（for / forEach / 迭代器）
- [ ] 泛型 `<T>`：`List<String>` = 只准装 String 的集合（JS 数组啥都能混装，Java 必须先声明装什么；学过 TS 的话泛型语法同款）；泛型运行时擦除（知道即可）
- [ ] 排序：`Comparable` / `Comparator`；工具类 `Collections` / `Arrays`

**🔗 前端对照**：`Map` ≈ JS 的 `Map`/对象；`List` ≈ 数组（但必须声明元素类型）；Java 泛型编译后擦除（运行时拿不到 `T`，知道即可）。

**🏁 产出**：用 `Map<Integer, List<String>>` 做一个"按分类分组商品"的内存小练习（为下周 Stream 做铺垫）。

---

### W5：异常 + Stream + 常用 API 🏁 里程碑1

**🎯 目标**：拿下和 JS 差异最大的两块——受检异常与 Stream，然后第一次综合实战。

- [ ] `try/catch/finally`、`throw`、`throws`
- [ ] ⚠️ **受检异常 vs 运行时异常**（`Exception` vs `RuntimeException`）：编译器强制你处理或声明——JS 完全没有的机制，hqq-api 的 `BizException` 就是受检的
- [ ] 自定义异常：写一个 `BizException extends Exception`（模拟公司用法）
- [ ] 函数式接口、**Lambda**、方法引用 `User::getName`
- [ ] **Stream API**：`filter/map/sorted/limit/collect/forEach/reduce`（和 JS 数组方法几乎一一对应，`collect` ≈ 你写过的 reduce 收集）
- [ ] ⚠️ Java 8 红线：没有 `Stream.toList()`，必须 `collect(Collectors.toList())`
- [ ] `Optional`（≈ `?.` + 空值显式化）
- [ ] `BigDecimal` 金额计算（⚠️ 配合 long 存分约定，浮点坑在 Java 同样存在）
- [ ] `LocalDate/LocalDateTime`（≈ dayjs）

**🏁 里程碑1：控制台版记账本（纯 Java）**

用集合 + Stream + 自定义异常实现一个控制台记账本：录入 / 列表 / 分类筛选 / 按月统计。不连数据库，数据放内存。

**验收**：能用 Stream 一条链完成"筛某分类 → 按金额排序 → 汇总"；金额运算全用分（int）或 `BigDecimal`；越界操作抛自己的 `BizException` 并被捕获打印友好信息。

---

### W6：Maven + Spring Boot 起步

**🎯 目标**：搞定构建工具，理解 IoC/DI——从"函数式思维"切换到"容器托管思维"（最大的思维转折点）。

- [ ] Maven：安装、`pom.xml` ≈ `package.json`（坐标 `groupId/artifactId/version` ≈ 包名+版本）
- [ ] 依赖传递、`scope`（compile/test）、生命周期 `compile/test/package`，`mvn` 命令 vs `npm/pnpm` 命令对照
- [ ] **多模块**：父 POM、`<dependencyManagement>`——hqq-api 就是 `com-api ← com-service ← com-common` 三模块
- [ ] Spring Boot 2.3.x：Spring Initializr 建项目、起步依赖、启动类 `@SpringBootApplication`
- [ ] `application.yml` 配置、dev/prod profile（≈ `.env.development/.env.production`）
- [ ] **IoC/DI 为什么**：平时前端每个组件自己 import 依赖；Spring 里对象不自己 `new`，统一交给容器创建和管理，需要时注入——把"层层传递"换成"框架统一发放"
- [ ] `@Component/@Service/@Autowired`，构造器注入 vs 字段注入

**🔗 前端对照**：Maven 中央仓库 ≈ npm registry；DI ≈ Vue 的 **provide/inject**——容器全局 provide，用到的地方 `@Autowired` inject，不用自己 `new`、不用层层传（学过 React Context 的话，就是它的全局版）。

**🔍 hqq-api grep 任务**：搜 `@Autowired` 和 `@Service`，看公司用字段注入还是构造器注入，照着公司的风格来。

**🏁 产出**：一个能启动的 Spring Boot 项目 + 一个被注入的 Service，写一段自己的话解释 IoC（讲不清 = 没懂）。

---

### W7：Spring MVC 写 REST API

**🎯 目标**：会写 Controller，前后端联调跑通。（如逢长假撞进本周，进度打折属正常，见弹性规则）

- [ ] `@RestController` + `@GetMapping/@PostMapping/@PutMapping/@DeleteMapping`
- [ ] 参数三兄弟：`@RequestParam`（query）、`@PathVariable`（动态路由段）、`@RequestBody`（JSON → 对象）
- [ ] DTO / VO / Entity 分层概念：DTO = 接收前端参数的壳、VO = 返回给前端的结构、Entity = 数据库表对应——同一份数据三种身份（学过 Next 的：DTO ≈ 请求体的 zod schema，Entity ≈ prisma model）
- [ ] 统一响应体 `Result<T>`（泛型实战；就是你前端拦截器里判 `code` 的那个 `{ code, message, data }`，这次轮到你从服务端发它）
- [ ] Apifox / Postman 联调（后端自测的日常工具）
- [ ] RESTful URL 设计（就是你平时 axios 调的那些 GET/POST/PUT/DELETE 接口的命名规则，这次站在提供方）

**🔗 前端对照**：Controller ≈ 你 `axios.get('/list')` 在服务端的落点（学过 Next 的：≈ Route Handler `route.ts`）；`@RequestBody` ≈ 请求体 JSON 自动变对象（还带类型）；`@RequestParam` ≈ URL 问号后面的参数。

**🏁 产出**：记账本 REST API 雏形——先内存 Map 存数据，跑通 Apifox 调 GET/POST/PUT/DELETE。

---

### W8：校验 + 全局异常 + 日志 🏁 里程碑2

**🎯 目标**：补齐企业级"标配三件套"，API 从"能跑"到"规范"。

- [ ] Bean Validation：`@NotNull/@NotBlank/@Size/@Min/@Pattern` + `@Validated` 触发（≈ el-form 的 rules：required/max/pattern；学过 Zod 的话就是 Zod 的注解版——写在服务端 DTO 字段上，前端校验能被绕过，这里才是最后防线）
- [ ] `@RestControllerAdvice` + `@ExceptionHandler` **全局异常**（≈ 服务端版的 axios 响应拦截器 + Vue 的 `app.config.errorHandler`：错误在一个地方统一接住、转成友好响应；学过 Next 的：≈ `error.tsx` 边界）
- [ ] 校验失败 → 拦下来转成 `Result` 里的友好 message（类似 el-form 校验不通过时拼"手机号格式不对"给用户看）
- [ ] 自定义业务异常体系：`BizException` + 错误码枚举
- [ ] 日志：slf4j `log.info/warn/error` + `logback` 配置，替代 `console.log` 的地位

**🏁 里程碑2：记账本 REST API（Spring Boot 完整版）**

**验收**：全部 CRUD 走统一 `Result<T>`；入参校验非法时返回 400 语义的字段级错误；业务异常被全局处理器接住而不是 500 白板；关键链路有日志。Apifox 全接口通过。

---

### W9：MyBatis-Plus 上——CRUD 落库

**🎯 目标**：把内存 API 换成真 MySQL，掌握 MP 的基础三板斧。

- [ ] 整合：`mybatis-plus-boot-starter` + 数据源配置（本地装 MySQL，建库建表写 SQL）
- [ ] 实体注解：`@TableName/@TableId/@TableField`（声明 `UserEntity ↔ user 表`、`userId ↔ user_id 列` 的对应关系）
- [ ] `BaseMapper` 内置 CRUD；`IService` / `ServiceImpl` 继承即得 `save/updateById/removeById/getById/list`
- [ ] 逻辑删除 `@TableLogic`、自动填充 `create_time/update_time`
- [ ] ⚠️ 命名红线：hqq-api 数据访问层叫 **`*Dao`** 不叫 `*Mapper`，练习项目就跟公司叫法

**🔗 SQL 对照**（背下来——它替你生成的就是这些 SQL）：

| SQL | MyBatis-Plus |
|---|---|
| `SELECT * FROM t WHERE id = 1` | `service.getById(1)` |
| `SELECT * FROM t` | `service.list()` / `dao.selectList()` |
| `INSERT INTO t ...` | `service.save(entity)` |
| `UPDATE t SET ... WHERE id = 1` | `service.updateById(entity)` |
| `DELETE FROM t WHERE id = 1`（逻辑删除实为 UPDATE） | `service.removeById(1)` |

> 学过 Prisma 的对应：`save/updateById/removeById` ≈ `create/update/delete`，`list()` ≈ `findMany()`，`selectList(Wrapper)` ≈ `findMany({ where })`。

**🏁 产出**：里程碑2 的记账本全部接口落库，重启不丢数据。

---

### W10：MyBatis-Plus 下——条件/分页/XML 🏁 里程碑3

**🎯 目标**：会条件查询和分页——这是以后 80% 的日常工作的形态。

- [ ] **`LambdaQueryWrapper`**：`eq/like/in/between/orderByDesc`（用 Java 方法写 WHERE 条件：`eq(User::getId, 1)` 就是 `WHERE id = 1`——不拼 SQL 字符串，字段名写错编译期就报错；学过 Prisma 的：≈ `where` 条件对象）
- [ ] 分页插件 `Page<T>`：current/size（就是你平时传的 `pageNum/pageSize`；学过 Prisma 的：≈ skip/take）+ 返回 total（列表接口的总条数）——这次站在生产端
- [ ] 聚合（sum/count）在 MP 里的局限 → **什么时候放弃 Wrapper 写 XML**
- [ ] XML 手写 SQL：`resultMap` 映射、动态 SQL `<if>/<where>/<foreach>`
- [ ] `@Transactional` 先会用（下周深究原理和坑）

**🏁 里程碑3：记账本落 MySQL 完整版**

**验收**：分页列表（页码+条数+total）、多条件筛选（日期范围 + 分类 + 关键词 like）、按月统计聚合（练一条手写 XML）。这已经是一个"公司味"的后端了。

---

### W11：JWT 鉴权全链路

**🎯 目标**：手写一遍登录鉴权——把"存 token、请求带头、401 跳登录"这套天天在用的流程，服务端部分亲手实现一遍（学过 NextAuth 的：框架帮你藏起来的部分这次全部手动做）。

- [ ] 复习会话 vs Token（天天在用的就是 Token 方案：localStorage + Authorization 头）
- [ ] jjwt 库：签发 / 解析 / 过期校验（平时存的那个 token，这里学它怎么被造出来、怎么验真伪；学过 NextAuth 的：≈ 它 JWT callback 的手动版）
- [ ] 登录接口：查用户 → 比对密码（BCrypt 或 MD5+盐，练手简化））→ 签发 token
- [ ] **拦截器 `HandlerInterceptor` + `preHandle`**（≈ 服务端版的 axios 请求拦截器：每个请求先过这道关卡；学过 Next 的：≈ `middleware.ts`）
- [ ] **`ThreadLocal` 存当前用户**（一次请求一个线程、各存各的互不串号；之后 Controller 里随处可取当前登录人，不用每层传参；学过 Next 的：≈ 请求里随取随用的 `auth()`）
- [ ] 白名单放行（登录/注册），其余校验 token 并注入用户

**🏁 产出**：记账本加登录——未带 token 访问被拦截返回 401 语义，登录后 Controller 里能直接 `getCurrentUser()`。

---

### W12：事务 + AOP + 权限注解

**🎯 目标**：理解企业代码里"看不见的逻辑"是怎么织进去的。

- [ ] `@Transactional`：什么算一个事务、回滚规则（⚠️ 默认只回滚 `RuntimeException`，受检异常默认不回滚——大坑）
- [ ] 事务失效场景：同类内部方法调用、try-catch 吞了异常（异常被空 catch 吃掉，事务毫无感知——类似前端 Promise 异常被吞、上层拿不到任何信号）
- [ ] **AOP**：切点 / 通知 / `@Around`（≈ Vue Router 的全局前置守卫 `router.beforeEach`：不侵入业务代码、在"外面"统一拦截；AOP 能给任意方法加前置/后置/环绕）
- [ ] 实战：写一个请求日志切面（入参/出参/耗时）
- [ ] 实战：自定义 `@RequireAdmin` 注解 + 切面校验角色（对标前端的 `v-if` 按钮权限 / 路由权限——前端权限只是"藏起来"、能被绕过，后端切面才是真拦截）
- [ ] `@Async` 异步 + 线程池概念（会用即可）

**🏁 产出**：记账本管理员接口挂上 `@RequireAdmin`，普通用户访问被切面拦下；转账类练习接口验证事务回滚。

---

### W13：仿 hqq-api 综合实战 🏁 里程碑4

**🎯 目标**：从"会知识点"到"会做项目"的跨越——对着公司真实代码，独立仿写一个完整功能。

- [ ] 在 hqq-api 里精读 `AdminProductClassifyController` → `ProductClassifyService` → `ProductClassifyDao` 整条链路
- [ ] 在自己的练习项目里，**仿照它的风格**重写一遍商品分类管理（不是抄，是仿：同样的分层、同样的注解用法、同样的返回结构）
- [ ] 完整用上：Controller + Service + Dao + `Result<T>` + `BizException` + 参数校验 + JWT 鉴权 + 分页
- [ ] 写复盘：我写的和公司的差异在哪、为什么公司那么写

**🏁 里程碑4 验收**（= 15 号文档"阶段 4 毕业标志"）：独立做出带鉴权、带校验、带异常处理的完整 CRUD；能讲出每个分层为什么存在。

---

### W14：hqq-api 精读一——跑起来 + 读链路

**🎯 目标**：让公司项目在自己机器上跑起来，建立全局地图。

- [ ] 本地跑起来：向同事要环境说明（内网 / Nacos / MySQL 连接 / 需要的启动参数），**卡住直接问，别自己耗**
- [ ] 三模块依赖图亲手画一遍（`com-api ← com-service ← com-common`），每个模块放什么
- [ ] 通读 hqq-api 的 **`AGENTS.md`**（74KB，事实单一来源：业务词典 / 速查表 / 代码定位口诀），业务词不懂就问 AI（"权益核销是什么"）
- [ ] 挑一个业务模块，从 URL 一路读到 SQL，写一篇链路笔记
- [ ] grep 公司真实的 `BizException`、`Result` 长什么样，和自己 W8 写的对比

**🏁 产出**：本地起服务 + 一篇"某接口完整链路"笔记 + 模块依赖图。

---

### W15：hqq-api 精读二——鉴权/配置/规范

**🎯 目标**：拆解公司特色实现，对齐代码规范。

- [ ] 拆解自定义鉴权：`@Login` 注解 + `getUser()` 机制（对比自己 W11 手写的拦截器，看公司方案聪明在哪）
- [ ] `Result<T>` 历史契约：⚠️ 冗余字段是历史对外接口契约，**不能删**（删了前端/外部调用方故障）
- [ ] 配置体系：profile 切换、Nacos 配置拉取（认脸即可）
- [ ] Redis 在项目里的使用场景扫一遍（先认脸，实战留到后续）
- [ ] **阿里巴巴 Java 开发手册**精要篇：命名 / 注释 / 集合初始化 / 并发注意项
- [ ] 看一个复杂的 XML SQL（连表 + 动态条件），练习"从 SQL 反推业务"

**🏁 产出**：鉴权机制拆解笔记 + 一份"公司代码规范 checklist"（以后自己写代码前过一遍）。

---

### W16：第一个真实任务

**🎯 目标**：真正介入——从小需求或 bug 修复开始，走完整协作流程。

- [ ] 主动向Leader 要一个小需求或 bug（明说自己在学 Java，要最小的）
- [ ] 走完流程：理解需求 → 定位该改的 Controller/Service/Dao → 改 → 自测 → 提 PR
- [ ] 对齐团队 Git 规范（分支命名 / commit 格式 / 合并流程）
- [ ] 补漏（时间富余才做）：`@Scheduled` 定时任务、Swagger/knife4j 看接口文档、Linux 基础（`tail -f` 看日志）、`mvn package` + `java -jar` 部署常识

**🏁 产出**：第一个被合并的 PR（哪怕只是改一行）。

---

### W17：独立需求 + 总复盘

**🎯 目标**：脱离"模仿"，独立交付一个中等小需求，并整理 4 个月所得。

- [ ] 独立完成一个中等需求：从建表 / 加字段 → 实体 → 接口 → 自测全程自己做
- [ ] 总复盘：把每周的"前端对照"汇总成一张 **Java ↔ JS/Vue/Next ↔ Spring 概念映射总表**（放 15 号文档或单独一篇）
- [ ] 更新 15 号文档的阶段进度追踪表（⬜ → ✅）
- [ ] 制定后续 2 个月方向：并发深入 / JVM 入门 / Redis 实战 / RabbitMQ / 分库分表（按公司项目用到什么排优先级）

**🏁 产出**：一个独立交付的需求 + 概念映射总表 + 下阶段计划。

---

## 三、四个里程碑验收标准汇总

| 里程碑 | 周次 | 验收问题（能自信回答"是"才过关） |
|---|---|---|
| 1 控制台记账本 | W5 | 能用 Stream 链式完成筛选+排序+汇总？会抛/接自定义异常？ |
| 2 REST API 完整版 | W8 | 任意接口：统一返回 + 校验拦截 + 全局异常 + 日志，Apifox 全通？ |
| 3 落库完整版 | W10 | 分页 + 多条件 + 聚合统计都从 MySQL 来？重启不丢数据？ |
| 4 仿写公司链路 | W13 | 独立写出带鉴权/校验/事务的完整 CRUD，且能讲清每层为什么？ |

---

## 四、弹性规则（计划赶不上变化时）

1. **单周没学完** → 用下周前 2 天补齐，不顺延整周（防止滚雪球）
2. **累计落后超过 1 周** → 砍 W16 的"补漏"内容保主线；W13（综合实战）和 W14（精读）**不可砍**
3. **长假撞进某周（国庆/春节等）**：假期整块时间适合冲刺实操类内容；若休息，整体顺延 1 周即可（4 个月变 4.5 个月，仍在 3-6 个月窗口内）
4. **公司提前派 Java 任务** → 直接跳 W14 精读 + 找人带，边做边回补对应周
5. **某知识点卡超过 2 天** → 触发你的老规则：卡住反问，别死磕

---

## 五、每周固定动作（形成节奏）

- **每个知识点学完** → 去 hqq-api grep 一个真实用例对着看（15 号三原则之一）
- **每周末** → 花 15 分钟更新本文件的 checkbox + 写 3 行周记（学了啥 / 卡在哪 / 下周注意什么）
- **遇到新坑** → 记到 15 号文档第六节"关键红线与坑"列表里，攒自己的避坑清单

---

## 六、周进度追踪

| 周 | 主题 | 状态 |
|---|---|---|
| W1 | 阶段 0 收尾 + 环境 | ⬜ |
| W2 | 基础语法 | ⬜ |
| W3 | OOP 上 | ⬜ |
| W4 | OOP 下 + 集合 | ⬜ |
| W5 | 异常 + Stream 🏁1 | ⬜ |
| W6 | Maven + Spring Boot | ⬜ |
| W7 | Spring MVC | ⬜ |
| W8 | 校验/异常/日志 🏁2 | ⬜ |
| W9 | MP 上：CRUD | ⬜ |
| W10 | MP 下：条件/分页 🏁3 | ⬜ |
| W11 | JWT 鉴权 | ⬜ |
| W12 | 事务 + AOP | ⬜ |
| W13 | 综合实战 🏁4 | ⬜ |
| W14 | 精读一 | ⬜ |
| W15 | 精读二 | ⬜ |
| W16 | 第一个真实任务 | ⬜ |
| W17 | 独立需求 + 复盘 | ⬜ |

> 状态：⬜ 未开始 / 🔄 进行中 / ✅ 完成。每周末更新。
