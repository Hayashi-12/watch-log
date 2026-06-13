// ============================================
// DetailPage.jsx - 作品詳細ページ
//
// 【解説】useEffect の使い方
// 「ページが表示された時にAPIからデータを取得する」
// という処理を実現します。
// ============================================

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// ↑ useParams: URLの :id 部分を取得するフック
//   例: /detail/550 → useParams() → { id: '550' }

const API_KEY = '2ac077f6d6f9b4c6eab1376e8b459937';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w300';

function DetailPage() {
  const { type, id } = useParams();
  // ↑ type: 'movie' or 'tv'、id: 作品ID
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // レビュー関連のstate
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // 記録状態
  const [status, setStatus] = useState(null); // 'watched' or 'watchlist' or null
  const [toast, setToast] = useState(''); // トースト通知メッセージ

  // ------------------------------------------
  // 【解説】useEffect
  //
  // useEffect(関数, [依存配列]);
  //
  // 依存配列の値が変わるたびに関数が実行される。
  // [id] なので、idが変わる（=別の作品を開く）たびに
  // APIから作品情報を取得します。
  //
  // 6th Man では「ボタンを押した時」に関数を呼びましたが、
  // useEffect は「画面が表示された時」に自動で実行されます。
  // ------------------------------------------
  useEffect(() => {
    async function fetchMovie() {
      setLoading(true);
      try {
        const response = await fetch(
          `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=ja-JP`
        );
        // ↑ type が 'movie' なら /movie/123、'tv' なら /tv/456 になる
        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error('取得エラー:', error);
      }
      setLoading(false);
    }

    fetchMovie();
    loadSavedData();
  }, [id]);

  // LocalStorageから保存済みデータを読み込む
  function loadSavedData() {
    const saved = JSON.parse(localStorage.getItem('watchlog_movies') || '[]');
    const found = saved.find((m) => String(m.id) === String(id));
    // ↑ find: 条件に合う最初の要素を返す（なければundefined）

    if (found) {
      setRating(found.rating || 0);
      setReview(found.review || '');
      setTags(found.tags || []);
      setStatus(found.status || null);
    } else {
      setRating(0);
      setReview('');
      setTags([]);
      setStatus(null);
    }
  }

  // 作品をLocalStorageに保存する
  function saveMovie(newStatus, newRating, newReview, newTags) {
    if (!movie) return;

    const saved = JSON.parse(localStorage.getItem('watchlog_movies') || '[]');
    // 既存データを探す
    const index = saved.findIndex((m) => String(m.id) === String(id));

    const movieData = {
      id: movie.id,
      media_type: type,
      title: movie.title || movie.name,
      poster_path: movie.poster_path,
      release_date: movie.release_date || movie.first_air_date,
      vote_average: movie.vote_average,
      genres: movie.genres ? movie.genres.map((g) => g.name) : [],
      overview: movie.overview,
      status: newStatus,
      rating: newRating,
      review: newReview,
      tags: newTags,
      savedAt: new Date().toISOString()
    };

    if (index !== -1) {
      saved[index] = movieData; // 上書き
    } else {
      saved.push(movieData); // 新規追加
    }

    localStorage.setItem('watchlog_movies', JSON.stringify(saved));
  }

  // 「観た」ボタン
  function handleWatched() {
    const newStatus = status === 'watched' ? null : 'watched';
    setStatus(newStatus);
    if (newStatus) {
      saveMovie(newStatus, rating, review, tags);
    } else {
      removeMovie();
    }
  }

  // 「観たい」ボタン
  function handleWatchlist() {
    const newStatus = status === 'watchlist' ? null : 'watchlist';
    setStatus(newStatus);
    if (newStatus) {
      saveMovie(newStatus, rating, review, tags);
    } else {
      removeMovie();
    }
  }

  // 記録を削除
  function removeMovie() {
    const saved = JSON.parse(localStorage.getItem('watchlog_movies') || '[]');
    const filtered = saved.filter((m) => String(m.id) !== String(id));
    localStorage.setItem('watchlog_movies', JSON.stringify(filtered));
    setRating(0);
    setReview('');
    setTags([]);
    setStatus(null);
  }

  // レビューを保存
  function handleSaveReview() {
    if (!status) {
      setStatus('watched');
      saveMovie('watched', rating, review, tags);
    } else {
      saveMovie(status, rating, review, tags);
    }
    // トースト通知を表示（2秒後に自動で消える）
    setToast('✓ 保存しました！');
    setTimeout(() => setToast(''), 2000);
  }

  // レビューを削除
  function handleDeleteReview() {
    setRating(0);
    setReview('');
    setTags([]);
    if (status) {
      saveMovie(status, 0, '', []);
    }
  }

  // タグを追加（Enterキーで）
  function handleTagKeyDown(e) {
    if (e.key === 'Enter' && tagInput.trim()) {
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        // ↑ スプレッド構文: 既存の配列を展開して新要素を追加
      }
      setTagInput('');
    }
  }

  // タグを削除
  function removeTag(tagToRemove) {
    setTags(tags.filter((t) => t !== tagToRemove));
  }

  // ★の表示
  function renderStars() {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          className={`star-btn ${i <= rating ? 'filled' : ''}`}
          onClick={() => setRating(i)}
        >
          ★
        </button>
      );
    }
    return stars;
  }

  // ローディング中
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>読み込み中...</p>
      </div>
    );
  }

  // 作品が見つからない
  if (!movie) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">😢</div>
        <h3>作品が見つかりませんでした</h3>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* 戻るボタン */}
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← 戻る
      </button>
      {/*
        navigate(-1) は「ブラウザの戻る」と同じ。
        navigate('/mylist') のようにパスを指定することもできます。
      */}

      {/* 作品情報 */}
      <div className="detail-top">
        {movie.poster_path ? (
          <img
            className="detail-poster"
            src={`${IMG_URL}${movie.poster_path}`}
            alt={movie.title}
          />
        ) : (
          <div className="detail-poster" style={{
            width: 180, height: 270, background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 48
          }}>
            🎬
          </div>
        )}

        <div className="detail-info">
          <h1>{movie.title || movie.name}</h1>
          <div className="detail-meta">
            {(movie.release_date || movie.first_air_date) && (
              <span>📅 {(movie.release_date || movie.first_air_date).substring(0, 4)}</span>
            )}
            {movie.runtime > 0 && <span>⏱ {movie.runtime}分</span>}
            {movie.number_of_seasons && (
              <span>📺 シーズン{movie.number_of_seasons}</span>
            )}
            {movie.vote_average > 0 && (
              <span className="detail-rating">★ {movie.vote_average.toFixed(1)}</span>
            )}
          </div>

          {/* ジャンル表示 */}
          {movie.genres && movie.genres.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {movie.genres.map((g) => (
                <span key={g.id} className="tag">{g.name}</span>
              ))}
            </div>
          )}

          <p className="detail-overview">{movie.overview || 'あらすじ情報がありません'}</p>

          {/* アクションボタン */}
          <div className="detail-actions">
            <button
              className={`btn-watched ${status === 'watched' ? 'recorded' : ''}`}
              onClick={handleWatched}
            >
              {status === 'watched' ? '✓ 観た' : '👁 観た'}
            </button>
            <button
              className={`btn-watchlist ${status === 'watchlist' ? 'recorded' : ''}`}
              onClick={handleWatchlist}
            >
              {status === 'watchlist' ? '✓ 観たい' : '+ 観たい'}
            </button>
          </div>
        </div>
      </div>

      {/* レビューセクション */}
      <div className="review-section">
        <h3>📝 レビュー</h3>

        {/* 星評価 */}
        <div className="star-rating">{renderStars()}</div>

        {/* 感想入力 */}
        <textarea
          className="review-textarea"
          placeholder="感想を書いてみよう..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        {/* タグ */}
        <div className="tags-input-wrap">
          {tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
              <button className="tag-remove" onClick={() => removeTag(tag)}>×</button>
            </span>
          ))}
          <input
            className="tag-input"
            type="text"
            placeholder="タグ追加..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        {/* 保存・削除・ホームボタン */}
        <div className="review-actions">
          <button className="btn-save-review" onClick={handleSaveReview}>
            保存する
          </button>
          <button className="btn-back" onClick={() => { navigate('/'); window.scrollTo(0, 0); }} style={{ margin: 0 }}>
            🏠 検索に戻る
          </button>
          {(rating > 0 || review) && (
            <button className="btn-delete-review" onClick={handleDeleteReview}>
              レビューを削除
            </button>
          )}
        </div>
      </div>

      {/* トースト通知 */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

export default DetailPage;
