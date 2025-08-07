import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import LoadingSpinner from '~/components/LoadingSpinner';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import StatusCodes from '~/statusConfig';
import { useTheme } from '~/context/themeProvider';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '~/components/ui/select';
import { LanguageSelect } from '~/components/language-select';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '~/components/ui/dialog';
import { Pencil, MailCheck, BadgeCheck, User, Settings } from 'lucide-react';
import Roles from '~/rolesConfig';

export function VerifyEmailButton({
  btnText,
  emailId,
}: {
  btnText?: string;
  emailId: number;
}) {
  const apiPrivate = useApiPrivate();
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    try {
      const promise = apiPrivate.post('/auth/send-verification', { emailId });

      toast.promise(promise, {
        loading: 'Loading...',
        success: (data) => {
          if (data.status === 200) {
            return `Verification email sent!`;
          }
        },
        error: 'Failed to send verification email',
      });
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message);
      }
    }
  };

  return (
    <>
      <Button
        className='cursor-pointer flex items-center gap-1'
        onClick={handleVerify}
        variant='outline'
        size='sm'
      >
        <MailCheck className='w-4 h-4' />
        <span className='hidden sm:inline'>{btnText ?? 'Verify Email'}</span>
      </Button>
      <p className='text-red-400'>{error}</p>
    </>
  );
}

// Edit Profile Dialog Component
function EditProfileDialog({
  user,
  onUpdate,
}: {
  user: any;
  onUpdate: (updatedUser: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState(user.username || '');
  const [firstName, setFirstName] = useState(user.userProfile?.firstName || '');
  const [lastName, setLastName] = useState(user.userProfile?.lastName || '');
  const apiPrivate = useApiPrivate();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: responseData } = await apiPrivate.put('/user/profile', {
        username,
        firstName,
        lastName,
      });

      toast.success('Profile updated successfully!');
      const updatedUser = responseData.data.user;
      onUpdate(updatedUser);
      setOpen(false);
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data.message || 'Failed to update profile');
      } else {
        toast.error('An unexpected error occurred');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm' className='flex items-center gap-1'>
          <Pencil className='w-4 h-4' />
          <span className='hidden sm:inline'>Edit Profile</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave} className='flex flex-col gap-4 mt-2'>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='edit-username'
            >
              Username
            </label>
            <input
              id='edit-username'
              className='w-full border rounded px-3 py-2 text-sm'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='edit-firstname'
            >
              First Name
            </label>
            <input
              id='edit-firstname'
              className='w-full border rounded px-3 py-2 text-sm'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              className='block text-sm font-medium mb-1'
              htmlFor='edit-lastname'
            >
              Last Name
            </label>
            <input
              id='edit-lastname'
              className='w-full border rounded px-3 py-2 text-sm'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='outline'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit' variant='default'>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Delete Account Dialog Component
