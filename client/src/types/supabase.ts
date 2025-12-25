// Supabase型定義
// 将来的にはSupabase CLIで自動生成される型を使用する
// npx supabase gen types typescript --project-id djzdfefdstzlcxppkbnt > src/types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      word_packs: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          is_default: boolean;
          language: string;
          creator_session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          is_default?: boolean;
          language?: string;
          creator_session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          is_default?: boolean;
          language?: string;
          creator_session_id?: string | null;
          created_at?: string;
        };
      };
      words: {
        Row: {
          id: string;
          word_pack_id: string;
          word: string;
        };
        Insert: {
          id?: string;
          word_pack_id: string;
          word: string;
        };
        Update: {
          id?: string;
          word_pack_id?: string;
          word?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          code: string;
          name: string;
          status: 'WAITING' | 'PLAYING' | 'FINISHED';
          is_public: boolean;
          word_pack_id: string;
          current_turn: 'RED' | 'BLUE' | null;
          winner: 'RED' | 'BLUE' | null;
          timer_seconds: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          status?: 'WAITING' | 'PLAYING' | 'FINISHED';
          is_public?: boolean;
          word_pack_id: string;
          current_turn?: 'RED' | 'BLUE' | null;
          winner?: 'RED' | 'BLUE' | null;
          timer_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          status?: 'WAITING' | 'PLAYING' | 'FINISHED';
          is_public?: boolean;
          word_pack_id?: string;
          current_turn?: 'RED' | 'BLUE' | null;
          winner?: 'RED' | 'BLUE' | null;
          timer_seconds?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      players: {
        Row: {
          id: string;
          room_id: string;
          nickname: string;
          team: 'RED' | 'BLUE' | 'SPECTATOR';
          role: 'SPYMASTER' | 'OPERATIVE' | null;
          session_id: string;
          is_host: boolean;
          spectator_view: 'SPYMASTER' | 'OPERATIVE';
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          nickname: string;
          team?: 'RED' | 'BLUE' | 'SPECTATOR';
          role?: 'SPYMASTER' | 'OPERATIVE' | null;
          session_id: string;
          is_host?: boolean;
          spectator_view?: 'SPYMASTER' | 'OPERATIVE';
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          nickname?: string;
          team?: 'RED' | 'BLUE' | 'SPECTATOR';
          role?: 'SPYMASTER' | 'OPERATIVE' | null;
          session_id?: string;
          is_host?: boolean;
          spectator_view?: 'SPYMASTER' | 'OPERATIVE';
          created_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          room_id: string;
          word: string;
          position: number;
          type: 'RED' | 'BLUE' | 'NEUTRAL' | 'ASSASSIN';
          is_revealed: boolean;
          revealed_by: string | null;
        };
        Insert: {
          id?: string;
          room_id: string;
          word: string;
          position: number;
          type: 'RED' | 'BLUE' | 'NEUTRAL' | 'ASSASSIN';
          is_revealed?: boolean;
          revealed_by?: string | null;
        };
        Update: {
          id?: string;
          room_id?: string;
          word?: string;
          position?: number;
          type?: 'RED' | 'BLUE' | 'NEUTRAL' | 'ASSASSIN';
          is_revealed?: boolean;
          revealed_by?: string | null;
        };
      };
      hints: {
        Row: {
          id: string;
          room_id: string;
          player_id: string;
          word: string;
          count: number;
          team: 'RED' | 'BLUE';
          created_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          player_id: string;
          word: string;
          count: number;
          team: 'RED' | 'BLUE';
          created_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          player_id?: string;
          word?: string;
          count?: number;
          team?: 'RED' | 'BLUE';
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
