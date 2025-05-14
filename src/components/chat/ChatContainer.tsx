import React, { useState } from 'react';
import { Grid, Box } from '@mui/material';
import { ChatList } from './ChatList';
import { ChatMessages } from './ChatMessages';

export const ChatContainer: React.FC = () => {
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box sx={{ 
          width: '25%',
          borderRight: '1px solid',
          borderColor: 'divider',
          height: '100%',
          overflow: 'hidden'
        }}>
          <ChatList
            onChatSelect={setSelectedChatId}
            selectedChatId={selectedChatId ?? undefined}
          />
        </Box>
        <Box sx={{ width: '75%', height: '100%' }}>
          {selectedChatId ? (
            <ChatMessages chatId={selectedChatId} />
          ) : (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}
            >
              Select a chat to start messaging
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}; 