import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    sendEmailVerification,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import axios from 'axios';

const API_URL = 'https://netwrkly-backend.onrender.com/api';

interface User extends FirebaseUser {
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    signup: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
    login: (email: string, password: string) => Promise<{ success: boolean; role?: string; message: string }>;
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
    const auth = getAuth();

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
            {children}
        </AuthContext.Provider>
    );
}; 