import axios, { type AxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Ensure token doesn't already have 'Bearer ' prefix and is not quoted
            const cleanToken = token.replace(/^Bearer\s+/i, '').replace(/^"|"$/g, '');
            console.log('[api] Attaching token to request', config.url, cleanToken);
            config.headers.Authorization = `Bearer ${cleanToken}`;
            // Helpful debug in development to see that a token was attached (do not print full token)
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.debug('[api] Attaching token to request', config.url, 'tokenPreview=', `${cleanToken.slice(0, 8)}...`);
            }
        }
        // Debug: show when no token is present (helps track 401s during dev)
        else {
            // Use Vite env helper - only log in dev mode
            if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.debug('[api] No token found in localStorage for request to', config.url);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Don't auto-redirect here — let the calling code (pages) handle 401 so
            // they can show contextual UI (retry, login prompt) like `ClientsPage`.
            console.error('Unauthorized access (401) for request:', error.config?.url, error.response);
        }
        return Promise.reject(error);
    }
);

// --- Request deduplication for identical GET requests ---
// Prevents duplicate network calls when the same GET is fired multiple times
// in quick succession (for example, React Strict Mode double-mount in dev).
const pendingRequests = new Map<string, Promise<any>>();

const originalRequest = api.request.bind(api);

api.request = function (config: AxiosRequestConfig) {
    try {
        const method = (config.method || 'get').toString().toLowerCase();
        if (method === 'get') {
            // Key: method + full url (baseURL + url) + params
            const base = (config.baseURL ?? api.defaults.baseURL ?? '').replace(/\/$/, '');
            const url = ((config.url ?? '') as string).replace(/^\//, '');
            const paramsKey = config.params ? JSON.stringify(config.params) : '';
            const key = `${method}:${base}/${url}:${paramsKey}`;

            if (pendingRequests.has(key)) {
                return pendingRequests.get(key) as Promise<any>;
            }

            const prom = originalRequest(config).finally(() => pendingRequests.delete(key));
            pendingRequests.set(key, prom);
            return prom;
        }
    } catch (e) {
        // if anything goes wrong, fall back to the original request
        // eslint-disable-next-line no-console
        console.warn('[api] dedupe wrapper error, falling back to normal request', e);
    }

    return originalRequest(config);
} as typeof api.request;

export default api;
