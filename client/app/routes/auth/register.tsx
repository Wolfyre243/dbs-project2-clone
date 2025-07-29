import { AspectRatio } from '@radix-ui/react-aspect-ratio';
import { isAxiosError } from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useActionData, useNavigate } from 'react-router';
import { LoginForm } from '~/components/login-form';
import { StepperRegisterForm } from '~/components/StepperRegisterForm';
import useAuth from '~/hooks/useAuth';
import { useJWTDecode } from '~/hooks/useJWTDecode';
import api from '~/services/api';

type FormState = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  gender: string;
  languageCode: string;
  dob: string;
};

const initialState: FormState = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  gender: '',
  languageCode: '',
  dob: '',
};

export default function MemberRegisterPage() {
  const registerFormRef = useRef<HTMLFormElement>(null);

  const { setAccessToken } = useAuth();
  const JWTDecode = useJWTDecode();
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const updateForm = (fields: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...fields }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const body: { [key: string]: string } = {};
    Array.from(Object.keys(form)).forEach((key: string) => {
      if (key === 'dob') {
        body[key] = new Date(form[key]).toISOString();
      } else {
        // @ts-ignore
        body[key] = form[key];
      }
    });

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='bg-background flex w-full md:w-1/2 min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10'>
      <a href='/' className='mb-2 flex gap-2 items-center justify-center'>
        {/* SDC Logo */}
        <AspectRatio ratio={16 / 9} className='flex flex-col justify-center'>
          <img src='/sdc-logo.png' alt='SDC Logo' className='' />
        </AspectRatio>
        <span className='text-2xl font-semibold'>
          Singapore Discovery Centre
        </span>
      </a>
      <div className='flex flex-col gap-5 w-full'>
        <StepperRegisterForm
          ref={registerFormRef}
          submitCb={handleSubmit}
          form={form}
          setForm={updateForm}
          isLoading={isLoading}
        />
        {error ? (
          <div className='bg-red-500 px-2 py-1 rounded-md'>{error}</div>
        ) : null}
      </div>
    </div>
  );
}
