import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardStyles = () => {
    const baseStyles = 'relative w-full aspect-[3/2] rounded-xl font-semibold text-sm md:text-base transition-all duration-200 flex items-center justify-center p-2 cursor-pointer';

    if (card.isRevealed) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-gradient-to-br from-rose-600/90 to-rose-700/90 text-white shadow-lg shadow-rose-500/30';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-gradient-to-br from-indigo-500/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-500/30';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-gray-600/80 text-gray-300';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-gradient-to-br from-zinc-900 to-black text-zinc-500 shadow-lg shadow-black/50';
        default:
          return baseStyles + ' bg-game-surface text-card-text';
      }
    }

    // Spymaster view - show colored borders
    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-card-default text-card-text ring-2 ring-rose-500/70 ring-inset shadow-card';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-card-default text-card-text ring-2 ring-indigo-400/70 ring-inset shadow-card';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-card-default text-card-text ring-2 ring-gray-500/50 ring-inset shadow-card';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-card-default text-card-text ring-2 ring-zinc-900 ring-inset shadow-card';
        default:
          return baseStyles + ' bg-card-default text-card-text shadow-card';
      }
    }

    // Disabled state
    if (disabled) {
      return baseStyles + ' bg-card-default text-gray-500 shadow-card cursor-not-allowed opacity-70';
    }

    // Normal operative view
    return baseStyles + ' bg-card-default text-card-text shadow-card hover:shadow-card-hover hover:scale-[1.02] hover:bg-card-hover active:scale-[0.98]';
  };

  const getTypeIndicatorColor = () => {
    switch (card.type) {
      case CardTypeEnum.RED:
        return 'bg-rose-500';
      case CardTypeEnum.BLUE:
        return 'bg-indigo-400';
      case CardTypeEnum.NEUTRAL:
        return 'bg-gray-500';
      case CardTypeEnum.ASSASSIN:
        return 'bg-zinc-900 ring-1 ring-zinc-700';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <button
      onClick={() => onSelect(card)}
      disabled={disabled || card.isRevealed}
      className={getCardStyles()}
      aria-label={card.word + (card.isRevealed ? ' (revealed)' : '')}
    >
      <span className="text-center break-words leading-tight select-none">
        {card.word}
      </span>

      {isSpymaster && !card.isRevealed && (
        <div className={'absolute top-2 right-2 w-3 h-3 rounded-full shadow-sm ' + getTypeIndicatorColor()} />
      )}

      {card.isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-12 h-12 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
    </button>
  );
}
