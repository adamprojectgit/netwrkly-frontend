import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    Stack,
    Card,
    CardContent,
    Chip,
    IconButton,
    Alert,
    CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CreateBriefDialog } from '../brief/CreateBriefDialog';
import { createBrief, fetchBriefs, updateBriefStatus } from '../../services/briefService';
import { CreateBriefData, Brief, BriefStatus } from '../../types/brief';
import { useAuth } from '../../contexts/AuthContext';

export const BrandHomepage: React.FC = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateBriefOpen, setIsCreateBriefOpen] = useState(false);
    const [briefs, setBriefs] = useState<Brief[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    useEffect(() => {
        const loadBriefs = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchBriefs();
                setBriefs(data.map(brief => ({
                    ...brief,
                    updatedAt: brief.updatedAt || brief.createdAt,
                    creatorId: brief.creatorId || String(user?.uid) || '1'
                })));
            } catch (err) {
                setError('Failed to load briefs. Please try again later.');
                console.error('Error loading briefs:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadBriefs();
    }, []);

    const getStatusColor = (status: BriefStatus) => {
        switch (status) {
            case BriefStatus.ACTIVE:
                return 'success';
            case BriefStatus.DRAFT:
                return 'warning';
            case BriefStatus.CLOSED:
                return 'error';
            default:
                return 'default';
        }
    };

    const handleCreateBrief = async (briefData: CreateBriefData) => {
        try {
            const newBrief = await createBrief(briefData);
            setBriefs(prev => [{
                ...newBrief,
                updatedAt: newBrief.updatedAt || newBrief.createdAt,
                creatorId: newBrief.creatorId || String(user?.uid) || '1'
            }, ...prev]);
            setSnackbar({ open: true, message: 'Brief created successfully', severity: 'success' });
            setIsCreateBriefOpen(false);
        } catch (error: any) {
            console.error('Error creating brief:', error);
            const errorMessage = error.response?.data?.message === 'Validation failed'
                ? 'Please check all required fields are filled correctly.'
                : error.response?.data?.message || error.message || 'Failed to create brief';
            setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        }
    };

    const handleActivateBrief = async (briefId: number) => {
        try {
            const updatedBrief = await updateBriefStatus(briefId, BriefStatus.ACTIVE);
            setBriefs(prev => prev.map(brief => 
                brief.id === briefId ? updatedBrief : brief
            ));
            setSnackbar({ open: true, message: 'Brief activated successfully', severity: 'success' });
        } catch (error: any) {
            console.error('Error activating brief:', error);
            setSnackbar({ 
                open: true, 
                message: error.message || 'Failed to activate brief', 
                severity: 'error' 
            });
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography color="primary">My Briefs</Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        color="primary"
                        onClick={() => setIsCreateBriefOpen(true)}
                    >
                        Create New Brief
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TextField
                        size="small"
                        placeholder="Search briefs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Stack spacing={2}>
                    {briefs.map((brief) => (
                        <Card key={brief.id}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Typography variant="h6" component="div">
                                        {brief.title}
                                    </Typography>
                                    <Box>
                                        <Chip 
                                            label={brief.status} 
                                            color={getStatusColor(brief.status)}
                                            size="small"
                                            sx={{ mr: 1 }}
                                        />
                                        {brief.status === BriefStatus.DRAFT && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleActivateBrief(brief.id)}
                                                sx={{ mr: 1 }}
                                            >
                                                Activate
                                            </Button>
                                        )}
                                        <IconButton size="small">
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small">
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="text.secondary" sx={{ mb: 2 }}>
                                    {brief.ask}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Budget: {brief.budget}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Responses: {brief.responses}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Created: {brief.createdAt}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                    {briefs.length === 0 && !error && (
                        <Typography color="text.secondary" textAlign="center">
                            No briefs found. Create your first brief to get started!
                        </Typography>
                    )}
                </Stack>
            )}

            <CreateBriefDialog
                open={isCreateBriefOpen}
                onClose={() => setIsCreateBriefOpen(false)}
                onSubmit={handleCreateBrief}
            />
        </>
    );
}; 