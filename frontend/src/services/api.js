const API_BASE_URL = 'http://localhost:3000/api';

class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

async function request(endpoint, options = {}) {
    const token = localStorage.getItem('__bank_auth_token');

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers,
        // Provide backend credentials cookie behavior like existing Vanilla JS did
        credentials: 'include'
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        let data;

        // Attempt to parse JSON response. Some responses (like 204) aren't JSON.
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json();
        }

        if (!response.ok) {
            throw new ApiError(data?.message || 'An error occurred', response.status, data);
        }

        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }
        // Network errors (e.g. server is down)
        throw new ApiError('Network error: Unable to connect to server', 0, null);
    }
}

export const api = {
    get: (endpoint) => request(endpoint, { method: 'GET' }),
    post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => request(endpoint, { method: 'DELETE' }),
};
