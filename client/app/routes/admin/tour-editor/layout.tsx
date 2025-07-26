import { Outlet } from 'react-router';
import { AppBar } from '~/components/app-bar';
import { AppBottomBar } from '~/components/app-bottombar';
import RequireAuth from '~/components/RequireAuth';
import Roles from '~/rolesConfig';

export default function TourEditorLayout() {
  return (
    <div className='flex justify-stretch flex-col h-full '>
      <Outlet />
    </div>
  );
}
