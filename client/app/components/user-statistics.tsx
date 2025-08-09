import { Progress } from './ui/progress';
import {
  AudioLines,
  AudioWaveform,
  CircleEllipsis,
  CirclePause,
  ExternalLink,
  Frown,
  Headphones,
  Landmark,
  Loader2,
  PlayCircle,
  QrCode,
  Search,
  Star,
  StarOff,
  Volume2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import useApiPrivate from '~/hooks/useApiPrivate';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';
import { type CarouselApi } from '~/components/ui/carousel';
import { Button } from './ui/button';
import deepEqualArray from '~/lib/equality';
import { toast } from 'sonner';
import EventTypes from '~/eventTypeConfig';
import { Link } from 'react-router';

interface Exhibit {
  exhibitId: string;
  title: string;
  description: string;
  imageUrl?: string;
}

interface ActivityLog {
  eventId: string;
  entityId: string;
  entityName: string;
  eventType: string;
  eventTypeId: number;
  details: string;
  userId: string;
  timestamp: string;
}

// QR Scan Count
export function UserQRCodeScanCount() {
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
        <QrCode />
        {!isLoading ? <h1>{count}</h1> : <Loader2 className='animate-spin' />}
      </div>
      <div className='text-sm'>QR Codes Scanned</div>
    </div>
  );
}

export function UserExhibitsDiscovered() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchExhibitsDiscovered = async () => {
      try {
        const { data: res } = await apiPrivate.get('/exhibit/discovered');
        setCount(res.data.exhibitsDiscovered ?? 0);
        setTotal(res.data.totalCount ?? 0);
      } catch {
        setCount(null);
        setTotal(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExhibitsDiscovered();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <Search />
        {!isLoading ? (
          <h1>
            {count} / {total}
          </h1>
        ) : (
          <Loader2 className='animate-spin' />
        )}
      </div>
      <div className='text-sm'>Exhibits Discovered</div>
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchTopExhibit = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/qr');
        setTop(res.data?.data?.topVisitedExhibit ?? null);
      } catch {
        setTop(null);
      } finally {
        setIsLoading(false);
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
          {!isLoading ? (
            (top?.title ?? 'No data')
          ) : (
            <Loader2 className='animate-spin' />
          )}
        </h1>
      </div>
    </div>
  );
}

// Audio Play Count
// Audio Play Count
export function UserAudioPlayCount() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchAudioCompletions = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/audio');
        setCount(res.data.data?.totalAudioPlays ?? 0);
      } catch {
        setCount(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudioCompletions();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <Headphones />
        {!isLoading ? <h1>{count}</h1> : <Loader2 className='animate-spin' />}
      </div>
      <div className='text-sm'>Audio Playbacks</div>
    </div>
  );
}

