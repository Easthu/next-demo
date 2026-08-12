import { CheckIcon, ClockIcon } from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/app/lib/utils';

export default function InvoiceStatus({ status }: { status: string }) {
  return (
    <Badge
      variant={status === 'pending' ? 'secondary' : 'default'}
      className={cn(
        status === 'paid' && 'bg-green-500 text-white hover:bg-green-500',
      )}
    >
      {status === 'pending' ? (
        <>
          待处理
          <ClockIcon className="ml-1 w-4 text-gray-500" />
        </>
      ) : null}
      {status === 'paid' ? (
        <>
          已支付
          <CheckIcon className="ml-1 w-4 text-white" />
        </>
      ) : null}
    </Badge>
  );
}
