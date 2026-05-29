import { Check, X } from "lucide-react";

interface BottomSheetModalProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  headerActions?: React.ReactNode;
  title: string;
}

export function BottomSheetModal({
  children,
  className = "",
  contentClassName = "",
  isOpen,
  onClose,
  headerActions,
  title,
}: BottomSheetModalProps) {
  if (!isOpen) return null;

  return (
    <div className={`choice-modal-backdrop ${className}`} onClick={onClose}>
      <div className="choice-modal animate-pop" onClick={(event) => event.stopPropagation()}>
        <div className="choice-modal__header">
          <h3>{title}</h3>
          <div className="choice-modal__header-actions">
            {headerActions ? headerActions : (
              <button className="choice-modal__close-btn" type="button" onClick={onClose} aria-label="Fechar">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <div className={`choice-modal__scroll ${contentClassName}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
