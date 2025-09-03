import { User, SkillLevel } from './auth';
import { Venue } from './venue';

export interface Game {
  id: number;
  title: string;
  description: string;
  sport: Sport;
  venue: Venue;
  organizer: User;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  costPerPerson: number;
  skillLevel: SkillLevel;
  status: GameStatus;
  participants: User[];
  teams?: Team[];
  createdAt: string;
  updatedAt: string;
  chatRoomId?: string;
  requirements?: string;
  equipment?: string[];
  isPrivate: boolean;
  tags?: string[];
}

export enum GameStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface Sport {
  id: number;
  name: string;
  nameNepali?: string;
  icon: string;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number; // in minutes
  description?: string;
  equipment?: string[];
}

export interface Team {
  id: number;
  name: string;
  gameId: number;
  members: TeamMember[];
  captain?: User;
  skillAverage: number;
  color: string;
  createdAt: string;
}

export interface TeamMember {
  id: number;
  user: User;
  teamId: number;
  position?: string;
  hasPaid: boolean;
  joinedAt: string;
}

export interface GameTemplate {
  id: number;
  name: string;
  description: string;
  sport: Sport;
  minPlayers: number;
  maxPlayers: number;
  estimatedDuration: number;
  rules?: string;
  equipment?: string[];
  skillLevel: SkillLevel;
  tags?: string[];
}

export interface CreateGameRequest {
  title: string;
  description: string;
  sportId: number;
  venueId: number;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  costPerPerson: number;
  skillLevel: SkillLevel;
  requirements?: string;
  isPrivate: boolean;
  tags?: string[];
}

export interface UpdateGameRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  costPerPerson?: number;
  requirements?: string;
  isPrivate?: boolean;
  tags?: string[];
}

export interface JoinGameRequest {
  message?: string;
}

export interface GameSearchParams {
  sport?: string;
  location?: string;
  skillLevel?: SkillLevel;
  startDate?: string;
  endDate?: string;
  maxCost?: number;
  radius?: number;
  latitude?: number;
  longitude?: number;
}