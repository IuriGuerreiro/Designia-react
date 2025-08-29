import React from 'react';
import { Chat } from '../components/chat';
import Layout from '../components/Layout/Layout';

const ChatPage: React.FC = () => {
  return (
    <Layout maxWidth="full" padding="minimal">
      <div style={{ 
        height: 'calc(100vh - 140px)', // Account for navbar and footer
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h1 style={{ 
            fontSize: '48px',
            fontWeight: '600',
            color: '#0A0A0A',
            margin: '0 0 16px 0',
            fontFamily: 'Playfair Display, serif',
            lineHeight: '56px'
          }}>
            Messages
          </h1>
          <p style={{ 
            color: '#6B7280',
            margin: 0,
            fontSize: '18px',
            lineHeight: '28px',
            fontFamily: 'Inter, sans-serif',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
            
          }}>
            Connect with designers, share ideas, and collaborate on projects through our premium messaging platform
          </p>
        </div>
        
        <div style={{ flex: 1 }}>
          <Chat />
        </div>
      </div>
    </Layout>
  );
};

export default ChatPage;