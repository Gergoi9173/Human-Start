// Shared GitHub API helpers for Netlify Functions
// Reads/writes JSON files in the GitHub repo via the Contents API

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPO_OWNER || 'Gergoi9173';
const REPO_NAME = process.env.GITHUB_REPO_NAME || 'Human-Start';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

const HEADERS = {
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'Human-Start-Netlify-Functions'
};

/**
 * Read a JSON file from the GitHub repo
 */
async function readJsonFile(filePath) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}?ref=${BRANCH}`;
  
  const response = await fetch(url, { headers: HEADERS });
  
  if (!response.ok) {
    if (response.status === 404) {
      return { data: [], sha: null };
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }
  
  const file = await response.json();
  const content = Buffer.from(file.content, 'base64').toString('utf-8');
  const data = JSON.parse(content);
  
  return { data, sha: file.sha };
}

/**
 * Write a JSON file to the GitHub repo (creates or updates)
 */
async function writeJsonFile(filePath, data, sha, message) {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`;
  
  const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
  
  const body = {
    message: message || `Update ${filePath}`,
    content,
    branch: BRANCH
  };
  
  if (sha) {
    body.sha = sha;
  }
  
  const response = await fetch(url, {
    method: 'PUT',
    headers: { ...HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`GitHub API write error: ${response.status} - ${errorBody}`);
  }
  
  return await response.json();
}

/**
 * Build standard CORS headers
 */
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
}

/**
 * Handle OPTIONS preflight
 */
function handleOptions() {
  return {
    statusCode: 204,
    headers: corsHeaders(),
    body: ''
  };
}

module.exports = { readJsonFile, writeJsonFile, corsHeaders, handleOptions };
