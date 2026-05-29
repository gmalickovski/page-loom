import { Blocks, Calendar, FileText, LayoutTemplate, Library, Plus } from "lucide-react";

const tabs = [
  { id: "library", label: "Biblioteca", Icon: Library },
  { id: "today", label: "Hoje", Icon: Calendar },
  { id: "add", label: "Novo", Icon: Plus },
  { id: "templates", label: "Templates", Icon: LayoutTemplate },
] as const;

interface BottomTabBarProps {
  active?: "library" | "today" | "templates";
  activeTemplateTool?: "pages" | "blocks" | null;
  mode?: "main" | "template-editor";
  onAdd?: () => void;
  onLibrary?: () => void;
  onTemplates?: () => void;
  onToday?: () => void;
  onTemplatePages?: () => void;
  onTemplateBlocks?: () => void;
}

export function BottomTabBar({
  active = "library",
  activeTemplateTool = null,
  mode = "main",
  onAdd,
  onLibrary,
  onTemplates,
  onToday,
  onTemplatePages,
  onTemplateBlocks,
}: BottomTabBarProps) {
  if (mode === "template-editor") {
    return (
      <nav className="bottom-tabs bottom-tabs--template-editor" aria-label="Ferramentas do template">
        <button
          type="button"
          className={activeTemplateTool === "pages" ? "is-active" : ""}
          onClick={onTemplatePages}
        >
          <FileText size={22} strokeWidth={2.4} />
          <span>Páginas</span>
        </button>
        <button
          type="button"
          className={activeTemplateTool === "blocks" ? "is-active" : ""}
          onClick={onTemplateBlocks}
        >
          <Blocks size={22} strokeWidth={2.4} />
          <span>Blocos</span>
        </button>
      </nav>
    );
  }

  const handlers = {
    library: onLibrary,
    today: onToday,
    add: onAdd,
    templates: onTemplates,
  } satisfies Record<(typeof tabs)[number]["id"], (() => void) | undefined>;

  return (
    <nav className="bottom-tabs" aria-label="Navegação principal">
      {tabs.map(({ id, label, Icon }) => (
        <button
          className={id === active ? "is-active" : ""}
          type="button"
          key={id}
          onClick={handlers[id]}
        >
          <Icon size={22} strokeWidth={2.4} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
