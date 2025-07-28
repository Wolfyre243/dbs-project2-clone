import { SectionCards, ChartAreaInteractive } from './statistics/statistics';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';

export default function AdminHomePage() {
  return (
    <div className='space-y-6 px-4 py-6'>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <h1 className='text-3xl font-bold'>
          Singapore Discovery Centre Admin Dashboard
        </h1>

        {/* Dropdown Select */}
        <Select defaultValue='Users'>
          <SelectTrigger className='w-[180px]'>
            <SelectValue placeholder='Select View' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='Users'>Users</SelectItem>
            <SelectItem value='Languages'>Languages</SelectItem>
            <SelectItem value='QR codes'>QR Codes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <SectionCards />
      <ChartAreaInteractive />
    </div>
  );
}
