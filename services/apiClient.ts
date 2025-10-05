import { handleRequest } from '../server/api';
import { User, UserRole, AgentStatus } from '../types';

let authToken: string | null = null;

const getAuthHeaders = () => {
    return authToken ? { 'Authorization': `Bearer ${authToken}` } : {};
};

export const setToken = (token: string) => {
    authToken = token;
    localStorage.setItem('authToken', token);
};

export const clearToken = () => {
    authToken = null;
    localStorage.removeItem('authToken');
};

// Initialize token from localStorage on script load
const storedToken = localStorage.getItem('authToken');
if (storedToken) {
    authToken = storedToken;
}

// --- Auth Methods ---
export const login = async (email: string, password: string): Promise<{ user: User, token: string }> => {
    const response: any = await handleRequest('POST', '/api/auth/login', { email, password });
    if (response.token) {
        setToken(response.token);
    }
    return response;
};

export const register = async (userData: Omit<User, 'id' | 'title' | 'avatar'>): Promise<{ user: User }> => {
    return handleRequest('POST', '/api/auth/register', userData) as Promise<{ user: User }>;
};

export const verifyEmail = async (userId: number, code: string): Promise<{ success: boolean }> => {
    return handleRequest('POST', '/api/auth/verify', { userId, code }) as Promise<{ success: boolean }>;
};

export const logout = () => {
    clearToken();
};


// --- Generic Data Methods ---
export const get = async <T>(path: string): Promise<T> => {
    return handleRequest('GET', path, undefined, getAuthHeaders()) as Promise<T>;
};

export const post = async <T>(path: string, data: any): Promise<T> => {
    return handleRequest('POST', path, data, getAuthHeaders()) as Promise<T>;
};

export const put = async <T>(path: string, data: any): Promise<T> => {
    return handleRequest('PUT', path, data, getAuthHeaders()) as Promise<T>;
};

export const del = async <T>(path: string): Promise<T> => {
    return handleRequest('DELETE', path, undefined, getAuthHeaders()) as Promise<T>;
};

// --- Message Methods ---
export const sendMessage = (receiverId: number, text: string) => {
    return post('/api/messages', { receiverId, text });
};

export const editMessage = (messageId: number, text: string) => {
    return put(`/api/messages/${messageId}`, { text });
};

export const trashMessage = (messageId: number) => {
    return put(`/api/messages/${messageId}/trash`, {});
};

export const restoreMessage = (messageId: number) => {
    return put(`/api/messages/${messageId}/restore`, {});
};

export const permanentlyDeleteMessage = (messageId: number) => {
    return del(`/api/messages/${messageId}`);
};


// --- Specific Business Logic Methods ---
export const approveAgent = async (agentId: number, role: UserRole) => {
    return post(`/api/agents/${agentId}/approve`, { role });
};

export const updateAgentStatus = async (agentId: number, status: AgentStatus) => {
    return put(`/api/agents/${agentId}/status`, { status });
};

export const deleteAgent = async (agentId: number) => {
    return del(`/api/agents/${agentId}`);
};

export const createLeadFromProfile = async (leadData: any, agentId: number) => {
    return post('/api/leads/from-profile', { leadData, agentId });
};

export const updateMyProfile = async (userData: Partial<User>) => {
    return put('/api/users/me', userData);
};