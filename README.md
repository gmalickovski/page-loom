# PageLoom / Meu Planner

Aplicativo Paper Planner Digital com foco inicial na biblioteca visual de estantes, livros e planner diário.

## Stack

- Monorepo com npm workspaces.
- Frontend em React + TypeScript + Vite.
- Backend separado em `apps/api`, preparado para evoluir com Supabase.
- Tipos compartilhados em `packages/shared`.

## Primeiros Comandos

```bash
npm install
npm run dev
npm run build
```

## Estrutura

- `apps/web`: interface principal.
- `apps/api`: camada futura de backend e integrações seguras.
- `packages/shared`: tipos e contratos reutilizados.
- `docs`: arquitetura, DevOps, armazenamento e decisões funcionais.
