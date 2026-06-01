import { BookIcon, CalendarIcon, PlusIcon } from "../ui";

const tabs = [
  { id: "library", label: "Biblioteca", Icon: BookIcon },
  { id: "today", label: "Hoje", Icon: CalendarIcon },
  { id: "add", label: "Novo", Icon: PlusIcon },
] as const;

interface BottomTabBarProps {
  active?: "library" | "today";
  onAdd?: () => void;
  onLibrary?: () => void;
  onToday?: () => void;
}

export function BottomTabBar({
  active = "library",
  onAdd,
  onLibrary,
  onToday,
}: BottomTabBarProps) {
  const handlers = {
    library: onLibrary,
    today: onToday,
    add: onAdd,
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
