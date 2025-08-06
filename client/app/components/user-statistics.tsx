import { Progress } from './ui/progress';
import {
  AudioLines,
  AudioLinesIcon,
  Headphones,
  Headset,
  Landmark,
  Loader2,
  QrCode,
  Search,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import useApiPrivate from '~/hooks/useApiPrivate';

// QR Scan Count
export function UserQRCodeScanCount() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  // TODO Set Loading

  useEffect(() => {
    const fetchQRStats = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/qr');
        setCount(res.data?.data?.totalQRScans ?? 0);
      } catch {
        setCount(null);
      }
    };
    fetchQRStats();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <QrCode />
        <h1>
          {count ?? <Loader2 className='text-muted-foreground animate-spin' />}
        </h1>
      </div>
      <div className='text-sm'>QR Codes Scanned</div>
    </div>
  );
}

export function UserExhibitsDiscovered() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchQRStats = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/qr');
        setCount(res.data?.data?.totalQRScans ?? 0);
      } catch {
        setCount(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQRStats();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <Search />
        {!isLoading ? (
          <h1>
            {count} / {count}
          </h1>
        ) : (
          <Loader2 className='animate-spin' />
        )}
      </div>
      <div className='text-sm'>Exhibits Discovered (TOFIX)</div>
    </div>
  );
}

// Top Visited Exhibit by QR
export function UserTopVisitedExhibit() {
  const apiPrivate = useApiPrivate();
  const [top, setTop] = useState<{
    exhibitId: string;
    title: string;
  } | null>(null);
  // TODO Set Loading
  // TODO BUG: Top Exhibit doesnt load for guest

  useEffect(() => {
    const fetchTopExhibit = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/qr');
        setTop(res.data?.data?.topVisitedExhibit ?? null);
      } catch {
        setTop(null);
      }
    };
    fetchTopExhibit();
  }, [apiPrivate]);

  return (
    <div className='rounded-xl p-4 w-fit bg-red-400/70'>
      <div className='flex flex-col gap-2 font-semibold'>
        <div className='flex flex-row gap-1 items-center'>
          <Landmark /> <h1>Top Exhibit</h1>
        </div>
        <h1 className='text-2xl'>
          {top?.title ?? <Loader2 className='animate-spin' />}
        </h1>
      </div>
    </div>
  );
}

// Audio Play Count
export function UserAudioPlayCount() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  // TODO Set Loading

  useEffect(() => {
    const fetchAudioCompletions = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/audio');
        setCount(res.data.data?.totalAudioPlays ?? 0);
      } catch {
        setCount(null);
      }
    };
    fetchAudioCompletions();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <Headphones />
        <h1>
          {count ?? <Loader2 className='text-muted-foreground animate-spin' />}
        </h1>
      </div>
      <div className='text-sm'>Audio Playbacks</div>
    </div>
  );
}

// Audio Completion Count
export function UserAudioCompletionRate() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  // TODO Set Loading

  useEffect(() => {
    const fetchAudioCompletions = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/audio');
        setCount(res.data?.data?.totalAudioCompletions ?? 0);
      } catch {
        setCount(null);
      }
    };
    fetchAudioCompletions();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <AudioLines />
        <h1>
          {count ?? <Loader2 className='text-muted-foreground animate-spin' />}
        </h1>
      </div>
      <div className='text-sm'>Audio Completions</div>
    </div>
  );
}

export function UserExhibitProgress() {
  return (
    <div className='flex flex-row w-full gap-5 items-center'>
      <h1 className='w-fit'>Progress: </h1>
      <p>33%</p>
      <Progress value={33} className='w-full' />
    </div>
  );
}
