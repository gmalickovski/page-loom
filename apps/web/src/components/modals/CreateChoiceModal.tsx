import React from "react";
import { FolderPlus, BookOpen } from "lucide-react";
import { BottomSheetModal } from "../layout/BottomSheetModal";

interface CreateChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShelf: () => void;
  onCreateBook: () => void;
}

export function CreateChoiceModal({
  isOpen,
  onClose,
  onCreateShelf,
  onCreateBook,
}: CreateChoiceModalProps) {
  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title="O que você deseja criar?"
    >
      <div className="choice-modal__options">
        <button
          type="button"
          className="choice-option"
          onClick={() => {
            onClose();
            onCreateShelf();
          }}
        >
          <div className="choice-option__icon choice-option__icon--shelf">
            <FolderPlus size={22} />
          </div>
          <div className="choice-option__content">
            <h4>Estante Organizadora</h4>
            <p>Crie um novo espaço físico para arquivar seus planners e cadernos.</p>
          </div>
        </button>

        <button
          type="button"
          className="choice-option"
          onClick={() => {
            onClose();
            onCreateBook();
          }}
        >
          <div className="choice-option__icon choice-option__icon--book">
            <BookOpen size={22} />
          </div>
          <div className="choice-option__content">
            <h4>Novo Livro, Planner ou Agenda</h4>
            <p>Crie uma agenda diária 2026 com divisórias em abas físicas e metas inteligentes.</p>
          </div>
        </button>
      </div>
    </BottomSheetModal>
  );
}
