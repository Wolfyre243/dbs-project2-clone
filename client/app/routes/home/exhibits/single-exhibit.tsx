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
import EventTypes from '~/eventTypeConfig';
import useAuth from '~/hooks/useAuth';
import Roles from '~/rolesConfig';
import { Button } from '~/components/ui/button';
import { Star } from 'lucide-react';
import { Tooltip } from '~/components/ui/tooltip';
import { toast } from 'sonner';

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
  wordTimings: {
    word: string;
    start: number;
    end: number;
    source?: string;
    type?: string;
  }[];
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
  status: string;
  supportedLanguages: string[];
  subtitles: ExhibitSubtitle[];
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
  debouncedHandleTimeUpdate,
  handleAudioEnded,
  exhibitId,
}: {
  subtitle: ExhibitSubtitle;
  selectedLanguage: string;
  currentWordIndices: Record<string, number[]>;
  audioRefs: React.MutableRefObject<Record<string, HTMLAudioElement | null>>;
  debouncedHandleTimeUpdate: (subtitleId: string) => void;
  handleAudioEnded: (subtitleId: string) => void;
  exhibitId: string;
}) {
  const apiPrivate = useApiPrivate();
  const { role } = useAuth();

  // Audio event logging
  const logAudioEvent = async (
    eventTypeId: number,
    audioElement: HTMLAudioElement,
    extraDetails = {},
  ) => {
    try {
      if (role === Roles.ADMIN || role === Roles.SUPERADMIN) return;

      await apiPrivate.post(`/event-log/audio/${eventTypeId}`, {
        entityId: subtitle.audio.audioId,
        details: `Exhibit ${exhibitId}, Subtitle ${subtitle.subtitleId}, Audio ${subtitle.audio.audioId} (${subtitle.languageCode}) at ${audioElement.currentTime.toFixed(1)}s/${audioElement.duration.toFixed(1)}s, volume ${audioElement.volume}, muted: ${audioElement.muted}`,
        metadata: {
          exhibitId,
          subtitleId: subtitle.subtitleId,
          audioId: subtitle.audio.audioId,
          languageCode: subtitle.languageCode,
          currentTime: audioElement.currentTime,
          duration: audioElement.duration,
          volume: audioElement.volume,
          muted: audioElement.muted,
          ...extraDetails,
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Attach event listeners
  const audioRefCallback = (audioElement: HTMLAudioElement | null) => {
    if (audioElement) {
      audioRefs.current[subtitle.subtitleId] = audioElement;

      // Remove previous listeners to avoid duplicates
      audioElement.onplay = null;
      audioElement.onpause = null;
      audioElement.onended = null;
      audioElement.onseeked = null;
      audioElement.onvolumechange = null;

      audioElement.onplay = () =>
        logAudioEvent(EventTypes.AUDIO_STARTED, audioElement);
      audioElement.onpause = () =>
        logAudioEvent(EventTypes.AUDIO_PAUSED, audioElement);
      audioElement.onended = () =>
        logAudioEvent(EventTypes.AUDIO_COMPLETED, audioElement);
      audioElement.onseeked = () =>
        logAudioEvent(EventTypes.AUDIO_SEEKED, audioElement, {
          seekedTo: audioElement.currentTime,
        });
      audioElement.onvolumechange = () =>
        logAudioEvent(
          audioElement.muted
            ? EventTypes.AUDIO_MUTED
            : EventTypes.AUDIO_VOLUME_CHANGED,
          audioElement,
        );
    }
  };

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

  const isCJK = ['cmn-CN', 'zh-CN', 'cmn-Hans-CN', 'ja-JP', 'ko-KR'].includes(
    subtitle.languageCode,
  );

  // Language-specific highlighting configuration
  const getHighlightingConfig = useCallback(() => {
    if (isCJK) {
      return {
        maxGroupSize: 6, // Larger character groups for better readability
        lookAheadTime: 1.0, // Longer look-ahead for phrase context
        minHighlightDuration: 0.6, // Minimum highlight time for readability
        transitionDuration: 500, // Smoother transitions
        debounceMs: 60, // Slower updates to reduce flickering
      };
    } else {
      return {
        maxGroupSize: 3, // Current word grouping works well
        lookAheadTime: 0.5, // Current look-ahead timing
        minHighlightDuration: 0.3, // Current minimum time
        transitionDuration: 300, // Current transitions
        debounceMs: 25, // Current fast updates for responsiveness
      };
    }
  }, [isCJK]);

  const highlightConfig = getHighlightingConfig();

  const units = useMemo(() => {
    // Enhanced: Use complete word timings from backend (now includes all original words)
    if (!subtitle.wordTimings || subtitle.wordTimings.length === 0) {
      // Fallback: create basic timing structure from subtitle text with punctuation preservation
      const words = subtitle.subtitleText
        .split(/\s+/)
        .filter((word) => word.length > 0);
      return words.map((word, index) => ({
        word: word, // Preserve original word including punctuation
        start: index * 0.6,
        end: (index + 1) * 0.6,
        source: 'frontend-fallback',
        type: 'word', // Default type for fallback
      }));
    }

    return subtitle.wordTimings.map((timing) => ({
      word: timing.word || '',
      start: timing.start || 0,
      end: timing.end || 0,
      source: timing.source || 'legacy',
      type: timing.type || 'word', // Preserve type information from backend
    }));
  }, [subtitle.wordTimings, subtitle.subtitleText]);

  const renderWords = () => {
    const highlightedIndices = currentWordIndices[subtitle.subtitleId] || [];
    const elements: React.ReactNode[] = [];

    // Enhanced rendering with language-specific grouping and spacing
    let i = 0;
    while (i < units.length) {
      if (highlightedIndices.includes(i)) {
        // Start of a highlighted group - use language-specific grouping
        let groupStart = i;
        let groupWords = [units[i].word];
        let j = i + 1;

        // Language-specific grouping logic
        const maxGroupSize = highlightConfig.maxGroupSize;

        if (isCJK) {
          // For Chinese: Group characters intelligently, respecting punctuation boundaries
          while (
            j < units.length &&
            highlightedIndices.includes(j) &&
            j < groupStart + maxGroupSize
          ) {
            // Stop at punctuation for natural phrase boundaries
            if (units[j].type === 'punctuation') break;
            groupWords.push(units[j].word);
            j++;
          }
        } else {
          // For space-separated languages: Use current word-based grouping
          while (
            j < units.length &&
            highlightedIndices.includes(j) &&
            j < groupStart + maxGroupSize
          ) {
            groupWords.push(units[j].word);
            j++;
          }
        }

        // Enhanced highlighting style with language-specific transitions
        elements.push(
          <span
            key={`highlight-${groupStart}`}
            className='p-0 transition-all ease-in-out'
            style={{
              borderRadius: '3px',
              background: 'linear-gradient(90deg, #ffeb3b, #ffca28)',
              fontWeight: '400',
              boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
              color: '#1a1a1a',
              display: 'inline',
              wordBreak: 'break-word',
              whiteSpace: 'normal',
              transitionDuration: `${highlightConfig.transitionDuration}ms`,
            }}
          >
            {groupWords.join(isSpaceSeparated ? ' ' : '')}
          </span>,
        );

        // Add space after highlighted group if needed
        if (isSpaceSeparated && j < units.length) {
          elements.push(
            <span key={`space-after-${groupStart}`} className='inline'>
              {' '}
            </span>,
          );
        }
        i = j;
      } else {
        // Render non-highlighted words with subtle styling
        let nonHighlightStart = i;
        let nonHighlightWords = [];

        // Group non-highlighted words for better performance
        while (i < units.length && !highlightedIndices.includes(i)) {
          nonHighlightWords.push(units[i].word);
          i++;
        }

        elements.push(
          <span
            key={`normal-${nonHighlightStart}`}
            className='p-0'
            style={{
              fontWeight: '400',
              color: 'inherit',
              transition: `all ${highlightConfig.transitionDuration * 0.6}ms ease`,
            }}
          >
            {nonHighlightWords.join(isSpaceSeparated ? ' ' : '')}
          </span>,
        );

        // Add space after non-highlighted group if needed
        if (isSpaceSeparated && i < units.length) {
          elements.push(
            <span
              key={`space-after-normal-${nonHighlightStart}`}
              className='inline'
            >
              {' '}
            </span>,
          );
        }
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
      className='w-full'
    >
      <audio
        ref={audioRefCallback}
        controls
        src={subtitle.audio.fileLink}
        className='w-full mb-4 sm:mb-5'
        onTimeUpdate={() => debouncedHandleTimeUpdate(subtitle.subtitleId)}
        onEnded={() => handleAudioEnded(subtitle.subtitleId)}
      >
        Your browser does not support the audio element.
      </audio>
      <div className='flex items-center gap-2 sm:gap-3 mb-2 p-3 sm:p-4 rounded-lg bg-muted text-sm sm:text-base'>
        <span className='flex-1'>{renderWords()}</span>
      </div>
    </motion.div>
  );
}

export default function SingleExhibit() {
  const [exhibit, setExhibit] = useState<ExhibitData | null>(null);
  const [subtitles, setSubtitles] = useState<ExhibitSubtitle[] | null>(null);
  const [exhibitLoading, setExhibitLoading] = useState(true);
  const [subtitleLoading, setSubtitleLoading] = useState(true);
  const [exhibitError, setExhibitError] = useState<string | null>(null);
  const [subtitleError, setSubtitleError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [currentWordIndices, setCurrentWordIndices] = useState<
    Record<string, number[]>
  >({});
  const [isFavourite, setIsFavourite] = useState(false);

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const apiPrivate = useApiPrivate();
  const [searchParams] = useSearchParams();
  const params = useParams();

  useEffect(() => {
    const exhibitId = params.exhibitId;
    const token = searchParams.get('token');
    let cancelled = false;

    async function fetchExhibit() {
      setExhibitLoading(true);
      setExhibitError(null);

      try {
        await apiPrivate.post(`/exhibit/${exhibitId}/validate-qr-token`, {
          token,
        });
        const { data: metadataResponseData } = await apiPrivate.get(
          `/exhibit/public/${exhibitId}`,
        );
        if (!cancelled) {
          setExhibit(metadataResponseData.data.exhibit);
          setIsFavourite(metadataResponseData.data.isFavourite);
        }
      } catch (err: any) {
        console.error('Exhibit fetch error:', err);
        if (!cancelled) {
          setExhibit(null);
          setExhibitError(err.response?.data.message);
        }
      } finally {
        if (!cancelled) {
          setExhibitLoading(false);
        }
      }
    }

    if (exhibitId) {
      fetchExhibit();
    } else {
      setExhibitError('Access denied: QR code token or exhibit ID missing.');
      setExhibitLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [params.exhibitId, searchParams, apiPrivate]);

  useEffect(() => {
    const exhibitId = params.exhibitId;
    let cancelled = false;

    async function fetchSubtitles() {
      setSubtitleLoading(true);
      setSubtitleError(null);

      try {
        const { data: subtitlesResponseData } = await apiPrivate.get(
          `/subtitle/exhibit/${exhibitId}`,
        );
        if (!cancelled) {
          setSubtitles(subtitlesResponseData.data);
        }
      } catch (err: any) {
        console.error('Subtitle fetch error:', err);
        if (!cancelled) {
          setSubtitles(null);
          setSubtitleError('Error loading subtitles.');
        }
      } finally {
        if (!cancelled) {
          setSubtitleLoading(false);
        }
      }
    }

    if (exhibitId) {
      fetchSubtitles();
    }

    return () => {
      cancelled = true;
    };
  }, [params.exhibitId, apiPrivate]);

  useEffect(() => {
    if (exhibit && exhibit.supportedLanguages.length > 0) {
      setSelectedLanguage(exhibit.supportedLanguages[0]);
    }
  }, [exhibit]);

  const handleTimeUpdate = useCallback(
    (subtitleId: string) => {
      const audioElement = audioRefs.current[subtitleId];
      if (audioElement && subtitles) {
        const subtitle = subtitles.find((s) => s.subtitleId === subtitleId);
        if (subtitle && subtitle.wordTimings?.length) {
          const currentTime = audioElement.currentTime;
          const timings = subtitle.wordTimings;

          // Get language-specific configuration
          const isCJKLanguage = [
            'cmn-CN',
            'zh-CN',
            'cmn-Hans-CN',
            'ja-JP',
            'ko-KR',
          ].includes(subtitle.languageCode);

          const config = isCJKLanguage
            ? {
                lookAheadTime: 1.0,
                minHighlightDuration: 0.6,
                maxGroupSize: 6,
              }
            : {
                lookAheadTime: 0.5,
                minHighlightDuration: 0.3,
                maxGroupSize: 3,
              };

          // Enhanced word finding logic
          let currentIdx = timings.findIndex(
            (timing) => currentTime >= timing.start && currentTime < timing.end,
          );

          // Improved fallback logic for edge cases
          if (currentIdx === -1) {
            // Find the closest word based on time
            if (currentTime < timings[0].start) {
              // Before first word - don't highlight anything
              setCurrentWordIndices((prev) => ({
                ...prev,
                [subtitleId]: [],
              }));
              return;
            } else if (currentTime >= timings[timings.length - 1].end) {
              // After last word - highlight last few words briefly
              const lastIndices = Math.max(0, timings.length - 2);
              setCurrentWordIndices((prev) => ({
                ...prev,
                [subtitleId]: [lastIndices, timings.length - 1].filter(
                  (i) => i >= 0,
                ),
              }));
              return;
            } else {
              // Find the closest word by checking gaps between words
              for (let i = 0; i < timings.length - 1; i++) {
                if (
                  currentTime >= timings[i].end &&
                  currentTime < timings[i + 1].start
                ) {
                  // In a gap between words - highlight the previous word briefly
                  currentIdx = i;
                  break;
                }
              }
            }
          }

          if (currentIdx >= 0) {
            // Enhanced highlighting with language-specific logic
            const highlightIndices: number[] = [];

            // Always include current word
            highlightIndices.push(currentIdx);

            // Add next words based on language-specific timing and grouping
            const currentWord = timings[currentIdx];
            const timeToEnd = currentWord.end - currentTime;

            // Use language-specific look-ahead timing and duration
            if (
              timeToEnd < config.lookAheadTime &&
              currentIdx < timings.length - 1
            ) {
              // Look ahead to next words for smooth reading
              for (
                let i = currentIdx + 1;
                i < Math.min(currentIdx + config.maxGroupSize, timings.length);
                i++
              ) {
                const nextWord = timings[i];
                // Only highlight if the next word starts soon (language-specific timing)
                if (nextWord.start - currentTime < config.lookAheadTime) {
                  highlightIndices.push(i);
                } else {
                  break;
                }
              }
            }

            setCurrentWordIndices((prev) => ({
              ...prev,
              [subtitleId]: highlightIndices,
            }));
          }
        }
      }
    },
    [subtitles],
  );

  // Create language-specific debounced handlers
  const debouncedHandleTimeUpdate = useMemo(() => {
    const handlers: Record<string, (subtitleId: string) => void> = {};

    return (subtitleId: string) => {
      if (!handlers[subtitleId]) {
        const subtitle = subtitles?.find((s) => s.subtitleId === subtitleId);
        const isCJKLanguage =
          subtitle &&
          ['cmn-CN', 'zh-CN', 'cmn-Hans-CN', 'ja-JP', 'ko-KR'].includes(
            subtitle.languageCode,
          );

        const debounceMs = isCJKLanguage ? 60 : 25; // Slower for CJK languages
        handlers[subtitleId] = debounce(handleTimeUpdate, debounceMs);
      }

      handlers[subtitleId](subtitleId);
    };
  }, [handleTimeUpdate, subtitles]);

  const handleAudioEnded = useCallback((subtitleId: string) => {
    setCurrentWordIndices((prev) => ({
      ...prev,
      [subtitleId]: [],
    }));
  }, []);

  const handleToggleFavourite = async () => {
    try {
      if (!isFavourite) {
        await apiPrivate.post(`/exhibit/${exhibit?.exhibitId}/favorite`);
      } else {
        await apiPrivate.delete(`/exhibit/${exhibit?.exhibitId}/favorite`);
      }
      setIsFavourite(!isFavourite);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data.message);
    }
  };

  if (exhibitLoading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-base sm:text-lg font-semibold'>
          Loading exhibit...
        </span>
      </div>
    );
  }

  if (exhibitError) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-base sm:text-lg font-semibold text-red-500'>
          {exhibitError}
        </span>
      </div>
    );
  }

  if (subtitleError) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-base sm:text-lg font-semibold text-red-500'>
          {subtitleError}
        </span>
      </div>
    );
  }

  if (!exhibit) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-base sm:text-lg font-semibold text-red-500'>
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
      className='w-full max-w-md sm:max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8'
    >
      <div className='flex flex-col items-center gap-4 sm:gap-6'>
        <motion.img
          src={exhibit.imageLink ?? PLACEHOLDER_IMAGE}
          alt={exhibit.title}
          className='w-full h-auto object-cover rounded-lg border aspect-[4/3] sm:aspect-[16/9]'
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        <h1 className='text-2xl sm:text-3xl font-bold text-center'>
          {exhibit.title}
        </h1>
        <p className='text-base sm:text-lg text-muted-foreground text-center'>
          {exhibit.description}
        </p>
      </div>
      <Separator className='my-4 sm:my-6' />
      <div className='flex flex-row justify-between mb-4 sm:mb-6 w-full mx-auto'>
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
        <Button size={'icon'} variant={'ghost'} onClick={handleToggleFavourite}>
          {isFavourite ? (
            <Star fill='#ffc636' stroke='none' className='size-6' />
          ) : (
            <Star className='size-6' />
          )}
        </Button>
      </div>
      <div className='flex flex-col gap-4 sm:gap-6'>
        {subtitleLoading && (
          <div className='flex items-center justify-center'>
            <span className='text-base sm:text-lg font-semibold'>
              Loading subtitles...
            </span>
          </div>
        )}
        {subtitles
          ?.filter((subtitle) => subtitle.languageCode === selectedLanguage)
          .map((subtitle) => (
            <Subtitle
              key={subtitle.subtitleId}
              subtitle={subtitle}
              selectedLanguage={selectedLanguage}
              currentWordIndices={currentWordIndices}
              audioRefs={audioRefs}
              debouncedHandleTimeUpdate={debouncedHandleTimeUpdate}
              handleAudioEnded={handleAudioEnded}
              exhibitId={exhibit.exhibitId}
            />
          ))}
      </div>
    </motion.div>
  );
}
