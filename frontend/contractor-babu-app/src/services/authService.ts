import api from './api';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    username: string;
    role: string;
    tenantId?: string;
}


export interface RegisterRequest {
    companyName: string;
    fullName: string;
    email: string;
    password: string;
}

export const authService = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/login', credentials);
        // Support different backend token field names (token, accessToken, access_token)
        const token = (response.data as any)?.token ?? (response.data as any)?.accessToken ?? (response.data as any)?.access_token;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                username: response.data.username,
                role: response.data.role,
                tenantId: response.data.tenantId
            }));
        }
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<LoginResponse> => {
        const response = await api.post<LoginResponse>('/auth/register', data);
        // Support different backend token field names (token, accessToken, access_token)
        const token = (response.data as any)?.token ?? (response.data as any)?.accessToken ?? (response.data as any)?.access_token;
        if (token) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({
                username: response.data.username,
                role: response.data.role,
                tenantId: response.data.tenantId
            }));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (!userStr || userStr === 'undefined') return null;
        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
};
