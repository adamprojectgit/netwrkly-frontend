import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendEmailVerification,
    User as FirebaseUser,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import axios from 'axios';

const firebaseConfig = {
    apiKey: "AIzaSyBFcTGoPWxzcHQokMaRZbpXTYZoAmInVmQ",
    authDomain: "netwrkly.firebaseapp.com",
    projectId: "netwrkly",
    storageBucket: "netwrkly.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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
            if (firebaseUser) {
                const idTokenResult = await firebaseUser.getIdTokenResult();
                const userWithRole = {
                    ...firebaseUser,
                    role: idTokenResult.claims.role as string
                } as User;
                setUser(userWithRole);
                setIsEmailVerified(firebaseUser.emailVerified);
                
                // Get and store the latest token
                const idToken = await firebaseUser.getIdToken();
                localStorage.setItem('token', idToken);

                // Set up token refresh
                const refreshInterval = setInterval(async () => {
                    try {
                        const newToken = await firebaseUser.getIdToken(true); // Force refresh
                        localStorage.setItem('token', newToken);
                    } catch (error) {
                        console.error('Error refreshing token:', error);
                    }
                }, 55 * 60 * 1000); // Refresh every 55 minutes

                // Clean up interval on unmount
                return () => clearInterval(refreshInterval);
            } else {
                setUser(null);
                setIsEmailVerified(false);
                localStorage.removeItem('token');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [auth]);

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
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                await signOut(auth);
                return {
                    success: false,
                    message: 'Please verify your email before logging in.'
                };
            }
            
            const idTokenResult = await user.getIdTokenResult();
            const role = idTokenResult.claims.role as string;
            
            // Get and store the Firebase ID token
            const idToken = await user.getIdToken();
            localStorage.setItem('token', idToken);
            
            return {
                success: true,
                role,
                message: 'Login successful'
            };
        } catch (err: any) {
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