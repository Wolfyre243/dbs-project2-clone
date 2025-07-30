import AudioPlaysByExhibitChart from './AudioPlaysByExhibitChart';
import AudioCompletionRateChart from './AudioCompletionRateChart';
import AverageListenDurationChart from './AverageListenDurationChart';
import AudioCompletionRateLineChart from './AudioCompletionRateLineChart';
import AverageListenDurationLineChart from './AverageListenDurationLineChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { TotalUsersCard } from '../users';
import AudioCompletionRateCard from './AudioCards';

export default function AudioStatisticsDashboard() {
  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold'>Audio Engagement Analytics</h1>
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
          <AudioPlaysByExhibitChart />
        </div>
      </section>

      <section className='flex flex-col gap-4 w-full h-full sm:flex-row sm:overflow-visible sm:flex-wrap'>
        <div className='w-full min-h-full flex-1'>
          <AverageListenDurationLineChart />
        </div>
        <div className='w-full min-h-full flex-1'>
          <AudioCompletionRateLineChart />
        </div>
      </section>
    </div>
  );
}