// Audio Completion Count
export function UserAudioCompletionRate() {
  const apiPrivate = useApiPrivate();
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchAudioCompletions = async () => {
      try {
        const res = await apiPrivate.get('/user/statistics/audio');
        setCount(res.data?.data?.totalAudioCompletions ?? 0);
      } catch {
        setCount(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAudioCompletions();
  }, [apiPrivate]);

  return (
    <div className='rounded p-4 w-fit'>
      <div className='flex flex-row items-center gap-2 text-2xl font-bold'>
        <AudioLines />
        {!isLoading ? <h1>{count}</h1> : <Loader2 className='animate-spin' />}
      </div>
      <div className='text-sm'>Audio Completions</div>
    </div>
  );
}

export function UserExhibitProgress() {
  const apiPrivate = useApiPrivate();
  const [percentage, setPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const fetchExhibitsDiscovered = async () => {
      try {
        const { data: res } = await apiPrivate.get('/exhibit/discovered');
        setPercentage(
          (res.data.exhibitsDiscovered / res.data.totalCount) * 100,
        );
      } catch {
        setPercentage(0);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExhibitsDiscovered();
  }, [apiPrivate]);

  return (
    <div className='flex flex-row w-full gap-5 items-center'>
      <h1 className='w-fit'>Progress: </h1>
      <p>{isNaN(percentage) ? 0 : percentage.toFixed(1)}%</p>
      <Progress value={percentage} className='w-full z-10' />
    </div>
  );
}

export function UserFavouriteExhibitCard({ exhibit }: { exhibit?: Exhibit }) {
  const apiPrivate = useApiPrivate();

  const handleUnfavourite = async () => {
    try {
      const { data: responseData } = await apiPrivate.delete(
        `/exhibit/${exhibit?.exhibitId}/favorite`,
      );
      toast.success(responseData.message);
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data.message);
    }
  };

  return (
    <Card className='w-full h-full px-2 py-4 shadow'>
      <CardHeader className='p-2'>
        <CardTitle>{exhibit?.title}</CardTitle>
        <CardDescription>{exhibit?.description}</CardDescription>
        <CardAction>
          <Button asChild size={'icon'} variant={'ghost'}>
            <Link to={`/home/exhibits/${exhibit?.exhibitId}`}>
              <ExternalLink />
            </Link>
          </Button>
          <Button size={'icon'} variant={'ghost'} onClick={handleUnfavourite}>
            <StarOff className='size-4' />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='p-2'>
        {exhibit?.imageUrl && (
          <img
            src={exhibit?.imageUrl}
            className='rounded-md object-cover w-full h-60'
          />
        )}
      </CardContent>
    </Card>
  );
}

export function UserFavouriteExhibits() {
  const apiPrivate = useApiPrivate();
  const [api, setApi] = useState<CarouselApi>();
  const [count, setCount] = useState(0);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [exhibits, setExhibits] = useState<Exhibit[]>([]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchFavExhibits = async () => {
      // setIsLoading(true);

      try {
        const { data: responseData } =
          await apiPrivate.get('/exhibit/favorites');
        if (!deepEqualArray(responseData.data, exhibits)) {
          setExhibits(responseData.data);
        }
        // console.log("datA", responseData, exhibits, deepEqualArray(responseData.data, exhibits))
        setCount(responseData.data.length);
      } catch (error: any) {
        setExhibits([]);
        setError(error.response?.data.message);
      } finally {
        // setIsLoading(false);
      }
    };

    fetchFavExhibits();
    intervalId = setInterval(fetchFavExhibits, 2000); // Poll every 2s

    return () => {
      clearInterval(intervalId);
    };
  }, [apiPrivate, exhibits.length]);

  useEffect(() => {
    if (!api) {
      return;
    }

    // setCount(api.scrollSnapList().length);
    setIndex(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setIndex(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  return (
    <div className='flex flex-col gap-3 w-full'>
      <Carousel setApi={setApi}>
        <CarouselContent>
          {exhibits.length !== 0 ? (
            exhibits.map((exhibit: Exhibit) => {
              return (
                <CarouselItem className='md:basis-1/3'>
                  <UserFavouriteExhibitCard exhibit={exhibit} />
                </CarouselItem>
              );
            })
          ) : (
            <h1 className='flex flex-row gap-1 w-full text-muted-foreground/50 justify-center'>
              <Frown />
              No exhibits favourited yet!
            </h1>
          )}
        </CarouselContent>
      </Carousel>
      <p className='w-full text-sm text-muted-foreground text-center'>
        Exhibit {index} of {count}
      </p>
    </div>
  );
}

export function UserActivityLogItem({ activity }: { activity: ActivityLog }) {
  let activityIcon;
  switch (activity.eventTypeId) {
    case EventTypes.QR_SCANNED:
      activityIcon = <QrCode />;
      break;
    case EventTypes.AUDIO_COMPLETED:
      activityIcon = <Headphones />;
      break;
    case EventTypes.AUDIO_PAUSED:
      activityIcon = <CirclePause />;
      break;
    case EventTypes.AUDIO_STARTED:
      activityIcon = <PlayCircle />;
      break;
    case EventTypes.AUDIO_VOLUME_CHANGED:
      activityIcon = <Volume2 />;
      break;
    case EventTypes.AUDIO_SEEKED:
      activityIcon = <AudioWaveform />;
      break;
    case EventTypes.EXHIBIT_FAVOURITED:
      activityIcon = <Star />;
      break;
    case EventTypes.EXHIBIT_UNFAVOURITED:
      activityIcon = <StarOff />;
      break;
    default:
      activityIcon = <CircleEllipsis />;
      break;
  }

  return (
    <div className='flex flex-row items-center gap-2 px-2 py-4 bg-accent rounded-md shadow'>
      {activityIcon}
      <div className='flex flex-col'>
        <h1 className='font-semibold'>
          {activity.eventType.replace('_', ' ')}
        </h1>
      </div>
      <div className='flex-1 text-right text-xs text-muted-foreground'>
        {new Date(activity.timestamp).toLocaleString()}
      </div>
    </div>
  );
}

export function UserRecentActivity() {
  const apiPrivate = useApiPrivate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchActivity = async () => {
      setIsLoading(true);

      try {
        const { data: responseData } = await apiPrivate.get(
          '/user/recent-activity',
        );
        if (!deepEqualArray(responseData.data, activities)) {
          setActivities(responseData.data);
        }
      } catch (error: any) {
        setError(error.response?.data.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivity();
  }, [apiPrivate]);

  if (isLoading) {
    return (
      <div className='flex flex-col gap-3 w-full'>
        <div className='flex flex-row gap-1'>
          <Loader2 className='animate-spin' />
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 w-full'>
      {activities.length !== 0 ? (
        activities.map((activity: ActivityLog) => {
          return <UserActivityLogItem activity={activity} />;
        })
      ) : (
        <h1 className='flex flex-row gap-1 w-full text-muted-foreground/50 justify-center'>
          <Frown />
          No recent activity!
        </h1>
      )}
    </div>
  );
}
