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
import { useAuth } from '../../contexts/AuthContext';
import { CreatorProfile } from '../../components/profile/CreatorProfile';
import { useCreatorProfile } from '../../contexts/CreatorProfileContext';

const drawerWidth = 240;

export const CreatorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { profile: creatorProfile } = useCreatorProfile();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [selectedTab, setSelectedTab] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleTabSelect = (index: number) => {
        setSelectedTab(index);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const renderMainContent = () => {
        switch (selectedTab) {
            case 0: // Homepage
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>
                            Welcome, {user?.email?.split('@')[0]}
                        </Typography>
                        <Typography color="text.secondary">
                            Manage your creator profile and connect with brands
                        </Typography>
                    </Box>
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
                            Connect with brands through briefs to start conversations.
                        </Typography>
                    </Box>
                );
            case 4: // Profile
                return <CreatorProfile />;
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
                        alt={user?.email?.split('@')[0]}
                    >
                        {user?.email?.[0]?.toUpperCase()}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2">
                            {user?.email?.split('@')[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Creator
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