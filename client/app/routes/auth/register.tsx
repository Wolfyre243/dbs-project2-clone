import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useActionData, useNavigate } from 'react-router';
import { LoginForm } from '~/components/login-form';
import { MemberRegisterForm } from '~/components/register-form';
import useAuth from '~/hooks/useAuth';
import { useJWTDecode } from '~/hooks/useJWTDecode';
import api from '~/services/api';

export const action = async ({ request }: any) => {
  const formData = await request.formData();
  const payload: Record<string, any> = {};
  for (const [key, value] of formData.entries()) {
    payload[key] = value;
  }

  try {
    console.log(payload);
    const { data: responseData } = await api.post('/auth/register', payload, {
      withCredentials: true,
    });
    return responseData;
  } catch (error) {
    if (isAxiosError(error)) {
      return { error: error.response?.data.message };
    }
    return error;
  }
};

export default function MemberRegisterPage() {
  const [error, setError] = useState('');
  let actionData = useActionData();
  const { setAccessToken, loading } = useAuth();
  const JWTDecode = useJWTDecode();
  const navigate = useNavigate();

  // useEffect(() => {
  //   (async () => {
  //     if (!actionData) {
  //       return;
  //     }
  //     if (actionData.error) {
  //       return setError(actionData.error);
  //     }
  //     setAccessToken(actionData.accessToken);
  //     await JWTDecode(actionData.accessToken);
  //     navigate('/');
  //   })();
  // }, [actionData, loading]);

  return (
    <div className='bg-background flex w-full sm:w-1/2 min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex flex-col gap-5 w-full'>
        <MemberRegisterForm />
        {error !== '' ? (
          <div className='bg-red-500 px-2 py-1 rounded-md'>{error}</div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
