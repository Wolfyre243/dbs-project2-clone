import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from '@react-router/dev/routes';

export default [
  index('routes/page.tsx'),
  route('/*', 'routes/notFound.tsx'),
  route('/verify', 'routes/verify.tsx'),
  route('/unauthorized', 'routes/unauthorized.tsx'),

  ...prefix('home', [
    layout('routes/home/layout.tsx', [
      index('routes/home/page.tsx'),
      route('/profile', 'routes/home/profile.tsx'),
    ]),
  ]),

  ...prefix('admin', [
    layout('routes/admin/layout.tsx', [
      index('routes/admin/page.tsx'),
      route('/analytics', 'routes/admin/analytics.tsx'),
      ...prefix('tour-editor', []),
    ]),
  ]),

  ...prefix('auth', [
    layout('routes/auth/layout.tsx', [
      route('/login', 'routes/auth/login.tsx'),
      route('/register', 'routes/auth/register.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
