import { useEffect, useState } from 'react';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Badge } from '~/components/ui/badge';
import { DatePicker } from '~/components/date-picker';
import useApiPrivate from '~/hooks/useApiPrivate';
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from 'xlsx';
import { Button } from '~/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { TrendingUp } from 'lucide-react';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from '~/components/ui/card';
import AnimatedCard from '~/components/animations/AnimatedCard';

import {
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  Pie,
  PieChart,
} from 'recharts';

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '~/components/ui/chart';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import CountUp from '~/components/animations/CountUp';

// TypeScript interface for chart data
interface ChartDataItem {
  date: string;
  totalCount: number;
  dailySignups: number;
}

const chartConfig = {
  totalCount: {
    label: 'Cumulative Sign-Ups',
    color: 'var(--chart-1)',
  },
  dailySignups: {
    label: 'Sign Ups:',
    color: 'var(--chart-2)',
  },
};

// Individual card components

export function TotalUsersCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [monthRegistrations, setMonthRegistrations] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiPrivate.get('/statistics/count-of-users');
        setTotalUsers(response.data.data.totalUsers || 0);
        setMonthRegistrations(response.data.data.registrations?.thisMonth || 0);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  if (loading) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Loading...</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ---
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  if (error) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {error}
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  return (
    <AnimatedCard>
      <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            <CountUp
              from={0}
              to={totalUsers}
              separator=','
              direction='up'
              duration={1}
            />
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{monthRegistrations}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            New users total <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Excludes admin users</div>
        </CardFooter>
      </Card>
    </AnimatedCard>
  );
}

export function TodayRegistrationsCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [todayRegistrations, setTodayRegistrations] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiPrivate.get('/statistics/count-of-users');
        setTodayRegistrations(response.data.data.registrations?.today || 0);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  if (loading) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Loading...</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ---
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  if (error) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {error}
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  return (
    <AnimatedCard>
      <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>Today's Registrations</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            <CountUp
              from={0}
              to={todayRegistrations}
              separator=','
              direction='up'
              duration={1}
            />
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{todayRegistrations}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            New users today <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Daily sign-ups </div>
        </CardFooter>
      </Card>
    </AnimatedCard>
  );
}

export function MonthRegistrationsCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthRegistrations, setMonthRegistrations] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiPrivate.get('/statistics/count-of-users');
        setMonthRegistrations(response.data.data.registrations?.thisMonth || 0);
        setTotalUsers(response.data.data.totalUsers || 0);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  const percent = ((monthRegistrations / (totalUsers || 1)) * 100).toFixed(1);

  if (loading) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Loading...</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ---
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  if (error) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {error}
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  return (
    <AnimatedCard>
      <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>This Month</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            <CountUp
              from={0}
              to={monthRegistrations}
              separator=','
              direction='up'
              duration={1}
            />
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{percent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Monthly growth <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Registrations this month</div>
        </CardFooter>
      </Card>
    </AnimatedCard>
  );
}

export function YearRegistrationsCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearRegistrations, setYearRegistrations] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiPrivate.get('/statistics/count-of-users');
        setYearRegistrations(response.data.data.registrations?.thisYear || 0);
        setTotalUsers(response.data.data.totalUsers || 0);
      } catch (err) {
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  const percent = ((yearRegistrations / (totalUsers || 1)) * 100).toFixed(1);

  if (loading) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Loading...</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              ---
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  if (error) {
    return (
      <AnimatedCard>
        <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {error}
            </CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  return (
    <AnimatedCard>
      <Card className='@container/card bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>This Year</CardDescription>
          <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
            <CountUp
              from={0}
              to={yearRegistrations}
              separator=','
              direction='up'
              duration={1}
            />
          </CardTitle>
          <CardAction>
            <Badge variant='outline'>
              <IconTrendingUp />+{percent}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          <div className='line-clamp-1 flex gap-2 font-medium'>
            Yearly growth <IconTrendingUp className='size-4' />
          </div>
          <div className='text-muted-foreground'>Annual registrations</div>
        </CardFooter>
      </Card>
    </AnimatedCard>
  );
}

export function SectionCards() {
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:overflow-visible sm:flex-wrap'>
      <div className='min-w-[250px] flex-1'>
        <TotalUsersCard />
      </div>
      <div className='min-w-[250px] flex-1'>
        <TodayRegistrationsCard />
      </div>
      <div className='min-w-[250px] flex-1'>
        <MonthRegistrationsCard />
      </div>
      <div className='min-w-[250px] flex-1'>
        <YearRegistrationsCard />
      </div>
    </div>
  );
}

export function UserSignUpChart() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [totalMembers, setTotalMembers] = useState(0);

  const [filters, setFilters] = useState({
    gender: 'All',
    ageGroup: 'All',
    granularity: 'day',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiPrivate.get(
          '/statistics/display-member-sign-ups',
          {
            params: {
              gender: filters.gender,
              ageGroup: filters.ageGroup,
              granularity: filters.granularity,
            },
          },
        );

        const rawData = res.data.data.timeSeries.data;

        const formatted = rawData.map((item: any, index: number) => {
          const dailyTotal =
            (item.Children || 0) +
            (item.Youth || 0) +
            (item.Adults || 0) +
            (item.Seniors || 0) +
            (item.Unknown || 0);
          return {
            date: item.period,
            totalCount: dailyTotal,
            dailySignups: dailyTotal,
          };
        });

        setChartData(formatted);
        setTotalMembers(res.data.data.summary.totalMembers);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, apiPrivate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px] flex items-center justify-center'>
          <div>Loading chart data...</div>
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent className='h-[300px] flex items-center justify-center'>
          <div className='text-red-500'>{error}</div>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className='h-full bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
      <CardHeader className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <CardTitle>Member Sign-Ups Over Time</CardTitle>
          <CardDescription>
            Total: {totalMembers.toLocaleString()} members
          </CardDescription>
        </div>
        <div className='flex flex-wrap gap-2'>
          <Select
            value={filters.gender}
            onValueChange={(val) => setFilters((f) => ({ ...f, gender: val }))}
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Gender' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>All Genders</SelectItem>
              <SelectItem value='M'>Male</SelectItem>
              <SelectItem value='F'>Female</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.ageGroup}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, ageGroup: val }))
            }
          >
            <SelectTrigger className='w-[140px]'>
              <SelectValue placeholder='Age Group' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='All'>All Ages</SelectItem>
              <SelectItem value='Children'>Children (1 - 13)</SelectItem>
              <SelectItem value='Youth'>Youth (14 - 18)</SelectItem>
              <SelectItem value='Adults'>Adults (19 - 64)</SelectItem>
              <SelectItem value='Seniors'>Seniors (65+)</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.granularity}
            onValueChange={(val) =>
              setFilters((f) => ({ ...f, granularity: val }))
            }
          >
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Period' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='day'>Day</SelectItem>
              <SelectItem value='month'>Month</SelectItem>
              <SelectItem value='year'>Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        <ChartContainer config={chartConfig} className='h-[300px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id='fillDaily' x1='0' y1='0' x2='0' y2='1'>
                  <stop
                    offset='5%'
                    stopColor='var(--chart-2)'
                    stopOpacity={0.8}
                  />
                  <stop
                    offset='95%'
                    stopColor='var(--chart-2)'
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='date'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-SG', {
                    month: 'short',
                    day: filters.granularity === 'day' ? 'numeric' : undefined,
                    year: filters.granularity !== 'day' ? 'numeric' : undefined,
                  });
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString('en-SG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                    indicator='dot'
                  />
                }
              />
              <Line
                type='monotone'
                dataKey='dailySignups'
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
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
