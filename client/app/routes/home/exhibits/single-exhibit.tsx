import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import useApiPrivate from '~/hooks/useApiPrivate';
import { Separator } from '~/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { motion } from 'framer-motion';
import { useParams, useSearchParams } from 'react-router';

type ExhibitAudio = {
  audioId: string;
  description: string;
  createdBy: string;
  createdAt: string;
  statusId: number;
  fileLink: string;
  fileName: string;
  languageCode: string;
};

type ExhibitSubtitle = {
  subtitleId: string;
  subtitleText: string;
  languageCode: string;
  createdBy: string;
  modifiedBy: string;
  audioId: string;
  createdAt: string;
  modifiedAt: string;
  statusId: number;
  audio: ExhibitAudio;
  wordTimings: { word: string; start: number; end: number }[];
};

type ExhibitData = {
  exhibitId: string;
  title: string;
  description: string;
  createdBy: string;
  modifiedBy: string;
  imageLink: string | null;
  createdAt: string;
  modifiedAt: string;
  subtitles: ExhibitSubtitle[];
  status: string;
  supportedLanguages: string[];
};

const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/400x250.png?text=No+Image+Available';

function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

function Subtitle({
  subtitle,
  selectedLanguage,
  currentWordIndices,
  audioRefs,
  handleTimeUpdate,
}: {
  subtitle: ExhibitSubtitle;
  selectedLanguage: string;
  currentWordIndices: Record<string, number[]>;
  audioRefs: React.MutableRefObject<Record<string, HTMLAudioElement | null>>;
  handleTimeUpdate: (subtitleId: string) => void;
}) {
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
  ].includes(subtitle.languageCode);

  const units = useMemo(() => {
    const normalizedText = subtitle.subtitleText.replace(/\s+/g, ' ').trim();
    const textWords = isSpaceSeparated
      ? normalizedText.split(/\s+/).filter((w) => w)
      : normalizedText.split('');

    // Map timings to textWords
    let units = textWords.map((word, index) => {
      const timing = subtitle.wordTimings[index];
      return {
        word,
        start: timing?.start ?? index * 0.2,
        end: timing?.end ?? (index + 1) * 0.2,
      };
    });

    // Group Chinese characters (cmn-CN)
    if (subtitle.languageCode === 'cmn-CN') {
      units = units.reduce(
        (acc, timing, index) => {
          if (index % 3 === 0) {
            acc.push({ word: '', start: timing.start, end: timing.end });
          }
          acc[acc.length - 1].word += timing.word;
          if (index % 2 !== 2 && index < units.length - 1) {
            acc[acc.length - 1].end = units[index + 1].end;
          }
          return acc;
        },
        [] as { word: string; start: number; end: number }[],
      );
    }

    console.log('Units:', units);
    return units;
  }, [
    subtitle.wordTimings,
    subtitle.subtitleText,
    subtitle.languageCode,
    isSpaceSeparated,
  ]);

  // Group consecutive highlighted indices
  const renderWords = () => {
    const highlightedIndices = currentWordIndices[subtitle.subtitleId] || [];
    const elements = [];
    let i = 0;

    while (i < units.length) {
      if (highlightedIndices.includes(i)) {
        // Start of a highlighted group
        let groupWords = [units[i].word];
        let groupStart = i;
        let j = i + 1;

        // Collect consecutive highlighted words
        while (
          j < units.length &&
          highlightedIndices.includes(j) &&
          j < groupStart + 3
        ) {
          groupWords.push(units[j].word);
          j++;
        }

        // Render highlighted group
        elements.push(
          <span
            key={i}
            className='px-1 py-0.5'
            style={{
              borderRadius: '3px',
              background: 'linear-gradient(90deg, #ffeb3b, #ffca28)',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 2px rgba(255, 215, 0, 0.4)',
              color: '#1a1a1a',
            }}
          >
            {groupWords.join(isSpaceSeparated ? ' ' : '')}
          </span>,
        );

        // Add space after group if needed
        if (isSpaceSeparated && j < units.length) {
          elements.push('');
        }

        i = j;
      } else {
        // Non-highlighted word
        elements.push(
          <span
            key={i}
            className=''
            style={{
              borderRadius: '3px',
              fontWeight: '300',
              // color: '#000000',
            }}
          >
            {units[i].word}
          </span>,
        );

        // Add space after if needed
        if (isSpaceSeparated && i < units.length) {
          elements.push(' ');
        }

        i++;
      }
    }

    return elements;
  };

  return (
    <motion.div
      key={subtitle.subtitleId}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className=''
    >
      <audio
        ref={(audioElement) => {
          if (audioElement)
            audioRefs.current[subtitle.subtitleId] = audioElement;
        }}
        controls
        src={subtitle.audio.fileLink}
        className='w-full mb-5'
        onTimeUpdate={() => handleTimeUpdate(subtitle.subtitleId)}
      >
        Your browser does not support the audio element.
      </audio>
      <div className='flex items-center gap-3 mb-2 p-4 rounded-lg bg-muted'>
        <span className='text-base'>{renderWords()}</span>
      </div>
    </motion.div>
  );
}

