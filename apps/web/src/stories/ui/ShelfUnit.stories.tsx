import type { Meta, StoryObj } from "@storybook/react";
import { ShelfUnit } from "../../components/bookshelf/ShelfUnit";
import type { PlannerBook } from "../../types/library";

const mockBooks: PlannerBook[] = [
  {
    id: "book-1",
    title: "Diário de Bordo",
    pages: 80,
    color: "#8EA898",
    dark: "#7A9486",
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29",
    description: "Anotações diárias sobre navegação e clima.",
  },
  {
    id: "book-2",
    title: "Estratégia 2026",
    pages: 160,
    color: "#C2773A",
    dark: "#AE6326",
    createdAt: "2026-05-28",
    updatedAt: "2026-05-29",
    description: "Planejamento estratégico de negócios do PageLoom.",
  },
  {
    id: "book-3",
    title: "Finanças Pessoais",
    pages: 240,
    color: "#7E8FA0",
    dark: "#6A7B8C",
    createdAt: "2026-05-27",
    updatedAt: "2026-05-28",
    description: "Controle financeiro mensal e metas de poupança.",
  },
];

const meta: Meta<typeof ShelfUnit> = {
  title: "Bookshelf/ShelfUnit",
  component: ShelfUnit,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ShelfUnit>;

export const DesktopShelf: Story = {
  args: {
    books: mockBooks,
    onBookClick: (book, origin) => console.log("Book clicked:", book, "origin:", origin),
    scale: 1,
    gap: 6,
  },
  render: (args) => (
    <div style={{ padding: "40px", backgroundColor: "#eceae6", minHeight: "300px" }}>
      <ShelfUnit {...args} />
    </div>
  ),
};

export const MobileShelf: Story = {
  args: {
    books: mockBooks,
    onBookClick: (book, origin) => console.log("Book clicked:", book, "origin:", origin),
    scale: 0.72,
    gap: 3,
  },
  render: (args) => (
    <div style={{ padding: "20px", maxWidth: "375px", backgroundColor: "#eceae6", minHeight: "240px", margin: "0 auto", border: "1px solid #ddd", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <ShelfUnit {...args} />
    </div>
  ),
};
