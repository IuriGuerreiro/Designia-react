import Settings from './ui/settings/Settings';
import EditProfile from './ui/profile/EditProfile';
import BecomeSellerForm from './ui/seller/BecomeSellerForm';
import UserProfileScreen from './ui/profile/UserProfileScreen';
import type { AppRoute } from '@/app/router/types';

export const accountRoutes: AppRoute[] = [
  { path: '/settings', element: <Settings /> },
  { path: '/settings/become-seller', element: <BecomeSellerForm /> },
  { path: '/profile', element: <UserProfileScreen /> },
  { path: '/profile/edit', element: <EditProfile /> },
  { path: '/profile/:userId', element: <UserProfileScreen /> },
];
