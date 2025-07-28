import { SectionCards, ChartAreaInteractive } from './statistics/users';
import { LanguageStatistics } from './statistics/language';
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

export default function AdminHomePage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className='space-y-6 px-4 py-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold'>
          Singapore Discovery Centre Admin Dashboard
        </h1>

        {/* Dropdown Select that controls content */}
        <Select value={activeTab} onValueChange={setActiveTab}>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select View' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='users'>Users</SelectItem>
            <SelectItem value='languages'>Languages</SelectItem>
            <SelectItem value='qr-codes'>QR Codes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Hidden Tabs - only content is shown, no tab buttons */}
      <Tabs value={activeTab} className='w-full'>
        <TabsContent value='users' className='space-y-6'>
          <SectionCards />
          <ChartAreaInteractive />
        </TabsContent>

        <TabsContent value='languages' className='space-y-6'>
          <LanguageStatistics />
        </TabsContent>

        <TabsContent value='qr-codes' className='space-y-6'>
          <div className='text-center py-12'>
            <h2 className='text-2xl font-semibold mb-4'>QR Code Statistics</h2>
            <p className='text-muted-foreground'>
              QR code scan analytics will be displayed here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
