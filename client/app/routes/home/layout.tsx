import { Outlet } from 'react-router';
import { AppBar } from '~/components/app-bar';
import { AppBottomBar } from '~/components/app-bottombar';
import RequireAuth from '~/components/RequireAuth';
import Roles from '~/rolesConfig';
export default function HomeLayout() {
  return (
    <RequireAuth
      allowedRoles={[Roles.GUEST, Roles.MEMBER, Roles.ADMIN, Roles.SUPERADMIN]}
    >
      <main className='flex flex-col min-h-screen w-full'>
        <div className='sticky top-0 w-full'>
          <AppBar />
        </div>
        <div className='flex flex-col h-full '>
          <Outlet />
        </div>
        <div className='sticky bottom-0 w-full block md:hidden'>
          <AppBottomBar />
        </div>
      </main>
    </RequireAuth>
  );
}
