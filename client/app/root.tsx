import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { AuthProvider } from './context/authProvider';
import useAuth from './hooks/useAuth';
import useRefreshToken from './hooks/useRefreshToken';
import { useLayoutEffect } from 'react';
import { isAxiosError } from 'node_modules/axios';
import LoadingSpinner from './components/LoadingSpinner';

export const links: Route.LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
];

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'SDC Exhibition App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='dark'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider>
          <main className='w-screen flex flex-col justify-center items-center'>
            {children}
            <ScrollRestoration />
          </main>
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const { accessToken, setLoading, loading } = useAuth();
  const refreshToken = useRefreshToken();

  useLayoutEffect(() => {
    (async () => {
      try {
        if (!accessToken)
          // If access token is gone from memory, generate a new one
          await refreshToken();
      } catch (error: any) {
        if (isAxiosError(error)) {
          console.log(
            '[REFRESH ERROR] ' + error.response?.data.message ||
              '[SERVER ERROR] Something went wrong. Please try again later.',
          );
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken]);

  return (
    <>
      {loading ? (
        <div className='flex h-full w-full justify-center items-center'>
          <LoadingSpinner />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (
    import.meta.env.VITE_ENV === 'development' &&
    error &&
    error instanceof Error
  ) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className='pt-16 p-4 container mx-auto'>
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className='w-full p-4 overflow-x-auto'>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
