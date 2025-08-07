import { GalleryVerticalEnd, Loader, Loader2 } from 'lucide-react';

import { cn } from '~/lib/utils';
import { Label } from '~/components/ui/label';
import { Link } from 'react-router';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import api from '~/services/api';
import { useState } from 'react';
import { toast } from 'sonner';

export function LoginForm({
  className,
  submitCb,
  guestLoginCb,
  ref,
  ...props
}: {
  className?: string;
  submitCb: (e: React.FormEvent) => Promise<void>;
  guestLoginCb: () => Promise<void>;
  ref: React.RefObject<HTMLFormElement | null>;
}) {
  // Forgot Password modal state
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [email, setEmail] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  // Live email validation (checks if email exists in backend)
  const validateEmail = async (value: string) => {
    setEmail(value);
    setEmailValid(null);
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailValid(false);
      return;
    }
    setEmailValid(true);
  };

  const handleForgotPassword = async () => {
    if (!emailValid) {
      toast.error('Please enter a valid registered email.');
      return;
    }

    setSending(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset instructions sent to your email.');
      setOpen(false);
      setEmail('');
      setEmailValid(null);
    } catch {
      toast.error('Error sending reset instructions.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
      <form ref={ref} onSubmit={submitCb}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <Link
              to='/'
              className='flex flex-col items-center gap-2 font-medium'
            >
              <div className='flex gap-3 items-center justify-center rounded-md'>
                <GalleryVerticalEnd className='size-6' />
                <h1 className='font-bold'>SDC</h1>
              </div>
            </Link>
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
          <div className='flex flex-col'>
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant='link'
                  size={'sm'}
                  className='text-xs text-center w-fit my-2 self-end'
                >
                  Forgot Password?
                </Button>
              </DialogTrigger>
              <DialogContent className='gap-1'>
                <DialogHeader>
                  <DialogTitle>Forgot Password?</DialogTitle>
                </DialogHeader>
                <Input
                  type='email'
                  value={email}
                  onChange={(e) => validateEmail(e.target.value)}
                  required
                  placeholder='Enter your email'
                  className='mb-2'
                />
                {email && emailValid === false && (
                  <div className='text-xs text-red-500'>
                    Invalid email format.
                  </div>
                )}
                {email && emailValid === true && (
                  <div className='text-xs text-green-600'>Email is valid.</div>
                )}
                <DialogFooter>
                  <Button onClick={handleForgotPassword} disabled={!emailValid}>
                    {sending ? (
                      <div className='flex flex-row gap-1 items-center'>
                        <Loader2 className='animate-spin' />
                        <h1>Sending...</h1>
                      </div>
                    ) : (
                      <h1>Send Reset Link</h1>
                    )}
                  </Button>
                  <Button variant='secondary' onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className='flex flex-col gap-3'>
              <Button type='submit' className='w-full'>
                Login
              </Button>
              <Button
                variant={'ghost'}
                onClick={guestLoginCb}
                type='button'
                className='w-full'
              >
                Login as Guest
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
