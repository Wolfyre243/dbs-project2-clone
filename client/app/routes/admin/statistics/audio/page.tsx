import AudioPlaysByExhibitChart from './AudioPlaysByExhibitChart';
import AudioCompletionRateChart from './AudioCompletionRateChart';
import AverageListenDurationChart from './AverageListenDurationChart';
import AudioCompletionRateLineChart from './AudioCompletionRateLineChart';
import AverageListenDurationLineChart from './AverageListenDurationLineChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export default function AudioStatisticsDashboard() {
  return (
    <div className='space-y-6 px-4 py-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-2xl font-bold'>Audio Log Analytics</h1>
      </div>

      <Tabs defaultValue='current' className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='current'>Current Statistics</TabsTrigger>
          <TabsTrigger value='trends'>Trend Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value='current' className='space-y-6 mt-6'>
          <div className='space-y-6'>
            <AudioPlaysByExhibitChart />
            <AudioCompletionRateChart />
            <AverageListenDurationChart />
          </div>
        </TabsContent>

        <TabsContent value='trends' className='space-y-6 mt-6'>
          <div className='space-y-6'>
            <AudioCompletionRateLineChart />
            <AverageListenDurationLineChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
