import React from 'react';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import { useCreatorProfile } from '../../contexts/CreatorProfileContext';
import { useNavigate } from 'react-router-dom';

export const CreatorProfile: React.FC = () => {
    const { profile, isLoading, error } = useCreatorProfile();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (error?.message?.includes('Access denied')) {
            navigate('/login');
        }
    }, [error, navigate]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error.message}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h5" gutterBottom>
                Creator Profile
            </Typography>
            {profile ? (
                <Box>
                    <Typography variant="body1">
                        Bio: {profile.bio || 'No bio provided'}
                    </Typography>
                    <Typography variant="body1">
                        Location: {profile.location || 'No location provided'}
                    </Typography>
                    <Typography variant="body1">
                        Website: {profile.website || 'No website provided'}
                    </Typography>
                </Box>
            ) : (
                <Typography variant="body1">No profile data available</Typography>
            )}
        </Box>
    );
}; 