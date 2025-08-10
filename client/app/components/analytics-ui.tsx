import { cn } from '~/lib/utils';
import { DatePicker } from './date-picker';
import { useIsMobile } from '~/hooks/use-mobile';
import { Button } from './ui/button';
import { RotateCcw } from 'lucide-react';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export function StartEndDatePicker({
  dateRange,
  setDateRange,
  title,
  className,
  children,
}: {
  dateRange?: DateRange;
  setDateRange: (prev: any) => void;
  title?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'sticky z-50 top-12 bg-background/50 backdrop-blur-xl px-6 py-6 rounded-md dark:shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className,
      )}
    >
      <div className='flex flex-row gap-5 items-center'>
        {!isMobile && title && <h1 className='text-2xl font-bold'>{title}</h1>}
        {/* Children inserted before Date Pickers */}
        {children}
      </div>

      {/* Date Pickers */}
      <div className='flex flex-row flex-wrap md:flex-nowrap gap-2 items-center'>
        <div className='flex flex-col gap-1 w-full'>
          <span>Start:</span>
          <DatePicker
            // value={dateRange.startDate ? dateRange.startDate.toISOString() : null}
            fieldName='startDate'
            label=''
            onChange={(val: string) =>
              setDateRange((prev: DateRange) => ({
                ...prev,
                startDate: val ? new Date(val) : null,
              }))
            }
          />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <span>End:</span>
          <DatePicker
            // value={dateRange.endDate ? dateRange.endDate.toISOString() : null}
            fieldName='endDate'
            label=''
            onChange={(val: string) =>
              setDateRange((prev: DateRange) => ({
                ...prev,
                endDate: val ? new Date(val) : null,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
}
