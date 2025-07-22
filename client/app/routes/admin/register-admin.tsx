import RequireAuth from '~/components/RequireAuth';
import Roles from '~/rolesConfig';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { UserPlus, Shield } from 'lucide-react';

export default function AdminRegisterPage() {
  return (
    <RequireAuth allowedRoles={[Roles.SUPERADMIN]}>
      <div className='h-full w-full bg-background text-foreground p-6'>
        <div className='max-w-2xl mx-auto space-y-6'>
          {/* Page Header */}
          <div className='space-y-2'>
            <div className='flex items-center gap-3'>
              <Shield className='h-8 w-8 text-primary' />
              <h1 className='text-3xl font-bold tracking-tight'>
                Admin Registration
              </h1>
            </div>
            <p className='text-muted-foreground'>
              Register new administrators to manage the Singapore Discovery
              Centre system.
            </p>
          </div>

          {/* Registration Form */}
          <Card className='w-full'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <UserPlus className='h-5 w-5' />
                Create New Admin Account
              </CardTitle>
              <CardDescription>
                Fill in the details below to create a new administrator account.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    placeholder='Enter first name'
                    className='bg-background border-border'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    placeholder='Enter last name'
                    className='bg-background border-border'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='email'>Email Address</Label>
                <Input
                  id='email'
                  type='email'
                  placeholder='admin@example.com'
                  className='bg-background border-border'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='username'>Username</Label>
                <Input
                  id='username'
                  placeholder='Enter username'
                  className='bg-background border-border'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='password'>Password</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='Enter secure password'
                    className='bg-background border-border'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirm Password</Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    placeholder='Confirm password'
                    className='bg-background border-border'
                  />
                </div>
              </div>

              <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                <Button className='flex-1'>
                  <UserPlus className='mr-2 h-4 w-4' />
                  Create Admin Account
                </Button>
                <Button variant='outline' className='flex-1'>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info Card */}
          <Card className='bg-muted/50 border-muted'>
            <CardContent className=''>
              <div className='flex items-start gap-3'>
                <Shield className='h-5 w-5 text-primary mt-0.5' />
                <div className='space-y-1'>
                  <h3 className='font-semibold text-sm'>Admin Privileges</h3>
                  <p className='text-sm text-muted-foreground'>
                    Admin accounts will have access to manage users, content,
                    and system settings. Ensure you only grant admin access to
                    trusted personnel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  );
}
