import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GameCard from './GameCard';
import { CardType } from '@/types';

describe('GameCard', () => {
  const mockCard = {
    id: '1',
    roomId: 'room1',
    word: 'テスト',
    position: 0,
    type: CardType.RED,
    isRevealed: false,
    revealedBy: null,
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  describe('Display', () => {
    it('should render card word', () => {
      render(
        <GameCard
          card={mockCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      expect(screen.getByText('テスト')).toBeInTheDocument();
    });

    it('should show red background for spymaster with red card', () => {
      render(
        <GameCard
          card={mockCard}
          isSpymaster={true}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-500');
    });

    it('should show blue background for spymaster with blue card', () => {
      const blueCard = { ...mockCard, type: CardType.BLUE };

      render(
        <GameCard
          card={blueCard}
          isSpymaster={true}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-blue-500');
    });

    it('should show neutral background for spymaster with neutral card', () => {
      const neutralCard = { ...mockCard, type: CardType.NEUTRAL };

      render(
        <GameCard
          card={neutralCard}
          isSpymaster={true}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-gray-300');
    });

    it('should show black background for spymaster with assassin card', () => {
      const assassinCard = { ...mockCard, type: CardType.ASSASSIN };

      render(
        <GameCard
          card={assassinCard}
          isSpymaster={true}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-black');
    });

    it('should show neutral background for operative with unrevealed card', () => {
      render(
        <GameCard
          card={mockCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-amber-50');
    });

    it('should show card type color for revealed card', () => {
      const revealedCard = { ...mockCard, isRevealed: true };

      render(
        <GameCard
          card={revealedCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('bg-red-500');
    });

    it('should show opacity for revealed card', () => {
      const revealedCard = { ...mockCard, isRevealed: true };

      render(
        <GameCard
          card={revealedCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('opacity-60');
    });
  });

  describe('Interaction', () => {
    it('should call onSelect when clicked', async () => {
      const user = userEvent.setup();

      render(
        <GameCard
          card={mockCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSelect).toHaveBeenCalledWith(mockCard);
    });

    it('should not call onSelect when disabled', async () => {
      const user = userEvent.setup();

      render(
        <GameCard
          card={mockCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should not call onSelect when card is revealed', async () => {
      const user = userEvent.setup();
      const revealedCard = { ...mockCard, isRevealed: true };

      render(
        <GameCard
          card={revealedCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should be disabled when card is revealed', () => {
      const revealedCard = { ...mockCard, isRevealed: true };

      render(
        <GameCard
          card={revealedCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={false}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should be disabled when disabled prop is true', () => {
      render(
        <GameCard
          card={mockCard}
          isSpymaster={false}
          onSelect={mockOnSelect}
          disabled={true}
        />
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });
});
