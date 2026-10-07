import { HealthStatus, PresetItem, VerificationReport } from '../types/report';

const API_BASE = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') : '';

export class ApiError extends Error {
  constructor(public status: number, message: string, public detail?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      errorDetail = await response.text();
    }
    throw new ApiError(response.status, errorDetail);
  }

  return response.json() as Promise<T>;
}

export const api = {
  getHealth: (signal?: AbortSignal): Promise<HealthStatus> => {
    return request<HealthStatus>('/api/health', { signal });
  },

  getPresets: (signal?: AbortSignal): Promise<PresetItem[]> => {
    return request<PresetItem[]>('/api/presets', { signal });
  },

  getMLStats: (signal?: AbortSignal): Promise<any> => {
    return request<any>('/api/ml-stats', { signal });
  },

  analyzeText: (text: string, signal?: AbortSignal): Promise<VerificationReport> => {
    return request<VerificationReport>('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ text }),
      signal,
    });
  },
};
