import React, { useState, useEffect } from 'react';
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
    Link,
    Stack,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const validationSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required'),
});

export const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const { login, user, logout } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                setError(null);
                setLoading(true);
                await login(values.email, values.password);
            } catch (err: any) {
                console.error('Login error:', err);
                setError(err.message || 'An error occurred during login');
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        if (user) {
            if (user.role === 'CREATOR') {
                navigate('/creator');
            } else if (user.role === 'BRAND') {
                navigate('/brand');
            } else {
                // Handle unknown role or show error
                setError('Invalid user role');
                logout();
            }
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
                        src={process.env.PUBLIC_URL + '/Logo.png'}
                        alt="Netwrkly Logo"
                        sx={{
                            width: 120,
                            height: 'auto',
                            mb: 3,
                        }}
                    />
                    <Typography component="h1" variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                        Welcome back
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                        Sign in to continue to Netwrkly
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
                                autoComplete="current-password"
                                value={formik.values.password}
                                onChange={formik.handleChange}
                                error={formik.touched.password && Boolean(formik.errors.password)}
                                helperText={formik.touched.password && formik.errors.password}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                disabled={loading}
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </Stack>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Link href="/register" variant="body2">
                                {"Don't have an account? Sign Up"}
                            </Link>
                            <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/reset-password')}
                            >
                                Forgot Password?
                            </Link>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}; 