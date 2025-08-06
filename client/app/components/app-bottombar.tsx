import { Link } from 'react-router';
import { CameraIcon, HomeIcon, ScanQrCode, Settings } from 'lucide-react';

export function AppBottomBar({ ...props }: React.ComponentProps<any>) {
  return (
    <div
      className='flex flex-row w-full justify-center items-center px-6 py-3 bg-background'
      {...props}
    >
      <div className='flex flex-row w-10/12 justify-between'>
        <Link to='/home' className='flex flex-col items-center text-sm'>
          <HomeIcon />
          <p>Home</p>
        </Link>
        <Link to='/home/scanner' className='flex flex-col items-center text-sm'>
          <ScanQrCode />
          <p>Scan</p>
        </Link>
        <Link
          to='/home/settings'
          className='flex flex-col items-center text-sm'
        >
          <Settings />
          <p>Settings</p>
        </Link>
      </div>
    </div>
  );
}
