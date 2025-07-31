import { History, Plus } from 'lucide-react';
import { Link, Outlet } from 'react-router';
import { Button } from '~/components/ui/button';

export default function AssistantLayout() {
  return (
    <main className='flex flex-col min-h-full w-full'>
      <header className='flex flex-row justify-between items-center px-4'>
        <h1 className='text-xl font-bold'>Conversation Title Here</h1>
        <div className='flex flex-row gap-3 items-center'>
          <Button asChild size={'sm'}>
            <Link to={'/admin/assistant'} className='flex flex-row gap-1'>
              <Plus />
              New Chat
            </Link>
          </Button>
          <Button size={'icon'} variant={'ghost'} className='flex'>
            <History className='size-5' />
          </Button>
        </div>
      </header>
      <section className='flex h-full w-full'>
        <Outlet />
      </section>
    </main>
  );
}
