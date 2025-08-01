import { History, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import { useIsMobile } from '~/hooks/use-mobile';

export default function AssistantLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isHistoryPage = location.pathname.includes('history');

  const [title, setTitle] = useState<string>('');

  const handleTitle = (data: string) => {
    setTitle(data);
  };

  return (
    <main className='flex flex-col min-h-full w-full'>
      <header
        className={`flex flex-row ${isHistoryPage ? 'justify-end' : 'justify-between'} items-center md:px-4`}
      >
        {!isHistoryPage && (
          <h1 className='text-xl font-bold'>
            {isMobile && title?.length > 13
              ? title.slice(0, 13) + '...'
              : title}
          </h1>
        )}
        <div className='flex flex-row gap-3 items-center'>
          <Button asChild size={'sm'}>
            <Link to={'/admin/assistant'} className='flex flex-row gap-1'>
              <Plus />
              {!isMobile && 'New Chat'}
            </Link>
          </Button>
          <Button asChild size={'icon'} variant={'ghost'} className='flex'>
            <Link to={'/admin/assistant/history'}>
              <History className='size-5' />
            </Link>
          </Button>
        </div>
      </header>
      <section className='flex h-full w-full'>
        <Outlet context={{ handleTitle }} />
      </section>
    </main>
  );
}
