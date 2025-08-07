import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Link } from 'react-router';
import { RegistrationGenderSelect } from './register-form';
import { LanguageSelect } from './language-select';
import { DatePicker } from './date-picker';
import { cn } from '~/lib/utils';
import { Eye, EyeClosed, LoaderCircle } from 'lucide-react';

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

function Step1AccountInfo({
  form,
  setForm,
  next,
}: {
  form: FormState;
  setForm: (f: Partial<FormState>) => void;
  next: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const allValid =
    form.username &&
    form.email &&
    passwordRequirements.every((req) => req.test(form.password)) &&
    form.password === form.confirmPassword;

  return (
    <div className='flex flex-col gap-3'>
      <h2 className='text-xl font-bold'>Account Info</h2>
      <Label htmlFor='username'>Username</Label>
      <Input
        id='username'
        name='username'
        type='text'
        value={form.username}
        onChange={(e) => setForm({ username: e.target.value })}
        required
      />
      <Label htmlFor='email'>Email</Label>
      <Input
        id='email'
        name='email'
        type='text'
        value={form.email}
        onChange={(e) => setForm({ email: e.target.value })}
        required
      />
      <Label htmlFor='password'>Password</Label>
      <div className='relative flex flex-row gap-1'>
        <Input
          id='password'
          name='password'
          type={showPassword ? 'text' : 'password'}
          value={form.password}
          onChange={(e) => setForm({ password: e.target.value })}
          required
          autoComplete='new-password'
        />
        <Button
          type='button'
          variant={'default'}
          size={'icon'}
          className='px-2 py-1 bg-transparent text-accent-foreground hover:bg-transparent'
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <Eye /> : <EyeClosed />}
        </Button>
      </div>
      <div className='flex flex-col gap-1 text-sm mt-1'>
        {passwordRequirements.map((req, idx) => (
          <div key={idx} className='flex items-center gap-2'>
            <span
              style={{
                color: req.test(form.password) ? 'green' : 'red',
                fontWeight: req.test(form.password) ? 'bold' : 'normal',
              }}
            >
              {req.test(form.password) ? '✓' : '✗'}
            </span>
            <span>{req.label}</span>
          </div>
        ))}
      </div>
      <Label htmlFor='confirmPassword'>Confirm Password</Label>
      <div className='relative flex flex-row gap-1'>
        <Input
          id='confirmPassword'
          name='confirmPassword'
          type={showConfirm ? 'text' : 'password'}
          value={form.confirmPassword}
          onChange={(e) => setForm({ confirmPassword: e.target.value })}
          required
          autoComplete='new-password'
        />
        <Button
          type='button'
          variant={'default'}
          size={'icon'}
          className='px-2 py-1 bg-transparent text-accent-foreground hover:bg-transparent'
          onClick={() => setShowConfirm((v) => !v)}
        >
          {showConfirm ? <Eye /> : <EyeClosed />}
        </Button>
      </div>
      <div className='text-sm mt-1'>
        {form.confirmPassword ? (
          form.confirmPassword === form.password ? (
            <span style={{ color: 'green', fontWeight: 'bold' }}>
              ✓ Passwords match
            </span>
          ) : (
            <span style={{ color: 'red' }}>✗ Passwords do not match</span>
          )
        ) : null}
      </div>
      <Button className='w-full mt-4' onClick={next} disabled={!allValid}>
        Next
      </Button>
    </div>
  );
}

