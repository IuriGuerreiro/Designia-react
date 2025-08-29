import React from 'react';
import Layout from '../Layout/Layout';
import { ChatProvider } from './ChatContext';
import { Chat } from './Chat';

export const ChatPage: React.FC = () => {
  return (
    <Layout maxWidth="xl" padding="default">
      <ChatProvider>
        <Chat />
      </ChatProvider>
    </Layout>
  );
};