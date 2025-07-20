import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useActionData, useNavigate } from 'react-router';
import { LoginForm } from '~/components/login-form';
import { MemberRegisterForm } from '~/components/register-form';
import useAuth from '~/hooks/useAuth';
import { useJWTDecode } from '~/hooks/useJWTDecode';
import api from '~/services/api';

export default function MemberRegisterPage() {
  const registerFormRef = useRef<HTMLFormElement>(null);

  const { setAccessToken } = useAuth();
  const JWTDecode = useJWTDecode();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const form = registerFormRef.current;
    if (!form) return;

    const body: { [key: string]: string } = {};
    Array.from(form.elements).forEach((element) => {
      if (element instanceof HTMLInputElement && element.name) {
        if (element.name === 'dob') {
          body[element.name] = new Date(element.value).toISOString();
        } else {
          body[element.name] = element.value;
        }
      }
    });

    console.log(body);

    try {
      const { data: responseData } = await api.post('/auth/register', body, {
        withCredentials: true,
      });

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
  };

  return (
    <div className='bg-background flex w-full sm:w-1/2 min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <div className='flex flex-col gap-5 w-full'>
        <MemberRegisterForm ref={registerFormRef} submitCb={handleSubmit} />
        {error ? (
          <div className='bg-red-500 px-2 py-1 rounded-md'>{error}</div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
