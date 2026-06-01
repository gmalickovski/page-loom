import type { Meta, StoryObj } from "@storybook/react";
import { BookOpenPlanner } from "../../components/planner/BookOpenPlanner";
import { useState } from "react";
import type { PlannerBook, PlannerPage } from "../../types/library";

const mockBook: PlannerBook = {
  id: "test-book",
  title: "Meu Planner Premium",
  pages: 80,
  color: "#8EA898",
  dark: "#7A9486",
  templateType: "custom_planner",
  customPages: [
    {
      id: "cover",
      title: "Contracapa",
      date: "2026",
      template: "cover",
      pageData: {
        notes: "Planner para demonstração interativa de abas.",
        ownerName: "Helena de Troy",
        ownerEmail: "helena@pageloom.com"
      }
    },
    {
      id: "calendar",
      title: "Calendário 2026",
      date: "2026",
      template: "calendar"
    },
    {
      id: "goals",
      title: "Metas do Ano",
      date: "2026",
      template: "goals",
      pageData: {
        goals: ["Lançar nova coleção de papelaria", "Beber 2L de água diariamente", "Ir à academia 4x na semana"],
        notes: "Reflexões de ano novo..."
      }
    },
    {
      id: "sec-financeiro",
      title: "Abertura Financeiro",
      date: "Aba Financeiro",
      template: "separator",
      pageData: {
        sectionTitle: "Financeiro",
        notes: "Painel de controle financeiro",
        separatorColor: "#DACBD5"
      } as any
    },
    {
      id: "finance-1",
      title: "Fluxo de Caixa",
      date: "Finanças",
      template: "custom",
      pageData: {
        sectionTitle: "Financeiro",
        paperPattern: "grid",
        paperTone: "pollen",
        layoutBlocks: [
          {
            id: "fin-b1",
            type: "finance_table",
            title: "Controle de Caixa",
            variant: "Entrada/saida",
            xMm: 20,
            yMm: 30,
            widthMm: 108,
            heightMm: 80
          }
        ]
      }
    },
    {
      id: "projs-page",
      title: "Gestão de Projetos",
      date: "Projetos",
      template: "custom",
      pageData: {
        sectionTitle: "Projetos",
        paperPattern: "dot_grid",
        paperTone: "offset",
        layoutBlocks: [
          {
            id: "sep-proj-b",
            type: "separator",
            title: "Projetos",
            variant: "#D2DCD0",
            xMm: 20,
            yMm: 20,
            widthMm: 108,
            heightMm: 30
          },
          {
            id: "tasks-proj-b",
            type: "checklist",
            title: "Entregáveis",
            variant: "Prioridades",
            xMm: 20,
            yMm: 60,
            widthMm: 108,
            heightMm: 100
          }
        ]
      }
    }
  ]
};

function BookOpenPlannerInteractive(props: any) {
  const [pages, setPages] = useState<PlannerPage[]>(props.book.customPages || []);
  const [activePage, setActivePage] = useState<PlannerPage | null>(pages[0] || null);

  const updatedBook = {
    ...props.book,
    customPages: pages
  };

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto", backgroundColor: "#f6f5f3", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
      <BookOpenPlanner
        {...props}
        book={updatedBook}
        activePage={activePage}
        onNavigatePage={(p) => setActivePage(p)}
        onUpdateBookPages={(newPages) => setPages(newPages)}
      />
    </div>
  );
}

const meta: Meta<typeof BookOpenPlanner> = {
  title: "Planner/BookOpenPlanner",
  component: BookOpenPlanner,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BookOpenPlanner>;

export const Interactive: Story = {
  render: (args) => <BookOpenPlannerInteractive {...args} />,
  args: {
    book: mockBook,
    compact: false,
  },
};

export const CompactInteractive: Story = {
  render: (args) => <BookOpenPlannerInteractive {...args} />,
  args: {
    book: mockBook,
    compact: true,
  },
};
