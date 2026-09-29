const BASE = 'http://localhost:3001/api';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  health: () => get('/health'),
  aiStatus: () => get('/ai/status'),
  stats: () => get('/stats'),
  trackNote: () => post('/stats/note', {}),
  summarize: (text) => post('/ai/summarize', { text }),
  questions: (text) => post('/ai/questions', { text }),
  mcqs: (text) => post('/ai/mcqs', { text }),
  answer: (context, question) => post('/ai/answer', { context, question }),
  upload: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE}/ai/upload`, { method: 'POST', body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
