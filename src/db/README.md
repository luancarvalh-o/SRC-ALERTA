# Banco de dados

O projeto usa PostgreSQL, autenticação e armazenamento de imagens do Supabase.

## Instalação

1. Abra o projeto no Supabase.
2. Acesse **SQL Editor**.
3. Crie uma nova consulta.
4. Cole todo o conteúdo de [`schema.sql`](schema.sql).
5. Clique em **Run**.

O script cria:

- perfis vinculados ao Supabase Auth;
- tabela de problemas urbanos;
- políticas de segurança (Row Level Security);
- bucket público `problemas` para as fotos;
- gatilho para criar o perfil após o cadastro.
