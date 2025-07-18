import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/*', 'routes/notFound.tsx'),
  route('/unauthorized', 'routes/unauthorized.tsx'),
  ...prefix("admin", [
        layout("routes/admin/layout.tsx", [
            index("routes/admin/page.tsx"),
        ])
    ]),
] satisfies RouteConfig;
