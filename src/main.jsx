// ============================================
// main.jsx - アプリの起動ファイル
//
// 【解説】
// Reactアプリはここからスタートします。
// index.html の <div id="root"> にAppコンポーネントを描画します。
// このファイルは基本的に触る必要はありません。
// ============================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
