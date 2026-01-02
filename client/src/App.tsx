import { Routes, Route } from 'react-router-dom';
import TopPage from '@/pages/TopPage';
import CreateRoomPage from '@/pages/CreateRoomPage';
import JoinRoomPage from '@/pages/JoinRoomPage';
import RoomListPage from '@/pages/RoomListPage';
import LobbyPage from '@/pages/LobbyPage';
import GamePage from '@/pages/GamePage';
import WordPackListPage from '@/pages/WordPackListPage';
import WordPackCreatePage from '@/pages/WordPackCreatePage';
import WordPackEditPage from '@/pages/WordPackEditPage';
import SoloModePage from '@/pages/SoloModePage';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/solo" element={<SoloModePage />} />
        <Route path="/create" element={<CreateRoomPage />} />
        <Route path="/join" element={<JoinRoomPage />} />
        <Route path="/rooms" element={<RoomListPage />} />
        <Route path="/room/:code" element={<LobbyPage />} />
        <Route path="/room/:code/game" element={<GamePage />} />
        <Route path="/word-packs" element={<WordPackListPage />} />
        <Route path="/word-packs/create" element={<WordPackCreatePage />} />
        <Route path="/word-packs/:id/edit" element={<WordPackEditPage />} />
      </Routes>
    </div>
  );
}

export default App;
