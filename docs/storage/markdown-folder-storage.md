# Armazenamento em Markdown e Pastas

## Hierarquia Alvo

```text
/MeuPlanner/
├── Estante_Trabalho/
│   ├── Projeto_X_2024/
│   │   ├── config.json
│   │   ├── page-001.md
│   │   ├── page-002.md
│   │   └── assets/
│   └── Book_Reunioes/
└── Estante_Pessoal/
    └── Diario_Gratidao/
```

## Pagina Markdown

```md
---
template: "daily-planner-v1"
background: "dotted"
layout:
  - block: "calendar-mini"
    position: [10, 10]
  - block: "todo-list"
    position: [10, 60]
---

# Notas do Dia

- [x] Reuniao de alinhamento
- [ ] Finalizar prototipo da estante
```

## Diretriz

Markdown e a representacao exportavel/backup. No app hospedado, a sincronizacao e permissoes podem ser feitas por Supabase, mas o modelo deve continuar capaz de exportar/importar essa estrutura.
