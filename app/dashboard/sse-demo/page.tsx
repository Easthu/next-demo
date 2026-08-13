'use client';

// SSE 实战演示页
// 三个区块:① 实时发票通知(端点①) ② AI 流式回答(端点②) ③ 概念说明
//
// 关键 React 处理:
// - 'use client':EventSource 是浏览器 API,只能在客户端跑
// - useRef 持有 EventSource:防止 React 19 StrictMode 下 useEffect 执行两次开两条连接
// - useEffect return 里 source.close():组件卸载必须关连接,否则内存泄漏

import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// ---------- 工具:金额分→元,状态中文化(复用项目约定) ----------
const formatAmount = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const formatStatus = (s: string) =>
  s === 'paid' ? '已支付' : s === 'pending' ? '待处理' : s;

// ---------- 类型 ----------
type InvoiceMsg = {
  id: string;
  amount: number;
  status: string;
  date: string | Date;
  customerName: string;
};

// ---------- 连接状态徽章 ----------
function StatusBadge({ readyState }: { readyState: number }) {
  // 0=CONNECTING 1=OPEN 2=CLOSED
  const map = {
    0: { text: '连接中…', variant: 'secondary' as const },
    1: { text: '已连接', variant: 'default' as const },
    2: { text: '已断开', variant: 'outline' as const },
  };
  const { text, variant } = map[readyState as 0 | 1 | 2] ?? map[0];
  return <Badge variant={variant}>{text}</Badge>;
}

// ============================================================
// 区块 1:实时发票通知(订阅 /api/sse/invoices)
// ============================================================
function InvoiceStream() {
  const sourceRef = useRef<EventSource | null>(null);
  const [invoices, setInvoices] = useState<InvoiceMsg[]>([]);
  const [readyState, setReadyState] = useState(0);
  const [lastId, setLastId] = useState<number | null>(null);

  useEffect(() => {
    // 防止 StrictMode 双连接:已存在则不再建
    if (sourceRef.current) return;

    const source = new EventSource('/api/sse/invoices');
    sourceRef.current = source;

    // 监听命名事件 invoice(服务端用 event: invoice 发送)
    source.addEventListener('invoice', (e) => {
      const ev = e as MessageEvent;
      const msg: InvoiceMsg = JSON.parse(ev.data);
      setInvoices((prev) => [msg, ...prev].slice(0, 8)); // 只保留最近 8 条
      setLastId(Number(ev.lastEventId));
    });

    source.onopen = () => setReadyState(source.readyState);
    source.onerror = () => setReadyState(source.readyState);

    // 用轮询更新状态(close()/重连时 onopen/onerror 不一定触发)
    const stateTimer = setInterval(() => {
      if (sourceRef.current) setReadyState(sourceRef.current.readyState);
    }, 500);

    return () => {
      clearInterval(stateTimer);
      source.close();
      sourceRef.current = null;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>实时发票通知</CardTitle>
            <CardDescription>
              订阅 <code>/api/sse/invoices</code> · 每 3 条自动断线演示重连
            </CardDescription>
          </div>
          <StatusBadge readyState={readyState} />
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">
          最后消息 id:{lastId ?? '—'}(断线重连后 id 连续,体现 Last-Event-ID)
        </p>
        {invoices.length === 0 && (
          <p className="text-sm text-muted-foreground">等待推送…</p>
        )}
        {invoices.map((inv, idx) => (
          <div
            key={`${inv.id}-${idx}`}
            className="flex items-center justify-between rounded border p-2 text-sm"
          >
            <span>{inv.customerName}</span>
            <span>{formatAmount(inv.amount)}</span>
            <Badge variant="outline">{formatStatus(inv.status)}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================
// 区块 2:AI 流式回答(订阅 /api/sse/ai-stream)
// ============================================================
function AiStream() {
  const sourceRef = useRef<EventSource | null>(null);
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const start = () => {
    if (sourceRef.current) return; // 防重复开
    setText('');
    setDone(false);
    setRunning(true);

    const source = new EventSource('/api/sse/ai-stream');
    sourceRef.current = source;

    source.onmessage = (e) => {
      if (e.data === '[DONE]') {
        source.close();
        sourceRef.current = null;
        setRunning(false);
        setDone(true);
        return;
      }
      const { delta } = JSON.parse(e.data);
      setText((prev) => prev + delta);
    };

    source.onerror = () => {
      source.close();
      sourceRef.current = null;
      setRunning(false);
    };
  };

  // 卸载清理
  useEffect(() => {
    return () => {
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI 流式回答</CardTitle>
        <CardDescription>
          订阅 <code>/api/sse/ai-stream</code> · 模拟打字机效果
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button onClick={start} disabled={running}>
          {running ? '生成中…' : '生成回答'}
        </Button>
        <div className="min-h-[80px] rounded border bg-muted/30 p-3 text-sm leading-relaxed">
          {text || (done ? '' : '点击「生成回答」开始…')}
          {running && <span className="animate-pulse">▌</span>}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// 区块 3:概念说明
// ============================================================
function ConceptCard() {
  const items: [string, string][] = [
    ['心跳', '注释行 : ping,防止代理超时断连'],
    ['自动重连', '浏览器断线后自动重连,无需手写'],
    ['Last-Event-ID', '重连时浏览器带上最后 id,服务端可补发'],
    ['单向推送', '只能服务器→客户端,发消息需另开 fetch'],
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>本页演示的概念</CardTitle>
        <CardDescription>对照代码理解 SSE 四个核心机制</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="font-medium">{k}:</span>{' '}
            <span className="text-muted-foreground">{v}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// ============================================================
// 页面主体
// ============================================================
export default function SseDemoPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <InvoiceStream />
      <div className="space-y-4">
        <AiStream />
        <ConceptCard />
      </div>
    </div>
  );
}
