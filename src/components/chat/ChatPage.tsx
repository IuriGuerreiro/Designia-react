import React from 'react';
import { ChatProvider } from './ChatContext';
import { Chat } from './Chat';

export const ChatPage: React.FC = () => {
  return (
    <ChatProvider>
      <Chat />
    </ChatProvider>
  );
};