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

export const createCollege = async (name: string): Promise<College> => {
    try {
        const response = await api.post('/api/v1/core/colleges/', { name });
        return response.data;
    } catch (error: any) {
        console.log("CREATE COLLEGE API ERROR:", error?.response?.data || error.message);
        throw error;
    }
};

export const updateProfile = async (id: number, data: any) => {
    const response = await api.patch(`/api/v1/core/profile/${id}/`, data);
    return response.data;
};