function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    setOpen(false);
    alert('Account deletion not implemented.');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='destructive' size='sm'>
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete your account? This action is{' '}
            <span className='font-semibold text-red-500'>irreversible</span> and
            all your data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline'>
              Cancel
            </Button>
          </DialogClose>
          <Button type='button' variant='destructive' onClick={handleDelete}>
            Yes, Delete My Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function UserSettings() {
  const apiPrivate = useApiPrivate();
  const { theme, setTheme } = useTheme();
  const { accessToken, loading, setLoading, role } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { data: responseData } = await apiPrivate.get('/user/profile');
        setUser(responseData.data.user);
      } catch (err: any) {
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    })();
  }, [apiPrivate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className='text-red-500'>{error}</div>;
  if (!user) return <div>No user data found.</div>;

  if (role === Roles.GUEST) {
    return (
      <div className='w-full min-h-[70vh] px-2 py-8 bg-background flex flex-col md:flex-row gap-8'>
        <section className='flex-1 p-2 md:p-4'>
          <h2 className='text-2xl font-bold mb-4'>Profile</h2>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-2'>
              <div className='flex-1 flex flex-col gap-1'>
                <div className='flex flex-row items-center justify-between'>
                  <div className='flex flex-row items-center gap-2'>
                    <span className='text-lg font-semibold'>
                      {user.username}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <div className='text-xs text-muted-foreground mb-1'>
                  Account Created
                </div>
                <div className='font-medium'>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleString()
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const statusVariant =
    user.status?.statusId === StatusCodes.VERIFIED ||
    user.status?.statusId === StatusCodes.ACTIVE
      ? 'default'
      : 'destructive';

  return (
    <div className='w-full min-h-[70vh] px-2 py-8 bg-background flex flex-col md:flex-row gap-8'>
      {/* Profile Section */}
      <section className='flex-1 p-2 md:p-4'>
        <div className='flex flex-row gap-2 items-center mb-4'>
          <User />
          <h2 className='text-2xl font-bold'>Profile</h2>
        </div>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-2'>
            <div className='flex-1 flex flex-col gap-1'>
              <div className='flex flex-row items-center justify-between'>
                <div className='flex flex-row items-center gap-2'>
                  <span className='text-lg font-semibold'>{user.username}</span>
                  <Badge variant={statusVariant}>
                    {user.status?.statusId === StatusCodes.VERIFIED && (
                      <BadgeCheck />
                    )}
                    {user.status?.statusName || 'Unknown'}
                  </Badge>
                  <Badge variant='secondary'>
                    {user.userRoles?.role?.roleName || 'Unknown'}
                  </Badge>
                </div>
                <EditProfileDialog user={user} onUpdate={setUser} />
              </div>
              <div className='flex flex-row items-center gap-2 text-sm text-muted-foreground'>
                <span>
                  {user.userProfile?.firstName} {user.userProfile?.lastName}
                </span>
              </div>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>
                Date of Birth
              </div>
              <div className='font-medium'>
                {user.userProfile?.dob
                  ? new Date(user.userProfile.dob).toLocaleDateString()
                  : 'N/A'}
              </div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>Email</div>
              <div className='flex flex-row items-center gap-2'>
                {user.emails ? (
                  <>
                    <span className='font-medium'>{user.emails?.email}</span>
                    {user.status?.statusId !== StatusCodes.VERIFIED && (
                      <VerifyEmailButton emailId={user.emails?.emailId} />
                    )}
                  </>
                ) : (
                  <h1>Login to save data!</h1>
                )}
              </div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>Gender</div>
              <div className='font-medium'>
                {user.userProfile?.gender || 'Not set'}
              </div>
            </div>
            <div>
              <div className='text-xs text-muted-foreground mb-1'>
                Account Created
              </div>
              <div className='font-medium'>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString()
                  : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Section */}
      <section className='flex-1 flex flex-col p-2 md:p-4'>
        <div className='flex flex-row gap-2 items-center mb-4'>
          <Settings />
          <h2 className='text-2xl font-bold'>Settings</h2>
        </div>
        {/* Security */}
        <div className='flex flex-col gap-3'>
          <div>
            <h3 className='text-lg font-semibold'>Security</h3>
            <p className='text-xs text-muted-foreground mb-2'>
              Manage your password and enable extra security for your account.
            </p>
            <div className='flex flex-row gap-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={async () => {
                  try {
                    if (!user?.emails?.email) {
                      toast.error('No registered email found.');
                      return;
                    }
                    const promise = apiPrivate.post('/auth/forgot-password', {
                      email: user.emails.email,
                    });
                    toast.promise(promise, {
                      loading: 'Sending password reset email...',
                      success: () => 'Password reset email sent!',
                      error: 'Failed to send password reset email.',
                    });
                  } catch (error) {
                    if (isAxiosError(error)) {
                      toast.error(
                        error.response?.data.message ||
                          'Failed to send password reset email.',
                      );
                    } else {
                      toast.error('An unexpected error occurred');
                    }
                  }
                }}
              >
                Change Password
              </Button>
              {/* <div className='flex items-center gap-2'>
                <span className='text-sm'>2FA:</span>
                <Badge variant='secondary'>Not Enabled</Badge>
              </div> */}
            </div>
          </div>
          {/* Preferences */}
          <div>
            <h3 className='text-lg font-semibold mb-1'>Preferences</h3>
            <p className='text-xs text-muted-foreground mb-2'>
              Customize your experience, including theme and language.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex flex-col gap-1'>
                <span className='text-sm'>Theme</span>
                <Select
                  value={theme}
                  onValueChange={(val) =>
                    setTheme(val as 'system' | 'light' | 'dark')
                  }
                >
                  <SelectTrigger size='sm' className='min-w-[100px] capitalize'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='system' className='capitalize'>
                      System
                    </SelectItem>
                    <SelectItem value='light' className='capitalize'>
                      Light
                    </SelectItem>
                    <SelectItem value='dark' className='capitalize'>
                      Dark
                    </SelectItem>
                  </SelectContent>
                </Select>
                <span className='text-xs text-muted-foreground'>
                  Choose your preferred color theme.
                </span>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='text-sm'>Language</span>
                <LanguageSelect
                  fieldName='language'
                  value={user.userProfile?.languageCode || ''}
                  onValueChange={() => {}}
                />
                <span className='text-xs text-muted-foreground'>
                  Select your display language.
                </span>
              </div>
            </div>
          </div>
          {/* Danger Zone */}
          <div className='mt-4 border-t border-neutral-300 pt-4'>
            <h3 className='text-lg font-semibold mb-1 text-red-500'>
              Danger Zone
            </h3>
            <p className='text-xs text-muted-foreground mb-2'>
              Deleting your account is irreversible. All your data will be
              permanently removed.
            </p>
            <DeleteAccountDialog />
          </div>
        </div>
      </section>
    </div>
  );
}
