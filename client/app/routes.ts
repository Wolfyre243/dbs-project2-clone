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
  route('/exhibits', 'routes/home/exhibits/page.tsx'),

  ...prefix('home', [
    layout('routes/home/layout.tsx', [
      index('routes/home/page.tsx'),
      route('/settings', 'routes/home/settings.tsx'),
      ...prefix('exhibits', [
        route('/:exhibitId', 'routes/home/exhibits/single-exhibit.tsx'),
      ]),
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
          route(
            '/create-exhibit',
            'routes/admin/tour-editor/create-exhibit.tsx',
          ),
          route(
            '/view-exhibit/:exhibitId',
            'routes/admin/tour-editor/view-exhibit.tsx',
          ),
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
