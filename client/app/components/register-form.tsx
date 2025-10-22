import { GalleryVerticalEnd } from 'lucide-react';
import { useState } from 'react';

import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Form, Link, useSubmit } from 'react-router';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { LanguageSelect } from './language-select';
import { DatePicker } from './date-picker';

export function RegistrationGenderSelect({
  className,
  placeholder,
  label,
  fieldName,
  required = false,
  value,
  onValueChange,
  onChange,
}: {
  className?: string;
  placeholder?: string;
  label?: string;
  fieldName: string;
  required?: boolean;
  value?: string;
  onValueChange?: (val: string) => void;
  onChange?: any;
}) {
  const [internalValue, setInternalValue] = useState<string>('');
  const controlled = value !== undefined && onValueChange !== undefined;
  const selectValue = controlled ? value : internalValue;
  const selectOnChange = controlled
    ? onValueChange
    : (val: string) => {
        setInternalValue(val);
        if (onChange) {
          onChange({ target: { value: val } });
        }
      };

  return (
    <>
      <Select value={selectValue} onValueChange={selectOnChange}>
        <SelectTrigger className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder ?? 'Gender'} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{label ?? 'Gender'}</SelectLabel>
            <SelectItem value='M'>Male</SelectItem>
            <SelectItem value='F'>Female</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <input
        type='hidden'
        name={fieldName}
        value={selectValue}
        required={required}
        onChange={onChange}
      />
    </>
  );
}

export function MemberRegisterForm({
  className,
  submitCb,
  ref,
  ...props
}: {
  className?: string;
  submitCb: (e: React.FormEvent) => Promise<void>;
  ref: React.RefObject<HTMLFormElement | null>;
}) {
  // Live password validation state
  const [password, setPassword] = useState('');
  const passwordRequirements = [
    {
      label: 'At least one lowercase letter',
      test: (pw: string) => /[a-z]/.test(pw),
    },
    {
      label: 'At least one uppercase letter',
      test: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: 'At least one digit',
      test: (pw: string) => /\d/.test(pw),
    },
    {
      label: 'At least one special character (@$!%*?&)',
      test: (pw: string) => /[@$!%*?&]/.test(pw),
    },
    {
      label: '6-50 characters',
      test: (pw: string) => pw.length >= 6 && pw.length <= 50,
    },
  ];

  return (
    <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
      <form ref={ref} onSubmit={submitCb}>
        <div className='flex flex-col gap-6'>
          <div className='flex flex-col items-center gap-2'>
            <a
              href='#'
              className='flex flex-col items-center gap-2 font-medium'
            >
              <div className='flex gap-3 items-center justify-center rounded-md'>
                {/* <GalleryVerticalEnd className='size-6' /> */}
                <img src='/soc-logo.png' alt='' className='scale-150' />
                <h1 className='font-bold'>SOC</h1>
              </div>
            </a>
            <h1 className='text-xl font-bold'>Membership Registration</h1>
            <div className='text-center text-sm'>
              Already have an account?{' '}
              <Link to='/auth/login' className='underline underline-offset-4'>
                Login
              </Link>
            </div>
          </div>
          <div className='flex flex-col gap-6'>
            <div className='grid gap-3'>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                name='username'
                type='text'
                placeholder='Alis'
                required
              />
              <div className='flex flex-row gap-5 w-full'>
                <div className='flex flex-col gap-3 w-full'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    name='firstName'
                    type='text'
                    placeholder='Alis'
                    required
                  />
                </div>
                <div className='flex flex-col gap-3 w-full'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    name='lastName'
                    type='text'
                    placeholder='Alis'
                    required
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-5 w-full'>
                <div className='flex flex-col gap-3'>
                  <Label htmlFor='gender'>Gender</Label>
                  {/* <RegistrationGenderSelect
                    fieldName='gender'
                    required={true}
                  /> */}
                </div>
                <div className='flex flex-col gap-3'>
                  <Label htmlFor='languageCode'>Language</Label>
                  <LanguageSelect
                    placeholder='Language'
                    fieldName='languageCode'
                    required
                  />
                </div>
                <div className='flex flex-col gap-3 col-span-2'>
                  <DatePicker
                    label='Date of Birth'
                    fieldName='dob'
                    required={true}
                  />
                </div>
              </div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                name='email'
                type='text'
                placeholder='user@mail.com'
                required
              />
              <Label htmlFor='password'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder='password123'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete='new-password'
              />
              {/* Live password validation feedback */}
              <div className='flex flex-col gap-1 text-sm mt-1'>
                {passwordRequirements.map((req, idx) => (
                  <div key={idx} className='flex items-center gap-2'>
                    <span
                      style={{
                        color: req.test(password) ? 'green' : 'red',
                        fontWeight: req.test(password) ? 'bold' : 'normal',
                      }}
                    >
                      {req.test(password) ? '✓' : '✗'}
                    </span>
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                placeholder='password123'
                required
                autoComplete='new-password'
              />
            </div>
            <Button
              type='submit'
              className='w-full'
              disabled={
                !passwordRequirements.every((req) => req.test(password))
              }
            >
              Register
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
