# Back-end

API serverless executada por Vercel Functions.

## Rotas

- `GET /api/health`: verifica a API e a conexão com o Supabase.
- `GET /api/problemas`: lista os problemas cadastrados.

As funções usam as variáveis de ambiente:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

O front-end usa o SDK oficial do Supabase para autenticação, atualização em tempo real e upload das imagens. As funções desta pasta fornecem uma camada de API para integrações externas e demonstram a separação do back-end.
