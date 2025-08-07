import AudioPlaysByExhibitChart from './AudioPlaysByExhibitChart';
import AudioCompletionRateChart from './AudioCompletionRateChart';
import AverageListenDurationChart from './AverageListenDurationChart';
import AudioCompletionRateLineChart from './AudioCompletionRateLineChart';
import AverageListenDurationLineChart from './AverageListenDurationLineChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { TotalUsersCard } from '../users';
import AudioCompletionRateCard from './AudioCards';
import { useState } from 'react';
import { DatePicker } from '~/components/date-picker';

export default function AudioStatisticsDashboard() {
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  return (
    <div className='space-y-6'>
      <div className='sticky z-50 top-15 bg-background/70 backdrop-blur-xl px-2 py-6 rounded-md shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold'>Audio Engagement Analytics</h1>
        {/* Date Pickers */}
        <div className='flex flex-row flex-wrap md:flex-nowrap gap-2 items-center'>
          <div className='flex flex-col gap-1 w-full'>
            <span>Start:</span>
            <DatePicker
              fieldName='startDate'
              label=''
              onChange={(val: string) =>
                setDateRange((prev) => ({
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
                setDateRange((prev) => ({
                  ...prev,
                  endDate: val ? new Date(val) : null,
                }))
              }
            />
          </div>
        </div>
      </div>

      {/* TODO Audio Cards */}
      <section className='flex flex-col w-full gap-4 sm:flex-row sm:overflow-visible sm:flex-wrap'>
        <div className='w-full flex-1'>
          <AudioCompletionRateCard />
        </div>
        <div className='w-full flex-1'>
          <TotalUsersCard />
        </div>
      </section>

      <section className='flex flex-col gap-4 w-full h-full sm:flex-row sm:overflow-visible sm:flex-wrap'>
        <div className='w-full min-h-full flex-1'>
          <AudioPlaysByExhibitChart dateRange={dateRange} />
        </div>
      </section>

      <section className='flex flex-col gap-4 w-full h-full sm:flex-row sm:overflow-visible sm:flex-wrap'>
        <div className='w-full min-h-full flex-1'>
          <AverageListenDurationLineChart dateRange={dateRange} />
        </div>
        <div className='w-full min-h-full flex-1'>
          <AudioCompletionRateLineChart dateRange={dateRange} />
        </div>
      </section>
    </div>
  );
}
