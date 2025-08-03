// Membership page for users to view membership types, comparison, and FAQ

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { AppBar } from '~/components/app-bar';
import useApiPrivate from '~/hooks/useApiPrivate';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

type Review = {
  reviewId: string;
  rating: number;
  reviewText: string;
  username: string;
  avatar: string | null;
  date: string;
};

export default function ReviewPage() {
  const apiPrivate = useApiPrivate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch all reviews on mount and after submit
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await apiPrivate.get('/review/');
      // Defensive: ensure data.data is an array
      setReviews(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      toast.error('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  // Handle review submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reviewText.trim()) {
      setError('Please enter your review.');
      return;
    }
    if (rating < 1 || rating > 5) {
      setError('Please select a rating.');
      return;
    }

    setSubmitting(true);
    try {
      await apiPrivate.post('/review/submit', {
        rating,
        reviewText,
      });
      toast.success('Thank you for your review!');
      setReviewText('');
      setRating(5);
      // Re-fetch reviews from database to show latest
      await fetchReviews();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          'Failed to submit review. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
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

      {/* Review Form */}
      <section className='w-full max-w-xl px-4 mb-12'>
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle className='text-2xl'>Your Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center gap-2 mb-4'>
                <span className='font-medium'>Your Rating:</span>
                <div className='flex items-center'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type='button'
                      key={star}
                      onClick={() => setRating(star)}
                      className='focus:outline-none'
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill={star <= rating ? 'currentColor' : 'none'}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className='w-full border rounded-lg p-3 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-red-400'
                placeholder='Share your experience...'
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                maxLength={500}
                required
              />
              {error && (
                <div className='text-red-600 text-sm mt-2'>{error}</div>
              )}
            </CardContent>
            <CardFooter>
              <Button type='submit' className='w-full' disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </section>

      {/* Reviews List */}
      <section className='w-full max-w-2xl px-4 mb-16'>
        <h2 className='text-2xl font-semibold mb-4 text-red-700'>
          Recent Reviews
        </h2>
        {loading ? (
          <div className='text-center text-muted-foreground'>
            Loading reviews...
          </div>
        ) : reviews.length === 0 ? (
          <div className='text-center text-muted-foreground'>
            No reviews yet. Be the first!
          </div>
        ) : (
          <div className='space-y-4'>
            {reviews.map((review) => (
              <Card key={review.reviewId}>
                <CardHeader className='flex flex-row items-center gap-3 pb-2'>
                  <div className='flex-shrink-0'>
                    {review.avatar ? (
                      <img
                        src={review.avatar}
                        alt={review.username}
                        className='w-10 h-10 rounded-full object-cover border'
                      />
                    ) : (
                      <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-600'>
                        {review.username?.[0]?.toUpperCase() || 'A'}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className='font-semibold'>{review.username}</div>
                    <div className='text-xs text-muted-foreground'>
                      {new Date(review.date).toLocaleString()}
                    </div>
                  </div>
                  <div className='ml-auto flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                        fill={star <= review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className='text-base'>{review.reviewText}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
