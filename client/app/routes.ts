import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('/*', 'routes/notFound.tsx'),
  route('/unauthorized', 'routes/unauthorized.tsx'),
] satisfies RouteConfig;
