export interface Game {
  id: string;
  title: string;
  sport: SportType;
  description: string;
  dateTime: string;
  duration: number; // in minutes
  location: GameLocation;
  maxPlayers: number;
  currentPlayers: number;
  skillLevel: SkillLevel;
  cost: number;
  currency: string;
  status: GameStatus;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
  };
  players: GamePlayer[];
  equipment: Equipment[];
  rules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GameLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  facilities: string[];
  rating: number;
  photos: string[];
}

export interface GamePlayer {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  joinedAt: string;
  status: PlayerStatus;
  skillLevel: SkillLevel;
  rating: number;
}

export interface Equipment {
  id: string;
  name: string;
  required: boolean;
  providedByOrganizer: boolean;
}

export type SportType = 
  | 'FOOTBALL' 
  | 'BASKETBALL' 
  | 'CRICKET' 
  | 'BADMINTON' 
  | 'TENNIS' 
  | 'VOLLEYBALL' 
  | 'TABLE_TENNIS'
  | 'FUTSAL';

export type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type GameStatus = 
  | 'UPCOMING' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED';

export type PlayerStatus = 
  | 'CONFIRMED' 
  | 'PENDING' 
  | 'DECLINED' 
  | 'WAITLISTED';

export interface CreateGameRequest {
  title: string;
  sport: SportType;
  description: string;
  dateTime: string;
  duration: number;
  locationId: string;
  maxPlayers: number;
  skillLevel: SkillLevel;
  cost: number;
  equipment: Omit<Equipment, 'id'>[];
  rules: string[];
}