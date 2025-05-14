import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, TextField, Button, Stack } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../../hooks/useAuth';

interface Message {
  id: number;
  content: string;
  sender: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface ChatMessagesProps {
  chatId: number;
}

export const ChatMessages: React.FC<ChatMessagesProps> = ({ chatId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/api/chats/${chatId}/messages`);
        setMessages(response.data.content);
        scrollToBottom();
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
    // Set up polling for new messages
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage?.trim()) return;

    try {
      const response = await axios.post(`/api/chats/${chatId}/messages`, {
        content: newMessage
      });
      setMessages([...messages, response.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Stack sx={{ height: '100%', p: 2 }} spacing={2}>
      <Paper 
        sx={{ 
          flex: 1, 
          overflow: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}
      >
        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: 'flex',
              justifyContent: message.sender.id === user?.id ? 'flex-end' : 'flex-start',
              mb: 1
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                backgroundColor: message.sender.id === user?.id ? 'primary.main' : 'grey.200',
                color: message.sender.id === user?.id ? 'white' : 'text.primary',
                borderRadius: 2,
                p: 1,
                px: 2
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Paper>
      
      <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="contained" disabled={!newMessage?.trim()}>
          Send
        </Button>
      </Box>
    </Stack>
  );
}; 