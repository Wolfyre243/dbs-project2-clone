import RequireAuth from '~/components/RequireAuth';
import Roles from '~/rolesConfig';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserPlus, Shield, Loader2 } from 'lucide-react';
import { RegistrationGenderSelect } from '~/components/register-form';
import { LanguageSelect } from '~/components/language-select';
import { DatePicker } from '~/components/date-picker';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import api from '~/services/api';
import useApiPrivate from '~/hooks/useApiPrivate';
import { Eye, EyeClosed } from 'lucide-react';

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    gender: '',
    languageCode: '',
    dob: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const updateForm = (fields: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Prepare body
    const body: { [key: string]: string } = { ...form };
    // Format dob as ISO string if present
    if (body.dob) {
      body.dob = new Date(body.dob).toISOString();
    }

    try {
      const { data: responseData } = await apiPrivate.post(
        '/auth/register-admin',
        body,
      );
      setSuccess('Admin account created successfully!');
      setTimeout(() => navigate('/admin'), 1500);
    } catch (error: any) {
      let message = 'Something went wrong. Please try again later.';
      if (error.response?.data?.message) {
        message = error.response.data.message;
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <RequireAuth allowedRoles={[Roles.SUPERADMIN]}>
      <div className='h-full w-full bg-background text-foreground p-6'>
        <div className='max-w-4xl mx-auto space-y-6'>
          {/* Page Header */}
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <Shield className='h-8 w-8 text-primary' />
              <h1 className='text-3xl font-bold tracking-tight'>
                Admin Registration
              </h1>
            </div>
            <p className='text-muted-foreground'>
              Register new administrators to manage the Singapore Discovery
              Centre system.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <Card className='w-full'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <UserPlus className='h-5 w-5' />
                  Create New Admin Account
                </CardTitle>
                <CardDescription>
                  Fill in the details below to create a new administrator
                  account.
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>First Name</Label>
                    <Input
                      id='firstName'
                      name='firstName'
                      placeholder='Enter first name'
                      className='bg-background border-border'
                      value={form.firstName}
                      onChange={(e) =>
                        updateForm({ firstName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>Last Name</Label>
                    <Input
                      id='lastName'
                      name='lastName'
                      placeholder='Enter last name'
                      className='bg-background border-border'
                      value={form.lastName}
                      onChange={(e) => updateForm({ lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='username'>Username</Label>
                    <Input
                      id='username'
                      name='username'
                      placeholder='Enter username'
                      className='bg-background border-border'
                      value={form.username}
                      onChange={(e) => updateForm({ username: e.target.value })}
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input
                      id='email'
                      name='email'
                      type='email'
                      placeholder='admin@example.com'
                      className='bg-background border-border'
                      value={form.email}
                      onChange={(e) => updateForm({ email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password</Label>
                    <div className='relative flex flex-row gap-1'>
                      <Input
                        id='password'
                        name='password'
                        type={showPassword ? 'text' : 'password'}
                        placeholder='Enter secure password'
                        className='bg-background border-border'
                        value={form.password}
                        onChange={(e) =>
                          updateForm({ password: e.target.value })
                        }
                        required
                        autoComplete='new-password'
                      />
                      <Button
                        type='button'
                        variant={'default'}
                        size={'icon'}
                        className='px-2 py-1 bg-transparent text-accent-foreground hover:bg-transparent'
                        onClick={() => setShowPassword((v) => !v)}
                      >
                        {showPassword ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                    <div className='flex flex-col gap-1 text-sm mt-1'>
                      {passwordRequirements.map((req, idx) => (
                        <div key={idx} className='flex items-center gap-2'>
                          <span
                            style={{
                              color: req.test(form.password) ? 'green' : 'red',
                              fontWeight: req.test(form.password)
                                ? 'bold'
                                : 'normal',
                            }}
                          >
                            {req.test(form.password) ? '✓' : '✗'}
                          </span>
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <div className='relative flex flex-row gap-1'>
                      <Input
                        id='confirmPassword'
                        name='confirmPassword'
                        type={showConfirm ? 'text' : 'password'}
                        placeholder='Confirm password'
                        className='bg-background border-border'
                        value={form.confirmPassword}
                        onChange={(e) =>
                          updateForm({ confirmPassword: e.target.value })
                        }
                        required
                        autoComplete='new-password'
                      />
                      <Button
                        type='button'
                        variant={'default'}
                        size={'icon'}
                        className='px-2 py-1 bg-transparent text-accent-foreground hover:bg-transparent'
                        onClick={() => setShowConfirm((v) => !v)}
                      >
                        {showConfirm ? <Eye /> : <EyeClosed />}
                      </Button>
                    </div>
                    <div className='text-sm mt-1'>
                      {form.confirmPassword ? (
                        form.confirmPassword === form.password ? (
                          <span style={{ color: 'green', fontWeight: 'bold' }}>
                            ✓ Passwords match
                          </span>
                        ) : (
                          <span style={{ color: 'red' }}>
                            ✗ Passwords do not match
                          </span>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='gender'>Gender</Label>
                    <RegistrationGenderSelect
                      fieldName='gender'
                      required={true}
                      onChange={(e: any) =>
                        updateForm({ gender: e.target.value })
                      }
                      placeholder='Select gender'
                      label='Gender'
                      className='w-full'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='languageCode'>Language</Label>
                    <LanguageSelect
                      fieldName='languageCode'
                      required={true}
                      value={form.languageCode}
                      onValueChange={(val: string) =>
                        updateForm({ languageCode: val })
                      }
                      placeholder='Select language'
                      className='w-full'
                    />
                  </div>
                  <div className='space-y-2'>
                    <DatePicker
                      label='Date of Birth'
                      fieldName='dob'
                      required={true}
                      onChange={(val: string) => updateForm({ dob: val })}
                    />
                  </div>
                </div>

                {error && (
                  <div className='bg-red-500 px-2 py-1 rounded-md text-white'>
                    {error}
                  </div>
                )}
                {success && (
                  <div className='bg-green-500 px-2 py-1 rounded-md text-white'>
                    {success}
                  </div>
                )}

                <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                  <Button className='flex-1' type='submit' disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className='mr-2 h-4 w-4' />
                        Create Admin Account
                      </>
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    className='flex-1'
                    type='button'
                    onClick={() => navigate('/admin')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Additional Info Card */}
          <Card className='bg-muted/50 border-muted'>
            <CardContent className=''>
              <div className='flex items-start gap-3'>
                <Shield className='h-5 w-5 text-primary mt-0.5' />
                <div className='space-y-1'>
                  <h3 className='font-semibold text-sm'>Admin Privileges</h3>
                  <p className='text-sm text-muted-foreground'>
                    Admin accounts will have access to manage users, content,
                    and system settings. Ensure you only grant admin access to
                    trusted personnel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
