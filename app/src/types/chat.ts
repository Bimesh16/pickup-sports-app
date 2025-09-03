import { User } from './auth';

export interface ChatMessage {
  id: string;
  gameId: number;
  sender: User;
  content: string;
  type: MessageType;
  timestamp: string;
  edited?: boolean;
  editedAt?: string;
  replyTo?: ChatMessage;
  reactions?: MessageReaction[];
}

export enum MessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
  JOIN = 'JOIN',
  LEAVE = 'LEAVE',
  GAME_UPDATE = 'GAME_UPDATE',
  PAYMENT = 'PAYMENT',
}

export interface MessageReaction {
  emoji: string;
  users: User[];
  count: number;
}

export interface ChatRoom {
  id: string;
  gameId: number;
  participants: User[];
  messages: ChatMessage[];
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

export interface SendMessageRequest {
  content: string;
  type: MessageType;
  replyToId?: string;
}

export interface WebSocketMessage {
  type: 'MESSAGE' | 'JOIN' | 'LEAVE' | 'TYPING' | 'REACTION';
  payload: any;
  timestamp: string;
}

export interface TypingIndicator {
  userId: number;
  username: string;
  isTyping: boolean;
}