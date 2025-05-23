import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendEmailVerification,
    User as FirebaseUser,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const API_URL = 'https://netwrkly-backend.onrender.com/api';

interface User extends FirebaseUser {
    role: string;
}

interface RegisterData {
    email: string;
    password: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
    login: (email: string, password: string) => Promise<{ success: boolean; role?: string; message: string }>;
    logout: () => Promise<void>;
    isEmailVerified: boolean;
    resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEmailVerified, setIsEmailVerified] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('Auth state changed, user:', firebaseUser?.email);
            if (firebaseUser) {
                try {
                    console.log('Firebase user authenticated:', firebaseUser.email);
                    const idTokenResult = await firebaseUser.getIdTokenResult();
                    const role = idTokenResult.claims.role as string;
                    
                    // If no role is set, try to register the user
                    if (!role) {
                        try {
                            const idToken = await firebaseUser.getIdToken();
                            // Try to register the user with BRAND role by default
                            await axios.post(
                                `${API_URL}/auth/register`,
                                {
                                    email: firebaseUser.email,
                                    role: 'BRAND',
                                    firebaseUid: firebaseUser.uid
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${idToken}`
                                    }
                                }
                            );
                            // Get updated token with role
                            const updatedTokenResult = await firebaseUser.getIdTokenResult(true);
                            const userWithRole = {
                                ...firebaseUser,
                                role: updatedTokenResult.claims.role as string
                            } as User;
                            setUser(userWithRole);
                        } catch (error) {
                            console.error('Error registering user:', error);
                            // If registration fails, sign out the user
                            await signOut(auth);
                            setError('Failed to complete registration. Please try again.');
                            return;
                        }
                    } else {
                        const userWithRole = {
                            ...firebaseUser,
                            role
                        } as User;
                        setUser(userWithRole);
                    }
                    
                    setIsEmailVerified(firebaseUser.emailVerified);
                    
                    // Get and store the latest token
                    const idToken = await firebaseUser.getIdToken();
                    console.log('Got new token, length:', idToken.length);
                    console.log('Token starts with:', idToken.substring(0, 20));
                    localStorage.setItem('token', idToken.trim());
                    
                    // Verify token was stored
                    const storedToken = localStorage.getItem('token');
                    if (!storedToken) {
                        console.error('Failed to store token in localStorage');
                    } else {
                        console.log('Token stored successfully in localStorage, length:', storedToken.length);
                        console.log('Stored token starts with:', storedToken.substring(0, 20));
                    }

                    // Set up token refresh
                    const refreshInterval = setInterval(async () => {
                        try {
                            console.log('Refreshing token...');
                            const newToken = await firebaseUser.getIdToken(true); // Force refresh
                            console.log('Got refreshed token, length:', newToken.length);
                            localStorage.setItem('token', newToken);
                            
                            // Verify refreshed token was stored
                            const refreshedStoredToken = localStorage.getItem('token');
                            if (!refreshedStoredToken) {
                                console.error('Failed to store refreshed token in localStorage');
                            } else {
                                console.log('Refreshed token stored successfully in localStorage');
                            }
                        } catch (error) {
                            console.error('Error refreshing token:', error);
                        }
                    }, 55 * 60 * 1000); // Refresh every 55 minutes

                    // Clean up interval on unmount
                    return () => clearInterval(refreshInterval);
                } catch (error) {
                    console.error('Error in auth state change handler:', error);
                }
            } else {
                console.log('No Firebase user, clearing token');
                setUser(null);
                setIsEmailVerified(false);
                localStorage.removeItem('token');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const register = async ({ email, password, role }: RegisterData) => {
        try {
            setError(null);
            
            // Create user in Firebase
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Send email verification
            await sendEmailVerification(user);
            
            // Get Firebase ID token
            const idToken = await user.getIdToken();
            
            // Register user in our backend
            await axios.post(
                `${API_URL}/auth/register`,
                {
                    email,
                    role,
                    firebaseUid: user.uid
                },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`
                    }
                }
            );
            
            // Sign out the user until they verify their email
            await signOut(auth);
            
            return {
                success: true,
                message: 'Please check your email to verify your account before logging in.'
            };
        } catch (err: any) {
            setError(err.message);
            return {
                success: false,
                message: err.message
            };
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            console.log('Attempting login for:', email);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                console.log('Email not verified, signing out');
                await signOut(auth);
                return {
                    success: false,
                    message: 'Please verify your email before logging in.'
                };
            }
            
            const idTokenResult = await user.getIdTokenResult();
            const role = idTokenResult.claims.role as string;
            console.log('User role:', role);
            
            // Get and store the Firebase ID token
            const idToken = await user.getIdToken();
            console.log('Storing token after login');
            localStorage.setItem('token', idToken);
            
            // Verify token was stored
            const storedToken = localStorage.getItem('token');
            if (!storedToken) {
                console.error('Token was not stored properly');
                throw new Error('Failed to store authentication token');
            }
            
            console.log('Token stored successfully, length:', storedToken.length);
            
            return {
                success: true,
                role,
                message: 'Login successful'
            };
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message);
            return {
                success: false,
                message: err.message
            };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            localStorage.removeItem('token'); // Remove the token on logout
        } catch (err: any) {
            setError(err.message);
            throw err;  
        }
    };

    const resetPassword = async (email: string) => {
        try {
            setError(null);
            await sendPasswordResetEmail(auth, email);
            return {
                success: true,
                message: 'Password reset email sent. Please check your inbox.'
            };
        } catch (err: any) {
            setError(err.message);
            return {
                success: false,
                message: err.message
            };
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isEmailVerified,
        resetPassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 