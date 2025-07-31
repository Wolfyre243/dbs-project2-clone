import {
  Send,
  SendHorizonal,
  Sparkle,
  MessageCircle,
  LoaderCircle,
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
          className={`flex flex-row cursor-pointer rounded-2xl ${gradient}`}
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
    <div className='w-full p-4'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex items-center gap-3'>
          <div className='flex-1 relative'>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask Anything...'
              className='min-h-[60px] max-h-[120px] resize-none pr-12 bg-white/90 dark:bg-zinc-900/90 border-gray-200 dark:border-zinc-700 focus:border-red-300 dark:focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-500/20 backdrop-blur-sm'
              disabled={isLoading}
            />
            <div className='absolute bottom-2 right-2 text-xs text-gray-400 dark:text-zinc-500'>
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || isLoading}
            className='px-6 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
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
    </div>
  );
}
