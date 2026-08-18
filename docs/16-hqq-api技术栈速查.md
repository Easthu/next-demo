# 16 - hqq-api 项目技术栈速查

> 公司 Java 后端项目 `hqq-api`（"和圈圈"）的技术参考手册。学习全程可查"公司代码用什么、怎么组织、学 Java 时重点学什么"。
>
> 本文档基于代码调研，仅记录**技术架构层面**信息，用于自学参考。项目本地路径：`/Users/huhejie/CODE/hqq-api`。

---

## 一、一句话画像

运营商权益营销**后台服务**。**单体应用**（不是微服务），Java 8 + Spring Boot 2.3.4 + MyBatis-Plus + MySQL（分库分表）。规模大：842 个 Controller、1001 个 Service、427 个 Dao、约 1.1 万个 Java 文件。业务偏重：权益发放核销、多省运营商办理、多渠道支付。

---

## 二、技术栈总表

| 维度 | 实际值 | 学习影响 |
|---|---|---|
| **JDK** | **Java 8**（红线，禁 9+ 特性） | ⚠️ 别学 var/record/文本块 |
| **框架** | Spring Boot 2.3.4.RELEASE | 学 2.x |
| **构建** | Maven 多模块 | 学 Maven |
| **ORM** | **MyBatis-Plus 3.5.3.1** | 不学 JPA |
| **数据库** | MySQL（Druid 连接池） | 学 MySQL |
| **分库分表** | ShardingSphere 4.1.1 + dynamic-datasource（`@DS` 切换） | 后期再补，前期不碰 |
| **缓存** | Redis（Redisson 3.15.6）+ Caffeine | 学 Redis 基础 |
| **消息队列** | RabbitMQ | 后期补 |
| **检索** | Elasticsearch 7.17 | 按需 |
| **任务调度** | XXL-Job + Quartz | 写定时任务时学 |
| **鉴权** | **自定义拦截器 + JWT（auth0 java-jwt）**，无 Spring Security | 不学 Spring Security |
| **日志** | Log4j2 | 了解 |
| **对象映射** | MapStruct + Lombok | 必学 |
| **API 文档** | Swagger2（`/doc.html`） | 用得到 |
| **配置中心** | Nacos（仅 config） | 了解 |
| **架构** | **单体**，无 Spring Cloud/网关/Feign | 不学微服务那一套 |
| **部署** | 阿里云 ACK（K8s） | 运维，暂不用管 |

---

## 三、项目架构

### 单体，不是微服务
只有 Nacos 做配置中心，**没有**注册中心、网关、Feign、Ribbon。最终只产出一个可执行 jar：`com-api-new.jar`。

### 多模块依赖链

```
com-common   （基础设施：框架/工具/DTO/VO/Redis/MyBatis 增强/支付封装）
    ↑ 被依赖
com-service  （业务实现：Service / *Dao / pojo / 各省办理逻辑）
    ↑ 被依赖
com-api      （启动 + Web 层：842 个 Controller / Application / 配置）  ← 唯一打包产出
```

- `com-common`、`com-service` 不单独打包（`spring-boot-maven-plugin` `<skip>true</skip>`）
- `com-api` 几乎只有 Controller，业务全下沉到 `com-service`

### 分层 + 业务域切分

- **横向分层**：`controller` → `service`(接口) / `impl`(实现) → `dao`(*Dao 接口 + XML) → MySQL
- **入参/出参**：入参 `pojo/param/`，出参 `pojo/vo/`，实体 `pojo/domain/`，枚举 `pojo/em/`
- **纵向切分**：按业务域 + 按省份。如 `service/beijing/`、`handle/chongqing/`——全国 20+ 省份运营商办理逻辑各自独立分包，用**策略模式**路由

---

## 四、代码风格（典型 CRUD 链路）

以"商品分类"为例，三层长这样（精简片段，建立体感用）：

**Controller 层**（注解多、返回 `Result<T>`）：
```java
@Api(tags = {"admin", "商品分类服务"})
@Validated @Login @JsonRequestBody
@RestController
@RequestMapping("/admin/product-classify/")
public class AdminProductClassifyController extends AbstractController {
    @Autowired private ProductClassifyService productClassifyService;

    @ApiOperation("分页获取")
    @PostMapping("page")
    public Result<Pager<ProductClassifyVO>> page(ProductClassifyPageParam param) throws BizException {
        return success(productClassifyService.page(param));   // 统一返回 Result
    }
}
```

**Service 实现层**（继承 MyBatis-Plus `ServiceImpl`，单表查询用 Wrapper）：
```java
@Service
public class ProductClassifyServiceImpl extends ServiceImpl<ProductClassifyDao, ProductClassify>
        implements ProductClassifyService {

    @Override
    public List<ProductClassify> listByClassifyId(Long classifyId) throws BizException {
        LambdaQueryWrapper<ProductClassify> query = new LambdaQueryWrapper<>();
        query.eq(ProductClassify::getClassifyId, classifyId);   // ← 对应 Prisma 的 where 条件
        return productClassifyDao.selectList(query);
    }
}
```

