// ============================================
// MyListPage.jsx - マイリスト（視聴記録一覧）
//
// 【解説】props を使わないシンプルなコンポーネント。
// LocalStorage からデータを読み込んで一覧表示します。
// 「観た」と「観たい」をタブで切り替えます。
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const IMG_URL = 'https://image.tmdb.org/t/p/w200';

function MyListPage() {
  const [tab, setTab] = useState('watched'); // 'watched' or 'watchlist'
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  // ------------------------------------------
  // 【解説】useEffect の依存配列が [tab] なので、
  // タブを切り替えるたびにデータを再読み込みします。
  // ------------------------------------------
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('watchlog_movies') || '[]');
    const filtered = saved.filter((m) => m.status === tab);

    // 保存日が新しい順にソート
    filtered.sort((a, b) => {
      return new Date(b.savedAt) - new Date(a.savedAt);
    });

    setMovies(filtered);
  }, [tab]);

  // 星を文字列で生成
  function starsText(rating) {
    if (!rating) return '';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📋 マイリスト</h1>
        <p>あなたの視聴記録</p>
      </div>

      {/* タブ切り替え */}
      <div className="tabs">
        <button
          className={`tab-btn ${tab === 'watched' ? 'active' : ''}`}
          onClick={() => setTab('watched')}
        >
          👁 観た（{JSON.parse(localStorage.getItem('watchlog_movies') || '[]').filter(m => m.status === 'watched').length}）
        </button>
        <button
          className={`tab-btn ${tab === 'watchlist' ? 'active' : ''}`}
          onClick={() => setTab('watchlist')}
        >
          + 観たい（{JSON.parse(localStorage.getItem('watchlog_movies') || '[]').filter(m => m.status === 'watchlist').length}）
        </button>
      </div>

      {/* 一覧 */}
      {movies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {tab === 'watched' ? '🎬' : '📝'}
          </div>
          <h3>
            {tab === 'watched'
              ? 'まだ記録がありません'
              : 'まだ作品がありません'}
          </h3>
          <p>
            {tab === 'watched'
              ? '検索から作品を探して「観た」を記録しよう'
              : '検索から気になる作品を「観たい」に追加しよう'}
          </p>
        </div>
      ) : (
        <div>
          {movies.map((movie) => (
            <div
              key={movie.id}
              className="mylist-card"
              onClick={() => navigate(`/detail/${movie.media_type || 'movie'}/${movie.id}`)}
            >
              {movie.poster_path ? (
                <img
                  className="mylist-poster"
                  src={`${IMG_URL}${movie.poster_path}`}
                  alt={movie.title}
                />
              ) : (
                <div className="mylist-poster" style={{
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, borderRadius: 8
                }}>
                  🎬
                </div>
              )}
              <div className="mylist-info">
                <div className="mylist-title">{movie.title}</div>
                <div className="mylist-meta">
                  {movie.release_date ? movie.release_date.substring(0, 4) : ''}
                  {movie.genres && movie.genres.length > 0 && (
                    <> · {movie.genres.slice(0, 2).join(', ')}</>
                  )}
                </div>
                {movie.rating > 0 && (
                  <div className="mylist-stars">{starsText(movie.rating)}</div>
                )}
                {movie.review && (
                  <div className="mylist-review">{movie.review}</div>
                )}
                {movie.tags && movie.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {movie.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyListPage;
