import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardStyles = () => {
    // スパイ・ノワール風カードスタイル - 機密書類/ドシエ風
    const baseStyles = `
      relative w-full aspect-[3/2] font-mono font-semibold text-xs md:text-sm 
      transition-all duration-200 flex items-center justify-center p-2 
      border-2 uppercase tracking-wider
    `;

    // 公開されたカード - チームカラーで発光
    if (card.isRevealed) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-stamp-red border-stamp-red-glow text-dossier-cream shadow-stamp cursor-default animate-stamp-appear';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-ink-navy border-ink-navy-glow text-dossier-cream cursor-default animate-stamp-appear';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-neutral-card border-noir-shadow text-dossier-stain cursor-default opacity-70';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-assassin border-noir-deep text-stamp-red cursor-default';
        default:
          return baseStyles + ' bg-noir-shadow text-dossier-cream cursor-default';
      }
    }

    // スパイマスター表示 - 機密マーカー付き
    if (isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return baseStyles + ' bg-noir-leather text-dossier-manila ring-2 ring-inset ring-stamp-red/60 border-noir-shadow cursor-default';
        case CardTypeEnum.BLUE:
          return baseStyles + ' bg-noir-leather text-dossier-manila ring-2 ring-inset ring-ink-navy/60 border-noir-shadow cursor-default';
        case CardTypeEnum.NEUTRAL:
          return baseStyles + ' bg-noir-shadow text-neutral-text border-noir-shadow cursor-default';
        case CardTypeEnum.ASSASSIN:
          return baseStyles + ' bg-noir-deep text-stamp-red ring-2 ring-inset ring-stamp-red/40 border-noir-shadow cursor-default';
        default:
          return baseStyles + ' bg-noir-leather text-dossier-manila border-noir-shadow cursor-default';
      }
    }

    // 無効（自分のターンではない）
    if (disabled) {
      return baseStyles + ' bg-noir-shadow text-neutral-text border-noir-shadow cursor-not-allowed opacity-50';
    }

    // インタラクティブカード - マニラフォルダ風ホバー
    return baseStyles + ` 
      bg-dossier-manila text-noir-leather border-dossier-stain 
      shadow-dossier hover:shadow-dossier-hover 
      hover:bg-dossier-aged hover:border-brass-gold hover:text-noir-deep
      active:translate-x-[2px] active:translate-y-[2px] active:shadow-none 
      cursor-pointer
    `;
  };

  // スパイマスター用機密レベルインジケーター
  const getIndicatorStyles = () => {
    switch (card.type) {
      case CardTypeEnum.RED: 
        return 'bg-stamp-red shadow-[0_0_8px_rgba(139,0,0,0.6)]';
      case CardTypeEnum.BLUE: 
        return 'bg-ink-navy shadow-[0_0_8px_rgba(26,54,93,0.6)]';
      case CardTypeEnum.NEUTRAL: 
        return 'bg-neutral-card';
      case CardTypeEnum.ASSASSIN: 
        return 'bg-noir-deep border-2 border-stamp-red shadow-[0_0_8px_rgba(139,0,0,0.4)]';
      default: 
        return 'bg-noir-shadow';
    }
  };


  return (
    <button
      onClick={() => onSelect(card)}
      disabled={disabled || card.isRevealed}
      className={getCardStyles()}
      aria-label={card.word + (card.isRevealed ? ' (revealed)' : '')}
    >
      {/* 紙のテクスチャ背景 */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.04' numOctaves='5'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paper)' opacity='0.1'/%3E%3C/svg%3E\")"
        }}
      />

      {/* 単語テキスト */}
      <span 
        className="text-center break-words leading-tight select-none z-10 relative"
        style={{ textShadow: card.isRevealed && card.type === CardTypeEnum.RED ? '0 0 10px rgba(139,0,0,0.5)' : 
                            card.isRevealed && card.type === CardTypeEnum.BLUE ? '0 0 10px rgba(26,54,93,0.5)' :
                            card.isRevealed && card.type === CardTypeEnum.ASSASSIN ? '0 0 15px rgba(139,0,0,0.8)' : 'none' }}
      >
        {card.word}
      </span>

      {/* スパイマスター用機密レベルインジケーター */}
      {isSpymaster && !card.isRevealed && (
        <div className={'absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ' + getIndicatorStyles()} />
      )}

      {/* 公開済みスタンプマーク */}
      {card.isRevealed && (
        <div className="absolute bottom-1 right-1 text-xs font-display opacity-70 tracking-widest">
          {card.type === CardTypeEnum.ASSASSIN ? '☠' : '✓'}
        </div>
      )}

      {/* 暗殺者の警告オーバーレイ */}
      {isSpymaster && !card.isRevealed && card.type === CardTypeEnum.ASSASSIN && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-stamp-red/20 text-3xl font-display">☠</span>
        </div>
      )}
    </button>
  );
}
