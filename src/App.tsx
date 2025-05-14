import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrandProfileProvider } from './contexts/BrandProfileContext';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { BrandDashboard } from './components/dashboard/BrandDashboard';
import { PrivateRoute } from './components/auth/PrivateRoute';
import { CreatorDashboard } from './components/dashboard/CreatorDashboard';
import { CreatorProfileProvider } from './contexts/CreatorProfileContext';

const theme = createTheme({
    palette: {
        primary: {
            main: '#000000', // Changed from pink to black
            light: '#333333',
            dark: '#000000',
        },
        secondary: {
            main: '#1A1A1A', // Dark gray for text
        },
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
            fontSize: '2.5rem',
        },
        h2: {
            fontWeight: 600,
            fontSize: '2rem',
        },
        h5: {
            fontWeight: 600,
            fontSize: '1.5rem',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.5,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 24,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                },
            },
        },
    },
});

const App: React.FC = () => {
  return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <AuthProvider>
                <CreatorProfileProvider>
                    <BrandProfileProvider>
                        <Router>
                            <Routes>
                                <Route path="/login" element={<LoginForm />} />
                                <Route path="/register" element={<RegisterForm />} />
                                <Route
                                    path="/creator/*"
                                    element={
                                        <PrivateRoute allowedRoles={['CREATOR']}>
                                            <CreatorDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route
                                    path="/brand/*"
                                    element={
                                        <PrivateRoute allowedRoles={['BRAND']}>
                                            <BrandDashboard />
                                        </PrivateRoute>
                                    }
                                />
                                <Route path="/" element={<Navigate to="/login" replace />} />
                            </Routes>
                        </Router>
                    </BrandProfileProvider>
                </CreatorProfileProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
