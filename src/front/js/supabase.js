const SUPABASE_URL = 'https://ihioaeiinewolfqfqiuz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloaW9hZWlpbmV3b2xmcWZxaXV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNjUxNTMsImV4cCI6MjA5NzY0MTE1M30.ydC4rnigd6EtVYmOI8hhsYfg_FO0VIIT2-dGzLiKYhw';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CloudDB = {
  async login(email, password) {
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async register({ name, email, password }) {
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { nome: name } },
    });
    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data } = await supabaseClient.auth.getSession();
    return data.session;
  },

  async getCurrentUser() {
    const session = await this.getSession();
    if (!session) return null;

    const { data: profile, error } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) throw error;
    return {
      id: session.user.id,
      name: profile.nome,
      email: session.user.email,
      city: profile.cidade,
      state: profile.estado,
      role: profile.role,
      isAdmin: profile.is_admin,
      createdAt: profile.created_at,
    };
  },

  async getProblemas() {
    const { data, error } = await supabaseClient
      .from('problemas')
      .select('*, profiles(nome)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getMinhasDenuncias() {
    const session = await this.getSession();
    if (!session) return [];
    const { data, error } = await supabaseClient
      .from('problemas')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async criarProblema(dados, arquivo) {
    const session = await this.getSession();
    if (!session) throw new Error('Faça login para enviar uma denúncia.');

    let imagemUrl = null;
    if (arquivo) {
      const extensao = (arquivo.name.split('.').pop() || 'jpg').toLowerCase();
      const caminho = `${session.user.id}/${crypto.randomUUID()}.${extensao}`;
      const { error: uploadError } = await supabaseClient.storage
        .from('problemas')
        .upload(caminho, arquivo, { cacheControl: '3600', upsert: false });
      if (uploadError) throw uploadError;
      imagemUrl = supabaseClient.storage.from('problemas').getPublicUrl(caminho).data.publicUrl;
    }

    const { data, error } = await supabaseClient
      .from('problemas')
      .insert({
        user_id: session.user.id,
        titulo: dados.titulo,
        descricao: dados.descricao,
        categoria: dados.categoria,
        endereco: dados.endereco,
        bairro: dados.bairro,
        imagem_url: imagemUrl,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async atualizarProblema(id, dados) {
    const { error } = await supabaseClient
      .from('problemas')
      .update(dados)
      .eq('id', id);
    if (error) throw error;
  },
};

