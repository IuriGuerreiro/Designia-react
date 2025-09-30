import React from 'react';
import Layout from '../Layout/Layout';
import { Chat } from './Chat';
import { ChatProvider } from './ChatContext';

const ChatPage: React.FC = () => {
  return (
    <Layout maxWidth="full" padding="minimal">
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </Layout>
  );
};

export default ChatPage;