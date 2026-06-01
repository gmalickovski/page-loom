import { ChevronLeft, Printer } from "lucide-react";

export interface TopBarPart {
  label: string;
  onClick?: () => void;
}

interface TopBarProps {
  parts: TopBarPart[];
  showBack: boolean;
  onBack: () => void;
  compact?: boolean;
  onAdminClick?: () => void;
}

export function TopBar({ parts, showBack, onBack, compact = false, onAdminClick }: TopBarProps) {
  return (
    <header className={`top-bar ${compact ? "top-bar--compact" : ""}`} style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
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
      {onAdminClick && (
        <button 
          className="icon-button" 
          type="button" 
          onClick={onAdminClick} 
          aria-label="Painel de Impressão Admin"
          title="Painel de Impressão Admin"
          style={{ marginLeft: 'auto', marginRight: '8px' }}
        >
          <Printer size={18} />
        </button>
      )}
    </header>
  );
}
