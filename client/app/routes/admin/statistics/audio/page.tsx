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
import { StartEndDatePicker, type DateRange } from '~/components/analytics-ui';

export default function AudioStatisticsDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  return (
    <div className='space-y-6'>
      <StartEndDatePicker
        setDateRange={setDateRange}
        title={'Audio Analytics'}
      />

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
