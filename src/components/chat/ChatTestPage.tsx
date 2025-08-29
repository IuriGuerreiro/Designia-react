import React from 'react';
import { ChatProvider } from './ChatContext';
import { ChatTest } from './ChatTest';

export const ChatTestPage: React.FC = () => {
  return (
    <ChatProvider>
      <ChatTest />
    </ChatProvider>
  );
};