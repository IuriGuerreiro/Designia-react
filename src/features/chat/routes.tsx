import { ChatPage } from '../../components/chat';
import type { AppRoute } from '../../app/router/types';

export const chatRoutes: AppRoute[] = [
  { path: '/chat', element: <ChatPage /> },
];
