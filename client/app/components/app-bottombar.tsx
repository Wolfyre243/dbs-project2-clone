import { Link, useLocation } from 'react-router';
import { CameraIcon, HomeIcon, ScanQrCode, Settings } from 'lucide-react';

export function AppBottomBar({ ...props }: React.ComponentProps<any>) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div
      className='flex flex-row w-full justify-center items-center px-6 py-3 bg-background'
      {...props}
    >
      <div className='flex flex-row w-10/12 justify-between'>
        <Link
          to='/home'
          className={`flex flex-col items-center text-sm ${pathname === '/home' ? 'text-red-400' : ''}`}
        >
          <HomeIcon />
          <p>Home</p>
        </Link>
        <Link
          to='/home/scanner'
          className={`flex flex-col items-center text-sm ${pathname === '/home/scanner' ? 'text-red-400' : ''}`}
        >
          <ScanQrCode />
          <p>Scan</p>
        </Link>
        <Link
          to='/home/settings'
          className={`flex flex-col items-center text-sm ${pathname === '/home/settings' ? 'text-red-400' : ''}`}
        >
          <Settings />
          <p>Settings</p>
        </Link>
      </div>
    </div>
  );
}
