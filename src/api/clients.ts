import axios from 'axios';

export const api = axios.create({
    baseURL: 'https://bookmart-api.gourabacharjee.website',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});