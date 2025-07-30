// QRScanCountCard.tsx
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

export function QRScanCountCard() {
  const apiPrivate = useApiPrivate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalScans, setTotalScans] = useState<number | null>(null);
  const [uniqueExhibits, setUniqueExhibits] = useState<number | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiPrivate.get('/statistics/scans-per-exhibit');
        const data = res.data.data;
        if (!Array.isArray(data) || data.length === 0) {
          setTotalScans(0);
          setUniqueExhibits(0);
          return;
        }
        const total = data.reduce(
          (sum: number, ex: any) => sum + (ex.scanCount || 0),
          0,
        );
        setTotalScans(total);
        setUniqueExhibits(data.length);
      } catch (err) {
        setError('Failed to load QR scan stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [apiPrivate]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Loading...</CardDescription>
          <CardTitle className='text-2xl font-semibold'>---</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardDescription>Error</CardDescription>
          <CardTitle className='text-2xl font-semibold'>{error}</CardTitle>
        </CardHeader>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardDescription>QR Code Scans</CardDescription>
        <CardTitle className='text-2xl font-semibold'>
          {totalScans !== null ? totalScans.toLocaleString() : 'N/A'}
        </CardTitle>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        {uniqueExhibits !== null && (
          <div>
            <Badge variant='outline'>Exhibits Scanned: {uniqueExhibits}</Badge>
          </div>
        )}
        <div className='text-muted-foreground'>
          Total QR code scans across all exhibits
        </div>
      </CardFooter>
    </Card>
  );
}

export default QRScanCountCard;
