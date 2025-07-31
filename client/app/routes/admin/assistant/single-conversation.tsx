import { AxiosError, isAxiosError } from 'axios';
import { CircleUserRound, Divide } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AssistantChatBar } from '~/components/assistant-ui';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
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
        className={`flex gap-5 max-w-3/4 items-center ${role === 'user' ? 'flex-row' : 'flex-row-reverse'}`}
      >
        <div className='px-4 py-2 bg-neutral-800 max-w-full rounded-xl'>
          <p className='max-w-full text-wrap break-words'>
            {message.split('\n').map((line, index) => (
              <React.Fragment key={index}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </p>
        </div>
        <Avatar>
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

function ChatMessagePending() {
  return (
    <div className={`flex flex-row w-full items-center justify-baseline`}>
      <div className={`flex gap-5 max-w-3/4 items-center flex-row-reverse`}>
        <div className='px-4 py-2 bg-neutral-800 max-w-full rounded-xl'>
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
        <Avatar>
          <AvatarImage src='https://github.com/shadcn.png' alt='@shadcn' />
          <AvatarFallback>
            <CircleUserRound className='h-full w-full' />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}

export default function AssistantConversationPage() {
  const { conversationId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reload, setReload] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageHistory, setMessageHistory] = useState<Message[]>([]);

  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    const getMessages = async () => {
      // setIsLoading(true);

      try {
        const { data: responseData } = await apiPrivate.get(
          `/assistant/conversations/${conversationId}/messages`,
        );

        setMessageHistory(responseData.messages);
      } catch (error: any) {
        let message =
          error.response?.data.message ||
          'Something went wrong. Please try again later.';
        console.log(message);
        setError(message);
        setMessageHistory([]);
      } finally {
        // setIsLoading(false);
      }
    };

    getMessages();
  }, [apiPrivate, reload]);

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

      setReload(true);

      // Clear message after sending
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
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
      <div className='w-5xl h-200 flex flex-col justify-between'>
        <div className='flex flex-col gap-3 overflow-y-scroll scrollbar-none'>
          {!error ? (
            messageHistory.map((messageItem: Message, index: number) => {
              return (
                <ChatMessageComponent
                  key={index}
                  role={messageItem.senderType}
                  message={messageItem.content}
                />
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
              <ChatMessageComponent role='user' message={message.toString()} />
              <ChatMessagePending />
            </div>
          ) : (
            ''
          )}
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
