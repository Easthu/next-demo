// Prisma seed 脚本 —— 用 Prisma API 灌初始数据
// 运行方式：npx prisma db seed
// 对应原来的 scripts/seed.js，但用 Prisma 的 create API，不用手写 SQL

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
const prisma = new PrismaClient({ adapter });

// 初始数据（和 scripts/seed.js 保持一致，方便对照）

const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456', // 下面会 bcrypt 哈希
    role: 'user',
  },
  // 演示管理员账号（RBAC 引导：默认都是 user，用 seed 造第一个 admin）
  // 登录信息：admin@nextmail.com / 123456
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442b', // 末位改 b，避免和上面重复
    name: 'Admin',
    email: 'admin@nextmail.com',
    password: '123456',
    role: 'admin',
  },
];

const customers = [
  { id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa', name: 'Evil Rabbit', email: 'evil@rabbit.com', image_url: '/customers/evil-rabbit.png' },
  { id: '3958dc9e-712f-4377-85e9-fec4b6a6442a', name: 'Delba de Oliveira', email: 'delba@oliveira.com', image_url: '/customers/delba-de-oliveira.png' },
  { id: '3958dc9e-742f-4377-85e9-fec4b6a6442a', name: 'Lee Robinson', email: 'lee@robinson.com', image_url: '/customers/lee-robinson.png' },
  { id: '76d65c26-f784-44a2-ac19-586678f7c2f2', name: 'Michael Novotny', email: 'michael@novotny.com', image_url: '/customers/michael-novotny.png' },
  { id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9', name: 'Amy Burns', email: 'amy@burns.com', image_url: '/customers/amy-burns.png' },
  { id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB', name: 'Balazs Orban', email: 'balazs@orban.com', image_url: '/customers/balazs-orban.png' },
];

const invoices = [
  { customer_id: customers[0].id, amount: 15795, status: 'pending', date: new Date('2022-12-06') },
  { customer_id: customers[1].id, amount: 20348, status: 'pending', date: new Date('2022-11-14') },
  { customer_id: customers[4].id, amount: 3040, status: 'paid', date: new Date('2022-10-29') },
  { customer_id: customers[3].id, amount: 44800, status: 'paid', date: new Date('2023-09-10') },
  { customer_id: customers[5].id, amount: 34577, status: 'pending', date: new Date('2023-08-05') },
  { customer_id: customers[2].id, amount: 54246, status: 'pending', date: new Date('2023-07-16') },
  { customer_id: customers[0].id, amount: 666, status: 'pending', date: new Date('2023-06-27') },
  { customer_id: customers[3].id, amount: 32545, status: 'paid', date: new Date('2023-06-09') },
  { customer_id: customers[4].id, amount: 1250, status: 'paid', date: new Date('2023-06-17') },
  { customer_id: customers[5].id, amount: 8546, status: 'paid', date: new Date('2023-06-07') },
  { customer_id: customers[1].id, amount: 500, status: 'paid', date: new Date('2023-08-19') },
  { customer_id: customers[5].id, amount: 8945, status: 'paid', date: new Date('2023-06-03') },
  { customer_id: customers[2].id, amount: 1000, status: 'paid', date: new Date('2022-06-05') },
];

const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2500 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3000 },
  { month: 'Dec', revenue: 4800 },
];

const transactions = [
  {
    id: '1',
    description: 'Payment from Evil Rabbit',
    amount: 15795,
  }
]

// async function main() {
//   // 用 upsert 保证可重复运行（已存在就跳过）
//   // 密码用 bcrypt 哈希
//   // for (const user of users) {
//   //   const hashedPassword = await bcrypt.hash(user.password, 10);
//   //   await prisma.user.upsert({
//   //     where: { id: user.id },
//   //     update: {},
//   //     create: { id: user.id, name: user.name, email: user.email, password: hashedPassword, role: user.role },
//   //   });
//   // }

//   // for (const customer of customers) {
//   //   await prisma.customer.upsert({
//   //     where: { id: customer.id },
//   //     update: {},
//   //     create: customer,
//   //   });
//   // }

//   // 发票用 deleteMany + createMany 保证重复运行结果一致
//   // （发票 id 是自动生成的，没法 upsert，所以先清空再插入）
//   // await prisma.invoice.deleteMany();
//   // await prisma.invoice.createMany({ data: invoices });

//   // for (const rev of revenue) {
//   //   await prisma.revenue.upsert({
//   //     where: { month: rev.month },
//   //     update: {},
//   //     create: rev,
//   //   });
//   // }
  

//   console.log('✅ 数据库种子数据已成功写入');
// }
// 工具函数：获取当前日期（用于动态生成日期）
function getDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day);
}
async function main() {
    console.log('🧹 清空旧数据...');

  // 删除顺序：先删子表，再删父表（因为有外键约束）
  await prisma.transaction.deleteMany({});
  await prisma.transactionCategory.deleteMany({});

  console.log('✅ 旧数据已清空');
  console.log('🌱 开始插入数据...');

  // ========================================
  console.log('📂 插入类别数据...');

  const categories = await prisma.transactionCategory.createMany({
    data: [
      // 收入类（系统预设）
      { name: '工资', description: '每月固定工资收入', type: 'income', is_system: true },
      { name: '奖金', description: '绩效奖金、年终奖等', type: 'income', is_system: true },
      { name: '投资收益', description: '股票、基金等投资收益', type: 'income', is_system: true },
      { name: '兼职', description: '副业、兼职收入', type: 'income', is_system: true },
      { name: '礼物', description: '生日、节日收到的红包或礼物', type: 'income', is_system: true },
      { name: '退款', description: '购物退款、退货返款', type: 'income', is_system: true },

      // 支出类（系统预设）
      { name: '餐饮', description: '日常三餐、外卖、零食', type: 'expense', is_system: true },
      { name: '交通', description: '地铁、公交、打车、加油', type: 'expense', is_system: true },
      { name: '购物', description: '衣服、数码、家居用品', type: 'expense', is_system: true },
      { name: '娱乐', description: '电影、游戏、聚会、KTV', type: 'expense', is_system: true },
      { name: '房租', description: '每月房租支出', type: 'expense', is_system: true },
      { name: '水电煤', description: '水费、电费、燃气费', type: 'expense', is_system: true },
      { name: '医疗', description: '看病、买药、体检', type: 'expense', is_system: true },
      { name: '教育', description: '培训、书籍、学习资料', type: 'expense', is_system: true },
      { name: '保险', description: '社保、商业保险', type: 'expense', is_system: true },
      { name: '旅游', description: '旅行、住宿、景点门票', type: 'expense', is_system: true },

      // 用户自定义类别
      { name: '宠物', description: '猫粮、狗粮、宠物用品', type: 'expense', is_system: false },
      { name: '咖啡', description: '星巴克、精品咖啡店', type: 'expense', is_system: false },
      { name: '健身', description: '健身房卡、私教课', type: 'expense', is_system: false },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ 插入了 ${categories.count} 个类别`);

  // ========================================
  // 第二步：获取所有类别的ID
  // ========================================
  const allCategories = await prisma.transactionCategory.findMany();
  
  const categoryMap = new Map<string, number>();
  allCategories.forEach(c => {
    categoryMap.set(`${c.name}_${c.type}`, c.id);
  });

  function getCategoryId(name: string, type: string): number {
    const key = `${name}_${type}`;
    const id = categoryMap.get(key);
    if (!id) {
      throw new Error(`找不到类别: ${name} (${type})`);
    }
    return id;
  }

  // ========================================
  // 第三步：插入交易数据
  // ========================================
  console.log('💰 插入交易数据...');

  const transactions = await prisma.transaction.createMany({
    data: [
      // ====== 1月 ======
      // 收入
      {
        amount: 50000,
        type: 'income',
        category_id: getCategoryId('工资', 'income'),
        date: getDate(2026, 1, 15),
        description: '1月工资到账',
      },
      {
        amount: 10000,
        type: 'income',
        category_id: getCategoryId('奖金', 'income'),
        date: getDate(2026, 1, 20),
        description: '年终奖',
      },
      {
        amount: 3000,
        type: 'income',
        category_id: getCategoryId('礼物', 'income'),
        date: getDate(2026, 1, 25),
        description: '生日红包（妈妈给的）',
      },
      // 支出
      {
        amount: 1500,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 1, 3),
        description: '午餐外卖',
      },
      {
        amount: 2000,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 1, 10),
        description: '周末和朋友聚餐',
      },
      {
        amount: 500,
        type: 'expense',
        category_id: getCategoryId('咖啡', 'expense'),
        date: getDate(2026, 1, 12),
        description: '星巴克咖啡',
      },
      {
        amount: 8000,
        type: 'expense',
        category_id: getCategoryId('房租', 'expense'),
        date: getDate(2026, 1, 1),
        description: '1月房租',
      },
      {
        amount: 1200,
        type: 'expense',
        category_id: getCategoryId('水电煤', 'expense'),
        date: getDate(2026, 1, 5),
        description: '水电网费',
      },
      {
        amount: 2000,
        type: 'expense',
        category_id: getCategoryId('购物', 'expense'),
        date: getDate(2026, 1, 18),
        description: '买冬装',
      },
      {
        amount: 1500,
        type: 'expense',
        category_id: getCategoryId('娱乐', 'expense'),
        date: getDate(2026, 1, 22),
        description: '看电影+吃饭',
      },
      {
        amount: 300,
        type: 'expense',
        category_id: getCategoryId('交通', 'expense'),
        date: getDate(2026, 1, 28),
        description: '地铁卡充值',
      },

      // ====== 2月 ======
      {
        amount: 50000,
        type: 'income',
        category_id: getCategoryId('工资', 'income'),
        date: getDate(2026, 2, 15),
        description: '2月工资到账',
      },
      {
        amount: 5000,
        type: 'income',
        category_id: getCategoryId('兼职', 'income'),
        date: getDate(2026, 2, 20),
        description: '周末接私活',
      },
      {
        amount: 2500,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 2, 5),
        description: '春节家庭聚餐',
      },
      {
        amount: 1500,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 2, 14),
        description: '情人节晚餐',
      },
      {
        amount: 8000,
        type: 'expense',
        category_id: getCategoryId('房租', 'expense'),
        date: getDate(2026, 2, 1),
        description: '2月房租',
      },
      {
        amount: 600,
        type: 'expense',
        category_id: getCategoryId('健身', 'expense'),
        date: getDate(2026, 2, 8),
        description: '健身房月卡',
      },
      {
        amount: 3000,
        type: 'expense',
        category_id: getCategoryId('购物', 'expense'),
        date: getDate(2026, 2, 16),
        description: '买运动鞋',
      },
      {
        amount: 1000,
        type: 'expense',
        category_id: getCategoryId('交通', 'expense'),
        date: getDate(2026, 2, 22),
        description: '滴滴打车（春节拜年）',
      },

      // ====== 3月 ======
      {
        amount: 50000,
        type: 'income',
        category_id: getCategoryId('工资', 'income'),
        date: getDate(2026, 3, 15),
        description: '3月工资到账',
      },
      {
        amount: 2000,
        type: 'income',
        category_id: getCategoryId('投资收益', 'income'),
        date: getDate(2026, 3, 25),
        description: '股票分红',
      },
      {
        amount: 1200,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 3, 2),
        description: '午饭外卖',
      },
      {
        amount: 1800,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 3, 8),
        description: '妇女节请同事吃饭',
      },
      {
        amount: 8000,
        type: 'expense',
        category_id: getCategoryId('房租', 'expense'),
        date: getDate(2026, 3, 1),
        description: '3月房租',
      },
      {
        amount: 900,
        type: 'expense',
        category_id: getCategoryId('水电煤', 'expense'),
        date: getDate(2026, 3, 10),
        description: '水电燃气费',
      },
      {
        amount: 5000,
        type: 'expense',
        category_id: getCategoryId('旅游', 'expense'),
        date: getDate(2026, 3, 20),
        description: '杭州周末游',
      },
      {
        amount: 400,
        type: 'expense',
        category_id: getCategoryId('交通', 'expense'),
        date: getDate(2026, 3, 28),
        description: '加油',
      },

      // ====== 4月 ======
      {
        amount: 52000,
        type: 'income',
        category_id: getCategoryId('工资', 'income'),
        date: getDate(2026, 4, 15),
        description: '4月工资到账（涨薪）',
      },
      {
        amount: 3000,
        type: 'income',
        category_id: getCategoryId('退款', 'income'),
        date: getDate(2026, 4, 22),
        description: '淘宝退货退款',
      },
      {
        amount: 2000,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 4, 5),
        description: '清明节聚餐',
      },
      {
        amount: 8000,
        type: 'expense',
        category_id: getCategoryId('房租', 'expense'),
        date: getDate(2026, 4, 1),
        description: '4月房租',
      },
      {
        amount: 1500,
        type: 'expense',
        category_id: getCategoryId('娱乐', 'expense'),
        date: getDate(2026, 4, 12),
        description: '演唱会门票（周杰伦）',
      },
      {
        amount: 3500,
        type: 'expense',
        category_id: getCategoryId('购物', 'expense'),
        date: getDate(2026, 4, 18),
        description: '换季买衣服',
      },
      {
        amount: 700,
        type: 'expense',
        category_id: getCategoryId('交通', 'expense'),
        date: getDate(2026, 4, 25),
        description: '地铁月卡',
      },

      // ====== 5月 ======
      {
        amount: 52000,
        type: 'income',
        category_id: getCategoryId('工资', 'income'),
        date: getDate(2026, 5, 15),
        description: '5月工资到账',
      },
      {
        amount: 8000,
        type: 'income',
        category_id: getCategoryId('奖金', 'income'),
        date: getDate(2026, 5, 20),
        description: '季度绩效奖金',
      },
      {
        amount: 2200,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 5, 3),
        description: '五一假期吃大餐',
      },
      {
        amount: 8000,
        type: 'expense',
        category_id: getCategoryId('房租', 'expense'),
        date: getDate(2026, 5, 1),
        description: '5月房租',
      },
      {
        amount: 1000,
        type: 'expense',
        category_id: getCategoryId('水电煤', 'expense'),
        date: getDate(2026, 5, 8),
        description: '电费网费',
      },
      {
        amount: 2000,
        type: 'expense',
        category_id: getCategoryId('医疗', 'expense'),
        date: getDate(2026, 5, 12),
        description: '看牙医（补牙）',
      },
      {
        amount: 1500,
        type: 'expense',
        category_id: getCategoryId('健身', 'expense'),
        date: getDate(2026, 5, 18),
        description: '私教课3节',
      },
      {
        amount: 2500,
        type: 'expense',
        category_id: getCategoryId('娱乐', 'expense'),
        date: getDate(2026, 5, 25),
        description: '和朋友玩密室逃脱',
      },

      // ====== 6月 ======
      {
        amount: 52000,
        type: 'income',
        category_id: getCategoryId('工资', 'income'),
        date: getDate(2026, 6, 15),
        description: '6月工资到账',
      },
      {
        amount: 5000,
        type: 'income',
        category_id: getCategoryId('兼职', 'income'),
        date: getDate(2026, 6, 22),
        description: '接UI设计单',
      },
      {
        amount: 1800,
        type: 'expense',
        category_id: getCategoryId('餐饮', 'expense'),
        date: getDate(2026, 6, 3),
        description: '工作日午餐',
      },
      {
        amount: 1200,
        type: 'expense',
        category_id: getCategoryId('咖啡', 'expense'),
        date: getDate(2026, 6, 8),
        description: '咖啡馆办公（4杯）',
      },
      {
        amount: 8000,
        type: 'expense',
        category_id: getCategoryId('房租', 'expense'),
        date: getDate(2026, 6, 1),
        description: '6月房租',
      },
      {
        amount: 6000,
        type: 'expense',
        category_id: getCategoryId('旅游', 'expense'),
        date: getDate(2026, 6, 10),
        description: '端午假期出游（苏州）',
      },
      {
        amount: 2000,
        type: 'expense',
        category_id: getCategoryId('购物', 'expense'),
        date: getDate(2026, 6, 18),
        description: '618购物节囤货',
      },
      {
        amount: 500,
        type: 'expense',
        category_id: getCategoryId('交通', 'expense'),
        date: getDate(2026, 6, 25),
        description: '公交卡充值',
      },
    ],
  });

  console.log(`✅ 插入了 ${transactions.count} 条交易记录`);
  console.log('🎉 数据导入完成！');
}

main()
  .catch((e) => {
    console.error('❌ 写入种子数据失败：', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
