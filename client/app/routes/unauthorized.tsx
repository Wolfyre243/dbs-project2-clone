// Unauthorized page for handling missing logins
import { Link } from 'react-router';

export default function Unauthorized() {
  return (
    <div className='flex flex-col items-center justify-center h-screen p-4'>
      <h1 className='text-4xl font-bold text-red-500 mb-4'>
        401 - Unauthorized
      </h1>
      <p className='text-lg mb-6'>
        You do not have permission to view this page.
      </p>
      <Link
        to='/'
        className='bg-neutral-700 text-white px-4 py-2 rounded-full shadow-md hover:bg-neutral-500 hover:scale-105 hover:shadow-md transition duration-200 ease-in-out'
      >
        Go Home
      </Link>
    </div>
  );
}
