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
import DarkVeil from '~/components/backgrounds/darkveil';

const membershipTiers = [
  {
    name: 'Basic',
    price: 'Free',
    icon: <LucideUser className='text-primary' />,
    benefits: [
      'Access to public exhibitions',
      'Monthly newsletter',
      'Member-only events (limited)',
    ],
  },
  {
    name: 'Premium',
    price: '$49/year',
    icon: <LucideStar className='text-yellow-500' />,
    benefits: [
      'All Basic benefits',
      'Unlimited member events',
      'Priority booking',
      'Exclusive workshops',
    ],
  },
  {
    name: 'Elite',
    price: '$99/year',
    icon: <LucideCrown className='text-red-600' />,
    benefits: [
      'All Premium benefits',
      'VIP lounge access',
      'Complimentary guest passes',
      'Special recognition',
    ],
  },
];

const comparison = [
  {
    feature: 'Public Exhibitions',
    Basic: true,
    Premium: true,
    Elite: true,
  },
  {
    feature: 'Monthly Newsletter',
    Basic: true,
    Premium: true,
    Elite: true,
  },
  {
    feature: 'Member Events',
    Basic: 'Limited',
    Premium: 'Unlimited',
    Elite: 'Unlimited',
  },
  {
    feature: 'Priority Booking',
    Basic: false,
    Premium: true,
    Elite: true,
  },
  {
    feature: 'Exclusive Workshops',
    Basic: false,
    Premium: true,
    Elite: true,
  },
  {
    feature: 'VIP Lounge Access',
    Basic: false,
    Premium: false,
    Elite: true,
  },
  {
    feature: 'Guest Passes',
    Basic: false,
    Premium: false,
    Elite: true,
  },
];

const faqs = [
  {
    question: 'How do I join a membership?',
    answer:
      'Click the "Join Now" button on your preferred tier and complete the registration process.',
  },
  {
    question: 'Can I upgrade my membership later?',
    answer:
      'Yes, you can upgrade at any time by contacting our support or through your account dashboard.',
  },
  {
    question: 'Are there any refunds?',
    answer:
      'Membership fees are non-refundable, but you can enjoy all benefits until expiry.',
  },
];

export default function MembershipPage() {
  const navigate = useNavigate();

  return (
    <div className='flex flex-col items-center w-full min-h-screen'>
      <AppBar />
      {/* Hero Section */}
      <section className='w-full bg-gradient-to-r from-red-600 via-red-200 to-red-300 py-12 mb-8'>
        <div className='max-w-3xl mx-auto text-center px-4'>
          <h1 className='text-4xl font-bold text-primary mb-4'>
            Membership Programme
          </h1>
          <p className='text-lg mb-6 text-neutral-800 font-semibold'>
            Unlock exclusive benefits and experiences. Choose the membership
            that fits you best and be part of our vibrant community.
          </p>
        </div>
      </section>

      {/* Membership Tiers */}
      <section className='w-full max-w-5xl px-4 mb-12'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {membershipTiers.map((tier) => (
            <Card key={tier.name} className='items-center'>
              <CardHeader className='flex flex-col items-center'>
                <div className='mb-2'>{tier.icon}</div>
                <CardTitle className='text-2xl'>{tier.name}</CardTitle>
                <CardDescription className='text-lg font-bold text-primary'>
                  {tier.price}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='list-disc list-inside space-y-1'>
                  {tier.benefits.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className='w-full'
                  onClick={() => navigate('/auth/register')}
                >
                  Join Now
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table */}
      <section className='w-full max-w-5xl px-4 mb-12'>
        <h2 className='text-2xl font-semibold mb-4 text-primary'>
          Compare Memberships
        </h2>
        <div className='overflow-x-auto rounded-xl border'>
          <table className='min-w-full text-sm text-center'>
            <thead className=''>
              <tr>
                <th className='py-3 px-4 border-b text-left'>Feature</th>
                <th className='py-3 px-4 border-b'>Basic</th>
                <th className='py-3 px-4 border-b'>Premium</th>
                <th className='py-3 px-4 border-b'>Elite</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature} className='even:bg-neutral-900/40'>
                  <td className='py-2 px-4 border-b text-left'>
                    {row.feature}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {row.Basic === true
                      ? '✔️'
                      : row.Basic === false
                        ? '—'
                        : row.Basic}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {row.Premium === true
                      ? '✔️'
                      : row.Premium === false
                        ? '—'
                        : row.Premium}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    {row.Elite === true
                      ? '✔️'
                      : row.Elite === false
                        ? '—'
                        : row.Elite}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ Section */}
      <section className='w-full max-w-3xl px-4 mb-16'>
        <h2 className='text-2xl font-semibold mb-4 text-primary'>
          Frequently Asked Questions
        </h2>
        <div className='space-y-4'>
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className='rounded-lg border px-4 py-3 bg-accent-foreground'
            >
              <summary className='cursor-pointer font-medium text-accent'>
                {faq.question}
              </summary>
              <div className='mt-2 text-accent'>{faq.answer}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
