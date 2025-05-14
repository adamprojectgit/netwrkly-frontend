import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BrandProfileData } from '../types/profile';
import { profileService } from '../services/profileService';

interface BrandProfileContextType {
  profile: BrandProfileData | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (profileData: BrandProfileData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const BrandProfileContext = createContext<BrandProfileContextType | undefined>(undefined);

export const useBrandProfile = () => {
  const context = useContext(BrandProfileContext);
  if (context === undefined) {
    throw new Error('useBrandProfile must be used within a BrandProfileProvider');
  }
  return context;
};

interface BrandProfileProviderProps {
  children: ReactNode;
}

export const BrandProfileProvider: React.FC<BrandProfileProviderProps> = ({ children }) => {
  const [profile, setProfile] = useState<BrandProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
      // Set a default empty profile to prevent infinite loading
      setProfile({
        companyName: '',
        description: '',
        industry: '',
        website: '',
        preferredNiches: [],
        logoUrl: '',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: BrandProfileData) => {
    try {
      setIsLoading(true);
      setError(null);
      await profileService.updateProfile(profileData);
      setProfile(profileData);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return (
    <BrandProfileContext.Provider
      value={{
        profile,
        isLoading,
        error,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </BrandProfileContext.Provider>
  );
}; 