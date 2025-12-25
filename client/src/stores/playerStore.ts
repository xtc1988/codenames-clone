import { create } from 'zustand';
import { Player } from '@/types';

interface PlayerState {
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;
  clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentPlayer: null,
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
  clearPlayer: () => set({ currentPlayer: null }),
}));
