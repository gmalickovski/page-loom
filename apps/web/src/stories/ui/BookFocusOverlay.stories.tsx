import type { Meta, StoryObj } from "@storybook/react";
import { BookFocusOverlay } from "../../components/bookshelf/BookFocusOverlay";
import { useState } from "react";
import type { PlannerBook } from "../../types/library";

const mockBook: PlannerBook = {
  id: "book-focus-test",
  title: "Estratégia 2026",
  pages: 160,
  color: "#C2773A",
  dark: "#AE6326",
  createdAt: "2026-05-28",
  updatedAt: "2026-05-29",
  description: "Planejamento estratégico de negócios do PageLoom.",
  coverDesignerItems: [
    {
      id: "default-front-label",
      type: "label",
      name: "ESTRATÉGIA 2026",
      x: 650,
      y: 260,
      scale: 1.2,
      rotation: 0,
      shape: "rectangular",
      background: "sticker",
      color: "#1c1917",
      font: "serif",
    },
    {
      id: "default-spine-label",
      type: "label",
      name: "ESTRATÉGIA 2026",
      x: 512,
      y: 357,
      scale: 0.9,
      rotation: -90,
      shape: "rectangular",
      background: "sticker",
      color: "#1c1917",
      font: "sans",
    }
  ]
};

const meta: Meta<typeof BookFocusOverlay> = {
  title: "Bookshelf/BookFocusOverlay",
  component: BookFocusOverlay,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BookFocusOverlay>;

function BookFocusInteractiveWrapper(props: any) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <button 
          onClick={() => setIsOpen(true)}
          style={{ padding: "10px 20px", background: "var(--color-accent)", color: "#fff", border: "0", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        >
          Reabrir Popover 3D
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "600px", width: "100%", backgroundColor: "#eceae6", overflow: "hidden", borderRadius: "12px" }}>
      <BookFocusOverlay
        {...props}
        onDismiss={() => setIsOpen(false)}
        onOpen={() => alert("Abrindo planner...")}
      />
    </div>
  );
}

export const FocusOverlay: Story = {
  args: {
    book: mockBook,
    books: [mockBook],
    origin: { x: 100, y: 300, width: 20, height: 180 },
    closing: false,
    settled: true,
    pageClosing: false,
    screen: "home",
  },
  render: (args) => <BookFocusInteractiveWrapper {...args} />,
};
