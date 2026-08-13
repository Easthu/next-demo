// SSE 端点①:实时推送最新发票(模拟"新发票到达"通知)
// 学习重点:SSE 的消息格式(data:/id:/retry:/心跳注释行)、自动重连、Last-Event-ID
import { prisma } from '@/app/lib/prisma';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  // 读 Last-Event-ID:浏览器断线重连时会自动带上"最后收到的消息 id"
  // 我们从这里继续递增,让 id 连续 —— 演示 Last-Event-ID 机制
  const lastEventId = Number(request.headers.get('Last-Event-ID') || 0);
  let messageId = lastEventId;
  let pushedSinceReconnect = 0;
  // 定时器引用提到外层,以便 cancel() 能清理(客户端断开时防内存泄漏)
  let heartbeat: ReturnType<typeof setInterval>;
  let businessTimer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    async start(controller) {
      // 先推一条 retry,告诉浏览器"断了之后等 3000ms 再连"
      controller.enqueue(encoder.encode('retry: 3000\n\n'));

      // 心跳:每 25 秒推一条注释行(: 开头浏览器会忽略)
      // 作用:防止 nginx/CDN 等中间代理因"长时间无数据"掐断连接
      heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(': ping\n\n'));
      }, 25000);

      // 业务循环:每 4 秒查一次最新发票并推送
      businessTimer = setInterval(async () => {
        try {
          const latest = await prisma.invoice.findFirst({
            include: { customer: true },
            orderBy: { date: 'desc' },
          });

          messageId += 1;
          pushedSinceReconnect += 1;

          const data = {
            id: latest?.id ?? '',
            amount: latest?.amount ?? 0, // 单位:分
            status: latest?.status ?? 'pending',
            date: latest?.date ?? new Date(),
            customerName: latest?.customer?.name ?? '未知客户',
          };

          // SSE 消息格式:id / event / data 三段,末尾 \n\n 表示一条消息结束
          const payload =
            `id: ${messageId}\n` +
            `event: invoice\n` +
            `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(payload));

          // 断线演示:每推 3 条主动关闭一次
          // 浏览器会自动重连(等 retry 毫秒),并发起新请求(带 Last-Event-ID)
          if (pushedSinceReconnect >= 3) {
            pushedSinceReconnect = 0;
            clearInterval(heartbeat);
            clearInterval(businessTimer);
            controller.close();
          }
        } catch (err) {
          console.error('[sse/invoices] 推送失败:', err);
        }
      }, 4000);
    },
    cancel() {
      // 客户端断开(关页面/source.close())时触发,清理定时器防泄漏
      clearInterval(heartbeat);
      clearInterval(businessTimer);
      console.log('[sse/invoices] 客户端断开连接');
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
