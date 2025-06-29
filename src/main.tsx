import React from 'react';
import ReactDOM from 'react-dom/client';
import Mi50Game from './mi50_game.tsx';
import { AudioPreloader } from './AudioPreloader.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AudioPreloader>
      <Mi50Game />
    </AudioPreloader>
  </React.StrictMode>,
)
