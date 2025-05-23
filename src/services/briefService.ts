import axios from 'axios';
import { Brief, CreateBriefData } from '../types/brief';
import { getAuthToken } from '../utils/auth';

const API_URL = `${process.env.REACT_APP_API_URL || 'https://netwrkly-backend.onrender.com/api'}/briefs`;

const getHeaders = (requireAuth = true) => {
    const token = getAuthToken();
    console.log('Getting headers, token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    if (requireAuth && !token) {
        console.error('No token found when auth is required');
        throw new Error('No authentication token found. Please log in again.');
    }
    const headers = {
        'Authorization': token ? `Bearer ${token.trim()}` : undefined,
        'Content-Type': 'application/json'
    };
    console.log('Headers being sent:', {
        ...headers,
        'Authorization': headers.Authorization ? `${headers.Authorization.substring(0, 20)}...` : undefined
    });
    return headers;
};

export const fetchBriefs = async (): Promise<Brief[]> => {
    try {
        console.log('Fetching briefs...');
        const response = await axios.get(API_URL, {
            headers: getHeaders(false)
        });
        console.log('Briefs fetched successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error fetching briefs:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
        }
        throw error;
    }
};

export const createBrief = async (briefData: CreateBriefData): Promise<Brief> => {
    try {
        console.log('Creating brief with data:', briefData);
        const headers = getHeaders(true);
        console.log('Headers for create brief:', headers);
        const response = await axios.post(API_URL, briefData, { headers });
        console.log('Brief created successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating brief:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
            if (error.response?.status === 401) {
                throw new Error('Unauthorized. Please log in again.');
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
        }
        throw error;
    }
};

export const updateBriefStatus = async (briefId: number, status: Brief['status']): Promise<Brief> => {
    try {
        console.log(`Updating brief ${briefId} status to ${status}`);
        const response = await axios.patch(`${API_URL}/${briefId}/status`, { status }, {
            headers: getHeaders(true)
        });
        console.log('Brief status updated successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error updating brief status:', error);
        if (axios.isAxiosError(error)) {
            console.error('Response data:', error.response?.data);
            console.error('Status:', error.response?.status);
            if (error.response?.status === 401) {
                throw new Error('Unauthorized. Please log in again.');
            }
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
        }
        throw error;
    }
}; 