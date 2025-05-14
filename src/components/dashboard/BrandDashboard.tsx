import React from 'react';
import {
    Box,
    Container,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Drawer,
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Button,
    ButtonBase,
    InputAdornment,
    TextField,
    Stack,
    Divider,
    Card,
    CardContent,
    Chip,
    Grid,
    Alert,
    CircularProgress,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { CreateBriefDialog } from '../brief/CreateBriefDialog';
import { createBrief, fetchBriefs, updateBriefStatus } from '../../services/briefService';
import { CreateBriefData, Brief, BriefStatus } from '../../types/brief';
import { BrandProfile } from '../profile/BrandProfile';
import { useBrandProfile } from '../../contexts/BrandProfileContext';

const drawerWidth = 240;

const mockBriefs: Brief[] = [
    {
        id: 1,
        title: "Social Media Marketing Campaign",
        background: "Initial campaign context",
        ask: "Looking for creative agencies to handle our Q4 social media campaign across multiple platforms.",
        deliverables: "Social media content calendar, creative assets, performance metrics",
        budget: "$10,000 - $15,000",
        status: BriefStatus.ACTIVE,
        responses: 12,
        createdAt: "2024-02-15",
        updatedAt: "2024-02-15",
        creatorId: "1"
    },
    {
        id: 2,
        title: "Website Redesign Project",
        background: "Current website overview",
        ask: "Need a complete overhaul of our e-commerce website with modern UI/UX principles.",
        deliverables: "New website design, responsive layouts, improved user flow",
        budget: "$20,000 - $30,000",
        status: BriefStatus.DRAFT,
        responses: 0,
        createdAt: "2024-02-10",
        updatedAt: "2024-02-10",
        creatorId: "1"
    },
    {
        id: 3,
        title: "Brand Identity Development",
        background: "Current brand position",
        ask: "Seeking agencies for a complete brand refresh including logo, color scheme, and brand guidelines.",
        deliverables: "Brand guidelines, logo package, color palette",
        budget: "$15,000 - $25,000",
        status: BriefStatus.CLOSED,
        responses: 8,
        createdAt: "2024-01-20",
        updatedAt: "2024-01-20",
        creatorId: "1"
    },
];

export const BrandDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { profile: brandProfile } = useBrandProfile();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isCreateBriefOpen, setIsCreateBriefOpen] = React.useState(false);
    const [briefs, setBriefs] = React.useState<Brief[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'success' });

    React.useEffect(() => {
        const loadBriefs = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await fetchBriefs();
                setBriefs(data.map(brief => ({
                    ...brief,
                    updatedAt: brief.updatedAt || brief.createdAt,
                    creatorId: brief.creatorId || String(user?.id) || '1'
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

    const handleTabSelect = (index: number) => {
        setSelectedTab(index);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

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
                creatorId: newBrief.creatorId || String(user?.id) || '1'
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

    const renderMainContent = () => {
        switch (selectedTab) {
            case 0: // Homepage - Briefs
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
            case 1: // Chats
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
                        <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5 }} />
                        <Typography variant="h6" color="text.secondary">
                            No Active Chats
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mb: 2 }}>
                            Start matchmaking to connect with potential creators and begin conversations about your briefs.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<HandshakeIcon />}
                            onClick={() => handleTabSelect(3)} // Navigate to Matchmakers tab
                        >
                            Start Matchmaking
                        </Button>
                    </Box>
                );
            case 4: // Profile
                return <BrandProfile />;
            // Add other cases for different tabs
            default:
                return null;
        }
    };

    return (
        <Box sx={{ display: 'flex' }}>
            {/* Left Sidebar */}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                        bgcolor: 'background.paper',
                        borderRight: '1px solid',
                        borderColor: 'divider',
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar 
                        sx={{ width: 40, height: 40 }}
                        src={brandProfile?.logoUrl}
                        alt={brandProfile?.companyName || 'Company Logo'}
                    >
                        {brandProfile?.companyName ? brandProfile.companyName[0].toUpperCase() : user?.email?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2">
                            {brandProfile?.companyName || user?.email?.split('@')[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {brandProfile?.companyName ? 'Company' : 'Personal'}
                        </Typography>
                    </Box>
                </Box>
                <List>
                    <ListItemButton selected={selectedTab === 0} onClick={() => handleTabSelect(0)}>
                        <ListItemIcon>
                            <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Homepage" />
                    </ListItemButton>
                    <ListItemButton selected={selectedTab === 1} onClick={() => handleTabSelect(1)}>
                        <ListItemIcon>
                            <ChatIcon />
                        </ListItemIcon>
                        <ListItemText primary="Chats" />
                    </ListItemButton>
                    <ListItemButton selected={selectedTab === 2} onClick={() => handleTabSelect(2)}>
                        <ListItemIcon>
                            <GroupsIcon />
                        </ListItemIcon>
                        <ListItemText primary="Communities" />
                    </ListItemButton>
                    <ListItemButton selected={selectedTab === 3} onClick={() => handleTabSelect(3)}>
                        <ListItemIcon>
                            <HandshakeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Matchmakers" />
                    </ListItemButton>
                    <ListItemButton selected={selectedTab === 4} onClick={() => handleTabSelect(4)}>
                        <ListItemIcon>
                            <AccountCircleIcon />
                        </ListItemIcon>
                        <ListItemText primary="Profile" />
                    </ListItemButton>
                    <ListItemButton onClick={logout}>
                        <ListItemIcon>
                            <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText primary="Log out" />
                    </ListItemButton>
                </List>
            </Drawer>

            {/* Main Content */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {['Homepage', 'Chats', 'Communities', 'Matchmakers', 'Profile'][selectedTab]}
                        </Typography>
                    </Box>
                </Box>

                {/* Dynamic Content Based on Selected Tab */}
                {renderMainContent()}
            </Box>
        </Box>
    );
}; 