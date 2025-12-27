import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardStyles = () => {
    // Base: min 44px touch target (UX guideline), Flat Design rounded cards
    const baseStyles = 'relative w-full aspect-[3/2] rounded-card font-heading font-semibold text-sm md:text-base transition-all duration-normal flex items-center justify-center p-2';

    // Revealed cards - solid team colors (Flat Design)
    if (card.isRevealed) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-team-red text-white shadow-glow-red cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-team-blue text-white shadow-glow-blue cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-card-neutral text-game-bg cursor-default opacity-70';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-card-assassin text-team-red cursor-default';
        default:
          return baseStyles + ' bg-card-surface text-card-text cursor-default';
      }
    }

    // Spymaster view - show team indicators with borders
    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-card-surface text-card-text ring-4 ring-team-red/60 ring-inset shadow-card cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-card-surface text-card-text ring-4 ring-team-blue/60 ring-inset shadow-card cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-card-surface text-card-text ring-4 ring-game-muted/40 ring-inset shadow-card cursor-default';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-card-surface text-card-text ring-4 ring-card-assassin ring-inset shadow-card cursor-default';
        default:
          return baseStyles + ' bg-card-surface text-card-text shadow-card cursor-default';
      }
    }

    // Disabled (not your turn)
    if (disabled) {
      return baseStyles + ' bg-card-surface text-game-muted shadow-card cursor-not-allowed opacity-60';
    }

    // Interactive card - UX guideline: hover feedback + cursor-pointer
    return baseStyles + ' bg-card-surface text-card-text shadow-card hover:shadow-card-hover hover:scale-[1.03] active:scale-[0.98] cursor-pointer';
  };

  // Type indicator for spymaster
  const getIndicatorColor = () => {
    switch (card.type) {
      case CardTypeEnum.RED: return 'bg-team-red';
      case CardTypeEnum.BLUE: return 'bg-team-blue';
      case CardTypeEnum.NEUTRAL: return 'bg-game-muted';
      case CardTypeEnum.ASSASSIN: return 'bg-card-assassin ring-2 ring-team-red/50';
      default: return 'bg-game-muted';
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

      {/* Spymaster type indicator */}
      {isSpymaster && !card.isRevealed && (
        <div className={'absolute top-2 right-2 w-3 h-3 rounded-full ' + getIndicatorColor()} />
      )}

      {/* Revealed check mark */}
      {card.isRevealed && (
        <div className="absolute bottom-2 right-2">
          <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}
