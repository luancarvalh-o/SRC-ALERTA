const { supabaseRequest } = require('./_supabase');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    await supabaseRequest('problemas?select=id&limit=1');
    return response.status(200).json({
      status: 'ok',
      service: 'alerta-betim-api',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return response.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
};