export default function SingleExhibit() {
  const [exhibit, setExhibit] = useState<ExhibitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [currentWordIndices, setCurrentWordIndices] = useState<
    Record<string, number[]>
  >({}); // Change to store array of indices
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const apiPrivate = useApiPrivate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const exhibitId = params.exhibitId;
    const token = searchParams.get('token');
    let cancelled = false;

    if (!exhibitId || !token) {
      setError('Access denied: QR code token or exhibit ID missing.');
      setLoading(false);
      return;
    }

    async function validateAndFetch() {
      setLoading(true);
      setError(null);

      try {
        await apiPrivate.post(`/exhibit/${exhibitId}/validate-qr-token`, {
          token,
        });
        const { data: responseData } = await apiPrivate.get(
          `/exhibit/${exhibitId}`,
        );
        if (!cancelled) {
          setExhibit(responseData.data.exhibit);
        }
      } catch (err: any) {
        if (!cancelled) {
          setExhibit(null);
          setError('Access denied: Invalid or expired QR code token.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    validateAndFetch();

    return () => {
      cancelled = true;
    };
  }, [params.exhibitId, searchParams, apiPrivate]);

  useEffect(() => {
    if (exhibit && exhibit.supportedLanguages.length > 0) {
      setSelectedLanguage(exhibit.supportedLanguages[0]);
    }
  }, [exhibit]);

  const handleTimeUpdate = useCallback(
    debounce((subtitleId: string) => {
      const audioElement = audioRefs.current[subtitleId];
      if (audioElement && exhibit) {
        const subtitle = exhibit.subtitles.find(
          (s) => s.subtitleId === subtitleId,
        );
        if (subtitle && subtitle.wordTimings?.length) {
          const currentTime = audioElement.currentTime;
          const duration = audioElement.duration || Infinity;
          const maxWordsToHighlight = 3; // Controls max words (e.g., 2 or 3)
          let activeIndices = subtitle.wordTimings
            .map((timing, index) =>
              currentTime >= timing.start - 0.1 &&
              currentTime <= timing.end + 0.3
                ? index
                : -1,
            )
            .filter((index) => index >= 0)
            .slice(0, maxWordsToHighlight);

          const lastWordIndex = subtitle.wordTimings.length;
          if (
            activeIndices.length === 0 &&
            currentTime >= subtitle.wordTimings[lastWordIndex].start - 0.2 &&
            currentTime <= duration
          ) {
            activeIndices = [lastWordIndex];
          }

          console.log('Time update:', {
            subtitleId,
            currentTime,
            activeIndices,
            words: activeIndices.map((i) => subtitle.wordTimings[i]?.word),
          });
          setCurrentWordIndices((prev) => ({
            ...prev,
            [subtitleId]: activeIndices,
          }));
        }
      }
    }, 100),
    [exhibit],
  );

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-lg font-semibold'>Loading exhibit...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-lg font-semibold text-red-500'>{error}</span>
      </div>
    );
  }

  if (!exhibit) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-lg font-semibold text-red-500'>
          Exhibit not found.
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className='max-w-3xl mx-auto py-8'
    >
      <div className='flex flex-col items-center gap-4'>
        <motion.img
          src={exhibit.imageLink ?? PLACEHOLDER_IMAGE}
          alt={exhibit.title}
          className='max-w-3xl object-cover rounded-lg border'
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        <h1 className='text-3xl font-bold text-center'>{exhibit.title}</h1>
        <p className='text-lg text-muted-foreground text-center'>
          {exhibit.description}
        </p>
      </div>
      <Separator className='my-6' />
      <div className='mb-6 w-full max-w-xs'>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger>
            <SelectValue placeholder='Select language' />
          </SelectTrigger>
          <SelectContent>
            {exhibit.supportedLanguages.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {lang}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='flex flex-col gap-6'>
        {exhibit.subtitles
          .filter((subtitle) => subtitle.languageCode === selectedLanguage)
          .map((subtitle) => (
            <Subtitle
              key={subtitle.subtitleId}
              subtitle={subtitle}
              selectedLanguage={selectedLanguage}
              currentWordIndices={currentWordIndices}
              audioRefs={audioRefs}
              handleTimeUpdate={handleTimeUpdate}
            />
          ))}
      </div>
    </motion.div>
  );
}
