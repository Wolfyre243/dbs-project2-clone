// TypeScript React
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { toast } from 'sonner';
import { GalleryVerticalEnd } from 'lucide-react';
import api from '~/services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Live password validation logic (copied from registration form)
  const passwordRequirements = [
    {
      label: 'At least one lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      label: 'At least one uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: 'At least one digit',
      test: (pw: string) => /\d/.test(pw),
    },
    {
      label: 'At least one special character (@$!%*?&)',
      test: (pw: string) => /[@$!%*?&]/.test(pw),
    },
    {
      label: '6-50 characters',
      test: (pw: string) => pw.length >= 6 && pw.length <= 50,
    },
  ];

  const allValid =
    passwordRequirements.every((req) => req.test(password)) &&
    password === confirmPassword;

  // Extract token from URL query
  const params = new URLSearchParams(location.search);
  const token = params.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/forbidden');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/auth/reset-password?token=${token}`, {
        password,
        confirmPassword,
      });
      toast.success('Password reset successful. You may now log in.');
      navigate('/auth/login');
    } catch {
      toast.error('Failed to reset password. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className='bg-background flex w-full sm:w-1/2 md:w-1/3 lg:w-1/4 min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex flex-col items-center gap-2'>
        <Link to='/' className='flex flex-col items-center gap-2 font-medium'>
          <div className='flex gap-3 items-center justify-center rounded-md'>
            <GalleryVerticalEnd className='size-6' />
            <h1 className='font-bold'>SOC</h1>
          </div>
        </Link>
        <h1 className='text-xl font-bold'>Reset Password</h1>
        <div className='text-center text-sm'>
          Remembered your password?{' '}
          <Link to='/auth/login' className='underline underline-offset-4'>
            Login
          </Link>
        </div>
      </div>
      <form
        className='flex flex-col gap-6 w-full'
        onSubmit={handleSubmit}
        autoComplete='off'
      >
        <div className='flex flex-col gap-3'>
          <Label htmlFor='password'>New Password</Label>
          <Input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder='Enter new password'
          />
          <div className='flex flex-col gap-1 text-sm mt-1'>
            {passwordRequirements.map((req, idx) => (
              <div key={idx} className='flex items-center gap-2'>
                <span
                  style={{
                    color: req.test(password) ? 'green' : 'red',
                    fontWeight: req.test(password) ? 'bold' : 'normal',
                  }}
                >
                  {req.test(password) ? '✓' : '✗'}
                </span>
                <span>{req.label}</span>
              </div>
            ))}
          </div>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder='Confirm new password'
          />
          <div className='text-sm mt-1'>
            {confirmPassword ? (
              confirmPassword === password ? (
                <span style={{ color: 'green', fontWeight: 'bold' }}>
                  ✓ Passwords match
                </span>
              ) : (
                <span style={{ color: 'red' }}>✗ Passwords do not match</span>
              )
            ) : null}
          </div>
        </div>
        <Button
          type='submit'
          className='w-full'
          disabled={submitting || !allValid}
        >
          {submitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}
