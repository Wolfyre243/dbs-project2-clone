import { Link } from 'react-router';
import { CameraIcon, HomeIcon } from 'lucide-react';

export function AppBottomBar({ ...props }: React.ComponentProps<any>) {
  return (
    <div
      className='flex flex-row w-full justify-between items-center px-6 py-3 bg-primary'
      {...props}
    >
      <div className='flex flex-row w-full justify-between'>
        <Link to='/' className='flex flex-col items-center text-sm'>
          <HomeIcon />
          <p>Home</p>
        </Link>
        <Link to='/' className='flex flex-col items-center text-sm'>
          <CameraIcon />
          <p>Scan</p>
        </Link>
        <Link to='/' className='flex flex-col items-center text-sm'>
          <HomeIcon />
          <p>Home</p>
        </Link>
        <Link to='/' className='flex flex-col items-center text-sm'>
          <HomeIcon />
          <p>Home</p>
        </Link>
      </div>
    </div>
  );
}
