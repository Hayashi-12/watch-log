// ============================================
// SearchPage.jsx - 作品検索ページ
//
// 【解説】props（プロップス）
// 親コンポーネント（App.jsx）から渡されたデータを
// 「props」として受け取ります。
// これにより、ページ移動しても検索結果が消えません。
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// TMDB API の設定
const API_KEY = 'e82f51095289d9792d8eb38e378c888f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';

// ------------------------------------------
// 【解説】props の受け取り方
//
// function SearchPage({ query, setQuery, ... })
// この {} の中身が、App.jsx から渡された値です。
// App.jsx で <SearchPage query={searchQuery} ... /> と書くと、
// ここで query として使えます。
// ------------------------------------------
function SearchPage({ query, setQuery, movies, setMovies, searched, setSearched }) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 検索を実行する関数
  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch(
        `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}&language=ja-JP`
      );

      const data = await response.json();

      const filtered = (data.results || []).filter(
        (item) => item.media_type === 'movie' || item.media_type === 'tv'
      );

      setMovies(filtered);
    } catch (error) {
      console.error('検索エラー:', error);
      setMovies([]);
    }

    setLoading(false);
  }

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

      {loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>検索中...</p>
        </div>
      )}

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
