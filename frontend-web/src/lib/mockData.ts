import type { GameSummaryDTO, UserDTO } from '@app-types/api';

// Mock user data
export const mockUsers: UserDTO[] = [
  {
    id: 1,
    username: 'jane@example.com',
    preferredSport: 'Soccer',
    location: 'Kathmandu, Nepal'
  },
  {
    id: 2,
    username: 'john@example.com',
    preferredSport: 'Basketball',
    location: 'Pokhara, Nepal'
  }
];

// Mock games data
export const mockGames: GameSummaryDTO[] = [
  {
    id: 1,
    sport: 'Soccer',
    location: 'Tundikhel Ground',
    time: '2025-01-15T18:00:00Z',
    skillLevel: 'Intermediate',
    latitude: 27.7172,
    longitude: 85.3240,
    creatorName: 'jane@example.com',
    currentPlayers: 6,
    maxPlayers: 10,
    status: 'ACTIVE'
  },
  {
    id: 2,
    sport: 'Basketball',
    location: 'Kathmandu Sports Complex',
    time: '2025-01-15T19:30:00Z',
    skillLevel: 'Advanced',
    latitude: 27.7200,
    longitude: 85.3300,
    creatorName: 'john@example.com',
    currentPlayers: 4,
    maxPlayers: 8,
    status: 'ACTIVE'
  },
  {
    id: 3,
    sport: 'Futsal',
    location: 'Pulchowk Futsal Court',
    time: '2025-01-16T17:00:00Z',
    skillLevel: 'Beginner',
    latitude: 27.6800,
    longitude: 85.3100,
    creatorName: 'jane@example.com',
    currentPlayers: 8,
    maxPlayers: 10,
    status: 'ACTIVE'
  },
  {
    id: 4,
    sport: 'Tennis',
    location: 'Lazimpat Tennis Club',
    time: '2025-01-16T16:00:00Z',
    skillLevel: 'Intermediate',
    latitude: 27.7300,
    longitude: 85.3200,
    creatorName: 'john@example.com',
    currentPlayers: 2,
    maxPlayers: 4,
    status: 'ACTIVE'
  },
  {
    id: 5,
    sport: 'Volleyball',
    location: 'Swayambhu Sports Ground',
    time: '2025-01-17T18:30:00Z',
    skillLevel: 'Advanced',
    latitude: 27.7100,
    longitude: 85.2900,
    creatorName: 'jane@example.com',
    currentPlayers: 10,
    maxPlayers: 12,
    status: 'ACTIVE'
  }
];

// Mock authentication responses
export const mockAuthResponses = {
  'jane@example.com': {
    accessToken: 'mock-jwt-token-jane',
    refreshToken: 'mock-refresh-token-jane',
    tokenType: 'Bearer',
    expiresInSeconds: 7200
  },
  'john@example.com': {
    accessToken: 'mock-jwt-token-john',
    refreshToken: 'mock-refresh-token-john',
    tokenType: 'Bearer',
    expiresInSeconds: 7200
  }
};

// Mock user profile data
export const mockUserProfiles = {
  'jane@example.com': {
    username: 'jane@example.com',
    roles: ['USER'],
    authenticated: true,
    id: 1,
    bio: 'Soccer enthusiast from Kathmandu',
    skillLevel: 'Intermediate',
    location: 'Kathmandu, Nepal'
  },
  'john@example.com': {
    username: 'john@example.com',
    roles: ['USER'],
    authenticated: true,
    id: 2,
    bio: 'Basketball player and coach',
    skillLevel: 'Advanced',
    location: 'Pokhara, Nepal'
  }
};
