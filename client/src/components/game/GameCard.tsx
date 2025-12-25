import { Card as CardType, CardType as CardTypeEnum } from '@/types';

interface GameCardProps {
  card: CardType;
  isSpymaster: boolean;
  onSelect: (card: CardType) => void;
  disabled: boolean;
}

export default function GameCard({ card, isSpymaster, onSelect, disabled }: GameCardProps) {
  const getCardColor = () => {
    if (card.isRevealed || isSpymaster) {
      switch (card.type) {
        case CardTypeEnum.RED:
          return 'bg-red-500 text-white border-red-700';
        case CardTypeEnum.BLUE:
          return 'bg-blue-500 text-white border-blue-700';
        case CardTypeEnum.NEUTRAL:
          return 'bg-gray-300 text-gray-800 border-gray-500';
        case CardTypeEnum.ASSASSIN:
          return 'bg-black text-white border-gray-900';
        default:
          return 'bg-white border-gray-300';
      }
    }
    return 'bg-amber-50 border-amber-300 hover:bg-amber-100';
  };

  const getCardOpacity = () => {
    if (card.isRevealed) return 'opacity-60';
    return '';
  };

  return (
    <button
      onClick={() => onSelect(card)}
      disabled={disabled || card.isRevealed}
      className={`
        ${getCardColor()}
        ${getCardOpacity()}
        relative
        w-full
        aspect-[3/2]
        rounded-lg
        border-2
        font-bold
        text-sm
        md:text-base
        transition-all
        duration-200
        disabled:cursor-not-allowed
        flex
        items-center
        justify-center
        p-2
        ${!card.isRevealed && !disabled ? 'cursor-pointer shadow-md hover:shadow-lg transform hover:-translate-y-1' : ''}
      `}
    >
      <span className="text-center break-words">{card.word}</span>

      {/* スパイマスター用のインジケーター */}
      {isSpymaster && !card.isRevealed && (
        <div className="absolute top-1 right-1 w-3 h-3 rounded-full border-2 border-white opacity-50">
          {card.type === CardTypeEnum.RED && <div className="w-full h-full bg-red-500 rounded-full" />}
          {card.type === CardTypeEnum.BLUE && <div className="w-full h-full bg-blue-500 rounded-full" />}
          {card.type === CardTypeEnum.NEUTRAL && <div className="w-full h-full bg-gray-400 rounded-full" />}
          {card.type === CardTypeEnum.ASSASSIN && <div className="w-full h-full bg-black rounded-full" />}
        </div>
      )}

      {/* 公開済みインジケーター */}
      {card.isRevealed && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-4xl opacity-20">✓</div>
        </div>
      )}
    </button>
  );
}
