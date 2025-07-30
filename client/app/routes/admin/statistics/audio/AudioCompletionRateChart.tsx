import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '~/components/ui/card';
import { ChartContainer } from '~/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DatePicker } from '~/components/date-picker';
import { Button } from '~/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import useApiPrivate from '~/hooks/useApiPrivate';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';

export default function AudioCompletionRateChart() {
  const apiPrivate = useApiPrivate();
  const [data, setData] = useState([]);
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (dateRange.startDate)
          params.startDate = dateRange.startDate.toISOString();
        if (dateRange.endDate) params.endDate = dateRange.endDate.toISOString();
        const res = await apiPrivate.get('/statistics/audio-completion-rates', {
          params,
        });
        setData(res.data.data);
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dateRange, apiPrivate]);

  const handleExportCSV = () => {
    const sheet = data.map((item: any) => ({
      Audio: item.fileName,
      Exhibit: item.title,
      Started: item.started,
      Completed: item.completed,
      'Completion Rate (%)': item.completionRate,
    }));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(
      wb,
      XLSXUtils.json_to_sheet(sheet),
      'Audio Completion Rate',
    );
    XLSXWriteFile(wb, 'audio-completion-rate.csv');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Completion Rate</CardTitle>
        <CardDescription>
          Completion rate of each audio (completed/started)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-4 mb-4 items-center'>
          <div className='flex gap-2 items-center'>
            <span>Start:</span>
            <DatePicker
              fieldName='startDate'
              label=''
              onChange={(val: string) =>
                setDateRange((prev) => ({
                  ...prev,
                  startDate: val ? new Date(val) : null,
                }))
              }
            />
            <span>End:</span>
            <DatePicker
              fieldName='endDate'
              label=''
              onChange={(val: string) =>
                setDateRange((prev) => ({
                  ...prev,
                  endDate: val ? new Date(val) : null,
                }))
              }
            />
          </div>
          <Button size='sm' variant='secondary' onClick={handleExportCSV}>
            <DownloadIcon className='mr-1' /> Export CSV
          </Button>
        </div>
        <ChartContainer
          config={{ completionRate: { label: 'Completion Rate (%)' } }}
        >
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='fileName' />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey='completionRate' fill='var(--chart-2)' />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
