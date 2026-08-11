// Prisma 7 配置文件 —— 管理数据库连接和迁移设置
// Prisma 7 把这些配置从 schema.prisma 移到了这里
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // 用非池化连接（Neon 的 -pooler 主机会和 Prisma 事务冲突）
  datasource: {
    url: env('POSTGRES_URL_NON_POOLING'),
  },
});
