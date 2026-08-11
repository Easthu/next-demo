// PrismaClient 单例
// 全项目共用一个 PrismaClient 实例，避免 dev 模式下热更新时开太多连接
// Prisma 7 必须通过 adapter 传连接字符串（不再在 schema 里配 url）

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// 用 PrismaPg adapter 连接数据库（非池化连接，避开 PgBouncer）
const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_URL_NON_POOLING });

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
