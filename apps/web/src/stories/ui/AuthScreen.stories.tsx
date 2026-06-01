import type { Meta, StoryObj } from "@storybook/react";
import { AuthScreen } from "../../app/AuthScreen";
import "../../styles/theme.css";
import "../../styles/global.css";

const meta: Meta<typeof AuthScreen> = {
  title: "Screens/AuthScreen",
  component: AuthScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Tela de autenticação unificada (Login + Cadastro) usando Supabase. " +
          "Estilo de papelaria rústica com fita adesiva, espiral de caderno e " +
          "componentes shadcn reutilizáveis (Card, Button, Input, Tabs, Separator).",
      },
    },
  },
  argTypes: {
    onBack: { action: "onBack" },
    onAuthenticated: { action: "onAuthenticated" },
  },
};

export default meta;
type Story = StoryObj<typeof AuthScreen>;

export const Default: Story = {
  args: {
    onBack: () => console.log("← Voltar à landing"),
    onAuthenticated: () => console.log("✓ Autenticado!"),
  },
};

export const LoginTab: Story = {
  name: "Login (padrão)",
  args: {
    onBack: () => console.log("← Voltar à landing"),
    onAuthenticated: () => console.log("✓ Autenticado!"),
  },
};
