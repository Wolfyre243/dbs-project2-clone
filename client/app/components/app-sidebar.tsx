import {
  Gauge,
  Users,
  UserPlus,
  Settings,
  CircleQuestionMark,
  LayoutDashboard,
  ScrollText,
  Hammer,
  ChartNoAxesCombined,
  HardDrive,
  SlidersVertical,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { NavMain } from '~/components/nav-main';
import { NavSecondary } from '~/components/nav-secondary';
import { NavUser } from '~/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import { NavSuperAdmin } from './nav-superadmin';
import Roles from '~/rolesConfig';

const data = {
  user: {
    username: 'shadcn',
    firstName: 'shad',
    lastName: 'cn',
    email: 'shadcn@mail.com',
    roleId: 0,
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin',
      icon: Gauge,
    },
    {
      title: 'Tour Editor',
      url: '/admin/tour-editor',
      icon: Hammer,
    },
    {
      title: 'Analytics',
      url: '/admin/analytics',
      icon: ChartNoAxesCombined,
    },
    {
      title: 'Content',
      url: '/admin/content',
      icon: HardDrive,
    },
    {
      title: 'User Management',
      url: '/admin/users',
      icon: Users,
    },
  ],
  navSuperadmin: [
    {
      title: 'Register Admin',
      url: '/admin/register',
      icon: UserPlus,
    },
    {
      title: 'Manage Site',
      url: '/admin/site-settings',
      icon: SlidersVertical,
    },
  ],
  navSecondary: [
    {
      title: 'Release Notes',
      url: '#',
      icon: ScrollText,
    },
    {
      title: 'Get Help',
      url: '#',
      icon: CircleQuestionMark,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = useState<any | null>(data.user);
  const { userId, accessToken, role } = useAuth();
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    (async () => {
      try {
        if (!userId) return;
        const { data: responseData } = await apiPrivate.get('/user/profile');
        const user = responseData.data.user;

        setUser({
          username: user.username,
          firstName: user.userProfile?.firstName,
          lastName: user.userProfile?.lastName,
          email: user.emails.email,
          roleId: role,
        });
      } catch (error: any) {
        setUser(data.user);
        console.log(error.response.data.message);
      }
    })();
  }, [accessToken, userId]);

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='/'>
                <div className='text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <LayoutDashboard className='size-6' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>
                    Singapore Discovery Centre
                  </span>
                  <span className='truncate text-xs opacity-50'>
                    Admin Dashboard
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {user.roleId === Roles.SUPERADMIN ? (
          <NavSuperAdmin items={data.navSuperadmin} />
        ) : (
          ''
        )}
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
