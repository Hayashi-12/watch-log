// ============================================
// SearchPage.jsx - 作品検索ページ
//
// 【解説】React の基本3要素がすべて入っています
// 1. useState   → 状態（データ）の管理
// 2. useEffect  → 副作用（API通信など）の実行
// 3. JSX        → HTMLのような記法でUIを記述
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// ↑ useNavigate: プログラムからページ遷移するためのフック

// TMDB API の設定
// TMDBは無料で使える映画データベースAPI
const API_KEY = 'e82f51095289d9792d8eb38e378c888f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';

function SearchPage() {
  // ------------------------------------------
  // 【解説】useState（状態管理）
  //
  // const [値, 値を変える関数] = useState(初期値);
  //
  // 6th Man では var query = '' のように普通の変数を使いましたが、
  // Reactでは useState を使います。
  // 理由: useState で値を変えると、Reactが自動で画面を更新してくれる。
  // 普通の変数を変えても画面は変わりません。
  // ------------------------------------------
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();

  // ------------------------------------------
  // 検索を実行する関数
  //
  // 【解説】async / await
  // APIからデータを取得するには時間がかかるので、
  // 「待つ」処理が必要。async/await はそのための書き方。
  //
  // fetch() → サーバーにリクエストを送る
  // await   → レスポンスが返ってくるまで待つ
  // .json() → レスポンスをJSONに変換
  // ------------------------------------------
  async function handleSearch() {
    if (!query.trim()) return;
    // ↑ 空欄なら何もしない。trim()は前後の空白を除去

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP`
      );
      // ↑ encodeURIComponent: 日本語をURLに使える形に変換
      //   例: "千と千尋" → "%E5%8D%83%E3%81%A8%E5%8D%83%E5%B0%8B"

      const data = await response.json();
      setMovies(data.results || []);
    } catch (error) {
      console.error('検索エラー:', error);
      setMovies([]);
    }

    setLoading(false);
  }

  // Enterキーでも検索できるようにする
  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  // ------------------------------------------
  // 【解説】JSX（UIの記述）
  //
  // HTMLに似ていますが、いくつか違いがあります:
  // - class → className（classはJSの予約語なので）
  // - onclick → onClick（キャメルケース）
  // - {} の中にJavaScriptを書ける
  // ------------------------------------------
  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔍 作品を検索</h1>
        <p>映画のタイトルを入力して検索</p>
      </div>

      {/* 検索バー */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="作品名を入力..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/*
          onChange: 入力が変わるたびに呼ばれる
          e.target.value: 入力欄の現在の値
          setQuery: その値で state を更新 → 画面も自動更新
        */}
        <button className="search-btn" onClick={handleSearch}>
          検索
        </button>
      </div>

      {/* ローディング表示 */}
      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>検索中...</p>
        </div>
      )}
      {/*
        【解説】条件付きレンダリング
        {条件 && <要素>} は「条件がtrueの時だけ表示」の書き方。
        6th Man では style.display = 'none' で切り替えていましたが、
        Reactではこの書き方が基本です。
      */}

      {/* 検索結果 */}
      {!loading && searched && movies.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎥</div>
          <h3>作品が見つかりませんでした</h3>
          <p>別のキーワードで試してみてください</p>
        </div>
      )}

      {!loading && movies.length > 0 && (
        <div className="movie-grid">
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="movie-card"
              onClick={() => navigate(`/detail/${movie.id}`)}
            >
              {/*
                【解説】map と key
                movies配列の各要素に対してカードを生成。
                6th Man では for ループで html 文字列を組み立てましたが、
                Reactでは .map() でコンポーネントの配列を返します。
                key はReactが各要素を区別するために必要。
              */}
              {movie.poster_path ? (
                <img
                  className="movie-card-poster"
                  src={`${IMG_URL}${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <div className="movie-card-poster" style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', background: 'var(--bg-secondary)'
                }}>
                  🎬
                </div>
              )}
              <div className="movie-card-info">
                <div className="movie-card-title">{movie.title}</div>
                <div className="movie-card-year">
                  {movie.release_date ? movie.release_date.substring(0, 4) : '---'}
                </div>
                {movie.vote_average > 0 && (
                  <div className="movie-card-rating">
                    ★ {movie.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 初期状態（未検索時） */}
      {!loading && !searched && (
        <div className="empty-state">
          <div className="empty-state-icon">🍿</div>
          <h3>映画を検索してみよう</h3>
          <p>観た映画や気になる映画のタイトルを入力してください</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
