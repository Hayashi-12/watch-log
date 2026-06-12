// ============================================
// StatsPage.jsx - 視聴統計ダッシュボード
//
// 【解説】Recharts の使い方
// Chart.jsはcanvasに描画しましたが、
// RechartsはReactコンポーネントとしてグラフを書けます。
// <BarChart>, <PieChart> などをJSXで並べるだけ。
// ============================================

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell,
  ResponsiveContainer
} from 'recharts';
// ↑ Rechartsのコンポーネントを必要な分だけインポート

// 円グラフ用の色
const COLORS = ['#E50914', '#F5C518', '#3FB950', '#1F6FEB', '#A371F7', '#F778BA', '#FFA657', '#79C0FF'];

function StatsPage() {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('watchlog_movies') || '[]');
    const watched = saved.filter((m) => m.status === 'watched');
    setMovies(watched);
  }, []);

  // ------------------------------------------
  // 統計データの計算
  // ------------------------------------------

  // 総視聴数
  const totalWatched = movies.length;

  // 平均評価
  const ratedMovies = movies.filter((m) => m.rating > 0);
  const avgRating = ratedMovies.length > 0
    ? (ratedMovies.reduce((sum, m) => sum + m.rating, 0) / ratedMovies.length).toFixed(1)
    : '---';
  // ↑ reduce: 配列を1つの値にまとめる関数
  //   例: [3, 4, 5].reduce((sum, n) => sum + n, 0) → 12

  // レビュー数
  const reviewCount = movies.filter((m) => m.review && m.review.trim()).length;

  // ジャンル別の集計（円グラフ用）
  function getGenreData() {
    const genreCounts = {};
    movies.forEach((m) => {
      if (m.genres) {
        m.genres.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    // オブジェクトを配列に変換してソート
    return Object.entries(genreCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
    // ↑ Object.entries: { a: 1, b: 2 } → [['a', 1], ['b', 2]]
  }

  // 評価分布（棒グラフ用）
  function getRatingData() {
    const counts = [0, 0, 0, 0, 0]; // ★1〜★5
    movies.forEach((m) => {
      if (m.rating >= 1 && m.rating <= 5) {
        counts[m.rating - 1]++;
      }
    });
    return counts.map((count, i) => ({
      name: '★' + (i + 1),
      count: count
    }));
  }

  const genreData = getGenreData();
  const ratingData = getRatingData();

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>📊 視聴統計</h1>
        <p>あなたの視聴傾向を可視化</p>
      </div>

      {/* 統計カード */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalWatched}</div>
          <div className="stat-label">視聴作品数</div>
        </div>
        <div className="stat-card">
          <div className="stat-value gold">{avgRating}</div>
          <div className="stat-label">平均評価</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{reviewCount}</div>
          <div className="stat-label">レビュー数</div>
        </div>
      </div>

      {/* データがない場合 */}
      {totalWatched === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>まだデータがありません</h3>
          <p>作品を「観た」に記録すると、ここに統計が表示されます</p>
        </div>
      )}

      {/* ジャンル別 円グラフ */}
      {genreData.length > 0 && (
        <div className="chart-section">
          <h3>🎭 ジャンル別の視聴数</h3>
          {/*
            【解説】ResponsiveContainer
            親要素の幅に合わせてグラフを自動リサイズする。
            Rechartsでグラフを作る時は基本これで囲みます。
          */}
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={genreData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name} (${value})`}
                labelLine={true}
              >
                {genreData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1C2333',
                  border: '1px solid #2A3444',
                  borderRadius: 8,
                  color: '#F0F2F5'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 評価分布 棒グラフ */}
      {ratedMovies.length > 0 && (
        <div className="chart-section">
          <h3>⭐ 評価の分布</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ratingData}>
              <XAxis
                dataKey="name"
                tick={{ fill: '#8B949E', fontSize: 13 }}
                axisLine={{ stroke: '#2A3444' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#8B949E', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#1C2333',
                  border: '1px solid #2A3444',
                  borderRadius: 8,
                  color: '#F0F2F5'
                }}
              />
              <Bar
                dataKey="count"
                fill="#F5C518"
                radius={[6, 6, 0, 0]}
                name="作品数"
              />
              {/*
                radius: 棒の上部を角丸にする。
                [左上, 右上, 右下, 左下] の順。
              */}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default StatsPage;
