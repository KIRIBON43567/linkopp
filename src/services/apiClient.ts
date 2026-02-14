// API Client for LINKOPP

const API_BASE_URL = 'https://linkopp-api.web3linkerclub.workers.dev/api';

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

// Set auth token to localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

// Clear auth token
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

// Base fetch function with auth
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string }) => {
    const result = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  login: async (data: { email: string; password: string }) => {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.token) {
      setAuthToken(result.token);
    }
    return result;
  },

  getMe: async () => {
    return apiFetch('/auth/me');
  },

  logout: () => {
    clearAuthToken();
  },
};

// Agents API
export const agentsAPI = {
  list: async (params?: { industry?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.industry) query.append('industry', params.industry);
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const queryString = query.toString();
    return apiFetch(`/agents${queryString ? `?${queryString}` : ''}`);
  },

  getById: async (id: string) => {
    return apiFetch(`/agents/${id}`);
  },
};

// Matches API
export const matchesAPI = {
  list: async (params?: { status?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    
    const queryString = query.toString();
    return apiFetch(`/matches${queryString ? `?${queryString}` : ''}`);
  },

  calculate: async () => {
    return apiFetch('/matches/calculate', {
      method: 'POST',
    });
  },

  updateStatus: async (id: string, status: string) => {
    return apiFetch(`/matches/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Conversations API
export const conversationsAPI = {
  list: async () => {
    return apiFetch('/conversations');
  },

  create: async (agentId: string) => {
    return apiFetch('/conversations', {
      method: 'POST',
      body: JSON.stringify({ agent_id: agentId }),
    });
  },

  getMessages: async (conversationId: string) => {
    return apiFetch(`/conversations/${conversationId}/messages`);
  },

  sendMessage: async (conversationId: string, content: string) => {
    return apiFetch(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};

// Dashboard API
export const dashboardAPI = {
  getStats: async (date?: string) => {
    const query = date ? `?date=${date}` : '';
    return apiFetch(`/dashboard/stats${query}`);
  },

  getInsights: async () => {
    return apiFetch('/dashboard/insights');
  },
};

// Auto Communications API
export const autoCommunicationsAPI = {
  dispatch: async (data: { match_id: string; agent_id: string }) => {
    return apiFetch('/auto-communications/dispatch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getStatus: async (id: string) => {
    return apiFetch(`/auto-communications/${id}`);
  },

  getReport: async (id: string) => {
    return apiFetch(`/auto-communications/${id}/report`);
  },

  list: async () => {
    return apiFetch('/auto-communications');
  },
};
