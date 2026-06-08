import { type RouteConfigEntry, route, layout } from '@react-router/dev/routes';

export const renterProtectedRoutes: RouteConfigEntry = layout(
  'components/layouts/RenterLayout.tsx',
  [
    route('search', 'pages/renter/search.tsx'),
    route('property/:id', 'pages/renter/detail.tsx'),
    route('favorites', 'pages/renter/favorites.tsx'),
    route('inquiries', 'pages/renter/inquiries.tsx'),
    route('profile', 'pages/profile.tsx'),
    route('recommendations', 'pages/renter/recommendations.tsx'),
    route('saved-searches', 'pages/renter/saved-searches.tsx'),
    route('map-search', 'pages/renter/map-search.tsx'),
    route('tours', 'pages/renter/my-tours.tsx'),
    route('messages', 'pages/renter/messages.tsx'),
    route('applications', 'pages/renter/my-applications.tsx'),
    route('applications/new/:propertyId', 'pages/renter/application-form.tsx'),
  ]
);
