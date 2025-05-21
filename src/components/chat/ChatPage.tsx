import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import {
    Box,
    TextField,
    IconButton,
    List,
    ListItem,
    Typography,
    Paper,
    Container,
    Avatar,
    Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { format } from 'date-fns';

interface Message {
    senderUid: string;
    text: string;
    timestamp: number;
}

export const ChatPage: React.FC = () => {
    const { otherUid } = useParams<{ otherUid: string }>();
    const { subscribe, sendMessage } = useChat();
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState('');

    useEffect(() => {
        if (!otherUid) return;
        const unsub = subscribe(otherUid, (msg) => {
            setMessages(prev => [...prev, msg]);
        });
        return unsub;
    }, [otherUid, subscribe]);

    const handleSend = async () => {
        if (!text.trim() || !otherUid) return;
        await sendMessage(otherUid, text.trim());
        setText('');
    };

    return (
        <Container maxWidth="md" sx={{ height: '100vh', py: 2 }}>
            <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Typography variant="h6">Chat</Typography>
                </Box>
                
                <List sx={{ 
                    flex: 1, 
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                }}>
                    {messages.map((m, i) => (
                        <ListItem 
                            key={i}
                            sx={{
                                justifyContent: m.senderUid === user?.uid ? 'flex-end' : 'flex-start',
                                px: 1
                            }}
                        >
                            <Box sx={{ 
                                maxWidth: '70%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: m.senderUid === user?.uid ? 'flex-end' : 'flex-start'
                            }}>
                                <Box sx={{ 
                                    bgcolor: m.senderUid === user?.uid ? 'primary.main' : 'grey.100',
                                    color: m.senderUid === user?.uid ? 'white' : 'text.primary',
                                    borderRadius: 2,
                                    p: 1.5,
                                    boxShadow: 1
                                }}>
                                    <Typography variant="body1">{m.text}</Typography>
                                </Box>
                                <Typography 
                                    variant="caption" 
                                    sx={{ 
                                        mt: 0.5,
                                        color: 'text.secondary'
                                    }}
                                >
                                    {format(m.timestamp, 'h:mm a')}
                                </Typography>
                            </Box>
                        </ListItem>
                    ))}
                </List>

                <Divider />
                
                <Box sx={{ 
                    p: 2,
                    display: 'flex',
                    gap: 1,
                    bgcolor: 'background.paper'
                }}>
                    <TextField
                        fullWidth
                        placeholder="Type a message"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        variant="outlined"
                        size="small"
                    />
                    <IconButton 
                        onClick={handleSend}
                        color="primary"
                        disabled={!text.trim()}
                    >
                        <SendIcon />
                    </IconButton>
                </Box>
            </Paper>
        </Container>
    );
}; 