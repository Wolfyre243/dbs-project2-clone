// AudioCompletionRateCard.tsx
import { useEffect, useState } from 'react';
import useApiPrivate from '~/hooks/useApiPrivate';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '~/components/ui/card';
import AnimatedCard from '~/components/animations/AnimatedCard';
import { Badge } from '~/components/ui/badge';
import CountUp from '~/components/animations/CountUp';

function truncateDecimal(num: number, decimalPlaces: number) {
  const multiplier = Math.pow(10, decimalPlaces);
  return Math.trunc(num * multiplier) / multiplier;
}

export function AudioCompletionRateCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [overallRate, setOverallRate] = useState<number | null>(null);
  const [topExhibit, setTopExhibit] = useState<{
    title: string;
    rate: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiPrivate.get('/statistics/audio-completion-rates');
        const data = res.data.data;
        if (!Array.isArray(data) || data.length === 0) {
          setOverallRate(0);
          setTopExhibit(null);
          return;
        }
        // Compute overall completion rate (weighted by started count)
        let totalStarted = 0;
        let totalCompleted = 0;
        let exhibitRates: Record<
          string,
          { title: string; started: number; completed: number }
        > = {};
        data.forEach((item: any) => {
          totalStarted += item.started;
          totalCompleted += item.completed;
          if (item.title) {
            if (!exhibitRates[item.title]) {
              exhibitRates[item.title] = {
                title: item.title,
                started: 0,
                completed: 0,
              };
            }
            exhibitRates[item.title].started += item.started;
            exhibitRates[item.title].completed += item.completed;
          }
        });
        const overall =
          totalStarted > 0
            ? +((totalCompleted / totalStarted) * 100).toFixed(1)
            : 0;
        setOverallRate(overall);

        // Find exhibit with highest completion rate (min 10 starts for stability)
        let best: { title: string; rate: number } | null = null;
        Object.values(exhibitRates).forEach((ex) => {
          if (ex.started >= 10) {
            const rate =
              ex.started > 0
                ? +((ex.completed / ex.started) * 100).toFixed(1)
                : 0;
            if (!best || rate > best.rate) {
              best = { title: ex.title, rate };
            }
          }
        });
        setTopExhibit(best);
      } catch (err) {
        setError('Failed to load audio completion stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  if (loading) {
    return (
      <AnimatedCard>
        <Card className='bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Loading...</CardDescription>
            <CardTitle className='text-2xl font-semibold'>---</CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  if (error) {
    return (
      <AnimatedCard>
        <Card className='bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
          <CardHeader>
            <CardDescription>Error</CardDescription>
            <CardTitle className='text-2xl font-semibold'>{error}</CardTitle>
          </CardHeader>
        </Card>
      </AnimatedCard>
    );
  }
  return (
    <AnimatedCard>
      <Card className='bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>Audio Completion Rate</CardDescription>
          <CardTitle className='text-2xl font-semibold'>
            {overallRate !== null ? (
              <>
                <CountUp
                  from={0}
                  to={truncateDecimal(overallRate, 1)}
                  separator=','
                  direction='up'
                  duration={1}
                />
                %
              </>
            ) : (
              <p>N/A</p>
            )}
          </CardTitle>
        </CardHeader>
        <CardFooter className='flex-col items-start gap-1.5 text-sm'>
          {topExhibit && (
            <div>
              <Badge variant='outline'>
                Top Exhibit: {topExhibit.title} ({topExhibit.rate}%)
              </Badge>
            </div>
          )}
          <div className='text-muted-foreground'>
            % of users who completed audio
          </div>
        </CardFooter>
      </Card>
    </AnimatedCard>
  );
}

export default AudioCompletionRateCard;
