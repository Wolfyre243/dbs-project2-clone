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
}: {
  className?: string;
  placeholder?: string;
  label?: string;
  fieldName: string;
  required?: boolean;
}) {
  const [value, setValue] = useState<string>('');

  return (
    <>
      <Select value={value} onValueChange={setValue}>
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
      <input type='hidden' name={fieldName} value={value} required={required} />
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
                {/* TODO: Replace with SDC logo */}
                <GalleryVerticalEnd className='size-6' />
                <h1 className='font-bold'>SDC</h1>
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
                  <RegistrationGenderSelect
                    fieldName='gender'
                    required={true}
                  />
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
              />
              <Label htmlFor='confirmPassword'>Confirm Password</Label>
              <Input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                placeholder='password123'
                required
              />
            </div>
            <Button type='submit' className='w-full'>
              Register
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
