import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '~/components/ui/card';
import {
  Loader2,
  Image as ImageIcon,
  AudioLines,
  QrCode,
  FileQuestion,
} from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { apiPrivate } from '~/services/api';
import { Button } from '~/components/ui/button';
import { Link } from 'react-router';

interface Subtitle {
  subtitleId: string;
  subtitleText: string;
  languageCode: string;
  createdBy: string;
  modifiedBy: string;
  audioId?: string;
  createdAt: string;
  modifiedAt: string;
  statusId: number;
  audio?: {
    audioId: string;
    description: string;
    createdBy: string;
    createdAt: string;
    statusId: number;
    fileLink: string;
    fileName: string;
    languageCode: string;
  };
}

interface Exhibit {
  exhibitId: string;
  title: string;
  description: string;
  imageLink?: string;
  createdBy: string;
  modifiedBy: string;
  createdAt: string;
  modifiedAt: string;
  supportedLanguages: string[];
  subtitles?: Subtitle[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ExhibitMetadata({ exhibit }: { exhibit: Exhibit }) {
  return (
    <div className='w-full'>
      <h1 className='text-3xl font-bold mb-2'>
        {exhibit.title || (
          <span className='text-muted-foreground'>No Name</span>
        )}
      </h1>
      <p className='mb-4 text-lg'>
        {exhibit.description || (
          <span className='text-muted-foreground'>No Description</span>
        )}
      </p>
      <div className='flex flex-wrap gap-4 text-sm text-muted-foreground mb-4'>
        <span>
          <span className='font-semibold'>Created by:</span> {exhibit.createdBy}
        </span>
        <span>
          <span className='font-semibold'>Created at:</span>{' '}
          {formatDate(exhibit.createdAt)}
        </span>
        <span>
          <span className='font-semibold'>Last modified:</span>{' '}
          {formatDate(exhibit.modifiedAt)}
        </span>
      </div>
      <div className='font-semibold mb-2 flex items-center gap-2'>
        <ImageIcon className='h-5 w-5' /> Exhibit Image
      </div>
      {exhibit.imageLink ? (
        <img
          src={exhibit.imageLink}
          alt='Exhibit'
          className='max-h-64 rounded border object-contain'
        />
      ) : (
        <div className='flex items-center justify-center h-40 w-full bg-muted rounded border text-muted-foreground'>
          <ImageIcon className='h-10 w-10' />
          <span className='ml-2'>No Image</span>
        </div>
      )}
    </div>
  );
}

function ExhibitQrCard({ exhibitId }: { exhibitId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Exhibit QR Code</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col gap-2 w-full'>
        {/* Placeholder QR code */}
        <div className='flex items-center justify-center w-60 h-60 bg-muted rounded border text-muted-foreground'>
          <QrCode className='h-10 w-10' />
          <span className='ml-2'>QR Code Placeholder</span>
        </div>
        <Button asChild>
          <Link
            className='px-4 py-1 w-fit rounded-md'
            to={`/home/exhibits/${exhibitId}`}
          >
            View Live
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function SubtitleAudioPreview({ subtitles }: { subtitles: Subtitle[] }) {
  // Only show subtitles that have both subtitleText and audio.fileLink
  const available = subtitles.filter(
    (s) => s.languageCode && s.subtitleText && s.audio && s.audio.fileLink,
  );
  const [selectedLang, setSelectedLang] = useState(
    available.length > 0 ? available[0].languageCode : '',
  );
  const [current, setCurrent] = useState(
    available.length > 0 ? available[0] : undefined,
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentWordIndices, setCurrentWordIndices] = useState<
    Record<string, number | null>
  >({});

  // Update current when selectedLang changes
  useEffect(() => {
    setCurrent(available.find((s) => s.languageCode === selectedLang));
  }, [selectedLang, available]);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current && current) {
        const duration = audioRef.current.duration;
        if (isFinite(duration) && duration > 0) {
          const isSpaceSeparated = [
            'en-GB',
            'es-ES',
            'fr-FR',
            'de-DE',
            'ru-RU',
            'it-IT',
            'ms-MY',
            'ta-IN',
            'hi-IN',
          ].includes(current.languageCode);
          const units = isSpaceSeparated
            ? current.subtitleText.split(' ')
            : current.subtitleText.split('');
          const segmentSize = 8;
          const segmentDuration =
            duration / Math.ceil(units.length / segmentSize);
          const currentTime = audioRef.current.currentTime;
          const index = Math.floor(currentTime / segmentDuration);
          setCurrentWordIndices((prev) => ({
            ...prev,
            [current.subtitleId]:
              index >= 0 && index * segmentSize < units.length ? index : null,
          }));
        }
      }
    };

    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.addEventListener('timeupdate', handleTimeUpdate);
      audioElement.addEventListener('pause', handleTimeUpdate);
      audioElement.addEventListener('ended', handleTimeUpdate);
    }

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('timeupdate', handleTimeUpdate);
        audioElement.removeEventListener('pause', handleTimeUpdate);
        audioElement.removeEventListener('ended', handleTimeUpdate);
      }
    };
  }, [current]);

  if (available.length === 0) {
    return (
      <div className='flex items-center gap-2 text-muted-foreground'>
        <AudioLines className='h-5 w-5' />
        No subtitles with audio available
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full'>
      <div className='mb-4 flex items-center gap-2'>
        <span className='font-medium'>Language:</span>
        <Select value={selectedLang} onValueChange={setSelectedLang}>
          <SelectTrigger className='w-40'>
            <SelectValue placeholder='Select language' />
          </SelectTrigger>
          <SelectContent>
            {available.map((s) => (
              <SelectItem key={s.languageCode} value={s.languageCode}>
                {s.languageCode}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col md:flex-row w-full items-start gap-5'>
        {/* Subtitles */}
        <div className='p-4 border rounded-lg space-y-2 w-full md:w-2/3'>
          <div className='text-xs text-muted-foreground'>
            Language: {current?.languageCode}
          </div>
          <div className='font-medium'>
            {(() => {
              const isSpaceSeparated =
                current?.languageCode &&
                [
                  'en-GB',
                  'es-ES',
                  'fr-FR',
                  'de-DE',
                  'ru-RU',
                  'it-IT',
                  'ms-MY',
                  'ta-IN',
                  'hi-IN',
                ].includes(current.languageCode);
              const units = current?.subtitleText
                ? current.subtitleText.split(isSpaceSeparated ? ' ' : '')
                : [];
              return units
                .reduce((acc, unit, index) => {
                  const segmentIndex = Math.floor(index / 8);
                  if (index % 8 === 0) acc.push([]);
                  acc[acc.length - 1].push(unit);
                  return acc;
                }, [] as string[][])
                .map((group, groupIndex) => (
                  <span
                    key={groupIndex}
                    className={`${groupIndex === currentWordIndices[current?.subtitleId || ''] ? 'text-black' : ''} px-1 py-0.5`}
                    style={{
                      borderRadius: '4px',
                      background:
                        groupIndex ===
                        currentWordIndices[current?.subtitleId || '']
                          ? 'linear-gradient(90deg, #ffeb3b, #ffca28)'
                          : 'transparent',
                      fontWeight:
                        groupIndex ===
                        currentWordIndices[current?.subtitleId || '']
                          ? '500'
                          : '300',
                      transition: 'all 0.3s ease',
                      boxShadow:
                        groupIndex ===
                        currentWordIndices[current?.subtitleId || '']
                          ? '0 2px 6px rgba(255, 215, 0, 0.4)'
                          : 'none',
                    }}
                  >
                    {group.join(isSpaceSeparated ? ' ' : '') + ''}
                  </span>
                ));
            })()}
          </div>
        </div>
        {/* Audio */}
        <div className='flex flex-row w-full md:w-1/3'>
          {current?.audio?.fileLink ? (
            <audio
              ref={audioRef}
              key={current.audio.fileLink}
              controls
              className='w-full'
            >
              <source src={current.audio.fileLink} type='audio/wav' />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className='flex items-center gap-2 text-muted-foreground'>
              <AudioLines className='h-4 w-4' />
              No Audio
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminViewExhibitPage() {
  const { exhibitId } = useParams();
  const [exhibit, setExhibit] = useState<Exhibit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExhibit() {
      setLoading(true);
      try {
        const { data: responseData } = await apiPrivate.get(
          `/exhibit/${exhibitId}`,
        );
        setExhibit(responseData.data.exhibit);
      } catch (err) {
        setExhibit(null);
      } finally {
        setLoading(false);
      }
    }
    if (exhibitId) fetchExhibit();
  }, [exhibitId]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh]'>
        <Loader2 className='h-8 w-8 animate-spin mb-2' />
        <div>Loading exhibit...</div>
      </div>
    );
  }

  if (!exhibit) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh]'>
        <FileQuestion className='h-10 w-10 mb-2 text-muted-foreground' />
        <div className='text-lg font-semibold'>Exhibit not found</div>
      </div>
    );
  }

  return (
    <div className='w-full p-6'>
      <div className='flex flex-col gap-8'>
        {/* Left: Exhibit Metadata & QR */}
        <div className='w-full flex flex-col md:flex-row gap-6'>
          <ExhibitMetadata exhibit={exhibit} />
          <ExhibitQrCard exhibitId={exhibit.exhibitId} />
        </div>
        {/* Right: Subtitles, Audio */}
        <div className='w-full flex flex-col gap-8'>
          <div>
            <h3 className='text-xl font-semibold mb-4'>
              Subtitles & Audio Preview
            </h3>
            <SubtitleAudioPreview subtitles={exhibit.subtitles || []} />
          </div>
        </div>
      </div>
    </div>
  );
}
