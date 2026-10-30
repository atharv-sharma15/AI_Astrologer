import { Chart, Conversation, Message, HealthStatus, SourceReference, User } from '../types';

const API_BASE = ''; // Proxy handles /api and /health

class ApiService {
  private token: string | null = null;
  private guestId: string | null = null;

  constructor() {
    this.token = localStorage.getItem('vedviki_token');
    this.guestId = localStorage.getItem('vedviki_guest_id');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    if (this.guestId) {
      headers['X-Guest-ID'] = this.guestId;
    }
    return headers;
  }

  async initSession(): Promise<User> {
    if (!this.token && !this.guestId) {
      try {
        const res = await fetch(`${API_BASE}/api/auth/guest`, { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          this.token = data.access_token;
          this.guestId = data.user.id;
          localStorage.setItem('vedviki_token', this.token!);
          localStorage.setItem('vedviki_guest_id', this.guestId!);
          return data.user;
        }
      } catch (err) {
        console.warn('Could not initialize remote guest session, falling back to local guest id', err);
      }
    }
    return { id: this.guestId || 'guest', is_guest: true, created_at: new Date().toISOString() };
  }

  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  async uploadChart(file: File): Promise<Chart> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/api/charts/upload`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || 'Chart extraction failed');
    }

    return res.json();
  }

  async getChart(chartId: string): Promise<Chart> {
    const res = await fetch(`${API_BASE}/api/charts/${chartId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to load chart');
    return res.json();
  }

  async listCharts(): Promise<Chart[]> {
    const res = await fetch(`${API_BASE}/api/charts`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list charts');
    return res.json();
  }

  async updateChart(chartId: string, updates: Partial<Chart>): Promise<Chart> {
    const res = await fetch(`${API_BASE}/api/charts/${chartId}`, {
      method: 'PATCH',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update chart');
    return res.json();
  }

  async confirmChart(chartId: string, userNotes?: string): Promise<Chart> {
    const res = await fetch(`${API_BASE}/api/charts/${chartId}/confirm`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmed: true, user_notes: userNotes }),
    });
    if (!res.ok) throw new Error('Failed to confirm chart');
    return res.json();
  }

  async deleteChart(chartId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/charts/${chartId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete chart');
  }

  async createConversation(chartId?: string | null, title?: string, language: 'en' | 'hi' = 'en'): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/api/chats`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chart_id: chartId || null,
        title: title || 'Astrology Consultation',
        preferred_language: language,
      }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  }

  async listConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/api/chats`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list conversations');
    return res.json();
  }

  async getConversation(chatId: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/api/chats/${chatId}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get conversation');
    return res.json();
  }

  async sendMessage(chatId: string, content: string, language?: string): Promise<Message> {
    const res = await fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        ...this.getHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, language }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }

  async deleteConversation(chatId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/chats/${chatId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete conversation');
  }

  async getKnowledgeStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/api/knowledge/status`);
    if (!res.ok) throw new Error('Failed to get knowledge status');
    return res.json();
  }

  async searchKnowledge(query: string, topK: number = 3): Promise<SourceReference[]> {
    const res = await fetch(`${API_BASE}/api/knowledge/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, top_k: topK }),
    });
    if (!res.ok) throw new Error('Search failed');
    return res.json();
  }

  async seedDemo(): Promise<{ user_id: string; chart_id: string; conversation_id: string; access_token?: string }> {
    const res = await fetch(`${API_BASE}/api/health/seed-demo`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to seed demo');
    const data = await res.json();
    if (data.access_token) {
      this.token = data.access_token;
      localStorage.setItem('vedviki_token', this.token!);
    }
    const uid = data.user_id || data.guest_user_id;
    if (uid) {
      this.guestId = uid;
      localStorage.setItem('vedviki_guest_id', this.guestId!);
    }
    return data;
  }
}

export const api = new ApiService();
