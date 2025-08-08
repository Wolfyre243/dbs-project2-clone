import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import {
  SectionCards,
  UserAnalyticsDashboard,
  UserSignUpChart,
} from './statistics/users';
import { LanguageStatistics } from './statistics/language';
import { QRScanDashboard } from './statistics/qrCode/QrCodeGraphs';
import AudioStatisticsDashboard from './statistics/audio/page';
import { useState } from 'react';

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });

  return (
    <div className='space-y-6 px-4 py-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold'>Analytics</h1>

        {/* Dropdown Select that controls content */}
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select View' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='users'>Users</SelectItem>
            <SelectItem value='languages'>Languages</SelectItem>
            <SelectItem value='qr-codes'>QR Codes</SelectItem>
            <SelectItem value='audio'>Audio Engagement</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <section>
        {/* Hidden Tabs - only content is shown, no tab buttons */}
        <Tabs value={activeTab} className='w-full'>
          <TabsContent value='users' className='space-y-6'>
            <UserAnalyticsDashboard />
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
        </Tabs>
      </section>
    </div>
  );
}
