const BASE = '/api';

export const api = {
  get: async (path) => {
    const r = await fetch(BASE + path);
    if (!r.ok) return null;
    return r.json();
  },
  post: async (path, body) => {
    const r = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  put: async (path, body) => {
    const r = await fetch(BASE + path, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return r.json();
  },
  delete: async (path) => {
    const r = await fetch(BASE + path, { method: 'DELETE' });
    return r.json();
  }
};

export function formatDate(d = new Date()) {
  return d.toISOString().slice(0, 10);
}
