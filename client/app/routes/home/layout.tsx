import { Outlet } from 'react-router';
import { AppBar } from '~/components/app-bar';
import { AppBottomBar } from '~/components/app-bottombar';
import RequireAuth from '~/components/RequireAuth';
import Roles from '~/rolesConfig';
export default function HomeLayout() {
  return (
    <RequireAuth allowedRoles={[Roles.GUEST, Roles.MEMBER]}>
      <main className='flex flex-col h-screen w-full'>
        <div className='sticky top-0 w-full'>
          <AppBar />
        </div>
        <div className='flex px-6 py-2 justify-stretch flex-col h-full '>
          <Outlet />
        </div>
        <div className='sticky bottom-0 w-full block md:hidden'>
          <AppBottomBar />
        </div>
      </main>
    </RequireAuth>
  );
}
