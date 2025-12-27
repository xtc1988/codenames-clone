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
          return baseStyles + ' bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/25 opacity-80';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 opacity-80';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-slate-600 text-slate-300 opacity-60';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-400 shadow-lg shadow-black/50 opacity-80';
        default:
          return baseStyles + ' bg-slate-200 text-slate-800';
      }
    }

    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-card-default text-slate-800 ring-2 ring-rose-500 ring-inset shadow-card';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-card-default text-slate-800 ring-2 ring-indigo-500 ring-inset shadow-card';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-card-default text-slate-800 ring-2 ring-slate-400 ring-inset shadow-card';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-card-default text-slate-800 ring-2 ring-zinc-800 ring-inset shadow-card';
        default:
          return baseStyles + ' bg-card-default text-slate-800 shadow-card';
      }
    }

    if (disabled) {
      return baseStyles + ' bg-card-default text-slate-700 shadow-card cursor-not-allowed';
    }

    return baseStyles + ' bg-card-default text-slate-800 shadow-card hover:shadow-card-hover hover:scale-[1.02] hover:bg-card-hover active:scale-[0.98]';
  };

  const getTypeIndicatorColor = () => {
    switch (card.type) {
      case CardTypeEnum.RED:
        return 'bg-rose-500';
      case CardTypeEnum.BLUE:
        return 'bg-indigo-500';
      case CardTypeEnum.NEUTRAL:
        return 'bg-slate-400';
      case CardTypeEnum.ASSASSIN:
        return 'bg-zinc-800';
      default:
        return 'bg-slate-400';
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
        <div className={'absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-sm ' + getTypeIndicatorColor()} />
      )}

      {card.isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            className="w-12 h-12 text-white/30"
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
