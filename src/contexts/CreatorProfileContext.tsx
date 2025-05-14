import React, { createContext, useContext, useState, useEffect } from 'react';
import { creatorProfileService } from '../services/api';

interface CreatorProfile {
    id: number;
    bio?: string;
    location?: string;
    website?: string;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

interface CreatorProfileContextType {
    profile: CreatorProfile | null;
    isLoading: boolean;
    error: Error | null;
    updateProfile: (data: Partial<CreatorProfile>) => Promise<void>;
}

const CreatorProfileContext = createContext<CreatorProfileContextType | undefined>(undefined);

export const CreatorProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await creatorProfileService.getProfile();
            setProfile(data);
        } catch (err: any) {
            setError(new Error(err.message || 'Error loading profile'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const updateProfile = async (data: Partial<CreatorProfile>) => {
        try {
            setIsLoading(true);
            const updatedProfile = await creatorProfileService.updateProfile(data);
            setProfile(updatedProfile);
        } catch (err: any) {
            setError(new Error(err.message || 'Error updating profile'));
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CreatorProfileContext.Provider value={{ profile, isLoading, error, updateProfile }}>
            {children}
        </CreatorProfileContext.Provider>
    );
};

export const useCreatorProfile = () => {
    const context = useContext(CreatorProfileContext);
    if (context === undefined) {
        throw new Error('useCreatorProfile must be used within a CreatorProfileProvider');
    }
    return context;
}; 