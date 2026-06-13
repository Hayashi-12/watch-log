// ============================================
// SearchPage.jsx - 作品検索ページ
//
// 【解説】React の基本3要素がすべて入っています
// 1. useState   → 状態（データ）の管理
// 2. useEffect  → 副作用（API通信など）の実行
// 3. JSX        → HTMLのような記法でUIを記述
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// TMDB API の設定
// ★★★ ここにあなたのAPIキーを入れてください ★★★
const API_KEY = 'e82f51095289d9792d8eb38e378c888f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';

function SearchPage() {
  // ------------------------------------------
  // 【解説】sessionStorage で検索結果を保持
  //
  // 普通の useState だけだと、詳細ページに移動して
  // 戻ったときに検索結果が消えてしまいます。
  // sessionStorage に保存しておけば、戻っても復元できます。
  // ------------------------------------------
  const [query, setQuery] = useState(() => {
    return sessionStorage.getItem('search_query') || '';
  });
  const [movies, setMovies] = useState(() => {
    const saved = sessionStorage.getItem('search_results');
    return saved ? JSON.parse(saved) : [];
  });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(() => {
    return sessionStorage.getItem('search_searched') === 'true';
  });

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

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP`
      );
      // ↑ search/multi: 映画とTVシリーズを同時に検索するエンドポイント
      //   search/movie だと映画だけだが、multi なら Netflix独占ドラマも出る

      const data = await response.json();

      // 映画とTVだけに絞る（人物などは除外）
      const filtered = (data.results || []).filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
      );

      setMovies(filtered);

      // 検索結果を sessionStorage に保存（ページ遷移しても残る）
      sessionStorage.setItem('search_query', query);
      sessionStorage.setItem('search_results', JSON.stringify(filtered));
      sessionStorage.setItem('search_searched', 'true');
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

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>🔍 作品を検索</h1>
        <p>映画やドラマのタイトルを入力して検索</p>
      </div>

      {/* 検索バー */}
      <div className="search-bar">
        <input
          className="search-input"
          type="text"
          placeholder="映画・ドラマ名を入力..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
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
              key={`${movie.media_type}-${movie.id}`}
              className="movie-card"
              onClick={() => navigate(`/detail/${movie.media_type}/${movie.id}`)}
            >
              {movie.poster_path ? (
                <img
                  className="movie-card-poster"
                  src={`${IMG_URL}${movie.poster_path}`}
                  alt={movie.title || movie.name}
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
                <div className="movie-card-title">{movie.title || movie.name}</div>
                <div className="movie-card-year">
                  {(movie.release_date || movie.first_air_date || '').substring(0, 4) || '---'}
                  {movie.media_type === 'tv' && ' (TV)'}
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
          <h3>映画やドラマを検索してみよう</h3>
          <p>タイトルを入力してください（Netflix作品もOK）</p>
        </div>
      )}
    </div>
  );
}

export default SearchPage;
