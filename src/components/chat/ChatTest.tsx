import React, { useState } from 'react';
import Chat from './Chat';
import ChatService from '../../services/ChatService';

/**
 * Chat Test Component
 * 
 * This component provides a simple way to test the chat functionality
 * without needing to integrate it into the full application.
 * 
 * To use this component:
 * 1. Make sure you're logged in (have a valid access_token in localStorage)
 * 2. Import and use this component in your App.tsx or another page
 * 3. Test the following features:
 *    - View chat list
 *    - Create new chats by searching for users
 *    - Send text messages
 *    - Send image messages
 *    - Real-time message updates
 */

const ChatTest: React.FC = () => {
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const testConnection = async () => {
    try {
      const chats = await ChatService.getChats();
      setDebugInfo({
        status: 'success',
        message: 'Successfully connected to chat API',
        data: chats,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      setDebugInfo({
        status: 'error',
        message: 'Failed to connect to chat API',
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', background: 'white', padding: '16px', borderRadius: '8px' }}>
        <h1 style={{ margin: '0 0 16px 0', color: '#333' }}>Chat Test Page</h1>
        
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <button
            onClick={testConnection}
            style={{
              padding: '8px 16px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Test API Connection
          </button>
          
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            style={{
              padding: '8px 16px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showDebugInfo ? 'Hide Debug' : 'Show Debug'}
          </button>
        </div>

        {showDebugInfo && debugInfo && (
          <div style={{
            background: debugInfo.status === 'error' ? '#fff5f5' : '#f0fff4',
            border: `1px solid ${debugInfo.status === 'error' ? '#fed7d7' : '#c6f6d5'}`,
            borderRadius: '4px',
            padding: '12px',
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <div><strong>Status:</strong> {debugInfo.status}</div>
            <div><strong>Message:</strong> {debugInfo.message}</div>
            <div><strong>Timestamp:</strong> {debugInfo.timestamp}</div>
            {debugInfo.data && (
              <div><strong>Data:</strong> {JSON.stringify(debugInfo.data, null, 2)}</div>
            )}
            {debugInfo.error && (
              <div><strong>Error:</strong> {JSON.stringify(debugInfo.error, null, 2)}</div>
            )}
          </div>
        )}

        <div style={{ fontSize: '14px', color: '#666', marginTop: '12px' }}>
          <h3 style={{ margin: '0 0 8px 0' }}>Testing Instructions:</h3>
          <ul style={{ margin: '0', paddingLeft: '20px' }}>
            <li>Make sure you're logged in (check localStorage for access_token)</li>
            <li>Click "Test API Connection" to verify the backend is working</li>
            <li>Use the chat interface below to test messaging features</li>
            <li>Try creating a new chat by clicking "New Chat" and searching for users</li>
            <li>Test both text and image messages</li>
          </ul>
        </div>
      </div>

      {/* Main Chat Component */}
      <Chat />
    </div>
  );
};

export default ChatTest;