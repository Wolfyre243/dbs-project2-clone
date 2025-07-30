import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
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
import useApiPrivate from '~/hooks/useApiPrivate';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';

interface LanguageData {
  rank: number;
  languageCode: string;
  languageName: string;
  userCount: number;
  percentage: number;
}

interface ApiResponse {
  status: string;
  data: {
    summary: {
      totalUsers: number;
      totalLanguagesUsed: number;
      dateRange: string;
      topLanguagesCount: number;
    };
    topLanguages: LanguageData[];
    mostPopular: LanguageData | null;
    allLanguageStats: LanguageData[];
  };
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#a855f7',
  '#f43f5e',
  '#6366f1',
  '#ec4899',
  '#f87171',
  '#14b8a6',
  '#84cc16',
  '#eab308',
  '#8b5cf6',
  '#000000',
];

const chartConfig: ChartConfig = {
  users: { label: 'Users' },
};

type PieData = {
  language: string;
  users: number;
  fill: string;
};

export function LanguageUsageCard() {
  const apiPrivate = useApiPrivate();
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [summary, setSummary] = useState<ApiResponse['data']['summary'] | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<string>('5');

  useEffect(() => {
    const fetchLanguageStats = async () => {
      try {
        setLoading(true);
        const query = limit === 'all' ? '' : `?limit=${limit}`;
        const res = await apiPrivate.get(
          `/statistics/display-common-languages-used${query}`,
        );
        setLanguageData(res.data.data.topLanguages);
        setSummary(res.data.data.summary);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguageStats();
  }, [limit]);

  const pieData = languageData.map((lang, i) => ({
    language: lang.languageName,
    users: lang.userCount,
    fill: COLORS[i % COLORS.length],
  }));

  const totalUsers = summary?.totalUsers || 0;

  if (loading)
    return (
      <p className='text-muted-foreground'>Loading language statistics...</p>
    );
  if (error) return <div className='text-red-500'>Error: {error}</div>;
  if (languageData.length === 0) return <p>No language data available.</p>;

  return (
    <Card className='flex flex-col'>
      <CardHeader className='items-center pb-0 gap-2'>
        <div className='flex items-center justify-between w-full'>
          <div>
            <CardTitle>Language Usage Distribution</CardTitle>
            <CardDescription>Most Popular Languages</CardDescription>
          </div>
          <Select value={limit} onValueChange={setLimit}>
            <SelectTrigger className='w-[120px]'>
              <SelectValue placeholder='Top 5' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='3'>Top 3</SelectItem>
              <SelectItem value='5'>Top 5</SelectItem>
              <SelectItem value='10'>Top 10</SelectItem>
              <SelectItem value='all'>Show All</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className='flex-1 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[250px] pb-0'
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={pieData}
              dataKey='users'
              nameKey='language'
              outerRadius='80%'
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='flex-col gap-2 text-sm'>
        <div className='flex items-center gap-2 font-medium'>
          Total users: {totalUsers} <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground'>
          Showing {limit === 'all' ? 'all' : `top ${limit}`} languages used by
          members
        </div>
      </CardFooter>
    </Card>
  );
}

export function LanguageDetailsCard() {
  const apiPrivate = useApiPrivate();
  const [languageData, setLanguageData] = useState<LanguageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguageStats = async () => {
      try {
        setLoading(true);
        const res = await apiPrivate.get(
          `/statistics/display-common-languages-used`,
        );
        setLanguageData(res.data.data.topLanguages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLanguageStats();
  }, []);

  if (loading)
    return <p className='text-muted-foreground'>Loading language details...</p>;
  if (error) return <div className='text-red-500'>Error: {error}</div>;
  if (languageData.length === 0) return <p>No language data available.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Language Details</CardTitle>
        <CardDescription>Detailed breakdown of language usage</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Language preferences by user count</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Percentage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {languageData.map((lang, index) => (
              <TableRow key={lang.languageCode}>
                <TableCell className='font-medium'>#{lang.rank}</TableCell>
                <TableCell className='flex items-center gap-2'>
                  <span
                    className='w-3 h-3 rounded-full'
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  {lang.languageName}
                </TableCell>
                <TableCell>{lang.userCount}</TableCell>
                <TableCell className='text-left'>{lang.percentage}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function LanguageStatistics() {
  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
      <LanguageUsageCard />
      <LanguageDetailsCard />
    </div>
  );
}
