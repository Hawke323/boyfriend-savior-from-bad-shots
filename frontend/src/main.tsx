import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { log } from './log/logger';
import { setupUiLogging } from './log/uiTrack';
import './index.css';

setupUiLogging();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

log.info('app', '前端已挂载，UI 交互与请求日志已开启');
