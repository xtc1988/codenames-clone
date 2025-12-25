import { describe, it, expect } from 'vitest';
import {
  generateCardLayout,
  checkWinner,
  getTeamCounts,
  selectRandomWords,
} from './gameLogic';
import { CardType, Team } from '@/types';

describe('gameLogic', () => {
  describe('generateCardLayout', () => {
    it('should generate 25 cards', () => {
      const layout = generateCardLayout();
      expect(layout).toHaveLength(25);
    });

    it('should have 9 red cards', () => {
      const layout = generateCardLayout();
      const redCount = layout.filter((c) => c === CardType.RED).length;
      expect(redCount).toBe(9);
    });

    it('should have 8 blue cards', () => {
      const layout = generateCardLayout();
      const blueCount = layout.filter((c) => c === CardType.BLUE).length;
      expect(blueCount).toBe(8);
    });

    it('should have 7 neutral cards', () => {
      const layout = generateCardLayout();
      const neutralCount = layout.filter((c) => c === CardType.NEUTRAL).length;
      expect(neutralCount).toBe(7);
    });

    it('should have 1 assassin card', () => {
      const layout = generateCardLayout();
      const assassinCount = layout.filter((c) => c === CardType.ASSASSIN).length;
      expect(assassinCount).toBe(1);
    });

    it('should randomize card positions', () => {
      const layout1 = generateCardLayout();
      const layout2 = generateCardLayout();

      // 2回生成して異なる配置になる可能性が高い
      const isDifferent = layout1.some((card, index) => card !== layout2[index]);
      expect(isDifferent).toBe(true);
    });
  });

  describe('checkWinner', () => {
    it('should return RED when all red cards are revealed', () => {
      const cards = [
        { type: CardType.RED, isRevealed: true },
        { type: CardType.RED, isRevealed: true },
        { type: CardType.RED, isRevealed: true },
        { type: CardType.BLUE, isRevealed: false },
        { type: CardType.NEUTRAL, isRevealed: false },
      ];

      const winner = checkWinner(cards);
      expect(winner).toBe(Team.RED);
    });

    it('should return BLUE when all blue cards are revealed', () => {
      const cards = [
        { type: CardType.BLUE, isRevealed: true },
        { type: CardType.BLUE, isRevealed: true },
        { type: CardType.RED, isRevealed: false },
        { type: CardType.NEUTRAL, isRevealed: false },
      ];

      const winner = checkWinner(cards);
      expect(winner).toBe(Team.BLUE);
    });

    it('should return null when no team has won yet', () => {
      const cards = [
        { type: CardType.RED, isRevealed: true },
        { type: CardType.RED, isRevealed: false },
        { type: CardType.BLUE, isRevealed: true },
        { type: CardType.BLUE, isRevealed: false },
      ];

      const winner = checkWinner(cards);
      expect(winner).toBeNull();
    });

    it('should return null when assassin is revealed', () => {
      const cards = [
        { type: CardType.ASSASSIN, isRevealed: true },
        { type: CardType.RED, isRevealed: false },
        { type: CardType.BLUE, isRevealed: false },
      ];

      const winner = checkWinner(cards);
      expect(winner).toBeNull();
    });
  });

  describe('getTeamCounts', () => {
    it('should count red and blue cards correctly', () => {
      const cards = [
        { type: CardType.RED, isRevealed: false },
        { type: CardType.RED, isRevealed: true },
        { type: CardType.RED, isRevealed: true },
        { type: CardType.BLUE, isRevealed: false },
        { type: CardType.BLUE, isRevealed: true },
        { type: CardType.NEUTRAL, isRevealed: false },
      ];

      const counts = getTeamCounts(cards);

      expect(counts.red.total).toBe(3);
      expect(counts.red.revealed).toBe(2);
      expect(counts.red.remaining).toBe(1);

      expect(counts.blue.total).toBe(2);
      expect(counts.blue.revealed).toBe(1);
      expect(counts.blue.remaining).toBe(1);
    });

    it('should handle empty array', () => {
      const counts = getTeamCounts([]);

      expect(counts.red.total).toBe(0);
      expect(counts.red.revealed).toBe(0);
      expect(counts.red.remaining).toBe(0);

      expect(counts.blue.total).toBe(0);
      expect(counts.blue.revealed).toBe(0);
      expect(counts.blue.remaining).toBe(0);
    });
  });

  describe('selectRandomWords', () => {
    it('should select the requested number of words', () => {
      const words = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
      const selected = selectRandomWords(words, 3);

      expect(selected).toHaveLength(3);
    });

    it('should return all words if count exceeds array length', () => {
      const words = ['apple', 'banana', 'cherry'];
      const selected = selectRandomWords(words, 10);

      expect(selected).toHaveLength(3);
    });

    it('should select different words on multiple calls', () => {
      const words = Array.from({ length: 100 }, (_, i) => `word${i}`);
      const selected1 = selectRandomWords(words, 25);
      const selected2 = selectRandomWords(words, 25);

      // At least some words should be different
      const isDifferent = selected1.some((word, index) => word !== selected2[index]);
      expect(isDifferent).toBe(true);
    });

    it('should only include words from the original array', () => {
      const words = ['apple', 'banana', 'cherry'];
      const selected = selectRandomWords(words, 2);

      selected.forEach((word) => {
        expect(words).toContain(word);
      });
    });
  });
});
