const { readJsonFile, corsHeaders, handleOptions } = require('./github-api');

/**
 * GET /export-csv?date=2026.05.04  - Export allocations as CSV
 */
exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const date = event.queryStringParameters?.date;

    const [allocResult, resResult, projResult, reqResult, frameResult] = await Promise.all([
      readJsonFile('data/allocations.json'),
      readJsonFile('data/resources.json'),
      readJsonFile('data/projects.json'),
      readJsonFile('data/requesters.json'),
      readJsonFile('data/frames.json')
    ]);

    const resourceMap = Object.fromEntries(resResult.data.map(r => [r.id, r.name]));
    const projectMap = Object.fromEntries(projResult.data.map(p => [p.id, p.code]));
    const requesterMap = Object.fromEntries(reqResult.data.map(r => [r.id, r.name]));
    const frameMap = Object.fromEntries(frameResult.data.map(f => [f.id, f.name]));

    let allocations = allocResult.data;
    if (date) {
      allocations = allocations.filter(a => a.date === date);
    }

    // Build CSV
    const rows = [['Date', 'Resource', 'Project', 'Requester', 'Frame', 'Percentage']];
    
    for (const a of allocations) {
      rows.push([
        a.date,
        resourceMap[a.resource_id] || 'Unknown',
        projectMap[a.project_id] || 'Unknown',
        requesterMap[a.requester_id] || 'Unknown',
        frameMap[a.frame_id] || 'Unknown',
        String(a.percentage)
      ]);
    }

    const csvContent = rows.map(row => 
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename=allocations.csv'
      },
      body: csvContent
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message })
    };
  }
};
