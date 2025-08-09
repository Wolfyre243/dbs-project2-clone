import { cn } from '~/lib/utils';
import { DatePicker } from './date-picker';
import { useIsMobile } from '~/hooks/use-mobile';

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

export function StartEndDatePicker({
  setDateRange,
  title,
  className,
}: {
  setDateRange: (prev: any) => void;
  title?: string;
  className?: string;
}) {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'sticky z-50 top-12 bg-background/50 backdrop-blur-xl px-6 py-6 rounded-md dark:shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4',
        className,
      )}
    >
      {!isMobile && <h1 className='text-2xl font-bold'>{title}</h1>}
      {/* Date Pickers */}
      <div className='flex flex-row flex-wrap md:flex-nowrap gap-2 items-center'>
        <div className='flex flex-col gap-1 w-full'>
          <span>Start:</span>
          <DatePicker
            fieldName='startDate'
            label=''
            onChange={(val: string) =>
              setDateRange((prev: any) => ({
                ...prev,
                startDate: val ? new Date(val) : null,
              }))
            }
          />
        </div>
        <div className='flex flex-col gap-1 w-full'>
          <span>End:</span>
          <DatePicker
            fieldName='endDate'
            label=''
            onChange={(val: string) =>
              setDateRange((prev: any) => ({
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
