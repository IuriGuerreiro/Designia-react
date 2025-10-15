import type { AppRoute } from '@/app/router/types';
import { ChatPage } from '@/features/chat/ui';

export const chatRoutes: AppRoute[] = [
  { path: '/chat', element: <ChatPage /> },
];