function Step2PersonalDetails({
  form,
  setForm,
  next,
  back,
}: {
  form: FormState;
  setForm: (f: Partial<FormState>) => void;
  next: () => void;
  back: () => void;
}) {
  const allValid =
    form.firstName &&
    form.lastName &&
    form.gender &&
    form.languageCode &&
    form.dob;

  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-xl font-bold'>Personal Details</h2>
      <Label htmlFor='firstName'>First Name</Label>
      <Input
        id='firstName'
        name='firstName'
        type='text'
        value={form.firstName}
        onChange={(e) => setForm({ firstName: e.target.value })}
        required
      />
      <Label htmlFor='lastName'>Last Name</Label>
      <Input
        id='lastName'
        name='lastName'
        type='text'
        value={form.lastName}
        onChange={(e) => setForm({ lastName: e.target.value })}
        required
      />
      <Label htmlFor='gender'>Gender</Label>
      <RegistrationGenderSelect
        fieldName='gender'
        required={true}
        className='w-full'
        label='Gender'
        placeholder='Gender'
        value={form.gender}
        onValueChange={(val: string) => setForm({ gender: val })}
      />
      <Label htmlFor='languageCode'>Language</Label>
      <LanguageSelect
        placeholder='Language'
        fieldName='languageCode'
        required
        value={form.languageCode}
        onValueChange={(val: string) => setForm({ languageCode: val })}
      />
      {/* <Label htmlFor='dob'>Date of Birth</Label> */}
      <DatePicker
        label='Date of Birth'
        fieldName='dob'
        required={true}
        value={form.dob}
        onValueChange={(val: string) => setForm({ dob: val })}
      />
      <div className='flex flex-row gap-2 mt-4'>
        <Button className='w-1/2' variant='outline' onClick={back}>
          Back
        </Button>
        <Button className='w-1/2' onClick={next} disabled={!allValid}>
          Next
        </Button>
      </div>
    </div>
  );
}

function Step3Review({
  form,
  back,
  submit,
  isLoading,
}: {
  form: FormState;
  back: () => void;
  submit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
}) {
  return (
    <div className='flex flex-col gap-6'>
      <h2 className='text-xl font-bold'>Review & Submit</h2>
      <div className='text-sm'>
        <div>
          <strong>Username:</strong> {form.username}
        </div>
        <div>
          <strong>Email:</strong> {form.email}
        </div>
        <div>
          <strong>First Name:</strong> {form.firstName}
        </div>
        <div>
          <strong>Last Name:</strong> {form.lastName}
        </div>
        <div>
          <strong>Gender:</strong> {form.gender}
        </div>
        <div>
          <strong>Language:</strong> {form.languageCode}
        </div>
        <div>
          <strong>Date of Birth:</strong> {form.dob}
        </div>
      </div>
      <div className='flex flex-row gap-2 mt-4'>
        <Button className='w-1/2' variant='outline' onClick={back}>
          Back
        </Button>
        <Button
          className='w-1/2 btn btn-primary'
          type='submit'
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderCircle className='animate-spin' /> Registering...
            </>
          ) : (
            'Register'
          )}
        </Button>
      </div>
    </div>
  );
}

export function StepperRegisterForm({
  className,
  submitCb,
  ref,
  form,
  setForm,
  isLoading,
  onBack,
  ...props
}: {
  className?: string;
  submitCb: (e: React.FormEvent) => Promise<void>;
  ref: React.RefObject<HTMLFormElement | null>;
  form: FormState;
  setForm: (fields: Partial<FormState>) => void;
  isLoading: boolean;
  onBack?: () => void;
}) {
  const [step, setStep] = useState(0);

  const next = () => setStep((s) => Math.min(s + 1, 2));
  const back = () => {
    setStep((s) => Math.max(s - 1, 0));
    if (onBack) onBack();
  };

  return (
    <div className={cn('flex flex-col gap-6 w-full', className)} {...props}>
      <form ref={ref} onSubmit={submitCb}>
        <div className='mb-4 flex flex-row items-center gap-2'>
          <span className='font-bold'>Step {step + 1} of 3</span>
          <div className='flex-1 h-2 bg-gray-200 rounded'>
            <div
              className='h-2 bg-blue-500 rounded'
              style={{ width: `${((step + 1) / 3) * 100}%` }}
            />
          </div>
        </div>
        {step === 0 && (
          <Step1AccountInfo form={form} setForm={setForm} next={next} />
        )}
        {step === 1 && (
          <Step2PersonalDetails
            form={form}
            setForm={setForm}
            next={next}
            back={back}
          />
        )}
        {step === 2 && (
          <Step3Review
            form={form}
            back={back}
            submit={submitCb}
            isLoading={isLoading}
          />
        )}
        <div className='mt-6 text-center text-sm'>
          Already have an account?{' '}
          <Link to='/auth/login' className='underline underline-offset-4'>
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
