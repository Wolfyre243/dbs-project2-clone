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
      <section className='flex flex-row w-full gap-4'>
        <div className='w-full'>
          <AudioCompletionRateCard />
        </div>
        <div className='w-full'>
          <TotalUsersCard />
        </div>
      </section>

      <section>
        <div className='w-full min-h-full'>
          <AudioPlaysByExhibitChart />
        </div>
      </section>

      <section className='flex flex-row gap-5 w-full h-full'>
        <div className='w-full min-h-full'>
          <AverageListenDurationLineChart />
        </div>
        <div className='w-full min-h-full'>
          <AudioCompletionRateLineChart />
        </div>
      </section>
    </div>
  );
}
