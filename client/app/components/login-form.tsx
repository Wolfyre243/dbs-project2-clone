import { GalleryVerticalEnd } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Link } from 'react-router';

export function LoginForm({
  className,
  submitCb,
  ref,
  ...props
}: {
  className?: string;
  submitCb: (e: React.FormEvent) => Promise<void>;
  ref: React.RefObject<HTMLFormElement | null>;
}) {
  return (
    <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
      <form ref={ref} onSubmit={submitCb}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <a
              href='#'
              className='flex flex-col items-center gap-2 font-medium'
            >
              <div className='flex gap-3 items-center justify-center rounded-md'>
                <GalleryVerticalEnd className='size-6' />
                <h1 className='font-bold'>SDC</h1>
              </div>
            </a>
            <h1 className='text-xl font-bold'>Welcome Back!</h1>
            <div className='text-center text-sm'>
              Don't have an account?{' '}
              <Link
                to='/auth/register'
                className='underline underline-offset-4'
              >
                Register
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='Alis'
                required
              />
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='password123'
                required
              />
            </div>
            <Button type='submit' className='w-full'>
              Login
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
