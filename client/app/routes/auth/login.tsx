import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useActionData, useNavigate } from 'react-router';
import { LoginForm } from '~/components/login-form';
import useAuth from '~/hooks/useAuth';
import { useJWTDecode } from '~/hooks/useJWTDecode';
import api from '~/services/api';

export const action = async ({ request }: any) => {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');

  try {
    const { data: responseData } = await api.post(
      '/auth/login',
      { username, password },
      { withCredentials: true },
    );
    return responseData;
  } catch (error) {
    if (isAxiosError(error)) {
      return { error: error.response?.data.message };
    }
    return error;
  }
};

export default function LoginPage() {
  const [error, setError] = useState('');
  let actionData = useActionData();
  const { setAccessToken, loading } = useAuth();
  const JWTDecode = useJWTDecode();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!actionData) {
        return;
      }
      if (actionData.error) {
        return setError(actionData.error);
      }
      setAccessToken(actionData.accessToken);
      await JWTDecode(actionData.accessToken);
      navigate('/admin');
    })();
  }, [actionData, loading]);

  return (
    <div className='bg-background flex w-full sm:w-1/2 md:w-1/3 lg:w-1/4 min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex flex-col gap-5 w-full'>
        <LoginForm />
        {error !== '' ? (
          <div className='bg-red-500 px-2 py-1 rounded-md'>{error}</div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
