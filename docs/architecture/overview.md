# Arquitetura Inicial

## Decisao de Stack

O projeto nasce como monorepo com React, TypeScript e Vite no frontend. Essa base e simples de manter, tem ecossistema amplo e permite evoluir para multiplataforma por etapas:

- Web/PWA na VPS para landing page e app inicial.
- Supabase para autenticacao, banco e storage.
- Wrapper mobile futuro com Capacitor ou evolucao para React Native/Expo se o app exigir APIs nativas intensas.
- Desktop futuro com Tauri, reaproveitando a experiencia web.

## Separacao de Responsabilidades

- `apps/web`: experiencia visual e interacao.
- `apps/api`: regras de negocio, integracoes seguras e endpoints futuros.
- `packages/shared`: tipos e contratos compartilhados.
- `docs`: documentacao viva de produto, arquitetura, operacao e fluxo de dados.

## Regra de Seguranca

O frontend nunca deve ser fonte de verdade para permissoes, identidade, precos, dados sensiveis ou mutacoes definitivas. Toda alteracao persistente sera validada no backend/Supabase antes de ser gravada.
