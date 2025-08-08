import { TotalUsersCard, UserSignUpChart } from './statistics/users';
import { LanguageUsageCard } from './statistics/language';
import { QRScanDashboard } from './statistics/qrCode/QrCodeGraphs';
import AudioStatisticsDashboard from './statistics/audio/page';
import AudioCompletionRateCard from './statistics/audio/AudioCards';
import QRScanCountCard from './statistics/qrCode/QrCodeCards';
import TopExhibitCard from './statistics/exhibit/ExhibitCards';
import AudioPlaysByExhibitChart from './statistics/audio/AudioPlaysByExhibitChart';
import { StartEndDatePicker, type DateRange } from '~/components/analytics-ui';
import { useState } from 'react';

export default function AdminHomePage() {
  // const [activeTab, setActiveTab] = useState('users');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });

  return (
    <div className='space-y-4 px-4 py-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>
      </div>

      {/* Cards */}
      <section className='w-full flex lg:flex-row flex-col gap-4 justify-between'>
        <div className='w-full space-x-2'>
          <TotalUsersCard />
        </div>
        <div className='w-full space-x-2'>
          <AudioCompletionRateCard />
        </div>
        <div className='w-full space-x-2'>
          <QRScanCountCard />
        </div>
        <div className='w-full space-x-2'>
          <TopExhibitCard />
        </div>
      </section>

      {/* Charts */}
      <StartEndDatePicker setDateRange={setDateRange} />

      <section className='flex xl:flex-row flex-col w-full gap-4 justify-between'>
        <div className='min-w-full xl:min-w-3/4 min-h-full'>
          <UserSignUpChart dateRange={dateRange} />
        </div>
        <div className='w-full h-full'>
          <LanguageUsageCard />
        </div>
      </section>

      <section>
        <AudioPlaysByExhibitChart dateRange={dateRange} />
      </section>
    </div>
  );
}
