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

export default function AverageListenDurationLineChart({
  dateRange,
}: {
  dateRange: any;
}) {
  const apiPrivate = useApiPrivate();
  const [data, setData] = useState([]);
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
          '/statistics/average-listen-duration-time-series',
          {
            params,
          },
        );
        // Only update if data is different
        if (!deepEqualArray(res.data.data, data)) {
          setData(res.data.data);
        }
      } catch (e) {
        setError('Failed to load listen duration data');
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
      'Average Duration (s)': item.avgDuration,
      Count: item.count,
    }));
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(
      wb,
      XLSXUtils.json_to_sheet(sheet),
      'Average Listen Duration',
    );
    XLSXWriteFile(wb, 'average-listen-duration-time-series.csv');
  };

  return (
    <Card className='h-full bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
      <CardHeader>
        <div className='flex flex-row justify-between'>
          <div>
            <CardTitle>Average Listen Duration Trends</CardTitle>
            <CardDescription>
              Cumulative average listen duration over time
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
        {data.length === 0 && (
          <div>
            <h1>No data found.</h1>
          </div>
        )}

        {/* !loading && !error &&  */}
        {data.length > 0 && (
          <ChartContainer
            className='w-full aspect-auto h-[250px]'
            config={{ avgDuration: { label: 'Average Duration (s)' } }}
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
                dataKey='avgDuration'
                stroke='var(--chart-3)'
                strokeWidth={2}
                dot={{
                  fill: 'var(--chart-3)',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: 'var(--chart-3)',
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
