import { Outlet } from 'react-router';
import { AppSidebar } from '~/components/app-sidebar';
import RequireAuth from '~/components/RequireAuth';
import { SiteHeader } from '~/components/site-header';
import { SidebarInset, SidebarProvider } from '~/components/ui/sidebar';
import Roles from '~/rolesConfig';

export default function AdminHomeLayout() {
  return (
    <RequireAuth allowedRoles={[Roles.ADMIN, Roles.SUPERADMIN]}>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className='flex flex-1 flex-col'>
            <div className='@container/main flex flex-1 flex-col gap-2 p-4'>
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
