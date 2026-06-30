import axios from 'axios';
import { BASE_URL } from './api';

const api = axios.create({
    baseURL: BASE_URL,
});

export const registerUser = async (data: {
    username: string;
    email: string;
    password: string;
}) => {
    const response = await api.post('/auth/users/', data);

    return response.data;
};