import axios from 'axios';

const API_URL = (typeof process !== 'undefined' && process.env?.API_URL) || import.meta.env.VITE_API_URL || '/api';
const ACCESS_TOKEN_KEY = 'ps_token';
const REFRESH_TOKEN_KEY = 'ps_refresh_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token && config.headers) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void; config: any }[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.config.headers.Authorization = token ? 'Bearer ' + token : undefined;
      prom.resolve(apiClient(prom.config));
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    if (error.response?.status !== 401 || originalConfig._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject, config: originalConfig });
      });
    }

    originalConfig._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        throw error;
      }

      const { data } = await axios.post(API_URL + '/auth/refresh', { refreshToken });
      const newToken = data?.accessToken ?? null;
      if (newToken) {
        localStorage.setItem(ACCESS_TOKEN_KEY, newToken);
      } else {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }

      processQueue(null, newToken);
      isRefreshing = false;

      if (newToken) {
        if (!originalConfig.headers) originalConfig.headers = {};
        originalConfig.headers.Authorization = 'Bearer ' + newToken;
        return apiClient(originalConfig);
      }

      return Promise.reject(error);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      return Promise.reject(refreshError);
    }
  }
);

export function setAuthTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }

  if (typeof refreshToken === 'string') {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else if (refreshToken === null) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export const authStorage = {
  get accessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  get refreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
};
