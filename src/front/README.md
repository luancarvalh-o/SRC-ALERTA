# Front-end

Aplicação web do Alerta Betim.

- `index.html`: página inicial, cards, estatísticas e mapa.
- `pages/`: telas de login, cadastro, perfil e registro de problemas.
- `css/`: estilos da aplicação.
- `js/`: tema e persistência local do protótipo.
- `imagens/`: recursos visuais.

O arquivo `js/supabase.js` conecta o front-end ao Supabase para:

- autenticação e sessões;
- leitura e cadastro de denúncias;
- perfil do usuário;
- upload e publicação das fotos.

O arquivo `js/db.js` permanece apenas como referência da versão inicial que utilizava `localStorage`.
