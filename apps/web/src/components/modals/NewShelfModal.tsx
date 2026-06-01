import React, { useState } from "react";
import { X } from "lucide-react";

interface NewShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShelf: (name: string) => void;
}

export function NewShelfModal({
  isOpen,
  onClose,
  onCreateShelf,
}: NewShelfModalProps) {
  const [newShelfName, setNewShelfName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!newShelfName.trim()) return;
    onCreateShelf(newShelfName.trim());
    setNewShelfName("");
    onClose();
  };

  return (
    <div className="shelf-modal-backdrop" onClick={onClose}>
      <div className="shelf-modal animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="shelf-modal__header">
          <h3>Criar Nova Estante</h3>
          <button className="shelf-modal__close" type="button" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <p className="shelf-modal__subtitle">Dê um nome organizador para separar seus planners da biblioteca.</p>
        
        <div className="shelf-modal__field">
          <input
            type="text"
            placeholder="Ex: Projetos Pessoais, Estudos, Finanças 2026..."
            value={newShelfName}
            onChange={(e) => setNewShelfName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSubmit();
              }
            }}
          />
        </div>

        <div className="shelf-modal__actions">
          <button type="button" className="btn-modal-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-modal-submit"
            disabled={!newShelfName.trim()}
            onClick={handleSubmit}
          >
            Criar Estante
          </button>
        </div>
      </div>
    </div>
  );
}
