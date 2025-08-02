// Membership page for users to view membership types, comparison, and FAQ

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { LucideCrown, LucideStar, LucideUser } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AppBar } from '~/components/app-bar';
import useApiPrivate from '~/hooks/useApiPrivate';

export default function ReviewPage() {
  const navigate = useNavigate();
  const apiPrivate = useApiPrivate();

  const handleSubmit = async () => {
    await apiPrivate.post('/'); // TODO: Add in review POST route and send form data
  };

  return (
    <div className='flex flex-col items-center w-full min-h-screen'>
      <AppBar />
      {/* Hero Section */}
      <section className='w-full bg-accent-foreground py-12 mb-8'>
        <div className='max-w-3xl mx-auto text-center px-4'>
          <h1 className='text-4xl font-bold text-red-700 mb-4'>
            Leave a Review!
          </h1>
          <p className='text-lg mb-6 text-accent'>
            Enjoyed your time at Singapore Discovery Centre? We'd appreciate if
            you could take a minute to give us a review!
          </p>
        </div>
      </section>

      <section>{/* TODO Review Form Here */}</section>
    </div>
  );
}
