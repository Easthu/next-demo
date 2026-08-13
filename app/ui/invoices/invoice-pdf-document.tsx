// 发票 PDF 文档组件 —— 用 @react-pdf/renderer 的 JSX 语法写 PDF
//
// 心智模型：这就像写一个普通 React 组件，只是渲染目标从「浏览器 DOM」变成「PDF 文件」。
//   <Document>  = 整个 PDF 文件
//   <Page>      = 一页（size="A4"）
//   <View>      ≈ <div>（用 flexbox 布局）
//   <Text>      ≈ <span>/<p>
//   <Image>     ≈ <img>（但 src 必须是完整 URL 或 base64，不能用 /public 相对路径）
//
// ⚠️ 中文字体坑：@react-pdf/renderer 默认只带 Helvetica 等英文字体，
//    直接写中文会变成方块。要支持中文需用 Font.register 注册 .ttf 字体文件。
//    本组件用英文标签（Amount / Date / Status）保证开箱即用；
//    想换中文的话，参考官方文档注册字体后把下面的英文标签替换即可。
import fs from 'fs';
import path from 'path';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';
import { formatCurrency, formatDateToLocal } from '@/app/lib/utils';

// 这张发票需要的数据形状（fetchInvoiceDetailById 的返回值子集）
type InvoicePdfData = {
  id: string;
  amount: number; // 数据库存的是「分」，formatCurrency 会 /100 转元
  status: string; // 'paid' | 'pending'
  date: Date;
  customer: {
    name: string;
    email: string;
    image_url: string;
  };
};

// 把 /customers/x.png 这种相对路径，解析成 <Image> 能读的形式。
//
// 关键差异：浏览器的 <img src="/customers/x.png"> 能直接用，是因为浏览器知道
// 自己的域名（localhost:3000），会自动补全成完整 URL。
// 但 @react-pdf/renderer 跑在服务器进程里，没有「域名」概念——以 / 开头的相对路径
// 它读不到，图片会被静默丢弃。所以要手动解析成磁盘真实文件，再读成 base64 data URI。
function resolveImageSrc(imageUrl: string): string {
  // 已经是完整 URL 或 data URI，原样返回
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  // 相对路径（/customers/x.png）→ public 目录里的真实文件绝对路径
  const filePath = path.join(process.cwd(), 'public', imageUrl);
  if (fs.existsSync(filePath)) {
    const ext = path.extname(filePath).slice(1); // 'png' | 'jpg' ...
    const base64 = fs.readFileSync(filePath).toString('base64');
    return `data:image/${ext};base64,${base64}`;
  }
  return imageUrl; // 文件不存在就原样返回（<Image> 会留空，不报错）
}

// PDF 样式系统 —— 基于 flexbox，跟 CSS 很像，但只支持部分属性
// 写法跟 React Native 的 StyleSheet.create 几乎一样
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
    fontFamily: 'Helvetica',
    color: '#1f2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#111827',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  company: {
    textAlign: 'right',
    color: '#6b7280',
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#111827',
  },
  section: {
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 10,
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customerName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 6,
  },
  detailLabel: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    marginTop: 40,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 10,
  },
});

// 这个组件本身不渲染到屏幕，而是被 pdf/route.ts 里的 renderToBuffer 渲染成 PDF 字节
export default function InvoicePdfDocument({
  invoice,
}: {
  invoice: InvoicePdfData;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 顶部：标题 + 公司信息 */}
        <View style={styles.header}>
          <Text style={styles.title}>INVOICE</Text>
          <View style={styles.company}>
            <Text style={styles.companyName}>Acme Inc.</Text>
            <Text>123 Business Street</Text>
            <Text>billing@acme.com</Text>
          </View>
        </View>

        {/* 客户信息 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <View style={styles.customerRow}>
            {/* 坑提醒：PDF 的 <Image> src 必须是完整 URL（这里用客户头像远程地址） */}
            <Image
              style={styles.avatar}
              src={resolveImageSrc(invoice.customer.image_url)}
            />
            <View>
              <Text style={styles.customerName}>{invoice.customer.name}</Text>
              <Text style={{ color: '#6b7280' }}>{invoice.customer.email}</Text>
            </View>
          </View>
        </View>

        {/* 发票明细：金额 / 日期 / 状态 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={styles.detailValue}>
                {formatCurrency(invoice.amount)}
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>
                {formatDateToLocal(invoice.date)}
              </Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>
                {invoice.status === 'paid' ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* 合计 */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Due</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.amount)}
          </Text>
        </View>

        {/* 页脚 */}
        <Text style={styles.footer}>
          Thank you for your business! · Invoice #{invoice.id.slice(0, 8)}
        </Text>
      </Page>
    </Document>
  );
}
