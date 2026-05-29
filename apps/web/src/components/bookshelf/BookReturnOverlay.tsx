import { useEffect, useState } from "react";
import type { PlannerBook } from "../../types/library";
import ComponenteBook3D from "./ComponenteBook3D";
import { toComponenteBook3DData } from "./book3dData";

interface BookReturnOverlayProps {
  book: PlannerBook;
  active: boolean;
  onDone: () => void;
}

export function BookReturnOverlay({ book, active, onDone }: BookReturnOverlayProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeSheetIndex, setActiveSheetIndex] = useState(1);
  const [zoomMode, setZoomMode] = useState<"book" | "page">("book");

  useEffect(() => {
    if (!active) {
      setIsOpen(true);
      return;
    }

    setIsOpen(true);

    // Fecha o livro em 3D no centro da tela (muda de aberto para fechado) após 150ms
    const closeTimer = window.setTimeout(() => {
      setIsOpen(false);
    }, 150);

    // Finaliza a animação de fechamento após 1.2 segundos (quando o livro já estiver 100% plano e fechado no centro)
    const doneTimer = window.setTimeout(onDone, 1200);

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [active, onDone]);

  return (
    <div className={`book-return ${active ? "is-active" : "is-prewarm"}`} aria-hidden="true">
      <div className="book-return__backdrop" />
      <div className="book-return__content">
        <div className="book-return__stage">
          <ComponenteBook3D
            currentBook={toComponenteBook3DData(book)}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            activeSheetIndex={activeSheetIndex}
            setActiveSheetIndex={setActiveSheetIndex}
            zoomMode={zoomMode}
            setZoomMode={setZoomMode}
            coverCanvas={null}
            showControls={false}
            showGuide={false}
            showSpreadIndicator={false}
          />
        </div>
      </div>
    </div>
  );
}
