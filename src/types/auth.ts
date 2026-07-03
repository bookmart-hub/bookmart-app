import { api } from '@/api/clients';

export const registerUser = async (data: {
    username: string;
    email: string;
    password: string;
}) => {
    const response = await api.post('/auth/users/', data);

    return response.data;
};