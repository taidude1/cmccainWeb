const BASE = '/api';

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(url, opts = {}) {
  const res = await fetch(url, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const login = (username, password) =>
  request(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

export const fetchAlgorithms = () => request(`${BASE}/algorithms`);

export const fetchGoals = () => request(`${BASE}/goals`);

export const createGoal = (token, data) =>
  request(`${BASE}/goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });

export const updateGoal = (token, id, data) =>
  request(`${BASE}/goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });

export const deleteGoal = (token, id) =>
  request(`${BASE}/goals/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });

export const fetchCompetitorGoals = () => request(`${BASE}/competitor-goals`);

export const createCompetitorGoal = (token, data) =>
  request(`${BASE}/competitor-goals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });

export const updateCompetitorGoal = (token, id, data) =>
  request(`${BASE}/competitor-goals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });

export const deleteCompetitorGoal = (token, id) =>
  request(`${BASE}/competitor-goals/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token)
  });