**风格特征**：
- 注解偏多（Swagger `@Api/@ApiOperation` + Spring + MyBatis-Plus + 自定义 `@Login/@JsonRequestBody`）
- 返回值统一 `Result<T>`
- 参数校验 `@Validated` / `@NotNull`
- 异常用**受检** `BizException` 向上抛
- 单表查询用 `LambdaQueryWrapper`，复杂 SQL 才写 XML

---

## 五、返回值与异常约定（⚠️ 重要）

### `Result<T>`（统一返回）
字段含 `status / code / errorCode / errorMsg / data / success` 等。**字段冗余是为了兼容历史对外接口，不能删**。常用 `Result.success(data)` / `Result.error(ResultCode.XXX)`。

### `BizException`（业务异常）
是**受检异常**（extends Exception，不是 RuntimeException）。所以 Controller 方法签名**必须** `throws BizException`，不能吞。错误码集中在 `ResultCode` 枚举。

---

## 六、鉴权方式

**完全自定义，基于拦截器 + JWT**，不用 Spring Security / Sa-Token。

- **登录**：`LoginService` 校验账号密码 → 签发 JWT（`JwtService`）→ token 存 Redis
- **请求校验**：`AuthInterceptor` 拦截器链，按顺序校验：登录 → 签名 → 安全密码 → 设备指纹 → IP 风控
- **Token 位置**：HTTP Header（`token` 头，回退到 `authorization` 或 `token` 参数）
- **是否需登录由注解决定**：
  - `@Login(force=true/false)` → 需要登录（admin 接口必加）
  - `@IgnoreLogin` → 匿名放行（支付回调类）
  - 都没有 → 匿名可访问
- **取当前用户**：登录后拦截器把 `SessionUser` 塞进 request，Controller 用 `getUser()` 或静态 `Context.getUser()` 取

---

## 七、项目规模

| 指标 | 数量 |
|---|---|
| Java 文件总数 | ~11,861 |
| Controller | 842（38 个业务域子包） |
| Service 实现 | ~1,001（88 个业务域子包） |
| Dao 接口（`*Dao`） | 427 |
| Mapper XML | 370 |
| 实体 domain | ~443 |
| VO | 1,093 |
| 入参 Param | 2,715 |

**业务复杂度：重业务逻辑，远超简单 CRUD。** 核心三条主线：权益发放→核销、多省运营商办理、多渠道聚合支付与退款。简单 admin 表维护是少数，大量代码是和外部系统对接。

---

## 八、零基础学习切入建议

### 必须先掌握（阶段 1-3，入门 2 个月）
1. **Java 8 基础**：集合、Stream、异常（尤其受检异常）
2. **Spring Boot 2.x + Spring MVC**：IoC/DI、核心注解、请求映射
3. **Maven 多模块**：理解 parent POM、模块依赖
4. **MyBatis-Plus**：`ServiceImpl` / `LambdaQueryWrapper` / `@TableName`（日常 CRUD 核心）

### 重点掌握（阶段 4，介入开发必需）
5. **HTTP 三层链路 + 项目封装**：Controller(`@Login`/`Result<T>`) → Service(`ServiceImpl`/`BizException`) → Dao
6. **Lombok + MapStruct**：实体 `@Data`、对象转换
7. **Redis + Redisson**：通用缓存操作、分布式锁
8. **JWT 鉴权**：读懂 `AuthInterceptor`，理解 `@Login` 注解和 `getUser()`

### 用到再补（按业务线需要）
9. RabbitMQ、ShardingSphere 分库分表、Elasticsearch、XXL-Job、各支付/省份 SDK

---

## 九、上手项目的钥匙

1. **把项目跑起来**：需内网/VPN 连 Nacos，`profile=dev`（具体参考 hqq-api 的 `AGENTS.md`）。用 Swagger `/doc.html` 调几个 admin 接口建立体感。
2. **精读 `AGENTS.md`**：项目自带的 74KB 工作指南，是**事实单一来源**。含速查表、技术栈、模块结构图、业务领域词典（解释"权益/核销/办理/爆爆团/饭票"等业务黑话）、常见任务指引、调试排障。**比任何外部教程都重要。**
3. **仿简单链路**：照着 `AdminProductClassifyController` 链路，自己新增一个简单 admin CRUD，跑通。
4. **选一个业务域深读**：理解策略模式分发。

---

## 十、务必注意的坑

| 坑 | 说明 |
|---|---|
| **Java 8 红线** | 禁用 `var`/`record`/文本块/`Stream.toList()` 等 9+ 特性。写代码前先确认特性是否 Java 8 支持。 |
| **`Result` 字段不能删** | 冗余字段是历史对外接口契约，删了会让前端/外部调用方故障。 |
| **`BizException` 是受检异常** | Controller 方法签名必须 `throws BizException`，不能吞。 |
| **Dao 命名** | 数据访问接口叫 `*Dao`，不叫 `*Mapper`，别被外部教程带偏。 |
| **`@MapperScan("com.code.dao*")`** | Mapper 扫描路径，Dao 必须在这个包下。 |

---

> 📌 本文档是学习 [15-Java学习路线图](./15-Java学习路线图-hqq-api方向.md) 时随时回来查的参考手册。每学一个阶段，回来对照"公司代码用什么"，确保学的方向不跑偏。
