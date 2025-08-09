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
import {
  Delete,
  Divide,
  History,
  MessageCircle,
  SearchX,
  Trash,
} from 'lucide-react';
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

function HistoryItem({
  conversation,
  handleDelete,
}: {
  conversation: Conversation;
  handleDelete: any;
}) {
  const timeAgo = formatDistanceToNow(new Date(conversation.createdAt), {
    addSuffix: true,
  });

  const apiPrivate = useApiPrivate();

  return (
    <Card className='flex flex-col w-full bg-transparent border-none'>
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
                <DialogClose>
                  <Button
                    onClick={() => handleDelete(conversation.conversationId)}
                  >
                    Confirm
                  </Button>
                </DialogClose>
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

import { useSearchParams } from 'react-router';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination';
import { Input } from '~/components/ui/input';
import { Separator } from '~/components/ui/separator';
import { toast } from 'sonner';

export default function AssistantHistoryPage() {
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reload, setReload] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const apiPrivate = useApiPrivate();
  const pageSize = 10;

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const { data: responseData } = await apiPrivate.get(
          '/assistant/conversations',
          {
            params: {
              page: searchParams.get('page') || 1,
              pageSize: searchParams.get('pageSize') || pageSize,
            },
          },
        );
        setHistory(responseData.data.conversationList);
        setPageCount(responseData.data.pageCount || 1);
        setCurrentPage(Number(searchParams.get('page')) || 1);
      } catch (error: any) {
        setHistory([]);
        setError(error.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [apiPrivate, searchParams, reload]);

  const handlePrevious = () => {
    const page = Number(searchParams.get('page')) || 1;
    const newPage = Math.max(page - 1, 1);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
      pageSize: searchParams.get('pageSize') || pageSize.toString(),
    });
  };

  const handleNext = () => {
    const page = Number(searchParams.get('page')) || 1;
    if (!pageCount || page >= pageCount) return;
    const newPage = page + 1;
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
      pageSize: searchParams.get('pageSize') || pageSize.toString(),
    });
  };

  const handleShowPage = (newPage: number) => {
    setSearchParams({
      ...Object.fromEntries(searchParams),
      page: newPage.toString(),
      pageSize: searchParams.get('pageSize') || pageSize.toString(),
    });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    const newSize = Math.max(1, newPageSize);
    setSearchParams({
      ...Object.fromEntries(searchParams),
      pageSize: newSize.toString(),
      page: '1',
    });
  };

  const handleDelete = async (conversationId: string) => {
    try {
      await apiPrivate.delete(`/assistant/conversations/${conversationId}`);
      setReload((prev) => prev + 1);
      toast.success('Conversation deleted successfully');
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data.message);
    }
  };

  const paginationControls = {
    handlePrevious,
    handleNext,
    handleShowPage,
    handlePageSizeChange,
    pageCount,
    currentPage: currentPage || 1,
  };

  return (
    <div className='flex flex-row justify-start w-full'>
      <div className='w-4xl flex flex-col gap-4 px-4'>
        {/* Header */}
        <header className='flex flex-row items-center gap-2 flex-wrap'>
          <div className='flex flex-row items-center gap-2'>
            <History className='size-8' />
            <h1 className='text-3xl font-bold'>History</h1>
          </div>
          <Pagination className=''>
            <PaginationContent className='flex flex-row md:w-full w-fit md:justify-end'>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => paginationControls.handlePrevious()}
                />
              </PaginationItem>

              {paginationControls.currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => paginationControls.handlePrevious()}
                  >
                    {paginationControls.currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink>
                  {paginationControls.currentPage}
                </PaginationLink>
              </PaginationItem>

              {paginationControls.currentPage <
                paginationControls.pageCount && (
                <PaginationItem>
                  <PaginationLink
                    onClick={() => paginationControls.handleNext()}
                  >
                    {paginationControls.currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {paginationControls.currentPage <
                paginationControls.pageCount - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {paginationControls.pageCount > 3 &&
                paginationControls.currentPage <
                  paginationControls.pageCount - 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() =>
                        paginationControls.handleShowPage(
                          paginationControls.pageCount,
                        )
                      }
                    >
                      {paginationControls.pageCount}
                    </PaginationLink>
                  </PaginationItem>
                )}

              <PaginationItem>
                <Input
                  id='pageSizeInput'
                  type='number'
                  placeholder='10'
                  min={'1'}
                  onChange={(e) => {
                    const newPageSize = parseInt(e.target.value);
                    if (!isNaN(newPageSize) && newPageSize > 0) {
                      paginationControls.handlePageSizeChange(newPageSize);
                    } else {
                      paginationControls.handlePageSizeChange(10);
                    }
                  }}
                  className='w-20'
                />
              </PaginationItem>

              <PaginationItem>
                <PaginationNext
                  onClick={() => paginationControls.handleNext()}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </header>

        <section className='flex flex-col min-w-full gap-3'>
          {history.length !== 0 ? (
            history.map((historyItem, i) => {
              return (
                <>
                  <HistoryItem
                    conversation={historyItem}
                    handleDelete={() =>
                      handleDelete(historyItem.conversationId)
                    }
                    key={i}
                  />
                  <Separator />
                </>
              );
            })
          ) : (
            <div className='flex flex-col gap-3 p-2 text-center items-center'>
              <h1 className='flex flex-row gap-1 items-center justify-center font-semibold'>
                <SearchX /> No conversation history found...
              </h1>
              <Button asChild size={'sm'} className='w-fit' variant={'outline'}>
                <Link to={'/admin/assistant'}>
                  <MessageCircle /> Start a Conversation
                </Link>
              </Button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
