import Link from 'next/link';
import { FaceFrownIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex h-full flex-col items-center justify-center gap-2">
      <FaceFrownIcon className="w-10 text-gray-400" />
      <h2 className="text-xl font-semibold">404 页面不存在</h2>
      <p>找不到该发票。</p>
      <Button asChild variant="outline" className="mt-2">
        <Link href="/dashboard/invoices">返回</Link>
      </Button>
    </main>
  );
}
