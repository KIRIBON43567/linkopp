const API_BASE_URL = import.meta.env.DEV ? 'http://localhost:8787' : 'https://linkopp-api.web3linkerclub.workers.dev';

export class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  }

  // 认证 API
  async register(username: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async login(username: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/api/auth/me');
  }

  // AI 对话 API
  async chat(messages: any[]) {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  }

  async onboardingChat(conversationHistory: any[], currentStep: string) {
    return this.request('/api/ai/onboarding', {
      method: 'POST',
      body: JSON.stringify({ conversationHistory, currentStep }),
    });
  }

  // 用户画像 API
  async getProfile() {
    return this.request('/api/profile');
  }

  async updateProfile(profileData: any) {
    return this.request('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // 社群成员 API
  async getMembers() {
    return this.request('/api/members');
  }

  // 匹配 API
  async createMatch(targetId: number) {
    return this.request('/api/match/create', {
      method: 'POST',
      body: JSON.stringify({ targetId }),
    });
  }

  async getMatchHistory() {
    return this.request('/api/match/history');
  }

  async getMatchDetail(matchId: number) {
    return this.request(`/api/match/${matchId}`);
  }
}

export const api = new ApiClient();
