// 发票 PDF 导出路由 —— 把单张发票渲染成 PDF 文件供下载
//
// ╔══════════════════════════════════════════════════════════════════╗
// ║  结构跟 app/api/invoices/csv/route.ts 完全一样：                    ║
// ║    查数据库 → 转成目标格式 → 用 Response 返回文件                    ║
// ║  唯一区别在「格式化」那步：                                          ║
// ║    CSV 路由：拼字符串                                               ║
// ║    PDF 路由：把 <InvoicePdfDocument> 渲染成字节流                    ║
// ╚══════════════════════════════════════════════════════════════════╝
//
// 你的任务：把下面 3 个 TODO 填完（每个都带了提示，几乎是答案）。
// 填完后删掉文件末尾那行临时的 `return new Response('TODO...')`。
import { renderToBuffer } from '@react-pdf/renderer';
import InvoicePdfDocument from '@/app/ui/invoices/invoice-pdf-document';
import { fetchInvoiceDetailById } from '@/app/lib/data';
// TODO 1 ── 导入需要的东西 ──────────────────────────────────────────
// (a) 从 '@react-pdf/renderer' 导入 renderToBuffer
//       作用：把一个 <Document> 组件渲染成 PDF 的二进制数据（Buffer）
//       写法：import { renderToBuffer } from '@react-pdf/renderer';
// (b) 导入 PDF 组件：
//       import InvoicePdfDocument from '@/app/ui/invoices/invoice-pdf-document';
// (c) 导入查询函数（详情页已经在用这个）：
//       import { fetchInvoiceDetailById } from '@/app/lib/data';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // TODO 2 ── 查这张发票（含客户信息）─────────────────────────────────
  // 调用 fetchInvoiceDetailById(id)，拿到 invoice
  // 提示：它可能返回 undefined（发票不存在），这时应返回 404：
  const invoice = await fetchInvoiceDetailById(id);
    if (!invoice) {
      return new Response('Invoice not found', { status: 404 });
    }

  // TODO 3 ── 渲染 PDF + 返回文件给浏览器 ────────────────────────────
  // (a) 把组件渲染成字节流（注意这是「函数里调用组件」，不是渲染到 DOM）：
        const pdfBuffer = await renderToBuffer(
          <InvoicePdfDocument invoice={invoice} />
        );
  // (b) 返回文件（参考 csv/route.ts，但 Content-Type 换成 PDF）：
        return new Response(pdfBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
          },
        });
  //   浏览器看到 Content-Disposition: attachment 会直接触发下载，而非跳转页面。

  // ↓ TODO 填完后把这行删掉 ↓
  // return new Response('TODO: 还没实现', { status: 501 });
}
