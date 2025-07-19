import { GalleryVerticalEnd } from 'lucide-react';

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

export function RegistrationGenderSelect() {
  return (
    <Select name='gender'>
      <SelectTrigger className='w-full'>
        <SelectValue placeholder='Gender' />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Gender</SelectLabel>
          <SelectItem value='M'>Male</SelectItem>
          <SelectItem value='F'>Female</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

export function MemberRegisterForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
      <Form action='/auth/register' method='post'>
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
              <div className='flex flex-row gap-5 w-full'>
                <div className='flex flex-col gap-3 w-full'>
                  <Label htmlFor='gender'>Gender</Label>
                  <RegistrationGenderSelect />
                </div>
                <div className='flex flex-col gap-3 w-full'>
                  <DatePicker label='Date of Birth' fieldName='dob' />
                </div>
                <div className='flex flex-col gap-3 w-full'>
                  <Label htmlFor='languageCode'>Language</Label>
                  <LanguageSelect
                    placeholder='Language'
                    fieldName='languageCode'
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
      </Form>
    </div>
  );
}
