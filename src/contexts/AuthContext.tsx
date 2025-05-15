import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendEmailVerification,
    User as FirebaseUser,
    UserCredential
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
    createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword, 
    updateProfile,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const API_URL = 'https://netwrkly-backend.onrender.com/api';

interface User extends FirebaseUser {
    id: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signup: (email: string, password: string) => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isEmailVerified: boolean;
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
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                const idTokenResult = await firebaseUser.getIdTokenResult();
                const userWithRole = {
                    ...firebaseUser,
                    id: firebaseUser.uid,
                    role: idTokenResult.claims.role as string
                } as User;
                setUser(userWithRole);
                setIsEmailVerified(firebaseUser.emailVerified);
            } else {
                setUser(null);
                setIsEmailVerified(false);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, [auth]);

    const signup = async (email: string, password: string) => {
        try {
            setError(null);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Send email verification
            await sendEmailVerification(user);
            
            // Sign out the user until they verify their email
            await signOut(auth);
            
            // Show success message and redirect to login
            alert('Please check your email to verify your account before logging in.');
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setError(null);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            if (!user.emailVerified) {
                await signOut(auth);
                throw new Error('Please verify your email before logging in.');
            }
            
            // Redirect based on user role
            const idTokenResult = await user.getIdTokenResult();
            const role = idTokenResult.claims.role as string;
            
            if (role === 'BRAND') {
                navigate('/brand');
            } else if (role === 'CREATOR') {
                navigate('/creator');
            } else {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        signup,
        login,
        logout,
        isEmailVerified
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const AuthProviderOld: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                // Get the role from custom claims or default to CREATOR
                const role = (firebaseUser as any).role || 'CREATOR';
                const userData: User = {
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    role: role as string,
                    emailVerified: firebaseUser.emailVerified
                };
                setUser(userData);
                setIsAuthenticated(true);
            } else {
                setUser(null);
                setIsAuthenticated(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    };

    const register = async (email: string, password: string, role: 'CREATOR' | 'BRAND') => {
        try {
            // First create the user in Firebase
            const userCredential = await firebaseCreateUserWithEmailAndPassword(auth, email, password);
            
            // Get the Firebase ID token
            const idToken = await userCredential.user.getIdToken();
            
            // Then create the user in your backend
            await axios.post(`${API_URL}/auth/register`, {
                email,
                role,
                firebaseUid: userCredential.user.uid
            }, {
                headers: {
                    Authorization: `Bearer ${idToken}`
                }
            });

            // Store the role in Firebase profile
            await updateProfile(userCredential.user, {
                displayName: role
            });

            return userCredential;
        } catch (error: any) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}; 