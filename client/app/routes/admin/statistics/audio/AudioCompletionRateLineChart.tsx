import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { DatePicker } from '~/components/date-picker';
import { Button } from '~/components/ui/button';
import { DownloadIcon, Loader2 } from 'lucide-react';
import useApiPrivate from '~/hooks/useApiPrivate';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import deepEqualArray from '~/lib/equality';

export default function AudioCompletionRateLineChart() {
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      // setLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (dateRange.startDate)
          params.startDate = dateRange.startDate.toISOString();
        if (dateRange.endDate) params.endDate = dateRange.endDate.toISOString();
        const res = await apiPrivate.get(
          '/statistics/audio-completion-rates-time-series',
          {
            params,
          },
        );
        // Only update if data is different
        if (!deepEqualArray(res.data.data, data)) {
          setData(res.data.data);
        }
      } catch (e) {
        setError('Failed to load completion rate data');
        setData([]);
      } finally {
        // setLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [dateRange, apiPrivate, data]);

  const handleExportCSV = () => {
    if (data.length === 0) return;

    const sheet = data.map((item: any) => ({
      Date: item.date,
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
    XLSXWriteFile(wb, 'audio-completion-rate-time-series.csv');
  };

  return (
    <Card className='h-full bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
      <CardHeader>
        <div className='flex flex-row justify-between'>
          <div>
            <CardTitle>Audio Completion Rate Trends</CardTitle>
            <CardDescription>
              Cumulative completion rate over time
            </CardDescription>
          </div>
          <Button
            size='sm'
            variant='secondary'
            onClick={handleExportCSV}
            disabled={data.length === 0}
          >
            <DownloadIcon className='mr-1' /> Export CSV
          </Button>
        </div>
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
        </div>

        {/* {loading && (
          <div className='h-[300px] flex items-center justify-center'>
            <div className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin' />
              <span>Loading completion rate data...</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className='h-[300px] flex items-center justify-center'>
            <div className='text-center text-muted-foreground'>
              <p className='text-red-500 mb-2'>{error}</p>
              <p className='text-sm'>Please try again later</p>
            </div>
          </div>
        )}
        
        {!loading && !error && data.length === 0 && (
          <div className='h-[300px] flex items-center justify-center'>
            <div className='text-center text-muted-foreground'>
              <p className='mb-2'>No completion rate data available</p>
              <p className='text-sm'>Try adjusting your date range</p>
            </div>
          </div>
        )} */}

        {/* !loading && !error &&  */}
        {data.length > 0 && (
          <ChartContainer
            className='w-full aspect-auto h-[250px]'
            config={{ completionRate: { label: 'Completion Rate (%)' } }}
          >
            <LineChart data={data}>
              <CartesianGrid strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-SG', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <YAxis allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('en-SG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });
                    }}
                  />
                }
              />
              <Line
                type='monotone'
                dataKey='completionRate'
                stroke='var(--chart-2)'
                strokeWidth={2}
                dot={{
                  fill: 'var(--chart-2)',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: 'var(--chart-2)',
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
