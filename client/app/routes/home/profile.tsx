import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import LoadingSpinner from '~/components/LoadingSpinner';
import { Button } from '~/components/ui/button';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';
import StatusCodes from '~/statusConfig';

export function VerifyEmailButton({
  btnText,
  emailId,
}: {
  btnText?: string;
  emailId: number;
}) {
  const apiPrivate = useApiPrivate();
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    try {
      const { data: responseData, status: responseStatus } =
        await apiPrivate.post('/auth/send-verification', { emailId });

      if (responseStatus === 200) {
        setMsg('Verification Email Sent!');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        setError(error.response?.data.message);
      }
    }
  };

  return (
    <>
      <Button className='cursor-pointer' onClick={handleVerify}>
        {btnText ?? 'Verify Email'}
      </Button>
      <p className='text-green-400'>{msg}</p>
      <p className='text-red-400'>{error}</p>
    </>
  );
}

export default function UserProfile() {
  const apiPrivate = useApiPrivate();
  const { accessToken, loading, setLoading } = useAuth();
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
  }, [accessToken]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className='text-red-500'>{error}</div>;
  if (!user) return <div>No user data found.</div>;

  return (
    <div className='p-4'>
      <h2 className='text-xl font-bold mb-2'>User Profile</h2>
      <div className='flex flex-col gap-3 '>
        <div>
          <strong>Username:</strong> {user.username}
        </div>
        <div>
          <strong>First Name:</strong> {user.userProfile?.firstName}
        </div>
        <div>
          <strong>Last Name:</strong> {user.userProfile?.lastName}
        </div>
        <div>
          <strong>Date of Birth:</strong>{' '}
          {new Date(user.userProfile.dob).toLocaleDateString()}
        </div>
        <div className='flex flex-row flex-wrap gap-2 items-center'>
          <p>
            <strong>Email:</strong> {user.emails?.email}
          </p>
          {user.status.statusId !== StatusCodes.VERIFIED ? (
            <VerifyEmailButton emailId={user.emails?.emailId} />
          ) : (
            ''
          )}
        </div>
        <div>
          <strong>Role:</strong> {user.userRoles.role.roleName}
        </div>
        <div>
          <strong>Status:</strong> {user.status.statusName}
        </div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}
