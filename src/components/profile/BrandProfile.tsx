import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    Avatar,
    Chip,
    Stack,
    IconButton,
    Autocomplete,
    CircularProgress,
    Alert,
    Snackbar,
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import SaveIcon from '@mui/icons-material/Save';
import { profileService, BrandProfileData } from '../../services/profileService';
import { useBrandProfile } from '../../contexts/BrandProfileContext';

// Common niches that brands might be interested in
const AVAILABLE_NICHES = [
    'Fashion & Style',
    'Beauty & Cosmetics',
    'Technology',
    'Food & Beverage',
    'Travel & Lifestyle',
    'Gaming',
    'Fitness & Health',
    'Business & Finance',
    'Entertainment',
    'Education',
];

interface FormErrors {
    companyName?: string;
    description?: string;
    industry?: string;
    website?: string;
}

export const BrandProfile: React.FC = () => {
    const { profile: contextProfile, updateProfile: contextUpdateProfile, isLoading: contextIsLoading, error: contextError } = useBrandProfile();
    const [profile, setProfile] = useState<BrandProfileData>({
        companyName: '',
        description: '',
        industry: '',
        website: '',
        preferredNiches: [],
        logoUrl: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error'
    });

    useEffect(() => {
        if (contextProfile) {
            setProfile(contextProfile);
            setIsLoading(false);
        }
    }, [contextProfile]);

    // Show error message if context has an error
    useEffect(() => {
        if (contextError) {
            setSnackbar({
                open: true,
                message: contextError,
                severity: 'error'
            });
        }
    }, [contextError]);

    const loadProfile = async () => {
        try {
            const data = await profileService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            setSnackbar({
                open: true,
                message: 'Failed to load profile',
                severity: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        
        if (!profile.companyName?.trim()) {
            newErrors.companyName = 'Company name is required';
        }
        
        if (!profile.description?.trim()) {
            newErrors.description = 'Company description is required';
        }
        
        if (!profile.industry?.trim()) {
            newErrors.industry = 'Industry is required';
        }
        
        if (profile.website && !isValidUrl(profile.website)) {
            newErrors.website = 'Please enter a valid URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);

            try {
                const logoUrl = await profileService.uploadLogo(file);
                setProfile(prev => ({
                    ...prev,
                    logoUrl
                }));
                setSnackbar({
                    open: true,
                    message: 'Logo uploaded successfully',
                    severity: 'success'
                });
            } catch (error) {
                setSnackbar({
                    open: true,
                    message: 'Failed to upload logo',
                    severity: 'error'
                });
            }
        }
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsSaving(true);
            await contextUpdateProfile(profile);
            setSnackbar({
                open: true,
                message: 'Profile updated successfully',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error saving profile:', error);
            setSnackbar({
                open: true,
                message: 'Failed to update profile',
                severity: 'error'
            });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading || contextIsLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                    <Box sx={{ position: 'relative' }}>
                        <Avatar
                            src={profile.logoUrl}
                            sx={{ width: 100, height: 100 }}
                            alt="Company Logo"
                        />
                        <input
                            accept="image/*"
                            type="file"
                            id="logo-upload"
                            hidden
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="logo-upload">
                            <IconButton
                                component="span"
                                sx={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <PhotoCamera />
                            </IconButton>
                        </label>
                    </Box>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Company Profile
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your company information and preferences
                        </Typography>
                    </Box>
                </Box>

                <Stack spacing={3}>
                    <TextField
                        label="Company Name"
                        name="companyName"
                        value={profile.companyName}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!errors.companyName}
                        helperText={errors.companyName}
                    />

                    <TextField
                        label="Company Description"
                        name="description"
                        value={profile.description}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                        fullWidth
                        required
                        error={!!errors.description}
                        helperText={errors.description}
                    />

                    <TextField
                        label="Industry"
                        name="industry"
                        value={profile.industry}
                        onChange={handleInputChange}
                        fullWidth
                        required
                        error={!!errors.industry}
                        helperText={errors.industry}
                    />

                    <TextField
                        label="Website"
                        name="website"
                        value={profile.website}
                        onChange={handleInputChange}
                        fullWidth
                        type="url"
                        error={!!errors.website}
                        helperText={errors.website}
                    />

                    <Autocomplete
                        multiple
                        options={AVAILABLE_NICHES}
                        value={profile.preferredNiches}
                        onChange={(_, newValue) => {
                            setProfile(prev => ({
                                ...prev,
                                preferredNiches: newValue
                            }));
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Preferred Creator Niches"
                                placeholder="Select niches"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option}
                                    {...getTagProps({ index })}
                                    key={option}
                                />
                            ))
                        }
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Stack>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}; 