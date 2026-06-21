const DB = (() => {

  const defaultUsers = [
    {
      id:        1,
      name:      'Administrador',
      email:     'admin@alertabetim.com',
      password:  'admin123',
      role:      'Administrador',
      isAdmin:   true,
      joinMonth: 'janeiro',
      joinYear:  2025,
      city:      'Betim',
      state:     'MG',
    },
    {
      id:        2,
      name:      'João Silva',
      email:     'joao.silva@email.com',
      password:  '123456',
      role:      'Cidadão Ativo',
      isAdmin:   false,
      joinMonth: 'janeiro',
      joinYear:  2025,
      city:      'Betim',
      state:     'MG',
    },
  ];

  const defaultDenuncias = [
    {
      id:         1,
      userId:     2,
      title:      'Buraco grande na Av. Amazonas',
      desc:       'Buraco de aproximadamente 1 metro de diâmetro na pista central da Av. Amazonas, altura do número 2500. Causando risco para veículos e motos.',
      category:   'Buraco na via',
      badgeClass: 'badge-red',
      date:       '10/04/2026',
      apoios:     23,
      imgClass:   'img-road',
      imgEmoji:   '🕳️',
    },
    {
      id:         2,
      userId:     2,
      title:      'Poste sem iluminação há 2 semanas',
      desc:       'Poste de iluminação pública apagado na Rua das Flores, deixando a via completamente escura à noite.',
      category:   'Iluminação pública',
      badgeClass: 'badge-yellow',
      date:       '08/04/2026',
      apoios:     18,
      imgClass:   'img-light',
      imgEmoji:   '💡',
    },
    {
      id:         3,
      userId:     2,
      title:      'Lixo acumulado em terreno baldio',
      desc:       'Grande acúmulo de lixo e entulho em terreno baldio na esquina. Local está atraindo animais e insetos.',
      category:   'Acúmulo de lixo',
      badgeClass: 'badge-green',
      date:       '12/04/2026',
      apoios:     31,
      imgClass:   'img-trash',
      imgEmoji:   '🗑️',
    },
    {
      id:         4,
      userId:     2,
      title:      'Placa de PARE danificada',
      desc:       'Placa de sinalização PARE completamente apagada e amassada no cruzamento.',
      category:   'Sinalização',
      badgeClass: 'badge-cyan',
      date:       '01/04/2026',
      apoios:     15,
      imgClass:   'img-sign',
      imgEmoji:   '🛑',
    },
  ];

  const defaultActivities = [
    {
      userId: 2,
      type: 'report',
      text: 'Você reportou um novo problema',
      sub:  'Buraco grande na Av. Amazonas',
      time: 'Há 2 dias',
    },
    {
      userId: 2,
      type: 'support',
      text: 'Você apoiou um problema',
      sub:  'Falta de iluminação aumenta insegurança',
      time: 'Há 5 dias',
    },
    {
      userId: 2,
      type: 'update',
      text: 'Atualização recebida',
      sub:  'Seu problema foi marcado como "Em Andamento"',
      time: 'Há 1 semana',
    },
  ];

  function load(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  let users      = load('ab_users', defaultUsers);

  if (!users.find(u => u.email === 'admin@alertabetim.com')) {
    users.unshift(defaultUsers[0]);
    save('ab_users', users);
  }

  let denuncias  = load('ab_denuncias',  defaultDenuncias);
  let activities = load('ab_activities', defaultActivities);
  let problemas  = load('ab_problemas', []);

  let currentUserId = load('ab_session', null);

  return {

    login(email, password) {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return null;
      currentUserId = user.id;
      save('ab_session', currentUserId);
      return { ...user };
    },

    logout() {
      currentUserId = null;
      localStorage.removeItem('ab_session');
    },

    isLoggedIn() {
      return currentUserId !== null;
    },

    getCurrentUser() {
      if (!currentUserId) return null;
      const user = users.find(u => u.id === currentUserId);
      return user ? { ...user } : null;
    },

    register(data) {

      if (users.find(u => u.email === data.email)) return { error: 'Email já cadastrado.' };
      const newUser = {
        id:        Date.now(),
        name:      data.name,
        email:     data.email,
        password:  data.password,
        role:      'Cidadão',
        isAdmin:   false,
        joinMonth: new Date().toLocaleString('pt-BR', { month: 'long' }),
        joinYear:  new Date().getFullYear(),
        city:      data.city  || 'Betim',
        state:     data.state || 'MG',
      };
      users.push(newUser);
      save('ab_users', users);
      currentUserId = newUser.id;
      save('ab_session', currentUserId);
      return { user: { ...newUser } };
    },

    getUser()        { return this.getCurrentUser(); },
    updateUser(data) {
      const idx = users.findIndex(u => u.id === currentUserId);
      if (idx === -1) return;
      users[idx] = { ...users[idx], ...data };
      save('ab_users', users);
    },

    getDenuncias() {
      return denuncias.filter(d => d.userId === currentUserId);
    },
    addDenuncia(item) {
      denuncias.unshift({ ...item, userId: currentUserId });
      save('ab_denuncias', denuncias);
    },
    incrementApoio(id) {
      const d = denuncias.find(x => x.id === id);
      if (d) { d.apoios++; save('ab_denuncias', denuncias); }
      return d ? d.apoios : null;
    },

    getProblemas() {
      return problemas.map(p => ({ ...p }));
    },
    addProblema(item) {
      problemas.unshift({ ...item });
      save('ab_problemas', problemas);
    },
    updateProblema(id, data) {
      const idx = problemas.findIndex(p => String(p.id) === String(id));
      if (idx === -1) return;
      problemas[idx] = { ...problemas[idx], ...data };
      save('ab_problemas', problemas);
    },

    getActivities() {
      return activities.filter(a => a.userId === currentUserId);
    },
    addActivity(item) {
      activities.unshift({ ...item, userId: currentUserId });
      save('ab_activities', activities);
    },

    totalApoios() {
      return denuncias
        .filter(d => d.userId === currentUserId)
        .reduce((sum, d) => sum + d.apoios, 0);
    },
    gerarId()  { return Date.now(); },
    dataHoje() {
      const d = new Date();
      const pad = n => String(n).padStart(2, '0');
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    },
  };

})();
