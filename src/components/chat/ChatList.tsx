import React, { useEffect, useState } from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Paper, Divider, ButtonBase } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

interface Chat {
  id: number;
  brand: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  creator: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  lastMessageAt: string;
}

interface ChatListProps {
  onChatSelect: (chatId: number) => void;
  selectedChatId?: number;
}

export const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get('/api/chats');
        setChats(response.data);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };

    fetchChats();
  }, []);

  return (
    <Paper sx={{ height: '100%', overflow: 'auto' }}>
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {chats.map((chat) => (
          <React.Fragment key={chat.id}>
            <ButtonBase 
              component="div"
              onClick={() => onChatSelect(chat.id)}
              sx={{ 
                width: '100%',
                textAlign: 'left',
                bgcolor: chat.id === selectedChatId ? 'action.selected' : 'transparent'
              }}
            >
              <ListItem>
                <ListItemAvatar>
                  <Avatar>
                    {chat.brand.firstName.charAt(0)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={`${chat.brand.firstName} ${chat.brand.lastName}`}
                  secondary={
                    <React.Fragment>
                      <Typography
                        sx={{ display: 'inline' }}
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            </ButtonBase>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}; 