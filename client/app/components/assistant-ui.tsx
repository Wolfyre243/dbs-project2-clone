import { Send, SendHorizonal, Sparkle } from 'lucide-react';
import { Button } from './ui/button';
import type React from 'react';
import type { ButtonProps } from 'react-day-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Textarea } from './ui/textarea';
import { useState } from 'react';

export function GenerateSubtitleButton({
  handleSubmit,
}: {
  handleSubmit: any;
}) {
  const gradient = 'bg-gradient-to-br from-blue-300 via-pink-200 to-purple-300';

  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'default'}
          className={`flex flex-row rounded-2xl ${gradient}`}
        >
          <Sparkle />
          Generate
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex flex-row items-end gap-2 w-xs md:w-xl mt-2 -ms-4 p-4'
        align='start'
      >
        <Textarea
          className='text-sm'
          value={text}
          placeholder='Generate subtitles...'
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          size={'icon'}
          variant={'ghost'}
          onClick={async () => {
            if (text === '') return;
            setIsOpen(false);
            handleSubmit(text);
            setText('');
          }}
        >
          {' '}
          <SendHorizonal />{' '}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
