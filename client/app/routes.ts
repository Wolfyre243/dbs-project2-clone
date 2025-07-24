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
  route('/test', 'routes/test.tsx'),

  ...prefix('home', [
    layout('routes/home/layout.tsx', [
      index('routes/home/page.tsx'),
      route('/settings', 'routes/home/settings.tsx'),
    ]),
  ]),

  ...prefix('admin', [
    layout('routes/admin/layout.tsx', [
      index('routes/admin/page.tsx'),
      route('/analytics', 'routes/admin/analytics.tsx'),
      route('/content', 'routes/admin/content/page.tsx'),
      route('/users', 'routes/admin/user-management/user-pagination.tsx'),
      route('/register', 'routes/admin/register-admin.tsx'),
      route('/site-settings', 'routes/admin/site-settings.tsx'),
      ...prefix('tour-editor', [
        layout('routes/admin/tour-editor/layout.tsx', [
          index('routes/admin/tour-editor/page.tsx'),
        ]),
      ]),
    ]),
  ]),

  ...prefix('auth', [
    layout('routes/auth/layout.tsx', [
      route('/login', 'routes/auth/login.tsx'),
      route('/register', 'routes/auth/register.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
