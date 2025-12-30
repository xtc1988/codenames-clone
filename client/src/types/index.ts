// Enums (Prisma schemaと一致)
export enum RoomStatus {
  WAITING = 'waiting',
  PLAYING = 'playing',
  FINISHED = 'finished',
}

export enum Team {
  RED = 'red',
  BLUE = 'blue',
  SPECTATOR = 'spectator',
}

export enum PlayerRole {
  SPYMASTER = 'spymaster',
  OPERATIVE = 'operative',
}

export enum SpectatorView {
  SPYMASTER = 'spymaster',
  OPERATIVE = 'operative',
}

export enum CardType {
  RED = 'red',
  BLUE = 'blue',
  NEUTRAL = 'neutral',
  ASSASSIN = 'assassin',
}

// Models
export interface WordPack {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  isDefault: boolean;
  language: string;
  creatorSessionId: string | null;
  createdAt: string;
  wordCount?: number;
}

export interface Word {
  id: string;
  wordPackId: string;
  word: string;
}

export interface Player {
  id: string;
  roomId: string;
  nickname: string;
  team: Team;
  role: PlayerRole | null;
  sessionId: string;
  isHost: boolean;
  isAI: boolean;
  spectatorView: SpectatorView;
  createdAt: string;
}

export interface AIHintResponse {
  word: string;
  count: number;
  reason?: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  isPublic: boolean;
  wordPackId: string;
  currentTurn: Team | null;
  winner: Team | null;
  timerSeconds: number | null;
  createdAt: string;
  updatedAt: string;
  wordPack?: WordPack;
  players?: Player[];
  cards?: Card[];
  hints?: Hint[];
}

export interface Card {
  id: string;
  roomId: string;
  word: string;
  position: number;
  type: CardType;
  isRevealed: boolean;
  revealedBy: string | null;
}

export interface Hint {
  id: string;
  roomId: string;
  playerId: string;
  word: string;
  count: number;
  team: Team;
  createdAt: string;
  player?: Player;
}

// API Responses
export interface CreateRoomResponse {
  room: Room;
  player: Player;
}

export interface RoomListItem {
  id: string;
  code: string;
  name: string;
  status: RoomStatus;
  isPublic: boolean;
  playerCount: number;
  maxPlayers: number;
  createdAt: string;
}

export interface RoomListResponse {
  rooms: RoomListItem[];
}

// Realtime Events
export interface RealtimePresence {
  playerId: string;
  nickname: string;
  team: Team;
  role: PlayerRole | null;
  isHost: boolean;
}

export interface RealtimeBroadcast {
  type:
    | 'player_joined'
    | 'player_left'
    | 'player_updated'
    | 'game_started'
    | 'hint_given'
    | 'card_revealed'
    | 'turn_changed'
    | 'game_over'
    | 'chat_message';
  payload: any;
}

// Chat
export interface ChatMessage {
  playerId: string;
  nickname: string;
  message: string;
  timestamp: string;
}

// Game State
export interface GameState {
  room: Room;
  players: Player[];
  cards: Card[];
  hints: Hint[];
  currentPlayer: Player | null;
}

// Team Counts
export interface TeamCounts {
  red: {
    total: number;
    revealed: number;
  };
  blue: {
    total: number;
    revealed: number;
  };
}
