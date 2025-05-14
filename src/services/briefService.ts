import axios from 'axios';
import { Brief, CreateBriefData } from '../types/brief';
import { getAuthToken } from '../utils/auth';

const API_URL = '/api/briefs';

const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
});

export const fetchBriefs = async (): Promise<Brief[]> => {
    try {
        console.log('Fetching briefs...');
        const response = await axios.get(API_URL, {
            headers: getHeaders()
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
        const response = await axios.post(API_URL, briefData, {
            headers: getHeaders()
        });
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
            headers: getHeaders()
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