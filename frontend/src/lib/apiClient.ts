import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from '@/components/UI/Toaster';
import { API_BASE_URL } from './constant';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    successMessage?: string;
    showErrorToast?: boolean;
}

const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        const config = response.config as CustomAxiosRequestConfig;

        if (config.successMessage) {
            toast.success(config.successMessage);
        } else if (response.data && response.data.message) {
        }

        return response;
    },
    (error: AxiosError) => {
        const config = error.config as CustomAxiosRequestConfig | undefined;

        if (config?.showErrorToast !== false) {
            const errorMessage =
                (error.response?.data as any)?.error ||
                (error.response?.data as any)?.message ||
                error.message ||
                "An unexpected error occurred";

            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);

const api = {
    get: <T = any>(url: string, config?: CustomAxiosRequestConfig) =>
        apiClient.get<T>(url, config),

    post: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
        apiClient.post<T>(url, data, config),

    put: <T = any>(url: string, data?: any, config?: CustomAxiosRequestConfig) =>
        apiClient.put<T>(url, data, config),

    delete: <T = any>(url: string, config?: CustomAxiosRequestConfig) =>
        apiClient.delete<T>(url, config),

    instance: apiClient
};

export default api;
