import axios from 'axios';
import { getAuthToken } from '../utils/auth';

export interface BrandProfileData {
    id?: number;
    companyName: string;
    description: string;
    industry: string;
    website: string;
    preferredNiches: string[];
    logoUrl: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'https://netwrkly-backend.onrender.com/api';

export const profileService = {
    async getProfile(): Promise<BrandProfileData> {
        try {
            const response = await axios.get(`${API_URL}/brand-profiles/me`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
            // Ensure preferredNiches is always an array
            return {
                ...response.data,
                preferredNiches: response.data.preferredNiches || []
            };
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    async updateProfile(profileData: BrandProfileData): Promise<BrandProfileData> {
        try {
            const response = await axios.put(`${API_URL}/brand-profiles/me`, profileData, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    async uploadLogo(file: File): Promise<string> {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post(`${API_URL}/brand-profiles/me/logo`, formData, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    },

    async deleteLogo(filename: string): Promise<void> {
        try {
            await axios.delete(`${API_URL}/brand-profiles/me/logo/${filename}`, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw error;
        }
    }
}; 