// TopExhibitCard.tsx
import { useEffect, useState } from 'react';
import useApiPrivate from '~/hooks/useApiPrivate';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';

export function TopExhibitCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [topExhibit, setTopExhibit] = useState<{
    title: string;
    scanCount: number;
  } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiPrivate.get('/statistics/scans-per-exhibit');
        const data = res.data.data;
        if (!Array.isArray(data) || data.length === 0) {
          setTopExhibit(null);
          return;
        }
        // Data is sorted by scanCount descending in backend
        const top = data[0];
        setTopExhibit({ title: top.title, scanCount: top.scanCount });
      } catch (err) {
        setError('Failed to load top exhibit');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  if (loading) {
    return (
      <Card className='bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>Loading...</CardDescription>
          <CardTitle className='text-2xl font-semibold'>---</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  if (error) {
    return (
      <Card className='bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
        <CardHeader>
          <CardDescription>Error</CardDescription>
          <CardTitle className='text-2xl font-semibold'>{error}</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card className='bg-gradient-to-t from-primary/5 to-card shadow-xs dark:bg-card'>
      <CardHeader>
        <CardDescription>Best Performing Exhibit</CardDescription>
        <CardTitle className='text-2xl font-semibold'>
          {topExhibit ? topExhibit.title : 'N/A'}
        </CardTitle>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        {topExhibit && (
          <div>
            <Badge variant='outline'>QR Scans: {topExhibit.scanCount}</Badge>
          </div>
        )}
        <div className='text-muted-foreground'>Most scanned exhibit</div>
      </CardFooter>
    </Card>
  );
}

export default TopExhibitCard;
