import AudioPlaysByExhibitChart from './AudioPlaysByExhibitChart';
import AudioCompletionRateChart from './AudioCompletionRateChart';
import AverageListenDurationChart from './AverageListenDurationChart';

export default function AudioStatisticsDashboard() {
  return (
    <div className='space-y-8 px-4 py-6'>
      <h1 className='text-2xl font-bold'>Audio Log Analytics</h1>
      <AudioPlaysByExhibitChart />
      <AudioCompletionRateChart />
      <AverageListenDurationChart />
    </div>
  );
}
