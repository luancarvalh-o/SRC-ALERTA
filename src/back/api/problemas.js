const { supabaseRequest } = require('./_supabase');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const problemas = await supabaseRequest(
      'problemas?select=*,profiles(nome)&order=created_at.desc'
    );
    return response.status(200).json(problemas);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
};

