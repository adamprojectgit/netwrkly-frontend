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
    const { login, user } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            try {
                setError(null);
                await login(values.email, values.password);
            } catch (err: any) {
                console.error('Login error:', err);
                setError(err.message || 'An error occurred during login');
            }
        },
    });

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
                                size="large"
                            >
                                Sign In
                            </Button>
                        </Stack>
                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                Don't have an account?{' '}
                                <Link
                                    component="button"
                                    variant="body2"
                                    onClick={() => navigate('/register')}
                                    sx={{ fontWeight: 600 }}
                                >
                                    Sign up
                                </Link>
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
}; 