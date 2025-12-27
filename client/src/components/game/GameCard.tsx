import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardStyles = () => {
    // 新聞/紙風カードスタイル - タイプライター風フォント、黒インクボーダー
    const baseStyles = 'relative w-full aspect-[3/2] font-typewriter font-bold text-sm md:text-base transition-all duration-150 flex items-center justify-center p-2 border-3 border-ink-black';

    // 公開されたカード - チームカラーで塗りつぶし
    if (card.isRevealed) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-team-red text-paper-cream shadow-paper cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-team-blue text-paper-cream shadow-paper cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-card-neutral text-ink-black cursor-default opacity-80';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-card-assassin text-team-red cursor-default';
        default:
          return baseStyles + ' bg-paper-light text-ink-black cursor-default';
      }
    }

    // スパイマスター表示 - インクマーク付き
    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-paper-light text-ink-black ring-4 ring-inset ring-team-red shadow-paper cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-paper-light text-ink-black ring-4 ring-inset ring-team-blue shadow-paper cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-paper-aged text-ink-gray shadow-paper cursor-default';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-paper-light text-ink-black ring-4 ring-inset ring-ink-black shadow-paper cursor-default';
        default:
          return baseStyles + ' bg-paper-light text-ink-black shadow-paper cursor-default';
      }
    }

    // 無効（自分のターンではない）
    if (disabled) {
      return baseStyles + ' bg-paper-aged text-ink-light shadow-paper cursor-not-allowed opacity-60';
    }

    // インタラクティブカード - 紙のホバー効果
    return baseStyles + ' bg-paper-light text-ink-black shadow-paper hover:shadow-paper-hover hover:bg-paper-cream active:translate-x-[1px] active:translate-y-[1px] active:shadow-paper cursor-pointer';
  };

  // スパイマスター用タイプインジケーター（インクドット）
  const getIndicatorColor = () => {
    switch (card.type) {
      case CardTypeEnum.RED: return 'bg-team-red';
      case CardTypeEnum.BLUE: return 'bg-team-blue';
      case CardTypeEnum.NEUTRAL: return 'bg-ink-light';
      case CardTypeEnum.ASSASSIN: return 'bg-ink-black';
      default: return 'bg-ink-light';
    }
  };

  return (
    <button
      onClick={() => onSelect(card)}
      disabled={disabled || card.isRevealed}
      className={getCardStyles()}
      aria-label={card.word + (card.isRevealed ? ' (revealed)' : '')}
    >
      <span className="text-center break-words leading-tight select-none uppercase tracking-wide">
        {card.word}
      </span>

      {/* スパイマスター用インクドット */}
      {isSpymaster && !card.isRevealed && (
        <div className={'absolute top-2 right-2 w-3 h-3 rounded-full border-2 border-ink-black ' + getIndicatorColor()} />
      )}

      {/* 公開済みスタンプ */}
      {card.isRevealed && (
        <div className="absolute bottom-1 right-1 text-xs font-typewriter opacity-60">
          ✓
        </div>
      )}
    </button>
  );
}
