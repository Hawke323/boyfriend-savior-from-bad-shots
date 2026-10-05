import { useState } from 'react';
import { apiFetch } from './api/client';

function App() {
  const [label, setLabel] = useState('点下面的按钮试试');

  const handleClick = async () => {
    try {
      const res = await apiFetch<{ message: string }>('/api/hello', { method: 'POST' });
      setLabel(res.ok ? res.data.message : `请求失败：HTTP ${res.status}`);
    } catch (err) {
      setLabel('请求失败：' + (err as Error).message);
    }
  };

  return (
    <div className="page">
      <button onClick={handleClick}>发送</button>
      <p className="label">{label}</p>
    </div>
  );
}

export default App;
