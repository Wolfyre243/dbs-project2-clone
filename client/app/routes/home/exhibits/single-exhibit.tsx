import React, { useEffect, useState, useRef, useCallback } from 'react';
import useApiPrivate from '~/hooks/useApiPrivate';
import { Avatar } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '~/components/ui/select';
import { motion } from 'framer-motion';

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

// Simple debounce function to limit frequent updates
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function SingleExhibit() {
  const [exhibit, setExhibit] = useState<ExhibitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [currentWordIndices, setCurrentWordIndices] = useState<
    Record<string, number | null>
  >({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const exhibitId = pathParts[pathParts.length - 1];
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    async function validateAndFetch() {
      setLoading(true);
      setError(null);

      if (!token) {
        setError('Access denied: QR code token missing.');
        setLoading(false);
        return;
      }

      try {
        // Validate QR token
        await apiPrivate.post(`/exhibit/${exhibitId}/validate-qr-token`, {
          token,
        });

        // Fetch exhibit data if token is valid
        const res = await apiPrivate.get(`/exhibit/${exhibitId}`);
        setExhibit(res.data.data.exhibit);
      } catch (err: any) {
        setExhibit(null);
        setError('Access denied: Invalid or expired QR code token.');
      }
      setLoading(false);
    }

    validateAndFetch();
  }, [apiPrivate]);

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
          const currentWordIndex = subtitle.wordTimings.findIndex(
            (timing) =>
              currentTime >= timing.start && currentTime < timing.end + 0.1, // Buffer to avoid flicker
          );
          setCurrentWordIndices((prev) => ({
            ...prev,
            [subtitleId]: currentWordIndex >= 0 ? currentWordIndex : null,
          }));
        }
      }
    }, 50), // Debounce to update every 50ms
    [exhibit],
  );

  useEffect(() => {
    // Reset indices when language changes
    if (exhibit) {
      const validSubtitleIds = exhibit.subtitles
        .filter((sub) => sub.languageCode === selectedLanguage)
        .map((sub) => sub.subtitleId);
      setCurrentWordIndices((prev) => {
        const newIndices = { ...prev };
        Object.keys(newIndices).forEach((id) => {
          if (!validSubtitleIds.includes(id)) delete newIndices[id];
        });
        return newIndices;
      });
    }

    exhibit?.subtitles.forEach((subtitle) => {
      const audioElement = audioRefs.current[subtitle.subtitleId];
      if (audioElement) {
        audioElement.addEventListener('timeupdate', () =>
          handleTimeUpdate(subtitle.subtitleId),
        );
        audioElement.addEventListener('pause', () =>
          handleTimeUpdate(subtitle.subtitleId),
        );
        audioElement.addEventListener('ended', () => {
          setCurrentWordIndices((prev) => ({
            ...prev,
            [subtitle.subtitleId]: null,
          }));
        });
      }
    });

    return () => {
      exhibit?.subtitles.forEach((subtitle) => {
        const audioElement = audioRefs.current[subtitle.subtitleId];
        if (audioElement) {
          audioElement.removeEventListener('timeupdate', () =>
            handleTimeUpdate(subtitle.subtitleId),
          );
          audioElement.removeEventListener('pause', () =>
            handleTimeUpdate(subtitle.subtitleId),
          );
          audioElement.removeEventListener('ended', () => {
            setCurrentWordIndices((prev) => ({
              ...prev,
              [subtitle.subtitleId]: null,
            }));
          });
        }
      });
    };
  }, [exhibit, selectedLanguage, handleTimeUpdate]);

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
          .map((subtitle) => {
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
            // Group Chinese characters into phrases (4 characters per group)
            const units = subtitle.wordTimings?.length
              ? subtitle.languageCode === 'cmn-CN'
                ? subtitle.wordTimings.reduce(
                    (acc, timing, index) => {
                      if (index % 4 === 0) {
                        acc.push({
                          word: '',
                          start: timing.start,
                          end: timing.end,
                        });
                      }
                      acc[acc.length - 1].word += timing.word;
                      if (
                        index % 4 !== 3 &&
                        index < subtitle.wordTimings.length - 1
                      ) {
                        acc[acc.length - 1].end =
                          subtitle.wordTimings[index + 1].end;
                      }
                      return acc;
                    },
                    [] as { word: string; start: number; end: number }[],
                  )
                : subtitle.wordTimings
              : isSpaceSeparated
                ? subtitle.subtitleText.split(' ')
                : subtitle.subtitleText.split('');
            return (
              <motion.div
                key={subtitle.subtitleId}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className=''
              >
                <audio
                  ref={(el) => {
                    if (el) audioRefs.current[subtitle.subtitleId] = el;
                  }}
                  controls
                  src={subtitle.audio.fileLink}
                  className='w-full mb-5'
                >
                  Your browser does not support the audio element.
                </audio>
                <div className='flex items-center gap-3 mb-2 p-4 rounded-lg border bg-muted'>
                  <span className='text-base'>
                    {units.map((unit, index) => (
                      <span
                        key={index}
                        style={{
                          padding: '2px 4px',
                          borderRadius: '4px',
                          background:
                            index === currentWordIndices[subtitle.subtitleId]
                              ? 'linear-gradient(90deg, #ffeb3b, #ffca28)'
                              : 'transparent',
                          fontWeight:
                            index === currentWordIndices[subtitle.subtitleId]
                              ? '500'
                              : '300',
                          transition: 'all 0.3s ease',
                          boxShadow:
                            index === currentWordIndices[subtitle.subtitleId]
                              ? '0 2px 6px rgba(255, 215, 0, 0.4)'
                              : 'none',
                          color:
                            index === currentWordIndices[subtitle.subtitleId]
                              ? '#1a1a1a'
                              : '#ffffff',
                        }}
                      >
                        {typeof unit === 'string' ? unit : unit.word}
                        {isSpaceSeparated ? ' ' : ''}
                      </span>
                    ))}
                  </span>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}
