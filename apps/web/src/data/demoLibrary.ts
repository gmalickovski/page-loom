import type { PlannerPage, PlannerTask, ScheduleBlock, Shelf } from "../types/library";

/**
 * Generates all pages for the premium "Agenda Padrão 2026"
 */
export function generateAgenda2026Pages(title: string, description: string): PlannerPage[] {
  const coverPage: PlannerPage = {
    id: "cover",
    title: "Contracapa",
    date: "2026",
    template: "cover",
    pageData: {
      notes: description || "Caderno rústico para anotações e planejamento pessoal.",
      ownerName: "Usuário Pageloom",
      ownerEmail: "contato@pageloom.com",
      ownerPhone: "+55 (11) 99999-9999"
    }
  };

  const calendarPage: PlannerPage = {
    id: "calendar",
    title: "Calendário 2026",
    date: "2026",
    template: "calendar"
  };

  const goalsPage: PlannerPage = {
    id: "goals",
    title: "Metas 2026",
    date: "2026",
    template: "goals",
    pageData: {
      goals: [
        "Organizar rotina diária no Pageloom",
        "Praticar exercícios físicos regularmente",
        "Ler pelo menos 1 livro por mês",
        "Beber 2 litros de água todos os dias"
      ],
      notes: "Escreva aqui suas reflexões para o ano de 2026 e planos de ação para atingir seus objetivos mais ousados!"
    }
  };

  const date = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);
  const dailyPages: PlannerPage[] = [];

  const weekdays = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
  const monthsShort = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  const monthsLong = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  while (date <= end) {
    const dayVal = date.getDate();
    const dStr = dayVal.toString().padStart(2, "0");
    const mIndex = date.getMonth();
    const mStr = monthsShort[mIndex];
    const wStr = weekdays[date.getDay()];

    dailyPages.push({
      id: `d-2026-${(mIndex + 1).toString().padStart(2, "0")}-${dStr}`,
      title: `${wStr}, ${dStr} ${mStr}`,
      date: `${dStr} ${mStr.toLowerCase()}`,
      template: "daily",
      pageData: {
        notes: "",
        tasks: [
          { id: 1, text: "Planejar as tarefas deste dia", done: false },
          { id: 2, text: "Beber pelo menos 2L de água", done: false },
          { id: 3, text: "Revisar metas semanais", done: false }
        ],
        schedule: [
          { time: "08h", label: null, kind: null },
          { time: "09h", label: "Rotina Matinal", kind: "personal" },
          { time: "10h", label: null, kind: null },
          { time: "11h", label: null, kind: null },
          { time: "12h", label: "Intervalo para Almoço", kind: "personal" },
          { time: "13h", label: null, kind: null },
          { time: "14h", label: "Foco no Trabalho", kind: "focus" },
          { time: "15h", label: null, kind: null },
          { time: "16h", label: null, kind: null },
          { time: "17h", label: "Alinhamento diário", kind: "meeting" },
          { time: "18h", label: null, kind: null },
          { time: "19h", label: null, kind: null },
          { time: "20h", label: "Exercício físico / Lazer", kind: "personal" },
        ],
        waterIntake: 0,
        mood: null
      }
    });

    date.setDate(date.getDate() + 1);
  }

  return [coverPage, calendarPage, goalsPage, ...dailyPages];
}

export const pages: PlannerPage[] = [
  { id: "p001", title: "Semana 1 - 15 Jan", date: "15 jan", template: "daily" },
  { id: "p002", title: "Plano de Entregas", date: "10 jan", template: "notes" },
  { id: "p003", title: "Reuniao de Alinhamento", date: "15 jan", template: "meeting" },
  { id: "p004", title: "Semana 2 - 22 Jan", date: "22 jan", template: "daily" },
  { id: "p005", title: "Retrospectiva Sprint 1", date: "26 jan", template: "notes" },
];

export const initialTasks: PlannerTask[] = [
  { id: 1, text: "Reuniao de alinhamento com time", done: true },
  { id: 2, text: "Finalizar prototipo da estante", done: false },
  { id: 3, text: "Review do sprint com cliente", done: false },
  { id: 4, text: "Documentar decisoes de design", done: false },
  { id: 5, text: "Enviar proposta atualizada", done: false },
];

export const schedule: ScheduleBlock[] = [
  { time: "09h", label: "Stand-up diario", kind: "meeting" },
  { time: "10h", label: "Design Sprint", kind: "focus" },
  { time: "11h", label: "Design Sprint", kind: "focus" },
  { time: "12h", label: "Almoco", kind: "personal" },
  { time: "13h", label: null, kind: null },
  { time: "14h", label: "Review cliente", kind: "meeting" },
  { time: "15h", label: "Foco - prototipo", kind: "focus" },
  { time: "16h", label: null, kind: null },
  { time: "17h", label: null, kind: null },
  { time: "18h", label: "Wrap-up", kind: "personal" },
];

export const shelves: Shelf[] = [
  {
    id: "trabalho",
    name: "Estante Trabalho",
    books: [
      { 
        id: "estrategia", 
        shelfId: "trabalho", 
        title: "Estratégia 2026", 
        pages: 160, 
        color: "#C2773A", 
        dark: "#A8622C", 
        createdAt: "2026-01-15", 
        updatedAt: "2026-05-29",
        description: "Planejamento estratégico de negócios, metas e expansão da empresa.",
        customPages: generateAgenda2026Pages("Estratégia 2026", "Planejamento estratégico de negócios e expansão."),
        coverDesignerItems: [
          {
            id: "default-front-label",
            type: "label",
            name: "ESTRATÉGIA 2026",
            x: Math.round(493 + 38 + 246.5),
            y: 260,
            scale: 1.2,
            rotation: 0,
            shape: "rectangular",
            background: "sticker",
            color: "#1c1917",
            font: "serif"
          },
          {
            id: "default-spine-label",
            type: "label",
            name: "ESTRATÉGIA 2026",
            x: Math.round(493 + 38 / 2),
            y: 357,
            scale: 0.9,
            rotation: -90,
            shape: "rectangular",
            background: "sticker",
            color: "#1c1917",
            font: "sans"
          }
        ]
      }
    ]
  }
];
