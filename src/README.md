# Código do projeto

O código-fonte está organizado por responsabilidade:

- [`front/`](front): aplicação web (HTML, CSS, JavaScript e imagens).
- [`back/`](back): espaço reservado para a futura API/backend.
- [`db/`](db): espaço reservado para scripts e modelos do banco de dados.

## Executando o front-end

Abra `front/index.html` por meio de um servidor web local. Exemplo com a extensão Live Server do VS Code.

O sistema utiliza Supabase Auth, PostgreSQL e Storage. A API serverless fica em `back/api` e é executada pela Vercel.

## Estrutura

```text
src/
├── front/
│   ├── css/
│   ├── imagens/
│   ├── js/
│   ├── pages/
│   └── index.html
├── back/
└── db/
```

## Implantação

O projeto está configurado para publicação na Vercel por meio de `vercel.json`. A raiz do projeto na Vercel deve ser configurada como `src`.
