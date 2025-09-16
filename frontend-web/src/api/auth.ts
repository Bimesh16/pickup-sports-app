import { http } from '@lib/http';
import type { TokenPairResponse, LoginRequest } from '@app-types/api';

export async function login(req: LoginRequest): Promise<TokenPairResponse | { mfaRequired: boolean; challenge: string }> {
  return http('/auth/login', { method: 'POST', body: JSON.stringify(req) }, false);
}

export async function me(): Promise<{ username: string; roles: string[]; authenticated: boolean }> {
  return http('/auth/me', { method: 'GET' });
}
