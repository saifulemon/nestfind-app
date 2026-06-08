import { type RouteConfigEntry, route, layout } from '@react-router/dev/routes';

export const adminRoutes = [layout(
  'components/layouts/AdminLayout.tsx',
  [
    route('admin/dashboard', 'pages/admin/dashboard.tsx'),
    route('admin/properties', 'pages/admin/properties.tsx'),
    route('admin/properties/new', 'pages/admin/property-form.tsx'),
    route('admin/properties/:id/edit', 'pages/admin/property-form.tsx'),
    route('admin/inquiries', 'pages/admin/inquiries.tsx'),
    route('admin/users', 'pages/admin/users.tsx'),
    route('admin/reviews', 'pages/admin/reviews.tsx'),
    route('admin/tours', 'pages/admin/tours.tsx'),
    route('admin/applications', 'pages/admin/applications.tsx'),
    route('admin/messages', 'pages/admin/messages.tsx'),
  ]
)];
