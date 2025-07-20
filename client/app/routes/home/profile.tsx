import { useEffect, useState } from 'react';
import LoadingSpinner from '~/components/LoadingSpinner';
import useApiPrivate from '~/hooks/useApiPrivate';
import useAuth from '~/hooks/useAuth';

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
      <div>
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
        <div>
          <strong>Last Name:</strong> {user.userProfile?.lastName}
        </div>
        <div>
          <strong>Email:</strong> {user.emails?.email}
        </div>
        <div>
          <strong>Role:</strong> {user.userRoles.role.roleName}
        </div>
        {/* Add more fields as needed */}
      </div>
    </div>
  );
}
