// Minimal types aligned with docs/openapi.yaml

export type TokenPairResponse = {
  accessToken: string;
  refreshToken: string;
  refreshNonce?: string;
  tokenType?: string;
  expiresInSeconds?: number;
};

export type LoginRequest = { username: string; password: string };

export type UserDTO = {
  id: number;
  username: string;
  preferredSport?: string;
  location?: string;
};

export type GameSummaryDTO = {
  id: number;
  sport: string;
  location: string;
  time: string;
  skillLevel?: string;
  latitude?: number;
  longitude?: number;
  creatorName?: string;
  currentPlayers?: number;
  maxPlayers?: number;
  status?: string;
};

export type RsvpResultResponse = { joined: boolean; waitlisted: boolean; message: string };

