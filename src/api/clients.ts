import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const api = axios.create({
    baseURL: 'https://bookmart-backend-y6of.onrender.com',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error("Error fetching token from SecureStore", error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If the error is 401 Unauthorized and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Avoid infinite loops if the refresh call itself fails with 401
            if (originalRequest.url?.includes('/api/v1/auth/refresh')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;

            try {
                const refreshToken = await SecureStore.getItemAsync('refreshToken');

                if (refreshToken) {
                    // Call refresh endpoint directly with axios (not api client) to avoid interceptor loops
                    const refreshResponse = await axios.post(
                        'https://bookmart-backend-y6of.onrender.com/api/v1/auth/refresh/',
                        { refresh: refreshToken }
                    );

                    const newAccessToken = refreshResponse.data.access;

                    if (newAccessToken) {
                        // Save the new tokens
                        await SecureStore.setItemAsync('accessToken', newAccessToken);
                        if (refreshResponse.data.refresh) {
                            await SecureStore.setItemAsync('refreshToken', refreshResponse.data.refresh);
                        }

                        // Update the authorization header for the original request and retry
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                // If refresh fails, tokens are invalid. Best practice is to clear them.
                await SecureStore.deleteItemAsync('accessToken');
                await SecureStore.deleteItemAsync('refreshToken');
                // If you want to force navigation to login, you can remove the is_logged_in flag here.
                // Note: AsyncStorage would need to be imported.
            }
        }

        return Promise.reject(error);
    }
);