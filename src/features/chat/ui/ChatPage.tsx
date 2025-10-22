import { type FC } from 'react';
import { Layout } from '@/app/layout';
import { ChatProvider } from '@/features/chat/state/ChatContext';
import { Chat } from './Chat';

const ChatPage: FC = () => {
  return (
    <Layout maxWidth="full" padding="minimal" showFooter={false} showBackToTop={false}>
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </Layout>
  );
};

export default ChatPage;
