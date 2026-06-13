// ============================================
// App.jsx - アプリ全体の司令塔
//
// 【解説】状態の「リフトアップ」
// SearchPage の中で検索結果を管理すると、
// 詳細ページに移動した時点で SearchPage が消えて
// 状態もリセットされてしまいます。
//
// そこで検索の状態を App（親）で管理し、
// SearchPage に渡す（props）ことで、
// ページを移動しても検索結果が残るようにします。
// これを「状態のリフトアップ」と呼びます。
// ============================================

import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

import SearchPage from './components/SearchPage';
import MyListPage from './components/MyListPage';
import DetailPage from './components/DetailPage';
import StatsPage from './components/StatsPage';
import './App.css';

function App() {
  // 検索の状態をAppで管理（リフトアップ）
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  return (
    <BrowserRouter basename="/watch-log">
      {/* ===== ヘッダー ===== */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <div>Watch<span>Log</span></div>
        </div>
        <nav className="nav">
          <NavLink to="/">検索</NavLink>
          <NavLink to="/mylist">マイリスト</NavLink>
          <NavLink to="/stats">統計</NavLink>
        </nav>
      </header>

      {/* ===== ページ本体 ===== */}
      <main className="main">
        <Routes>
          <Route path="/" element={
            <SearchPage
              query={searchQuery}
              setQuery={setSearchQuery}
              movies={searchResults}
              setMovies={setSearchResults}
              searched={hasSearched}
              setSearched={setHasSearched}
            />
          } />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/detail/:type/:id" element={<DetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
