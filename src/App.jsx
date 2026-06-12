// ============================================
// App.jsx - アプリ全体の司令塔
//
// 【解説】Reactのコンポーネントとは？
// 6th Man では1つのHTMLに全部書きましたが、
// Reactでは画面やパーツを「コンポーネント」という
// 独立したパーツに分けて管理します。
//
// App.jsx は全コンポーネントをまとめる
// 一番上の「親コンポーネント」です。
// ============================================

import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
// ↑ react-router-dom: ページ遷移を管理するライブラリ
//   - BrowserRouter: ルーティング全体を囲むラッパー
//   - Routes / Route: URLとコンポーネントの対応を定義
//   - NavLink: 現在のページをハイライトできるリンク

import SearchPage from './components/SearchPage';
import MyListPage from './components/MyListPage';
import DetailPage from './components/DetailPage';
import StatsPage from './components/StatsPage';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      {/* ===== ヘッダー ===== */}
      <header className="header">
        <div className="logo">
          <span className="logo-icon">🎬</span>
          <div>Watch<span>Log</span></div>
        </div>
        <nav className="nav">
          {/*
            NavLink は今いるページに自動で "active" クラスをつける。
            6th Man では自分でclassList.add/removeしていたのを
            Reactが自動でやってくれます。
          */}
          <NavLink to="/">検索</NavLink>
          <NavLink to="/mylist">マイリスト</NavLink>
          <NavLink to="/stats">統計</NavLink>
        </nav>
      </header>

      {/* ===== ページ本体 ===== */}
      <main className="main">
        <Routes>
          {/*
            【解説】URLとコンポーネントの対応表
            / → SearchPage（検索画面）
            /mylist → MyListPage（マイリスト）
            /detail/:id → DetailPage（作品詳細。:idは作品ごとに変わる）
            /stats → StatsPage（統計）
          */}
          <Route path="/" element={<SearchPage />} />
          <Route path="/mylist" element={<MyListPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
          <Route path="/stats" element={<StatsPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
