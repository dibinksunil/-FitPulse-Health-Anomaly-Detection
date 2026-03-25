const API_BASE_URL = 'http://localhost:3000/api';

class ApiService {
    async register(username, password) {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Registration failed');
        return data;
    }

    async login(username, password) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Login failed');
        
        // Simple token/session management
        localStorage.setItem('fitpulse_user', JSON.stringify(data.user));
        return data.user;
    }

    async getDashboardMetrics() {
        const userStr = localStorage.getItem('fitpulse_user');
        if (!userStr) throw new Error('Not authenticated');
        
        const user = JSON.parse(userStr);
        const response = await fetch(`${API_BASE_URL}/metrics/${user.id}`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch metrics');
        return data;
    }

    async addLog(logData) {
        const userStr = localStorage.getItem('fitpulse_user');
        if (!userStr) throw new Error('Not authenticated');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...logData, userId: user.id })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to add log');
        return data;
    }

    async updateProfile(profileData) {
        const userStr = localStorage.getItem('fitpulse_user');
        if (!userStr) throw new Error('Not authenticated');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/users/${user.id}/profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to update profile');
        return data.profile;
    }

    async deleteLog(logId) {
        const userStr = localStorage.getItem('fitpulse_user');
        if (!userStr) throw new Error('Not authenticated');
        const user = JSON.parse(userStr);

        const response = await fetch(`${API_BASE_URL}/logs/${user.id}/${logId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to delete log');
        return data;
    }

    logout() {
        localStorage.removeItem('fitpulse_user');
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!localStorage.getItem('fitpulse_user');
    }
}

const api = new ApiService();
