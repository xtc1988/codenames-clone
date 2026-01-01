import { create } from 'zustand';
import { Card, Hint, Team } from '@/types';

interface GameState {
  cards: Card[];
  hints: Hint[];
  currentTurn: Team | null;
  winner: Team | null;

  setCards: (cards: Card[]) => void;
  setHints: (hints: Hint[]) => void;
  addHint: (hint: Hint) => void;
  setCurrentTurn: (turn: Team | null) => void;
  setWinner: (winner: Team | null) => void;
  revealCard: (cardId: string, revealedBy: string) => void;
  clearGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  cards: [],
  hints: [],
  currentTurn: null,
  winner: null,

  setCards: (cards) => set({ cards }),

  setHints: (hints) => set({ hints }),

  addHint: (hint) =>
    set((state) => ({
      hints: [hint, ...state.hints],
    })),

  setCurrentTurn: (turn) => set({ currentTurn: turn }),

  setWinner: (winner) => set({ winner }),

  revealCard: (cardId, revealedBy) =>
    set((state) => ({
      cards: state.cards.map((card) =>
        card.id === cardId
          ? { ...card, isRevealed: true, revealedBy }
          : card
      ),
    })),

  clearGame: () =>
    set({
      cards: [],
      hints: [],
      currentTurn: null,
      winner: null,
    }),
}));
