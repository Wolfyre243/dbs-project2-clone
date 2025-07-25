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
        <SidebarInset className='min-h-screen'>
          <div className='sticky top-0 z-50 bg-background shadow'>
            <SiteHeader />
          </div>
          <div className='flex flex-col h-fit'>
            <div className='flex-1 flex flex-col gap-2 p-4'>
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RequireAuth>
  );
}
