import { ChevronLeft } from "lucide-react";

export interface TopBarPart {
  label: string;
  onClick?: () => void;
}

interface TopBarProps {
  parts: TopBarPart[];
  showBack: boolean;
  onBack: () => void;
  compact?: boolean;
}

export function TopBar({ parts, showBack, onBack, compact = false }: TopBarProps) {
  return (
    <header className={`top-bar ${compact ? "top-bar--compact" : ""}`}>
      {showBack && (
        <button className="icon-button" type="button" onClick={onBack} aria-label="Voltar">
          <ChevronLeft size={20} />
        </button>
      )}
      <nav className="top-bar__breadcrumbs" aria-label="Caminho">
        {parts.map((part, index) => {
          const isCurrent = index === parts.length - 1;

          return (
            <span className={isCurrent ? "is-current" : ""} key={`${part.label}-${index}`}>
              {index > 0 && <i>/</i>}
              {part.onClick && !isCurrent ? (
                <button type="button" onClick={part.onClick}>
                  {part.label}
                </button>
              ) : (
                part.label
              )}
            </span>
          );
        })}
      </nav>
    </header>
  );
}
