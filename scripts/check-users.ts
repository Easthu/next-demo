// 临时诊断脚本：列出所有用户和角色（RBAC 排错用）
// 运行：npx tsx scripts/check-users.ts
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true },
  });
  console.table(users);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
