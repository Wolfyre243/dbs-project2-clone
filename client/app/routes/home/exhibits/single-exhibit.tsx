// single-exhibit.tsx

import React, { useEffect, useState } from 'react';
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
};

type ExhibitData = {
  exhibitId: string;
  title: string;
  description: string;
  createdBy: string;
  modifiedBy: string;
  imageId: string | null;
  createdAt: string;
  modifiedAt: string;
  subtitles: ExhibitSubtitle[];
  status: string;
  supportedLanguages: string[];
};

const PLACEHOLDER_IMAGE =
  'https://via.placeholder.com/400x250.png?text=No+Image+Available';

export default function SingleExhibit() {
  const [exhibit, setExhibit] = useState<ExhibitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const exhibitId = pathParts[pathParts.length - 1];
    async function fetchExhibit() {
      setLoading(true);
      try {
        const res = await apiPrivate.get(`/exhibit/${exhibitId}`);
        setExhibit(res.data.data.exhibit);
      } catch (err) {
        setExhibit(null);
      }
      setLoading(false);
    }
    fetchExhibit();
  }, [apiPrivate]);

  useEffect(() => {
    if (exhibit && exhibit.supportedLanguages.length > 0) {
      setSelectedLanguage(exhibit.supportedLanguages[0]);
    }
  }, [exhibit]);

  if (loading) {
    return (
      <div className='flex items-center justify-center h-[60vh]'>
        <span className='text-lg font-semibold'>Loading exhibit...</span>
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
          src={
            exhibit.imageId ? `/images/${exhibit.imageId}` : PLACEHOLDER_IMAGE
          }
          alt={exhibit.title}
          className='w-[400px] h-[250px] object-cover rounded-lg border'
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
      {/* <h2 className='text-xl font-semibold mb-4'>Subtitles & Audio</h2> */}
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
            <motion.div
              key={subtitle.subtitleId}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className=''
            >
              {/* <Badge className='ml-auto'>
                {subtitle.audio.languageCode}
              </Badge> */}
              {/* TODO: Add text highlighting here */}
              <audio
                controls
                src={subtitle.audio.fileLink}
                className='w-full mb-5'
              >
                Your browser does not support the audio element.
              </audio>
              <div className='flex items-center gap-3 mb-2 p-4 rounded-lg border bg-muted'>
                <span className='text-base'>{subtitle.subtitleText}</span>
              </div>
            </motion.div>
          ))}
      </div>
    </motion.div>
  );
}
