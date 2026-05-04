// API layer - calls Netlify Functions which read/write JSON files on GitHub

const API_BASE = '/.netlify/functions';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`API Error ${res.status}: ${error}`);
  }
  return res.json();
}

export const getResources = () => fetchJson(`${API_BASE}/resources`);
export const getProjects = () => fetchJson(`${API_BASE}/projects`);
export const getRequesters = () => fetchJson(`${API_BASE}/requesters`);
export const getFrames = () => fetchJson(`${API_BASE}/frames`);

export const getAllocations = (date) =>
  fetchJson(`${API_BASE}/allocations?date=${encodeURIComponent(date)}`);

export const createAllocation = (allocation) =>
  fetchJson(`${API_BASE}/allocations`, {
    method: 'POST',
    body: JSON.stringify(allocation),
  });

export const updateAllocation = (id, percentage) =>
  fetchJson(`${API_BASE}/allocations?id=${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ percentage }),
  });

export const deleteAllocation = (id) =>
  fetchJson(`${API_BASE}/allocations?id=${id}`, {
    method: 'DELETE',
  });

export const exportCsvUrl = (date) => {
  if (date) {
    return `${API_BASE}/export-csv?date=${encodeURIComponent(date)}`;
  }
  return `${API_BASE}/export-csv`;
};

// CSV import is no longer needed with the JSON-based system
// Data is managed directly through the allocations CRUD endpoints
export const importCSV = async (file) => {
  throw new Error('CSV import is not supported in the serverless version. Use the UI to add allocations.');
};
