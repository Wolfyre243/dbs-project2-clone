import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  Bar,
  BarChart,
  CartesianGrid,
  Area,
  AreaChart,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

import { Button } from '~/components/ui/button';
import useApiPrivate from '~/hooks/useApiPrivate';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import { DownloadIcon } from 'lucide-react';

export function QRScanDashboard() {
  const apiPrivate = useApiPrivate();

  const [granularity, setGranularity] = useState<'day' | 'month' | 'year'>(
    'month',
  );
  const [barData, setBarData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const fetchData = async () => {
    try {
      const res = await apiPrivate.get('/statistics/scans-per-exhibit', {
        params: { granularity },
      });

      const data = res.data.data;
      const bar = data.map((ex: any) => ({
        exhibit: ex.title,
        scans: ex.scanCount,
      }));

      const line: any[] = [];
      data.forEach((ex: any) => {
        ex.scanDates.forEach((entry: any) => {
          const found = line.find((l) => l.label === entry.date);
          if (found) {
            found.totalScans += entry.count;
          } else {
            line.push({
              label: entry.date,
              totalScans: entry.count,
              uniqueExhibits: 1,
            });
          }
        });
      });

      line.sort(
        (a, b) => new Date(a.label).getTime() - new Date(b.label).getTime(),
      );

      const totalScans = bar.reduce((sum: any, b: any) => sum + b.scans, 0);
      const uniqueExhibits = data.length;

      setBarData(bar);
      setLineData(line);
      setSummary({
        totalScans,
        uniqueExhibits,
        dateRange: 'Based on scan dates',
      });
    } catch (err) {
      console.error('Failed to fetch QR scan data', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [granularity]);

  const chartConfig: ChartConfig = {
    scans: {
      label: 'Total Scans',
      color: 'var(--chart-1)',
    },
    totalScans: {
      label: 'Total Scans',
      color: 'var(--chart-1)',
    },
  };

  const handleDownloadAllCSV = () => {
    const exhibitSheet = barData.map((item, index) => ({
      Ranking: index + 1,
      Exhibit: item.exhibit,
      Scans: item.scans,
    }));

    const trendSheet = lineData.map((item) => ({
      Date: item.label,
      'Total Scans': item.totalScans,
    }));

    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(
      wb,
      XLSXUtils.json_to_sheet(exhibitSheet),
      'Exhibit Breakdown',
    );
    XLSXUtils.book_append_sheet(
      wb,
      XLSXUtils.json_to_sheet(trendSheet),
      'Scan Trends',
    );

    XLSXWriteFile(wb, `QR-Scan-Statistics-${granularity}.xlsx`);
  };

  return (
    <div className='grid grid-cols-1 gap-6'>
      <div className='flex justify-start sm:justify-end'>
        <Button
          className='mb-2'
          size='sm'
          variant='secondary'
          onClick={handleDownloadAllCSV}
        >
          {' '}
          <DownloadIcon />
          Download
        </Button>
      </div>
      {/* TOP ROW: Bar Chart + Table */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card className='flex flex-col '>
          <CardHeader>
            <CardTitle>QR Scans by Exhibit</CardTitle>
            <CardDescription>Top scanned exhibits</CardDescription>
          </CardHeader>
          <CardContent className='overflow-x-auto sm:overflow-x-visible'>
            <div className='min-w-[450px] sm:min-w-0'>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width='100%' height={250}>
                  <BarChart
                    data={barData}
                    layout='vertical'
                    margin={{ left: 40, bottom: 30, top: 40 }}
                  >
                    <CartesianGrid horizontal={false} vertical={true} />
                    <XAxis
                      type='number'
                      dataKey='scans'
                      tickLine={false}
                      axisLine={true}
                      allowDecimals={false}
                      label={{ value: 'Scans', position: 'bottom', offset: 10 }}
                    />
                    <YAxis
                      dataKey='exhibit'
                      type='category'
                      tickLine={false}
                      tickMargin={10}
                      width={120}
                      axisLine={true}
                      label={{ value: 'Exhibit', position: 'top' }}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel={false} />}
                    />
                    <Bar dataKey='scans' fill='var(--chart-1)' radius={5} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exhibit Breakdown</CardTitle>
            <CardDescription>Top scanned exhibits summary</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>Exhibit QR scan stats</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className='text-left'>Ranking</TableHead>
                  <TableHead>Exhibit</TableHead>
                  <TableHead className='text-left'>Scans</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barData.map((item, index) => (
                  <TableRow key={item.exhibit}>
                    <TableCell className='text-left'>{index + 1}</TableCell>
                    <TableCell>{item.exhibit}</TableCell>
                    <TableCell className='text-left'>{item.scans}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM ROW: Area Chart */}
      <Card>
        <CardHeader className='flex flex-wrap justify-between items-start gap-2'>
          <div>
            <CardTitle>QR Scans Over Time</CardTitle>
            <CardDescription>
              Viewing by <span className='capitalize'>{granularity}</span>
            </CardDescription>
          </div>
          <div className='flex flex-wrap gap-2'>
            {['day', 'month', 'year'].map((g) => (
              <Button
                key={g}
                size='sm'
                variant={granularity === g ? 'default' : 'outline'}
                onClick={() => setGranularity(g as 'day' | 'month' | 'year')}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className='pb-4 overflow-x-auto sm:overflow-x-visible'>
          <div className='min-w-[500px] sm:min-w-0'>
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width='100%' height={220}>
                <AreaChart
                  data={lineData}
                  margin={{ top: 10, bottom: 30, left: 40, right: 20 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey='label'
                    tickLine={false}
                    axisLine={true}
                    tickMargin={8}
                    label={{
                      value: 'Date',
                      position: 'insideBottom',
                      offset: -20,
                    }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={true}
                    tickMargin={10}
                    label={{
                      value: 'Total Scans',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Area
                    type='monotone'
                    dataKey='totalScans'
                    stroke='var(--color-totalScans)'
                    fill='var(--color-totalScans)'
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </CardContent>

        {summary && (
          <CardFooter className='text-sm text-muted-foreground'>
            Showing total scans: {summary.totalScans}
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
