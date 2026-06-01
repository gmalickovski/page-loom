import type { PlannerBook } from "../types/library";

/** Cores CMYK-Safe da paleta PageLoom para os 4 livros da landing */
export const LANDING_BOOKS: LandingBook[] = [
  {
    id: "landing-crossover",
    title: "O Crossover",
    subtitle: "Físico ⇄ Digital",
    color: "#8EA898",       // Verde Sálvia (mapped from #D2DCD0 pastel)
    dark: "#6B8A73",
    description: "Seu planner ganha vida no digital. Aponte a câmera, escaneie o QR Code e veja seu caderno se materializar instantaneamente na tela do celular.",
    features: [
      "QR Code impresso com ID único em cada folha",
      "Réplica digital idêntica gerada automaticamente",
      "Sincronização ativa com Google Calendar",
      "Busca indexada por texto escrito à mão",
    ],
    pages: 240 as const,
  },
  {
    id: "landing-studio",
    title: "O Estúdio Web",
    subtitle: "Crie seu template perfeito",
    color: "#C2773A",       // Âmbar accent (Rosa Antigo mapped)
    dark: "#A05E28",
    description: "Arraste blocos, encaixe cronogramas, rastreadores de hábitos e listas de prioridade. Seu planner, do seu jeito — com precisão de milímetros.",
    features: [
      "Editor arrasta-e-solta estilo Elementor",
      "15+ blocos funcionais pré-desenhados",
      "Pautas de 7mm, pontilhado e quadriculado",
      "Folhas em 4 tons de papel premium",
    ],
    pages: 240 as const,
  },
  {
    id: "landing-marketplace",
    title: "O Marketplace",
    subtitle: "Templates da comunidade",
    color: "#9E8A9C",       // Lavanda (mapped from #DACBD5)
    dark: "#816E7F",
    description: "Designers criam, você imprime. Encontre templates incríveis de produtividade criados por especialistas e instancie quantas vezes quiser.",
    features: [
      "Biblioteca de templates de alta qualidade",
      "Separadores coloridos com abas trapezoidais",
      "Personalize tudo antes de imprimir",
      "Compartilhe seus designs com a comunidade",
    ],
    pages: 160 as const,
  },
  {
    id: "landing-manufatura",
    title: "Manufatura Ativa",
    subtitle: "Impressão sob demanda",
    color: "#7E8FA0",       // Azul Névoa (mapped from #CBD5D0)
    dark: "#63707E",
    description: "Da tela ao papel. Impressão duplex assistida com guias visuais, controle de lote e fidelidade CMYK-Safe absoluta entre o digital e o impresso.",
    features: [
      "Fluxo de impressão duplex passo a passo",
      "Paleta CMYK-Safe para cores idênticas",
      "Furação para Caderno Inteligente ou Fichário",
      "Refis de 40 a 120 folhas por pacote",
    ],
    pages: 160 as const,
  },
];

export interface LandingBook {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  dark: string;
  description: string;
  features: string[];
  pages: PlannerBook["pages"];
}

/** Labels de lombada para a estante da landing */
export const LANDING_SHELF_BOOKS: Pick<PlannerBook, "id" | "title" | "pages" | "color" | "dark">[] = LANDING_BOOKS.map((book) => ({
  id: book.id,
  title: book.title.toUpperCase(),
  pages: book.pages,
  color: book.color,
  dark: book.dark,
}));

/** Stats para social proof */
export const LANDING_STATS = [
  { value: "15+", label: "Blocos funcionais" },
  { value: "4", label: "Tons de papel" },
  { value: "100%", label: "Fidelidade CMYK" },
  { value: "∞", label: "Templates reutilizáveis" },
];

/** FAQ items */
export const LANDING_FAQ = [
  {
    question: "Como funciona o crossover físico-digital?",
    answer: "Cada folha impressa contém um QR Code com ID único. Ao escanear com o app PageLoom, uma réplica digital interativa é criada automaticamente na sua biblioteca, com todos os blocos e layouts idênticos.",
  },
  {
    question: "Posso criar meu próprio layout de páginas?",
    answer: "Sim! O PageLoom Studio é um editor arrasta-e-solta onde você monta cada página do seu planner com blocos funcionais como cronogramas, checklists, rastreadores de humor e muito mais.",
  },
  {
    question: "As cores impressas ficam iguais ao digital?",
    answer: "Utilizamos uma paleta restrita de Cores Pastéis CMYK-Safe, projetadas para manter fidelidade absoluta entre a tela do computador e a impressão em papel.",
  },
  {
    question: "Quais tipos de encadernação são suportados?",
    answer: "Caderno Inteligente (discos), fichário (4 furos) e encadernação wire-o. As folhas são impressas com a furação correta para cada formato.",
  },
];
