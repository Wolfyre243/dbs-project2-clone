import { Link, useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '~/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import useAuth from '~/hooks/useAuth';
import { User, LogOut, Settings, Menu, X, Shield } from 'lucide-react';
import useApiPrivate from '~/hooks/useApiPrivate';
import Roles from '~/rolesConfig';
import ThemeSwitcher from './theme-switch';
import LanguageSelector from '~/components/language-selector';
import { useTranslation } from 'react-i18next';

const links = [
  {
    to: '/home',
    name: 'Home',
    auth: true,
  },
  {
    to: '/membership-plans',
    name: 'Membership',
    auth: false,
  },
  {
    to: '/review',
    name: 'Review',
    auth: false,
  },
];

export function LoginButton() {
  const { t } = useTranslation();
  return (
    <Button asChild variant='outline' size='sm'>
      <Link to='/auth/login'>{t('login')}</Link>
    </Button>
  );
}

export function RegisterButton() {
  const { t } = useTranslation();
  return (
    <Button asChild variant='default' size='sm'>
      <Link to='/auth/register'>{t('register')}</Link>
    </Button>
  );
}

export function UserMenu() {
  const {
    accessToken,
    setAccessToken,
    role,
    setRole,
    setUserId,
    userId,
    loading,
    setLoading,
  } = useAuth();
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();
  const { t } = useTranslation();

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: responseData } = await apiPrivate.get('/user/profile');
        setUser(responseData.data.user);
      } catch (err: any) {
        console.log('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

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
      return user?.username.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Helper to truncate username
  const getTruncatedUsername = (username: string) => {
    if (!username) return '';
    return username.length > 15 ? username.slice(0, 15) + '...' : username;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={'ghost'}
          className='cursor-pointer relative rounded-full !ring-none !bg-transparent !hover:bg-transparent'
        >
          <h1>
            {`${role === Roles.ADMIN ? '🛠️' : ''}${role === Roles.SUPERADMIN ? '👑' : ''} ${getTruncatedUsername(user?.username)}`}
          </h1>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='bg-primary/10 text-primary'>
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-56' align='end' forceMount>
        {(role === Roles.SUPERADMIN || role === Roles.ADMIN) && (
          <DropdownMenuItem asChild>
            <Link to='/admin' className='cursor-pointer'>
              <Shield className='mr-2 h-4 w-4' />
              {t('adminDashboard')}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to='/home/settings' className='cursor-pointer'>
            <Settings className='mr-2 h-4 w-4' />
            {t('settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className='cursor-pointer'>
          <LogOut className='mr-2 h-4 w-4' />
          {t('logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  // TODO: Add transitions (low priority)
  return (
    // Show on medium device
    <div className='z-50 md:hidden'>
      <Button
        variant='ghost'
        size='sm'
        onClick={() => setIsOpen(!isOpen)}
        className='h-8 w-8 p-0'
      >
        {isOpen ? <X className='h-4 w-4' /> : <Menu className='h-4 w-4' />}
      </Button>

      {isOpen && (
        <div className='absolute top-full left-0 right-0 bg-background border-b shadow-lg z-50'>
          <div className='flex flex-col p-4 space-y-3'>
            {links.map((link, i) => {
              if (link.auth === isLoggedIn || !link.auth) {
                return (
                  <Link
                    key={i}
                    to={link.to}
                    className='text-sm font-medium hover:text-primary'
                    onClick={() => setIsOpen(false)}
                  >
                    {t(link.name.toLowerCase())}
                  </Link>
                );
              }
            })}

            <div className='flex gap-2 pt-2 border-t'>
              <ThemeSwitcher />
              <LanguageSelector />
              {!isLoggedIn && (
                <>
                  <LoginButton />
                  <RegisterButton />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function AppBar({ ...props }: React.ComponentProps<any>) {
  const { accessToken } = useAuth();
  const isLoggedIn = Boolean(accessToken);
  const { t } = useTranslation();

  return (
    <div
      className='sticky top-0 z-50 flex flex-row w-full justify-between items-center px-3 py-3 bg-background border-b'
      {...props}
    >
      <div className='flex flex-row items-center gap-3 px-3'>
        <div className='flex h-full items-center'>
          <Link to='/'>
            {/* TODO: Replace with SDC logo */}
            <h1 className='text-xl font-semibold'>SG Discovery Centre</h1>
          </Link>
        </div>
        <NavigationMenu viewport={false} className='hidden md:flex'>
          <NavigationMenuList className='font-bold'>
            {links.map((link, i) => {
              if (link.auth === isLoggedIn || !link.auth) {
                return (
                  <NavigationMenuItem key={i}>
                    <NavigationMenuLink
                      asChild
                      className='px-3 py-1 rounded-lg text-md'
                    >
                      <Link to={link.to}>{t(link.name.toLowerCase())}</Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                );
              }
            })}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className='hidden md:flex items-center gap-4'>
        <ThemeSwitcher />
        <LanguageSelector />
        {isLoggedIn ? (
          <UserMenu />
        ) : (
          <div className='flex flex-row gap-2'>
            <LoginButton />
            <RegisterButton />
          </div>
        )}
      </div>

      <div className='flex md:hidden items-center gap-2'>
        {isLoggedIn && <UserMenu />}
        <MobileMenu isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
