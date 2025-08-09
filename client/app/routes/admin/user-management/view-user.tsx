import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '~/components/ui/card';
import {
  Loader2,
  FileQuestion,
  User,
  Car,
  UserLock,
  History,
} from 'lucide-react';
import { apiPrivate } from '~/services/api';
import { Button } from '~/components/ui/button';
import useApiPrivate from '~/hooks/useApiPrivate';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { Badge } from '~/components/ui/badge';

interface UserRole {
  role: {
    roleId: string;
    roleName: string;
  };
}

interface UserProfile {
  dob?: number;
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
  userRoles: UserRole;
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

function calculateAge(dob?: string): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

function UserDetails({ user }: { user: User }) {
  return (
    <div className='flex flex-row gap-4'>
      <Card className='w-full gap-2'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <User className='h-5 w-5' />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='flex flex-col gap-4'>
            <div className='flex flex-row gap-2 items-center'>
              <span className='font-medium'>
                Username:{' '}
                {user.username || (
                  <span className='text-muted-foreground'>N/A</span>
                )}
              </span>

              {user.userRoles.role && (
                <Badge variant={'outline'}>
                  {user.userRoles.role.roleName.toUpperCase()}
                </Badge>
              )}

              {user.status?.statusName && (
                <Badge variant={'outline'}>
                  {user.status?.statusName.toUpperCase()}
                </Badge>
              )}
            </div>
            <div>
              <span className='font-medium'>User ID: </span>
              {user.userId}
            </div>

            <div>
              <span className='font-medium'>Created At: </span>
              {formatDate(user.createdAt)}
            </div>
            <div>
              <span className='font-medium'>Last Modified: </span>
              {formatDate(user.modifiedAt)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='w-full gap-2'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-xl'>
            <UserLock className='h-5 w-5' />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.userProfile ? (
            <div className='flex flex-col gap-4'>
              <div>
                <span className='font-medium'>Age: </span>
                {calculateAge(
                  typeof user.userProfile.dob === 'string'
                    ? user.userProfile.dob
                    : user.userProfile.dob
                      ? new Date(user.userProfile.dob)
                          .toISOString()
                          .slice(0, 10)
                      : undefined,
                ) !== null ? (
                  calculateAge(
                    typeof user.userProfile.dob === 'string'
                      ? user.userProfile.dob
                      : user.userProfile.dob
                        ? new Date(user.userProfile.dob)
                            .toISOString()
                            .slice(0, 10)
                        : undefined,
                  )
                ) : (
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
        </CardContent>
      </Card>
    </div>
  );
}

// RecentActivity component (inline for this file)
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Activity {
  eventId: string;
  eventType: string;
  eventTypeDescription?: string;
  timestamp: string;
  entityName?: string;
  entityId?: string;
  metadata?: any;
}

function RecentActivity({ userId }: { userId: string }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pageCount, setPageCount] = useState(1);

  const apiPrivate = useApiPrivate();

  useEffect(() => {
    async function fetchActivity() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await apiPrivate.get(
          `/user/recent-activity/${userId}?page=${page}&pageSize=${pageSize}`,
        );
        setActivities(data.data.activities);
        setPageCount(data.data.pageCount || 1);
      } catch (err) {
        setError('Failed to fetch recent activity');
      } finally {
        setLoading(false);
      }
    }
    if (userId) fetchActivity();
  }, [userId, page, pageSize, apiPrivate]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2 text-xl'>
          <History className='h-5 w-5' />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Latest actions performed by this user.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className='flex items-center gap-2'>
            <Loader2 className='h-5 w-5 animate-spin' />
            <span>Loading activity...</span>
          </div>
        ) : error ? (
          <div className='text-red-500'>{error}</div>
        ) : activities.length === 0 ? (
          <div className='text-muted-foreground'>No recent activity found.</div>
        ) : (
          <div>
            <ul className='space-y-2'>
              {activities.map((activity) => (
                <li key={activity.eventId} className='border-b pb-2'>
                  <div className='flex flex-col'>
                    <span>
                      <b>
                        {activity.eventTypeDescription || activity.eventType}
                      </b>
                    </span>
                    <span className='text-xs text-muted-foreground'>
                      {formatDate(activity.timestamp)}
                    </span>
                    {activity.entityId && (
                      <span className='text-xs text-muted-foreground/50'>
                        Entity: {activity.entityName} {activity.entityId}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className='flex items-center justify-end gap-2 mt-4'>
              <Button
                variant='outline'
                size='sm'
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className='h-4 w-4' />
                Prev
              </Button>
              <span>
                Page {page} of {pageCount}
              </span>
              <Button
                variant='outline'
                size='sm'
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                Next
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Integrate RecentActivity into AdminViewUserPage
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
    <div className='flex flex-col gap-4 w-full p-6'>
      <h1 className='text-3xl font-bold mb-4'>User Details</h1>
      <div className='w-full'>
        <UserDetails user={user} />
      </div>
      <div className='w-full'>
        <RecentActivity userId={user.userId} />
      </div>
    </div>
  );
}
