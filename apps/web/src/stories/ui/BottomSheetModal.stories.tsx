import type { Meta, StoryObj } from "@storybook/react";
import { BottomSheetModal } from "../../components/layout/BottomSheetModal";
import { Button } from "../../components/ui/button";
import { useState } from "react";

const meta: Meta<typeof BottomSheetModal> = {
  title: "UI/BottomSheetModal",
  component: BottomSheetModal,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BottomSheetModal>;

function BottomSheetInteractiveWrapper(props: any) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <Button onClick={() => setIsOpen(true)}>Abrir Bottom Sheet Reativo</Button>
      <BottomSheetModal
        {...props}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div style={{ padding: "10px 0" }} className="flex flex-col gap-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            Este modal deslizante reativo (Bottom Sheet) foi aprimorado utilizando a primitiva do Shadcn e Radix UI Sheet, oferecendo total acessibilidade nativa, foco de teclado assistido e transições animadas fluidas.
          </p>
          <div className="flex gap-3 justify-end mt-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Confirmar
            </Button>
          </div>
        </div>
      </BottomSheetModal>
    </div>
  );
}

export const Default: Story = {
  args: {
    title: "O que você deseja criar?",
  },
  render: (args) => <BottomSheetInteractiveWrapper {...args} />,
};
