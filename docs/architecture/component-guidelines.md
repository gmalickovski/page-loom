# Guia de Componentes

## Principios

- Componentes visuais reutilizaveis ficam em `src/components`.
- Telas ficam em `src/app/screens.tsx` enquanto o app ainda e pequeno.
- Tokens globais ficam em `src/styles/theme.css`.
- Dados mockados ficam em `src/data`, ate serem substituidos por API.

## Componentes Atuais

- `BookSpine`: lombada do livro.
- `RusticLabel`: etiqueta adesiva.
- `ShelfUnit`: composicao da prateleira.
- `BookFlipOverlay`: animacao de abertura.
- `SidebarNav`, `TopBar`, `BottomTabBar`: navegacao.
- `DailyPlanner`: template inicial de pagina diaria.

## Regra de Evolucao

Quando um componente passar a ter regra de negocio ou persistencia, a regra sai do componente e vai para services/hooks ligados ao backend.
