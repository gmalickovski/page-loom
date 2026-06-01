# Guia do Storybook — PageLoom (Visualização de Componentes)

Este documento é um guia prático para desenvolvedores, designers e agentes de IA acessarem, navegarem e utilizarem o **Storybook** no ecossistema PageLoom. O Storybook é a nossa única fonte de verdade para visualizar e testar componentes visuais de forma isolada antes do deploy.

---

## 📚 O que é o Storybook e como ele nos ajuda?

No PageLoom, trabalhamos com uma arquitetura multiplataforma. O Storybook atua como um **playbook interativo** que roda localmente no navegador, permitindo:
1. **Isolamento de Erros**: Desenvolver componentes de UI sem precisar de conexão ativa com o banco de dados (Supabase) ou lógica de rotas do aplicativo.
2. **Teste Adaptativo (Viewports)**: Validar o design nas três escalas de prioridade do projeto (Mobile `390px`, Tablet `768px`, Desktop `1280px`) em tempo real.
3. **Documentação Viva**: Qualquer novo desenvolvedor que entrar no projeto pode ver todos os componentes que já criamos e como utilizá-los, evitando código duplicado.

---

## 🚀 Como Iniciar e Acessar o Storybook Localmente

Para rodar o Storybook na sua máquina de desenvolvimento, siga estes passos simples no seu terminal:

1. **Abra o terminal** na raiz do projeto (`c:\Dev\pageloom`).
2. **Execute o comando de inicialização**:
   ```bash
   npm run storybook -w @pageloom/web
   ```
   *Nota: O parâmetro `-w @pageloom/web` diz ao npm workspaces para rodar o Storybook especificamente dentro da nossa aplicação frontend.*
3. **Acesse no seu navegador**:
   O terminal iniciará um servidor local de alta performance (usando o Vite) e abrirá automaticamente o seu navegador no endereço:
   👉 **`http://localhost:6006`**

*Se o navegador não abrir automaticamente, basta copiar o link `http://localhost:6006` e colá-lo na barra de endereços do Chrome, Edge ou Safari.*

---

## 🎨 Como navegar pela interface do Storybook

Quando o Storybook carregar no seu navegador, você verá uma tela dividida em três partes principais:

```
+-----------------------------------------------------------------+
| Sidebar (Esquerda)    | Tela Central (Canvas / Preview)         |
| • UI/Button           |                                         |
| • UI/Badge            |  [ Visualização Interativa ]            |
| • UI/RusticIcons      |                                         |
| • Modals/ChoiceModal  |                                         |
+-----------------------+-----------------------------------------+
|                       | Controls & Actions Panel (Rodapé)       |
|                       | Modifique propriedades em tempo real    |
+-----------------------------------------------------------------+
```

1. **A Sidebar (Barra Lateral Esquerda)**:
   Exibe a árvore de componentes organizados em categorias. 
   - Clique em **`UI / RusticIcons`** para ver a nossa galeria de ícones estilo papelaria!
   - Clique em **`UI / Button`**, **`UI / Badge`** ou **`UI / Sheet`** para ver as variações de cada componente primitivo.
2. **O Canvas (Painel Central de Visualização)**:
   Onde o componente é renderizado. 
   - No topo deste painel, você verá um **ícone de dispositivo/grade**. Clique nele para alternar e ver o componente no modo **Mobile (iPhone 14/15)**, **Tablet (iPad)** ou **Desktop**, garantindo que a escala física esteja perfeita.
3. **O Painel de Controles (Rodapé / Painel Inferior)**:
   Permite alterar as propriedades (`props`) do componente em tempo real. Por exemplo, você pode trocar o texto do botão, mudar a cor do Badge ou a variante do componente apenas clicando nos seletores, sem mexer no código.

---

## ✏️ Como alterar os ícones diretamente no código?

Sim! Você e qualquer outro desenvolvedor do projeto podem **alterar e customizar os ícones individualmente de forma extremamente simples**:

1. Abra o arquivo onde todos os ícones estão salvos:
   👉 **`apps/web/src/components/ui/icons.tsx`**
2. Cada ícone é um componente React que exporta um elemento SVG. Por exemplo, o `TasksIcon`:
   ```tsx
   export const TasksIcon = ({ size = 24, ...props }: IconProps) => (
     <svg
       width={size}
       height={size}
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       strokeWidth="1.8"
       strokeLinecap="round"
       strokeLinejoin="round"
       {...props}
     >
       {/* Circulo desenhado a mao */}
       <path d="M12 21.5C6.8 21.5..." />
       {/* Checkmark da caneta */}
       <path d="M8.2 12.5L11.5..." strokeWidth="2.2" />
     </svg>
   );
   ```
3. **Para alterar o design de um ícone**:
   - Modifique o caminho do SVG (`<path>`, `<circle>`, etc.) diretamente no código do ícone que deseja mudar.
   - Você pode alterar a espessura da linha mudando o atributo `strokeWidth` (ex: `strokeWidth="2.5"` para uma linha de caneta mais grossa, ou `strokeWidth="1.2"` para um traço de grafite fino).
4. **Atualização Instantânea (HMR)**:
   Graças ao nosso compilador Vite super rápido integrado com o Storybook, no segundo em que você **salvar o arquivo no seu editor**, o Storybook atualizará a tela no seu navegador **instantaneamente** com o novo design do ícone, sem que você precise recarregar a página!
