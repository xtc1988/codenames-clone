import { Link } from 'react-router-dom';

export default function TopPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-4">🎯 OKANAME</h1>
          <p className="text-gray-600">オンラインで遊べるボードゲーム</p>
        </div>

        <div className="space-y-4">
          <Link
            to="/solo"
            className="block w-full bg-gradient-to-r from-forest-primary to-forest-moss text-white text-center text-lg py-4 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            🤖 1人モード（AIと対戦）
          </Link>

          <Link
            to="/create"
            className="block w-full btn-primary text-center text-lg py-3"
          >
            ルームを作成する
          </Link>

          <Link
            to="/join"
            className="block w-full btn-secondary text-center text-lg py-3"
          >
            ルームに参加する
          </Link>

          <Link
            to="/rooms"
            className="block w-full btn-secondary text-center text-lg py-3"
          >
            公開ルーム一覧
          </Link>

          <Link
            to="/word-packs"
            className="block w-full btn-secondary text-center text-lg py-3"
          >
            単語パック管理
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>友達を集めて推理ゲームを楽しもう！</p>
        </div>
      </div>
    </div>
  );
}
