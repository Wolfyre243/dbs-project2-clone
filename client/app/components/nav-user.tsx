'use client';

import {
  BadgeCheck,
  Bell,
  CreditCard,
  LogOut,
  Sparkles,
  EllipsisVertical,
  User,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '~/components/ui/sidebar';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import Roles from '~/rolesConfig';

export function NavUser({
  user,
}: {
  user: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    roleId: number;
  };
}) {
  const { isMobile } = useSidebar();
  const { setRole, setAccessToken, setUserId } = useAuth();
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();

  const handleLogout = async () => {
    try {
      await apiPrivate.post('/auth/logout');

      setAccessToken('');
      setRole(null);
      setUserId(null);

      navigate('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
      setAccessToken('');
      setRole(null);
      setUserId(null);
      navigate('/auth/login');
    }
  };

  const getUserInitials = () => {
    if (user) {
      return user.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg'>
                <AvatarFallback className='rounded-lg'>
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>
                  {user.username} {user.roleId === Roles.ADMIN ? '🛠️' : ''}{' '}
                  {user.roleId === Roles.SUPERADMIN ? '👑' : ''}
                </span>
                <span className='text-muted-foreground truncate text-xs'>
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <EllipsisVertical className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarFallback className='rounded-lg'>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{`${user.firstName} ${user.lastName}`}</span>
                  <span className='truncate text-xs'>{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link
                  to={'/home/profile'}
                  className='flex flex-row gap-2 w-full'
                >
                  <User />
                  Profile
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
