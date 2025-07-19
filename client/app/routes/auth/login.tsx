import { isAxiosError } from 'axios';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { LoginForm } from '~/components/login-form';
import useAuth from '~/hooks/useAuth';
import { useJWTDecode } from '~/hooks/useJWTDecode';
import api from '~/services/api';

export default function LoginPage() {
  const loginFormRef = useRef<HTMLFormElement>(null);

  const { setAccessToken } = useAuth();
  const JWTDecode = useJWTDecode();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loginFormRef.current) {
      const formData = new FormData(loginFormRef.current);
      const username = formData.get('username') as string;
      const password = formData.get('password') as string;

      try {
        const { data: responseData } = await api.post(
          '/auth/login',
          { username, password },
          { withCredentials: true },
        );

        setAccessToken(responseData.accessToken);
        await JWTDecode(responseData.accessToken);
        navigate('/');
        // If auth successful, redirect to dashboard
      } catch (error) {
        let message;
        if (isAxiosError(error)) {
          message =
            error.response?.data.message ||
            'Something went wrong. Please try again later.';
        }
        setError(message);
      }
    }
  };

  return (
    <div className='bg-background flex w-full sm:w-1/2 md:w-1/3 lg:w-1/4 min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex flex-col gap-5 w-full'>
        <LoginForm ref={loginFormRef} submitCb={handleSubmit} />
        {error ? (
          <div className='bg-red-500 px-2 py-1 rounded-md'>{error}</div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
