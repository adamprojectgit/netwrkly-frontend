import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Alert,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Link,
    Stack,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface FormValues {
    email: string;
    password: string;
    confirmPassword: string;
    role: 'CREATOR' | 'BRAND';
}

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
    role: yup
        .string()
        .oneOf(['CREATOR', 'BRAND'] as const, 'Please select a valid role')
        .required('Role is required'),
});

export const RegisterForm: React.FC = () => {
    const navigate = useNavigate();
    const { register, user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik<FormValues>({
        initialValues: {
            email: '',
            password: '',
            confirmPassword: '',
            role: 'CREATOR',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                setError(null);
                await register(values.email, values.password, values.role as 'CREATOR' | 'BRAND');
                // The user state will be updated by the AuthContext's onAuthStateChanged
                // We'll use useEffect to handle the navigation
            } catch (err: any) {
                console.error('Registration error:', err);
                setError(err.message || 'An error occurred during registration');
            }
        },
    });

    // Handle navigation based on user role
    React.useEffect(() => {
        if (user) {
            navigate(user.role === 'CREATOR' ? '/creator' : '/brand');
        }
    }, [user, navigate]);

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                    }}
                >
                    <Box
                        component="img"
                        src="/Logo.png"
                        alt="Netwrkly Logo"
                        sx={{
                            width: 120,
                            height: 'auto',
                            mb: 3,
                        }}
                    />
                    <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        Create your account
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Join Netwrkly to connect with creators and brands
                    </Typography>
                    {error && (
                        <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                            {error}
                        </Alert>
                    )}
                    <Box
                        component="form"
                        onSubmit={formik.handleSubmit}
                        sx={{ width: '100%' }}
                    >
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                error={formik.touched.email && Boolean(formik.errors.email)}
                                helperText={formik.touched.email && formik.errors.email}
                            />
                            <TextField
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="new-password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                            <TextField
                                fullWidth
                                id="confirmPassword"
                                name="confirmPassword"
                                label="Confirm Password"
                                type="password"
                                value={formik.values.confirmPassword}
                                onChange={formik.handleChange}
                                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            />
                            <FormControl
                                fullWidth
                                error={formik.touched.role && Boolean(formik.errors.role)}
                            >
                                <InputLabel id="role-label">I am a</InputLabel>
                                <Select
                                    labelId="role-label"
                                    id="role"
                                    name="role"
                                    value={formik.values.role}
                                    onChange={formik.handleChange}
                                    label="I am a"
                                >
                                    <MenuItem value="CREATOR">Content Creator</MenuItem>
                                    <MenuItem value="BRAND">Brand</MenuItem>
                                </Select>
                                {formik.touched.role && formik.errors.role && (
                                    <Typography color="error" variant="caption">
                                        {formik.errors.role}
                                    </Typography>
                                )}
                            </FormControl>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={formik.isSubmitting}
                            >
                                {formik.isSubmitting ? 'Registering...' : 'Create Account'}
                            </Button>
                        </Stack>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Already have an account?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/login')}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Sign in
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}; 