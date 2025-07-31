import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { Delete, History, Trash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import useApiPrivate from '~/hooks/useApiPrivate';
import { Link } from 'react-router';

interface Conversation {
  conversationId: string;
  title: string;
  createdAt: string;
  modifiedAt: string;
}

function HistoryItem({ conversation }: { conversation: Conversation }) {
  const timeAgo = formatDistanceToNow(new Date(conversation.createdAt), {
    addSuffix: true,
  });

  const apiPrivate = useApiPrivate();

  const handleDelete = async (conversationId: string) => {
    try {
      await apiPrivate.delete(`/assistant/conversations/${conversationId}`);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-lg'>
          <Link
            to={`/admin/assistant/conversation/${conversation.conversationId}`}
          >
            {conversation.title}
          </Link>
        </CardTitle>
        <CardDescription className='text-xs'>
          {conversation.conversationId}
        </CardDescription>
        <CardAction>
          <Dialog>
            <DialogTrigger>
              <Button size={'icon'} variant={'ghost'}>
                <Trash className='text-red-500 size-5' />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete conversation?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose>
                  <Button variant={'secondary'}>Cancel</Button>
                </DialogClose>
                <Button
                  onClick={() => handleDelete(conversation.conversationId)}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardAction>
      </CardHeader>
      <CardFooter className='text-xs text-muted-foreground'>
        <p>Created {timeAgo}</p>
      </CardFooter>
    </Card>
  );
}

export default function AssistantHistoryPage() {
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const apiPrivate = useApiPrivate();

  useEffect(() => {
    setIsLoading(true);
    try {
      const getHistory = async () => {
        const { data: responseData } = await apiPrivate.get(
          '/assistant/conversations',
        );

        setHistory(responseData.conversations);
      };

      getHistory();
    } catch (error: any) {
      console.log(error);
      setError(error.response?.data.message);
    } finally {
      setIsLoading(false);
    }
  }, [apiPrivate]);

  return (
    <div className='flex flex-row justify-center w-full'>
      <div className='w-5xl flex flex-col gap-4 px-4'>
        {/* Header */}
        <header className='flex flex-row items-center gap-2'>
          <History className='size-8' />
          <h1 className='text-3xl font-bold'>History</h1>
        </header>

        <section className='flex flex-col gap-3'>
          {history.map((conversationItem, i) => {
            return <HistoryItem conversation={conversationItem} key={i} />;
          })}
        </section>
      </div>
    </div>
  );
}
