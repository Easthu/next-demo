'use client';

import { ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { cn, generatePagination } from '@/app/lib/utils';
import { usePathname, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get('page')) || 1;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const allPages = generatePagination(currentPage, totalPages);

  return (
    <div className="inline-flex items-center gap-1">
      <PaginationArrow
        direction="left"
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage <= 1}
      />

      <div className="flex -space-x-px">
        {allPages.map((page, index) => {
          let position: 'first' | 'last' | 'single' | 'middle' | undefined;

          if (index === 0) position = 'first';
          if (index === allPages.length - 1) position = 'last';
          if (allPages.length === 1) position = 'single';
          if (page === '...') position = 'middle';

          return (
            <PaginationNumber
              key={`${page}-${index}`}
              href={createPageURL(page)}
              page={page}
              position={position}
              isActive={currentPage === page}
            />
          );
        })}
      </div>

      <PaginationArrow
        direction="right"
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage >= totalPages}
      />
    </div>
  );
}

function PaginationNumber({
  page,
  href,
  isActive,
  position,
}: {
  page: number | string;
  href: string;
  position?: 'first' | 'last' | 'middle' | 'single';
  isActive: boolean;
}) {
  if (isActive || position === 'middle') {
    return (
      <Button
        variant={isActive ? 'default' : 'ghost'}
        size="icon"
        disabled={position === 'middle'}
        className={cn(
          'rounded-none',
          position === 'first' && 'rounded-l-md',
          position === 'last' && 'rounded-r-md',
          position === 'middle' && 'text-muted-foreground',
        )}
      >
        {page}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" asChild
      className={cn(
        'rounded-none',
        position === 'first' && 'rounded-l-md',
        position === 'last' && 'rounded-r-md',
      )}
    >
      <Link href={href}>{page}</Link>
    </Button>
  );
}

function PaginationArrow({
  href,
  direction,
  isDisabled,
}: {
  href: string;
  direction: 'left' | 'right';
  isDisabled?: boolean;
}) {
  const icon =
    direction === 'left' ? (
      <ArrowLeftIcon className="h-4 w-4" />
    ) : (
      <ArrowRightIcon className="h-4 w-4" />
    );

  if (isDisabled) {
    return (
      <Button variant="outline" size="icon" disabled
        className={direction === 'left' ? 'mr-2 md:mr-4' : 'ml-2 md:ml-4'}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button variant="outline" size="icon" asChild
      className={direction === 'left' ? 'mr-2 md:mr-4' : 'ml-2 md:ml-4'}
    >
      <Link href={href}>{icon}</Link>
    </Button>
  );
}
