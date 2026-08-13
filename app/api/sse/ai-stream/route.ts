// SSE 端点②:模拟 AI 流式输出(打字机效果)
// 学习重点:把一段文本切成片段逐个 push,呈现"逐字蹦出"的效果
// 这正是 ChatGPT/Cursor 等 AI 产品"打字机效果"的底层原理

const ANSWER =
  '你好!这是用 SSE 模拟的 AI 流式输出。' +
  '服务器把一段回答切成字符,逐个推送给浏览器,' +
  '客户端每收到一个字符就 append 到界面上,形成打字机效果。' +
  '这也是 ChatGPT 等 AI 产品流式回答的底层原理。';

export async function GET() {
  const encoder = new TextEncoder();
  // 用展开运算符按"字符"切(而非按字节),正确处理中文
  const chars = [...ANSWER];
  let i = 0;
  let timer: ReturnType<typeof setInterval>;

  const stream = new ReadableStream({
    start(controller) {
      timer = setInterval(() => {
        if (i < chars.length) {
          // 每次推一个字符,致敬 OpenAI 流式格式 { "delta": "字" }
          const payload = `data: ${JSON.stringify({ delta: chars[i] })}\n\n`;
          controller.enqueue(encoder.encode(payload));
          i += 1;
        } else {
          // 全部推送完,发 [DONE] 收尾,然后关闭流
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          clearInterval(timer);
          controller.close();
        }
      }, 50);
    },
    cancel() {
      // 客户端中途断开时清理,避免定时器继续空跑
      clearInterval(timer);
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
