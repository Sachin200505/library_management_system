import axios from 'axios';

let base = import.meta.env.VITE_API_URL || '';
if (base && !base.endsWith('/api/')) {
    base = base.endsWith('/') ? `${base}api/` : `${base}/api/`;
}
const API_URL = base || '/api/';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for session cookies
});

// Function to get CSRF token from cookies
const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

// Global variable to store CSRF token for production/cross-domain
let cachedCsrfToken = null;

const fetchCsrfToken = async () => {
    try {
        const response = await axios.get(`${API_URL}auth/csrf_token/`, { withCredentials: true });
        cachedCsrfToken = response.data.csrfToken;
        return cachedCsrfToken;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        return null;
    }
};

// Add a request interceptor to include the CSRF token
api.interceptors.request.use(
    async (config) => {
        // Try getting token from cookie first (works in local or same-domain)
        let csrftoken = getCookie('csrftoken');

        // If no cookie (common in cross-domain prod), use cached token or fetch it
        if (!csrftoken && ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())) {
            csrftoken = cachedCsrfToken || await fetchCsrfToken();
        }

        if (csrftoken) {
            config.headers['X-CSRFToken'] = csrftoken;
        }

        console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    (response) => {
        // If the response contains a new CSRF token in cookies, sync it? 
        // Not strictly needed with the fetchCsrfToken fallback.
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Unauthorized
        }
        return Promise.reject(error);
    }
);

export default api;
