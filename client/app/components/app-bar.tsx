import { Link } from 'react-router';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '~/components/ui/navigation-menu';
// import ThemeSwitcher from './theme-switch';

export function AppBar({ ...props }: React.ComponentProps<any>) {
  return (
    <div
      className='flex flex-row w-full justify-between items-center px-3 py-3 bg-background'
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
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className='px-3 py-1 rounded-lg text-md'
              >
                <Link to='/home'>Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className='px-3 py-1 rounded-lg text-md'
              >
                <Link to='/home'>Photobooth</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  );
}
