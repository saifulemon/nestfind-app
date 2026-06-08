import { type RouteConfig, route, index, layout } from '@react-router/dev/routes';
import { publicRoutes } from './routes/public.routes';
import { authRoutes } from './routes/auth.routes';
import { renterProtectedRoutes } from './routes/renter.routes';
import { adminRoutes } from './routes/admin.routes';

export default [
  index('pages/landing.tsx'),
  layout('pages/layout.tsx', publicRoutes),
  layout('pages/auth/layout.tsx', authRoutes),
  renterProtectedRoutes,
  ...adminRoutes,
  route("*", "pages/not-found.tsx"),
] satisfies RouteConfig;
