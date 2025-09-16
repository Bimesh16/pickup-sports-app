import { apiClient } from '@lib/apiClient';
import type { Game, Venue, Notification, User } from '@app-types/api';

export const gamesApi = {
  list(params?: Record<string, unknown>) {
    return apiClient.get<Game[]>('/games', { params }).then((res) => res.data);
  },
  trending(params?: Record<string, unknown>) {
    return apiClient.get<Game[]>('/games/trending', { params }).then((res) => res.data);
  },
  create(payload: Partial<Game>) {
    return apiClient.post<Game>('/games', payload).then((res) => res.data);
  },
  join(id: number) {
    return apiClient.post<Game>('/games/' + id + '/join', {}).then((res) => res.data);
  },
};

export const venuesApi = {
  list(params?: Record<string, unknown>) {
    return apiClient.get<Venue[]>('/venues', { params }).then((res) => res.data);
  },
};

export const profilesApi = {
  me() {
    return apiClient.get<User>('/profiles/me').then((res) => res.data);
  },
  update(payload: Partial<User>) {
    return apiClient.put<User>('/profiles/me', payload).then((res) => res.data);
  },
};

export const notificationsApi = {
  list() {
    return apiClient.get<Notification[]>('/notifications').then((res) => res.data);
  },
  markRead(id: number) {
    return apiClient.post('/notifications/' + id + '/read', {}).then((res) => res.data);
  },
};

export const aiApi = {
  recommendations(params?: Record<string, unknown>) {
    return apiClient.get('/ai/recommendations', { params }).then((res) => res.data);
  },
};
