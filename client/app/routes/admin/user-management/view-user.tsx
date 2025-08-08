import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '~/components/ui/card';
import { Loader2, FileQuestion, User } from 'lucide-react';
import { apiPrivate } from '~/services/api';
import { Button } from '~/components/ui/button';
import useApiPrivate from '~/hooks/useApiPrivate';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';

interface UserRole {
  role: {
    roleId: string;
    roleName: string;
  };
}

interface UserProfile {
  age?: number;
  gender?: string;
  languageCode?: string;
}

interface Email {
  emailId: string;
  email: string;
  isPrimary: boolean;
}

interface PhoneNumber {
  phoneId: string;
  phoneNumber: string;
  isPrimary: boolean;
}

interface UserStatus {
  statusName: string;
}

interface User {
  userId: string;
  username: string;
  createdAt: string;
  modifiedAt: string;
  status?: UserStatus;
  userRoles: UserRole[];
  userProfile?: UserProfile;
  emails: Email[];
  phoneNumbers: PhoneNumber[];
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function UserDetails({ user }: { user: User }) {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <User className='h-5 w-5' />
          User Details
        </CardTitle>
        <CardDescription>
          View user information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <h3 className='font-semibold'>Basic Information</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <span className='font-medium'>User ID: </span>
              {user.userId}
            </div>
            <div>
              <span className='font-medium'>Username: </span>
              {user.username || (
                <span className='text-muted-foreground'>N/A</span>
              )}
            </div>
            <div>
              <span className='font-medium'>Created At: </span>
              {formatDate(user.createdAt)}
            </div>
            <div>
              <span className='font-medium'>Last Modified: </span>
              {formatDate(user.modifiedAt)}
            </div>
            <div>
              <span className='font-medium'>Status: </span>
              {user.status?.statusName || (
                <span className='text-muted-foreground'>N/A</span>
              )}
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>Profile</h3>
          {user.userProfile ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <span className='font-medium'>Age: </span>
                {user.userProfile.age || (
                  <span className='text-muted-foreground'>N/A</span>
                )}
              </div>
              <div>
                <span className='font-medium'>Gender: </span>
                {user.userProfile.gender || (
                  <span className='text-muted-foreground'>N/A</span>
                )}
              </div>
              <div>
                <span className='font-medium'>Language: </span>
                {user.userProfile.languageCode || (
                  <span className='text-muted-foreground'>N/A</span>
                )}
              </div>
            </div>
          ) : (
            <div className='text-muted-foreground'>
              No profile information available
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>Roles</h3>
          {user.userRoles.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {user.userRoles.map((userRole) => (
                <span
                  key={userRole.role.roleId}
                  className='px-2 py-1 bg-muted rounded text-sm'
                >
                  {userRole.role.roleName}
                </span>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground'>No roles assigned</div>
          )}
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>Emails</h3>
          {user.emails.length > 0 ? (
            <div className='space-y-2'>
              {user.emails.map((email) => (
                <div key={email.emailId} className='flex items-center gap-2'>
                  <span>{email.email}</span>
                  {email.isPrimary && (
                    <span className='px-2 py-1 bg-primary text-primary-foreground text-xs rounded'>
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground'>
              No email addresses available
            </div>
          )}
        </div>

        <div className='space-y-2'>
          <h3 className='font-semibold'>Phone Numbers</h3>
          {user.phoneNumbers.length > 0 ? (
            <div className='space-y-2'>
              {user.phoneNumbers.map((phone) => (
                <div key={phone.phoneId} className='flex items-center gap-2'>
                  <span>{phone.phoneNumber}</span>
                  {phone.isPrimary && (
                    <span className='px-2 py-1 bg-primary text-primary-foreground text-xs rounded'>
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className='text-muted-foreground'>
              No phone numbers available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminViewUserPage() {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data: responseData } = await apiPrivate.get(
          `/user/admin/${userId}`,
        );
        setUser(responseData.data);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) {
          toast.error('User not found');
        } else {
          toast.error('Failed to fetch user details');
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchUser();
  }, [userId, apiPrivate]);

  if (loading) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh]'>
        <Loader2 className='h-8 w-8 animate-spin mb-2' />
        <div>Loading user...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh]'>
        <FileQuestion className='h-10 w-10 mb-2 text-muted-foreground' />
        <div className='text-lg font-semibold'>User not found</div>
      </div>
    );
  }

  return (
    <div className='w-full p-6'>
      <div className='flex flex-col gap-8'>
        <div className='w-full'>
          <UserDetails user={user} />
        </div>
      </div>
    </div>
  );
}
