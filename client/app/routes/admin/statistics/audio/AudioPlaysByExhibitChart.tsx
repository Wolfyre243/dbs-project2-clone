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

export default function AudioPlaysByExhibitChart() {
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
        const res = await apiPrivate.get(
          '/statistics/audio-plays-per-exhibit',
          { params },
        );
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
      Exhibit: item.title,
      'Play Count': item.playCount,
    }));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(
      wb,
      XLSXUtils.json_to_sheet(sheet),
      'Audio Plays',
    );
    XLSXWriteFile(wb, 'audio-plays-by-exhibit.csv');
  };

  // PNG export can be implemented with html2canvas or similar if needed

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Plays by Exhibit</CardTitle>
        <CardDescription>
          Number of times audio was played per exhibit
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
        <ChartContainer config={{ playCount: { label: 'Play Count' } }}>
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis dataKey='title' />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey='playCount' fill='var(--chart-1)' />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
