import {
  Send,
  SendHorizonal,
  Sparkle,
  MessageCircle,
  LoaderCircle,
  CornerDownLeft,
  ArrowBigUp,
  Sparkles,
  Languages,
} from 'lucide-react';
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
import { Badge } from './ui/badge';

export function GenerateSubtitleButton({
  handleSubmit,
}: {
  handleSubmit: any;
}) {
  const gradient = 'bg-gradient-to-br from-blue-300 via-pink-200 to-purple-300';

  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isLoading}
          className={`flex flex-row text-neutral-900 cursor-pointer rounded-2xl shadow-md transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg ${gradient}`}
        >
          {!isLoading ? (
            <>
              <Sparkle />
              Generate
            </>
          ) : (
            <>
              <LoaderCircle className='animate-spin' />
              Generating...
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex flex-row items-center gap-2 w-xs md:w-xl mt-2 -ms-4 p-4'
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
          disabled={Boolean(text === '')}
          className='hover:bg-transparent'
          onClick={async () => {
            if (text === '') return;
            setIsOpen(false);
            setIsLoading(true);
            handleSubmit(text).then(() => setIsLoading(false));
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

export function TranslateSubtitleButton({
  handleSubmit,
  languageCode,
}: {
  handleSubmit: any;
  languageCode: string;
}) {
  const gradient = 'bg-gradient-to-br from-red-300 to-orange-300';

  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          disabled={isLoading}
          className={`flex flex-row text-neutral-900 cursor-pointer rounded-2xl shadow-md transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg ${gradient}`}
        >
          {!isLoading ? (
            <>
              <Languages />
              Translate
            </>
          ) : (
            <>
              <LoaderCircle className='animate-spin' />
              Translating...
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='flex flex-row items-center gap-2 w-xs md:w-xl mt-2 -ms-4 p-4'
        align='start'
      >
        <div className='flex flex-col justify-center gap-2 w-full'>
          <h1 className='text-sm flex flex-row items-center gap-1'>
            Translating from{' '}
            <Badge
              variant={'secondary'}
              className='outline outline-primary mx-0.5'
            >
              en-GB
            </Badge>{' '}
            to{' '}
            <Badge
              variant={'secondary'}
              className='outline outline-primary mx-0.5'
            >
              {languageCode || 'No language selected'}
            </Badge>
          </h1>
          <Textarea
            className='text-sm w-full'
            value={text}
            placeholder='Translate subtitles...'
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <Button
          size={'icon'}
          variant={'ghost'}
          disabled={Boolean(languageCode === '')}
          className='hover:bg-transparent'
          onClick={async () => {
            if (text === '') return;
            setIsOpen(false);
            setIsLoading(true);
            handleSubmit(text).then(() => setIsLoading(false));
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

export function AssistantChatBar({
  message,
  setMessage,
  isLoading,
  handleSubmit,
}: {
  message: string;
  setMessage: (message: string) => void;
  isLoading: boolean;
  handleSubmit: () => void;
}) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className='w-full'>
      <div className='flex flex-wrap justify-end md:flex-nowrap md:items-center gap-3'>
        <div className='flex relative w-full'>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder='Ask Anything...'
            className='min-h-[60px] max-h-[120px] resize-none pr-12 shadow bg-zinc-50/90 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-700 backdrop-blur-sm'
            disabled={isLoading}
          />
          <div className='hidden md:flex absolute bottom-2 right-2 text-xs items-center text-gray-400 dark:text-zinc-500'>
            Press{' '}
            <Badge className='px-1 py-0 mx-1 rounded-sm bg-muted text-muted-foreground'>
              <CornerDownLeft />
              Enter
            </Badge>{' '}
            to send,{' '}
            <Badge className='px-1 py-0 mx-1 rounded-sm bg-muted text-muted-foreground'>
              <ArrowBigUp />
              Shift +
              <CornerDownLeft />
              Enter
            </Badge>{' '}
            for new line
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!message.trim() || isLoading}
          className='self-end md:self-auto px-6 bg-gradient-to-r from-blue-500 to-primary hover:from-blue-600 hover:to-primary text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center gap-2'>
              <LoaderCircle className='animate-spin' />
              <span>Sending...</span>
            </div>
          ) : (
            <div className='flex items-center gap-2'>
              <Send className='h-5 w-5' />
              <span className='hidden sm:inline'>Send</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
