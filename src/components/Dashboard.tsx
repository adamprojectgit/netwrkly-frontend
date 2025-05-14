import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

export const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Welcome to Netwrkly
                    </Typography>
                    <Typography variant="body1" paragraph>
                        You are logged in as: {user?.role || 'User'}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogout}
                        sx={{ mt: 2 }}
                    >
                        Logout
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
}; 