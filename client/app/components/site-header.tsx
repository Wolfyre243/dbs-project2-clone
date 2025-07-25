import { Separator } from '~/components/ui/separator';
import { SidebarTrigger } from '~/components/ui/sidebar';
import LayoutBreadcrumb from './layout-breadcrumb';
import { useEffect, useState } from 'react';
import ThemeSwitcher from './theme-switch';
// import ThemeSwitcher from './theme-switch';

export function SiteHeader() {
  let [windowHref, setWindowHref] = useState('');
  useEffect(() => {
    setWindowHref(window.location.pathname);
  }, []);
  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='-ml-1' />
        <Separator
          orientation='vertical'
          className='mx-2 data-[orientation=vertical]:h-4'
        />
        <div className='hidden md:block'>
          <LayoutBreadcrumb href={windowHref} />
        </div>
        <div className='ml-auto flex items-center gap-2'>
          {/* Light/Dark mode toggler */}
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
