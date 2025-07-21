// Unauthorized page for handling missing logins
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import useApiPrivate from '~/hooks/useApiPrivate';

export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const apiPrivate = useApiPrivate();

  const [verifySuccess, setVerifySuccess] = useState<boolean>();
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const token = searchParams.get('token');

        if (!token) {
          setError('Missing verification token!');
          return;
        }

        const { status: responseStatus } = await apiPrivate.put(
          `/auth/verify/${token}`,
        );

        if (responseStatus === 204) {
          setVerifySuccess(true);
          setError('You may now close this tab, or go to your dashboard.');
        }
      } catch (error: any) {
        setVerifySuccess(false);
        setError(error.response.data.message);
      }
    })();
  }, []);

  return (
    <div className='flex flex-col items-center justify-center h-screen p-4'>
      {verifySuccess ? (
        <h1 className='text-4xl font-bold text-green-500 mb-4'>
          Verification Successful!
        </h1>
      ) : (
        <h1 className='text-4xl font-bold text-red-500 mb-4'>
          Verification Failed
        </h1>
      )}
      <p className='text-lg text-zinc-300 mb-6'>{error}</p>
      <Link
        to='/'
        className='bg-neutral-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-neutral-500 hover:scale-105 hover:shadow-md transition duration-200 ease-in-out'
      >
        Go Home
      </Link>
    </div>
  );
}
