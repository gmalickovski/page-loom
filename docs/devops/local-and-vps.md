# DevOps Local e VPS

## Ambientes

- `.env.local`: teste local.
- `.env.example`: modelo para local e VPS.
- `.env`: arquivo privado no servidor, nunca versionado.

## Variaveis Iniciais

```env
VITE_APP_NAME="Meu Planner"
VITE_APP_PUBLIC_URL="http://localhost:5173"
VITE_SUPABASE_URL=""
VITE_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
```

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deploy Inicial

1. Rodar `npm run build`.
2. Publicar `apps/web/dist` na VPS.
3. Configurar HTTPS e variaveis de ambiente.
4. Depois da integracao Supabase, mover mutacoes sensiveis para backend ou edge functions.
