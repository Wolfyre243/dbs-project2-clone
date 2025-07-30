import {
  SectionCards,
  TotalUsersCard,
  TodayRegistrationsCard,
  MonthRegistrationsCard,
  YearRegistrationsCard,
  UserSignUpChart,
} from './statistics/users';
import {
  LanguageDetailsCard,
  LanguageStatistics,
  LanguageUsageCard,
} from './statistics/language';
import { QRScanDashboard } from './statistics/qrCode/QrCodeGraphs';
import AudioStatisticsDashboard from './statistics/audio/page';
import AudioCompletionRateCard from './statistics/audio/AudioCards';
import QRScanCountCard from './statistics/qrCode/QrCodeCards';
import TopExhibitCard from './statistics/exhibit/ExhibitCards';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import AudioPlaysByExhibitChart from './statistics/audio/AudioPlaysByExhibitChart';

export default function AdminHomePage() {
  // const [activeTab, setActiveTab] = useState('users');

  return (
    <div className='space-y-6 px-4 py-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold'>Dashboard</h1>

        {/* Dropdown Select that controls content */}
        {/* <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select View' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='users'>Users</SelectItem>
            <SelectItem value='languages'>Languages</SelectItem>
            <SelectItem value='qr-codes'>QR Codes</SelectItem>
            <SelectItem value='audio'>Audio Engagement</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      {/* Hidden Tabs - only content is shown, no tab buttons */}
      {/* <Tabs value={activeTab} className='w-full'>
        <TabsContent value='users' className='space-y-6'>
          <SectionCards />
          <ChartAreaInteractive />
        </TabsContent>

        <TabsContent value='languages' className='space-y-6'>
          <LanguageStatistics />
        </TabsContent>

        <TabsContent value='qr-codes' className='space-y-6'>
          <QRScanDashboard />
        </TabsContent>

        <TabsContent value='audio' className='space-y-6'>
          <AudioStatisticsDashboard />
        </TabsContent>
      </Tabs> */}

      {/* Cards */}
      <section className='w-full flex flex-row gap-4 justify-between'>
        <div className='w-full'>
          <TotalUsersCard />
        </div>
        <div className='w-full'>
          <AudioCompletionRateCard />
        </div>
        <div className='w-full'>
          <QRScanCountCard />
        </div>
        <div className='w-full'>
          <TopExhibitCard />
        </div>
      </section>

      {/* Charts */}
      <section className='flex flex-row w-full gap-4 justify-between'>
        <div className='min-w-3/4 min-h-full'>
          <UserSignUpChart />
        </div>
        <div className='w-full h-full'>
          <LanguageUsageCard />
        </div>
      </section>

      <section>
        <AudioPlaysByExhibitChart />
      </section>
    </div>
  );
}
