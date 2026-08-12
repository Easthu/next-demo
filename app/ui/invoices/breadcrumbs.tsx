import { clsx } from 'clsx';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface Crumb {
  label: string;
  href: string;
  active?: boolean;
}

export default function Breadcrumbs({
  breadcrumbs,
}: {
  breadcrumbs: Crumb[];
}) {
  return (
    <Breadcrumb aria-label="Breadcrumb" className="mb-6 block">
      <BreadcrumbList
        className={clsx(lusitana.className, 'text-xl md:text-2xl')}
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <BreadcrumbItem
              key={breadcrumb.href}
              className={clsx(
                breadcrumb.active ? 'text-gray-900' : 'text-gray-500',
              )}
            >
              {breadcrumb.active ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
              {!isLast && <BreadcrumbSeparator>/</BreadcrumbSeparator>}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
