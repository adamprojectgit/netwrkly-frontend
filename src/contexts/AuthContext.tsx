import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile,
    UserCredential
} from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

const API_URL = 'https://netwrkly-backend.onrender.com/api';

interface User {
    id: string;
    email: string;
    role: 'CREATOR' | 'BRAND';
    emailVerified: boolean;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<UserCredential>;
    register: (email: string, password: string, role: 'CREATOR' | 'BRAND') => Promise<UserCredential>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
                    role: role as 'CREATOR' | 'BRAND',
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 