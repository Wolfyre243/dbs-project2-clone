import { AxiosError, isAxiosError } from 'axios';
import { CircleUserRound, Copy, Divide } from 'lucide-react';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { toast } from 'sonner';
import { AssistantChatBar } from '~/components/assistant-ui';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '~/components/ui/tooltip';
import useApiPrivate from '~/hooks/useApiPrivate';

interface Message {
  messageId: string;
  senderType: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface Conversation {
  conversationId: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
}

function ChatMessageComponent({
  role,
  message,
}: {
  role: string;
  message: string;
}) {
  return (
    <div
      className={`flex flex-row w-full items-center ${role === 'user' ? 'justify-end' : 'justify-baseline'}`}
    >
      <div
        className={`flex gap-5 max-w-3/4 items-end ${role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <div className='px-4 py-2 text-sm md:text-base bg-neutral-200 dark:bg-neutral-800  max-w-full rounded-lg'>
          <p className='max-w-full text-wrap break-words'>
            {message.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
        <Avatar className='my-1'>
          {role === 'user' ? (
            <>
              <CircleUserRound className='h-full w-full' />
            </>
          ) : (
            <>
              <AvatarImage src='https://github.com/shadcn.png' alt='Omnie' />
              <AvatarFallback>
                <CircleUserRound className='h-full w-full' />
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </div>
    </div>
  );
}

function AssistantChatMessageComponent({ message }: { message: string }) {
  const parseInlineBold = (text: String) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (/^\*[^*]+\*$/.test(part)) {
        return <strong key={i}>{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  const parseFormattedText = (text: String) => {
    const lines = text.split('\n');

    const elements = [];
    let bulletList: string[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Empty line → break and flush bullet list
      if (trimmed === '') {
        if (bulletList.length > 0) {
          elements.push(
            <ul className='' key={`ul-${index}`}>
              {bulletList.map((item, i) => (
                <li key={`li-${index}-${i}`}>{parseInlineBold(item)}</li>
              ))}
            </ul>,
          );
          bulletList = [];
        }
        elements.push(<br key={`br-${index}`} />);
        return;
      }

      // Header line: **Header**
      const headerMatch = trimmed.match(/^\*\*(.+)\*\*$/);
      if (headerMatch) {
        if (bulletList.length > 0) {
          elements.push(
            <ul className='' key={`ul-${index}`}>
              {bulletList.map((item, i) => (
                <li key={`li-${index}-${i}`}>{parseInlineBold(item)}</li>
              ))}
            </ul>,
          );
          bulletList = [];
        }
        elements.push(
          <h1 className='text-xl font-semibold' key={`h1-${index}`}>
            {headerMatch[1]}
          </h1>,
        );
        return;
      }

      // Bullet line: * Text
      const bulletMatch = trimmed.match(/^\*\s+(.+)/);
      if (bulletMatch) {
        bulletList.push(bulletMatch[1]);
        return;
      }

      // Regular paragraph (also remove bullets before)
      if (bulletList.length > 0) {
        elements.push(
          <ul key={`ul-${index}`}>
            {bulletList.map((item, i) => (
              <li key={`li-${index}-${i}`}>{parseInlineBold(item)}</li>
            ))}
          </ul>,
        );
        bulletList = [];
      }
      elements.push(<p key={`p-${index}`}>{parseInlineBold(trimmed)}</p>);
    });

    // Remove any trailing bullets
    if (bulletList.length > 0) {
      elements.push(
        <ul className='list-disc list-inside' key='ul-end'>
          {bulletList.map((item, i) => (
            <li key={`li-end-${i}`}>{parseInlineBold(item)}</li>
          ))}
        </ul>,
      );
    }

    return elements;
  };

  return (
    <div className={`flex flex-col w-full items-start justify-center`}>
      <div className={`flex flex-col gap-5 max-w-3/4 items-end`}>
        <div className='py-2 text-sm md:text-base max-w-full rounded-lg'>
          <p className='max-w-full text-wrap break-words'>
            {message.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {parseFormattedText(line)}
              </React.Fragment>
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

const ChatMessagePending = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref} {...props}>
    <div className={`flex flex-row w-full items-center justify-baseline`}>
      <div className={`flex gap-5 max-w-3/4 items-center flex-row-reverse`}>
        <div className='px-4 py-2 bg-neutral-200 dark:bg-neutral-800 max-w-full rounded-xl'>
          <div className='flex p-2 space-x-2'>
            <span
              className='w-2 h-2 bg-white rounded-full animate-bounce'
              style={{ animationDelay: '0s' }}
            ></span>
            <span
              className='w-2 h-2 bg-white rounded-full animate-bounce'
              style={{ animationDelay: '0.2s' }}
            ></span>
            <span
              className='w-2 h-2 bg-white rounded-full animate-bounce'
              style={{ animationDelay: '0.4s' }}
            ></span>
          </div>
        </div>
        {/* <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
          <AvatarFallback>
            <CircleUserRound className='h-full w-full' />
          </AvatarFallback>
        </Avatar> */}
      </div>
    </div>
  </div>
));

function MessageUtilityBar({ responseText }: { responseText: string }) {
  return (
    <div className='flex flex-row gap-3'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => {
              navigator.clipboard.writeText(responseText);
              toast.success('Copied to clipboard!');
            }}
            variant='ghost'
            size={'icon'}
            className='size-5 text-muted-foreground'
          >
            <Copy />
          </Button>
        </TooltipTrigger>
        <TooltipContent className='px-1 py-1'>
          <p>Copy</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

export default function AssistantConversationPage() {
  const { conversationId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();
  const { handleTitle } = useOutletContext<any>();

  const lastMsgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const getMessages = async () => {
      // setIsLoading(true);

      try {
        const { data: responseData } = await apiPrivate.get(
          `/assistant/conversations/${conversationId}/messages`,
        );

        setMessageHistory(responseData.messages);
        setConversation(responseData.conversation);
        handleTitle(responseData.conversation.title);
      } catch (error: any) {
        let message =
          error.response?.data.message ||
          'Something went wrong. Please try again later.';
        console.log(message);
        setError(message);
        setMessageHistory([]);
        handleTitle('...');
      } finally {
        // setIsLoading(false);
      }
    };

    getMessages();
  }, [apiPrivate, reload]);

  useEffect(() => {
    if (lastMsgRef.current) {
      lastMsgRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [isLoading, messageHistory]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      const { data: responseData } = await apiPrivate.post(
        `/assistant/chat`,
        {
          content: message,
        },
        {
          params: {
            conversationId,
          },
        },
      );

      // Clear message after sending
      setMessage('');
      setReload((prev) => prev + 1);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      // setReload(false);
      setIsLoading(false);
    }
  };

  if (!conversationId) {
    return (
      <div>
        <h1>Missing conversation ID!</h1>
      </div>
    );
  }

  return (
    <div className='flex flex-row justify-center w-full min-h-full p-2'>
      <div className='w-5xl min-h-full max-h-[80vh] flex flex-col justify-between'>
        <div className='flex flex-col gap-3 overflow-y-scroll scrollbar-none'>
          {!error ? (
            messageHistory.map((messageItem: Message, index: number) => {
              return messageItem.senderType === 'user' ? (
                <ChatMessageComponent
                  key={index}
                  role={messageItem.senderType}
                  message={messageItem.content}
                />
              ) : (
                <>
                  <AssistantChatMessageComponent
                    key={index}
                    message={messageItem.content}
                  />
                  <Separator className='' />
                  <MessageUtilityBar responseText={messageItem.content} />
                  {index + 1 === messageHistory.length && (
                    <div ref={lastMsgRef}></div>
                  )}
                </>
              );
            })
          ) : (
            <div className='border rounded-md px-4 py-2'>
              <h1 className='font-semibold'>Oops! An error occurred: </h1>
              <h1 className='font-semibold text-red-400'>{error}</h1>
            </div>
          )}
          {isLoading ? (
            <div>
              <ChatMessageComponent role='user' message={message} />
              <ChatMessagePending ref={lastMsgRef} />
            </div>
          ) : (
            ''
          )}
          <div className='sticky bottom-0 h-40 bg-gradient-to-b from-transparent to-background shadow blur-xs z-10'>
            &nbsp;
          </div>
        </div>
        <div className='w-full flex flex-row justify-center'>
          <AssistantChatBar
            isLoading={isLoading}
            message={message}
            setMessage={setMessage}
            handleSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}
