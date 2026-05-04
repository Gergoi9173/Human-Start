const { readJsonFile, writeJsonFile, corsHeaders, handleOptions } = require('./github-api');

const DATA_PATH = 'data/allocations.json';

/**
 * GET /allocations?date=2026.05.04  - Get allocations for a date
 * POST /allocations                  - Create new allocation
 * PATCH /allocations?id=123          - Update allocation percentage
 * DELETE /allocations?id=123         - Delete allocation
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    switch (event.httpMethod) {
      case 'GET':
        return await handleGet(event);
      case 'POST':
        return await handlePost(event);
      case 'PATCH':
        return await handlePatch(event);
      case 'DELETE':
        return await handleDelete(event);
      default:
        return {
          statusCode: 405,
          headers: corsHeaders(),
          body: JSON.stringify({ error: 'Method not allowed' })
        };
    }
  } catch (err) {
    console.error('Allocations error:', err);
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message })
    };
  }
};

async function handleGet(event) {
  const date = event.queryStringParameters?.date;
  const { data: allocations } = await readJsonFile(DATA_PATH);

  // Also read master data to enrich the response
  const [projectsResult, requestersResult, framesResult] = await Promise.all([
    readJsonFile('data/projects.json'),
    readJsonFile('data/requesters.json'),
    readJsonFile('data/frames.json')
  ]);

  const projectMap = Object.fromEntries(projectsResult.data.map(p => [p.id, p]));
  const requesterMap = Object.fromEntries(requestersResult.data.map(r => [r.id, r]));
  const frameMap = Object.fromEntries(framesResult.data.map(f => [f.id, f]));

  let filtered = date
    ? allocations.filter(a => a.date === date)
    : allocations;

  // Enrich with related data
  const enriched = filtered.map(a => ({
    ...a,
    project: projectMap[a.project_id] || { id: a.project_id, code: 'Unknown' },
    requester: requesterMap[a.requester_id] || { id: a.requester_id, name: 'Unknown' },
    frame: frameMap[a.frame_id] || { id: a.frame_id, name: 'Unknown' }
  }));

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(enriched)
  };
}

async function handlePost(event) {
  const body = JSON.parse(event.body);
  const { data: allocations, sha } = await readJsonFile(DATA_PATH);

  // Generate new ID
  const maxId = allocations.reduce((max, a) => Math.max(max, a.id), 0);
  const newAllocation = {
    id: maxId + 1,
    resource_id: body.resource_id,
    project_id: body.project_id,
    requester_id: body.requester_id,
    frame_id: body.frame_id,
    date: body.date,
    percentage: body.percentage
  };

  allocations.push(newAllocation);

  await writeJsonFile(DATA_PATH, allocations, sha, `Add allocation #${newAllocation.id}`);

  // Enrich with related data for the response
  const [projectsResult, requestersResult, framesResult] = await Promise.all([
    readJsonFile('data/projects.json'),
    readJsonFile('data/requesters.json'),
    readJsonFile('data/frames.json')
  ]);

  const projectMap = Object.fromEntries(projectsResult.data.map(p => [p.id, p]));
  const requesterMap = Object.fromEntries(requestersResult.data.map(r => [r.id, r]));
  const frameMap = Object.fromEntries(framesResult.data.map(f => [f.id, f]));

  const enriched = {
    ...newAllocation,
    project: projectMap[newAllocation.project_id] || { id: newAllocation.project_id, code: 'Unknown' },
    requester: requesterMap[newAllocation.requester_id] || { id: newAllocation.requester_id, name: 'Unknown' },
    frame: frameMap[newAllocation.frame_id] || { id: newAllocation.frame_id, name: 'Unknown' }
  };

  return {
    statusCode: 201,
    headers: corsHeaders(),
    body: JSON.stringify(enriched)
  };
}

async function handlePatch(event) {
  const id = parseInt(event.queryStringParameters?.id);
  const body = JSON.parse(event.body);
  const { data: allocations, sha } = await readJsonFile(DATA_PATH);

  const index = allocations.findIndex(a => a.id === id);
  if (index === -1) {
    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Allocation not found' })
    };
  }

  allocations[index].percentage = body.percentage;

  await writeJsonFile(DATA_PATH, allocations, sha, `Update allocation #${id}: ${body.percentage}%`);

  // Enrich response
  const [projectsResult, requestersResult, framesResult] = await Promise.all([
    readJsonFile('data/projects.json'),
    readJsonFile('data/requesters.json'),
    readJsonFile('data/frames.json')
  ]);

  const projectMap = Object.fromEntries(projectsResult.data.map(p => [p.id, p]));
  const requesterMap = Object.fromEntries(requestersResult.data.map(r => [r.id, r]));
  const frameMap = Object.fromEntries(framesResult.data.map(f => [f.id, f]));

  const a = allocations[index];
  const enriched = {
    ...a,
    project: projectMap[a.project_id] || { id: a.project_id, code: 'Unknown' },
    requester: requesterMap[a.requester_id] || { id: a.requester_id, name: 'Unknown' },
    frame: frameMap[a.frame_id] || { id: a.frame_id, name: 'Unknown' }
  };

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify(enriched)
  };
}

async function handleDelete(event) {
  const id = parseInt(event.queryStringParameters?.id);
  const { data: allocations, sha } = await readJsonFile(DATA_PATH);

  const index = allocations.findIndex(a => a.id === id);
  if (index === -1) {
    return {
      statusCode: 404,
      headers: corsHeaders(),
      body: JSON.stringify({ error: 'Allocation not found' })
    };
  }

  allocations.splice(index, 1);

  await writeJsonFile(DATA_PATH, allocations, sha, `Delete allocation #${id}`);

  return {
    statusCode: 200,
    headers: corsHeaders(),
    body: JSON.stringify({ ok: true })
  };
}
