import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardStyles = () => {
    // Forest Nature スタイル
    const baseStyles = `
      relative w-full aspect-[4/3] font-body font-semibold text-sm md:text-base 
      transition-all duration-300 flex items-center justify-center p-3 
      rounded-card border-2 tracking-wide
    `;

    // 公開されたカード
    if (card.isRevealed) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-team-berry text-white border-team-berry-dark shadow-card cursor-default animate-pop-in';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-team-sky text-white border-team-sky-dark shadow-card cursor-default animate-pop-in';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-neutral-warm text-forest-bark/60 border-neutral-soft cursor-default opacity-60';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-assassin text-white border-assassin cursor-default';
        default:
          return baseStyles + ' bg-neutral-warm text-forest-bark cursor-default';
      }
    }

    // スパイマスター表示 - カラーインジケーター付き
    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-forest-bg text-forest-bark ring-4 ring-inset ring-team-berry/40 border-neutral-soft/50 cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-forest-bg text-forest-bark ring-4 ring-inset ring-team-sky/40 border-neutral-soft/50 cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-forest-bg text-forest-bark/60 border-neutral-soft/50 cursor-default';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-forest-bg text-forest-bark ring-4 ring-inset ring-assassin/60 border-neutral-soft/50 cursor-default';
        default:
          return baseStyles + ' bg-forest-bg text-forest-bark border-neutral-soft/50 cursor-default';
      }
    }

    // 無効（自分のターンではない）
    if (disabled) {
      return baseStyles + ' bg-forest-bg text-neutral-muted border-neutral-soft/30 cursor-not-allowed opacity-60';
    }

    // インタラクティブカード - ホバー効果
    return baseStyles + ` 
      bg-forest-bg text-forest-bark border-forest-primary/20 
      shadow-card hover:shadow-card-hover hover:border-forest-moss
      hover:-translate-y-1
      active:translate-y-0
      cursor-pointer
    `;
  };

  // スパイマスター用カラーインジケーター
  const getIndicatorColor = () => {
    switch (card.type) {
      case CardTypeEnum.RED: 
        return 'bg-team-berry';
      case CardTypeEnum.BLUE: 
        return 'bg-team-sky';
      case CardTypeEnum.NEUTRAL: 
        return 'bg-neutral-warm';
      case CardTypeEnum.ASSASSIN: 
        return 'bg-assassin';
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
          <span className="text-assassin/10 text-4xl font-display font-bold">!</span>
        </div>
      )}
    </button>
  );
}
