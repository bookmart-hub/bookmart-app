import { api } from '@/api/clients';

export interface College {
    id: number;
    name: string;
    district: string;
    state: string;
}

export const getColleges = async (search?: string): Promise<College[]> => {
    try {
        const params = search ? { search } : {};
        const response = await api.get('/api/v1/core/colleges/', { params });
        console.log("COLLEGE API RESPONSE:", JSON.stringify(response.data).slice(0, 500));
        
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.results)) return data.results;
        if (data && Array.isArray(data.data)) return data.data;
        
        return [];
    } catch (error: any) {
        console.log("COLLEGE API ERROR:", error?.response?.data || error.message);
        return [];
    }
};

export const submitOnboarding = async (data: {
    user_role: string;
    college_id: number | null;
    book_preferences: string;
}) => {
    const response = await api.post('/api/v1/core/profile/onboarding', data);
    return response.data;
};
