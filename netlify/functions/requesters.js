const { readJsonFile, corsHeaders, handleOptions } = require('./github-api');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return handleOptions();

  try {
    const { data } = await readJsonFile('data/requesters.json');
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message })
    };
  }
};
