import { CardType, Team } from '@/types';

/**
 * カード配置を生成
 * 赤9枚、青8枚、中立7枚、暗殺者1枚の合計25枚
 * 赤チームが先攻
 */
export function generateCardLayout(): CardType[] {
  const layout: CardType[] = [];

  // 赤9枚
  for (let i = 0; i < 9; i++) {
    layout.push(CardType.RED);
  }

  // 青8枚
  for (let i = 0; i < 8; i++) {
    layout.push(CardType.BLUE);
  }

  // 中立7枚
  for (let i = 0; i < 7; i++) {
    layout.push(CardType.NEUTRAL);
  }

  // 暗殺者1枚
  layout.push(CardType.ASSASSIN);

  // シャッフル
  return shuffleArray(layout);
}

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * ランダムに単語を選択
 */
export function selectRandomWords(words: string[], count: number): string[] {
  const shuffled = shuffleArray(words);
  return shuffled.slice(0, count);
}

/**
 * 勝利判定
 */
export function checkWinner(cards: Array<{ type: CardType; isRevealed: boolean }>): Team | null {
  // 暗殺者が公開されたか
  const assassinRevealed = cards.find(
    (c) => c.type === CardType.ASSASSIN && c.isRevealed
  );

  if (assassinRevealed) {
    // 暗殺者を引いたチームが負け（現在のターンのチーム）
    // この情報は別で管理する必要があるため、ここではnullを返す
    return null;
  }

  // 赤チームのカードが全て公開されたか
  const redCards = cards.filter((c) => c.type === CardType.RED);
  const redRevealed = redCards.filter((c) => c.isRevealed);

  if (redCards.length === redRevealed.length && redCards.length > 0) {
    return Team.RED;
  }

  // 青チームのカードが全て公開されたか
  const blueCards = cards.filter((c) => c.type === CardType.BLUE);
  const blueRevealed = blueCards.filter((c) => c.isRevealed);

  if (blueCards.length === blueRevealed.length && blueCards.length > 0) {
    return Team.BLUE;
  }

  return null;
}

/**
 * チームカウント取得
 */
export function getTeamCounts(cards: Array<{ type: CardType; isRevealed: boolean }>) {
  const redTotal = cards.filter((c) => c.type === CardType.RED).length;
  const redRevealed = cards.filter((c) => c.type === CardType.RED && c.isRevealed).length;

  const blueTotal = cards.filter((c) => c.type === CardType.BLUE).length;
  const blueRevealed = cards.filter((c) => c.type === CardType.BLUE && c.isRevealed).length;

  return {
    red: {
      total: redTotal,
      revealed: redRevealed,
      remaining: redTotal - redRevealed,
    },
    blue: {
      total: blueTotal,
      revealed: blueRevealed,
      remaining: blueTotal - blueRevealed,
    },
  };
}
