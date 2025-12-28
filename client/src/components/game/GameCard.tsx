import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardStyles = () => {
    // Risograph Print Studio スタイル
    const baseStyles = `
      relative w-full aspect-[4/3] font-body font-semibold text-sm md:text-base 
      transition-all duration-200 flex items-center justify-center p-3 
      rounded-card border-2 uppercase tracking-wide
    `;

    // 公開されたカード
    if (card.isRevealed) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-riso-coral text-white border-riso-coral-dark shadow-card cursor-default animate-pop-in';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-riso-teal text-white border-riso-teal-dark shadow-card cursor-default animate-pop-in';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-neutral-warm text-riso-navy/60 border-neutral-soft cursor-default';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-riso-navy text-white border-riso-navy cursor-default animate-wiggle';
        default:
          return baseStyles + ' bg-neutral-warm text-riso-navy cursor-default';
      }
    }

    // スパイマスター表示 - カラーインジケーター付き
    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-paper-aged text-riso-navy ring-4 ring-inset ring-riso-coral/40 border-neutral-soft cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-paper-aged text-riso-navy ring-4 ring-inset ring-riso-teal/40 border-neutral-soft cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-paper-aged text-riso-navy/60 border-neutral-soft cursor-default';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-paper-aged text-riso-navy ring-4 ring-inset ring-riso-navy/60 border-neutral-soft cursor-default';
        default:
          return baseStyles + ' bg-paper-aged text-riso-navy border-neutral-soft cursor-default';
      }
    }

    // 無効（自分のターンではない）
    if (disabled) {
      return baseStyles + ' bg-paper-warm text-neutral-muted border-neutral-soft cursor-not-allowed opacity-60';
    }

    // インタラクティブカード - ホバー効果
    return baseStyles + ` 
      bg-white text-riso-navy border-neutral-soft 
      shadow-card hover:shadow-card-hover hover:border-riso-mustard
      hover:-translate-y-1
      active:translate-y-0 active:shadow-card-active
      cursor-pointer misprint-effect
    `;
  };

  // スパイマスター用カラーインジケーター
  const getIndicatorColor = () => {
    switch (card.type) {
      case CardTypeEnum.RED: 
        return 'bg-riso-coral';
      case CardTypeEnum.BLUE: 
        return 'bg-riso-teal';
      case CardTypeEnum.NEUTRAL: 
        return 'bg-neutral-warm';
      case CardTypeEnum.ASSASSIN: 
        return 'bg-riso-navy';
      default: 
        return 'bg-neutral-warm';
    }
  };

  return (
    <button
      onClick={() => onSelect(card)}
      disabled={disabled || card.isRevealed}
      className={getCardStyles()}
      aria-label={card.word + (card.isRevealed ? ' (revealed)' : '')}
    >
      {/* 単語テキスト */}
      <span className="text-center break-words leading-tight select-none z-10 relative">
        {card.word}
      </span>

      {/* スパイマスター用カラードット */}
      {isSpymaster && !card.isRevealed && (
        <div className={'absolute top-2 right-2 w-3 h-3 rounded-full ' + getIndicatorColor()} />
      )}

      {/* 公開済みチェックマーク */}
      {card.isRevealed && card.type !== CardTypeEnum.ASSASSIN && (
        <div className="absolute bottom-1.5 right-2 text-white/80 text-xs font-bold">
          ✓
        </div>
      )}

      {/* 暗殺者マーク */}
      {card.isRevealed && card.type === CardTypeEnum.ASSASSIN && (
        <div className="absolute bottom-1.5 right-2 text-white text-xs">
          ✕
        </div>
      )}

      {/* 暗殺者の警告オーバーレイ（スパイマスター用） */}
      {isSpymaster && !card.isRevealed && card.type === CardTypeEnum.ASSASSIN && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-riso-navy/10 text-4xl font-display font-bold">!</span>
        </div>
      )}
    </button>
  );
}
