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

// Auth
export const login = (username, password) =>
  request(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

// Algorithms
export const fetchAlgorithms = () => request(`${BASE}/algorithms`);

// Research
export const fetchResearch = () => request(`${BASE}/research`);
export const updateResearch = (token, key, value) =>
  request(`${BASE}/research/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ value })
  });

// Goals
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
  request(`${BASE}/goals/${id}`, { method: 'DELETE', headers: authHeaders(token) });

// Competitor goals
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
  request(`${BASE}/competitor-goals/${id}`, { method: 'DELETE', headers: authHeaders(token) });

// Punishments
export const fetchPunishments = () => request(`${BASE}/punishments`);
export const createPunishment = (token, data) =>
  request(`${BASE}/punishments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });
export const updatePunishment = (token, id, data) =>
  request(`${BASE}/punishments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });
export const executePunishment = (token, id) =>
  request(`${BASE}/punishments/${id}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) }
  });
export const submitPunishment = (token, id, note) =>
  request(`${BASE}/punishments/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ note })
  });
export const completePunishment = (token, id) =>
  request(`${BASE}/punishments/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) }
  });
export const deletePunishment = (token, id) =>
  request(`${BASE}/punishments/${id}`, { method: 'DELETE', headers: authHeaders(token) });

// Settings
export const fetchSettings = () => request(`${BASE}/settings`);
export const updateSettings = (token, data) =>
  request(`${BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });

// Projects
export const fetchProjects = () => request(`${BASE}/projects`);
export const createProject = (token, data) =>
  request(`${BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });
export const updateProject = (token, id, data) =>
  request(`${BASE}/projects/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify(data)
  });
export const deleteProject = (token, id) =>
  request(`${BASE}/projects/${id}`, { method: 'DELETE', headers: authHeaders(token) });

// Stats
export const fetchStats = () => request(`${BASE}/stats`);
