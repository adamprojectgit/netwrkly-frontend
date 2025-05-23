import React from 'react';
import { Box, Typography } from '@mui/material';

export const Communities: React.FC = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
                gap: 3
            }}
        >
            <Typography variant="h6" color="text.secondary">
                Communities Coming Soon
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450 }}>
                We're working on bringing you a space to connect with other brands and creators.
            </Typography>
        </Box>
    );
}; 