# Chat-Old Directory

This directory contains the legacy chat implementation that was moved during the WebSocket architecture redesign.

## Contents

### Components
- `components/chat/` - Chat UI components (Chat.tsx, ChatTest.tsx, styles)

### Contexts
- `contexts/ChatContext.tsx` - Legacy chat context with GlobalWebSocketService integration

### Services
- `services/ChatService.ts` - HTTP API service for chat operations
- `services/ChatWebSocketService.ts` - Dedicated chat WebSocket service (connects to /ws/chat/)
- `services/GlobalWebSocketService.ts` - Legacy global WebSocket service (tried to connect to /ws/user/)
- `services/WebSocketService.ts` - Legacy per-chat WebSocket service

### Pages
- `pages/ChatPage.tsx` - Main chat page component

### Types
- `types/chat.ts` - TypeScript types for chat functionality

## Migration Notes

- The new architecture separates activity notifications (/ws/activity/) from chat messaging (/ws/chat/)
- ActivityContext now handles cart count updates via ActivityWebSocketService
- Chat functionality can be reimplemented using the services in this directory when needed
- All files maintain their original functionality and can be restored if needed

## Usage

These files are preserved for reference and can be moved back to their original locations if the chat functionality needs to be restored.