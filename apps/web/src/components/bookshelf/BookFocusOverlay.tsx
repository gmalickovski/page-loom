import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import type { BookClickOrigin, PlannerBook, ScreenName } from "../../types/library";
import ComponenteBook3D from "./ComponenteBook3D";
import { toComponenteBook3DData } from "./book3dData";

interface BookFocusOverlayProps {
  book: PlannerBook;
  books?: PlannerBook[];
  origin?: BookClickOrigin | null;
  closing?: boolean;
  settled?: boolean;
  pageClosing?: boolean;
  screen: ScreenName;
  onOpen: () => void;
  onEditCover?: () => void;
  onDismiss: () => void;
  onPageClosed: () => void;
  onSelectBook?: (book: PlannerBook) => void;
}

export function BookFocusOverlay({
  book,
  books = [],
  origin,
  closing = false,
  settled = false,
  pageClosing = false,
  screen,
  onOpen,
  onEditCover,
  onDismiss,
  onPageClosed,
  onSelectBook,
}: BookFocusOverlayProps) {
  const [entered, setEntered] = useState(settled);
  const [opening, setOpening] = useState(false);
  const [localBookOpen, setLocalBookOpen] = useState(false);
  const [activeSheetIndex, setActiveSheetIndex] = useState(1);
  const [zoomMode, setZoomMode] = useState<"book" | "page">("book");
  const [coverCanvas, setCoverCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (book.coverImage) {
      const img = new Image();
      img.onload = () => {
        const cv = document.createElement("canvas");
        cv.width = 1024;
        cv.height = 714;
        const ctx = cv.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, 1024, 714);
          setCoverCanvas(cv);
        }
      };
      img.src = book.coverImage;
    } else {
      setCoverCanvas(null);
    }
  }, [book.coverImage, book.id]);

  // Estados locais para controlar a transição horizontal suave de troca de livro
  const [slideState, setSlideState] = useState<"idle" | "slide-out" | "slide-in">("idle");
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right");

  const fromX = origin ? origin.x + origin.width / 2 - window.innerWidth / 2 : 0;
  const fromY = origin ? origin.y + origin.height / 2 - window.innerHeight / 2 : 28;
  const fromScale = origin ? Math.max(0.18, Math.min(0.42, origin.height / 300)) : 0.72;

  const metadata = useMemo(() => {
    return [
      book.createdAt ? `Criado ${formatBookDate(book.createdAt)}` : null,
      book.updatedAt ? `Editado ${formatBookDate(book.updatedAt)}` : null,
    ].filter(Boolean);
  }, [book.createdAt, book.updatedAt]);

  const handleOpen = () => setOpening(true);

  // Calcula navegação entre livros
  const currentIndex = useMemo(() => books.findIndex((b) => b.id === book.id), [books, book.id]);
  const hasLeft = currentIndex > 0;
  const hasRight = currentIndex >= 0 && currentIndex < books.length - 1;

  const handleNavigate = (direction: "left" | "right") => {
    if (slideState !== "idle" || !onSelectBook) return;

    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= books.length) return;

    const nextBook = books[targetIndex];

    setSlideDirection(direction);
    setSlideState("slide-out");

    // Etapa 1: Desliza o livro atual para fora
    setTimeout(() => {
      // Etapa 2: Altera o livro no estado pai
      onSelectBook(nextBook);

      // Etapa 3: Posiciona o novo livro instantaneamente fora da tela na direção oposta
      setSlideState("slide-in");

      // Etapa 4: Desliza o novo livro para o centro de forma ultra-suave
      setTimeout(() => {
        setSlideState("idle");
      }, 40);
    }, 220); // Duração condizente com a transição de slide-out
  };

  useEffect(() => {
    if (settled) {
      setEntered(true);
      return;
    }
    setEntered(false);
    const timer = window.setTimeout(() => {
      setEntered(true);
    }, 10);

    return () => {
      window.clearTimeout(timer);
    };
  }, [book.id, settled]);

  useEffect(() => {
    if (!opening) return;

    // Encurtado o tempo de transição para 1100ms para entrada super ágil no editor
    const timeout = window.setTimeout(onOpen, 1100);
    return () => window.clearTimeout(timeout);
  }, [onOpen, opening]);

  // Gerenciamento unificado e contínuo da fita de filme 3D
  useEffect(() => {
    if (screen === "planner") {
      setLocalBookOpen(true);
      setOpening(false); // reseta o trigger local ao entrar no editor
    } else if (pageClosing) {
      setLocalBookOpen(true);
      
      // Etapa 1: O livro em 3D fecha no centro da tela após 150ms
      const closeTimer = window.setTimeout(() => {
        setLocalBookOpen(false);
      }, 150);

      // Etapa 2: A animação termina e notifica o App.tsx após 1200ms
      const doneTimer = window.setTimeout(() => {
        onPageClosed();
      }, 1200);

      return () => {
        window.clearTimeout(closeTimer);
        window.clearTimeout(doneTimer);
      };
    } else {
      setLocalBookOpen(opening);
    }
  }, [screen, pageClosing, opening, onPageClosed]);

  return (
    <div
      className={`book-focus ${entered ? "is-entered" : ""} ${closing ? "is-closing" : ""} ${opening ? "is-opening" : ""} ${settled ? "is-settled" : ""} ${
        screen === "planner" ? "is-planner" : ""
      } ${pageClosing ? "is-page-closing" : ""}`}
      role="dialog"
      aria-label={`Livro selecionado: ${book.title}`}
    >
      <button className="book-focus__backdrop" type="button" aria-label="Cancelar selecao" onClick={opening || screen === "planner" || pageClosing ? undefined : onDismiss} />

      {/* Setas de navegação dinâmica sutil nas laterais */}
      {hasLeft && !opening && !pageClosing && screen !== "planner" && (
        <button
          className="btn-glass-circle book-focus__arrow book-focus__arrow--left"
          type="button"
          aria-label="Livro anterior"
          onClick={() => handleNavigate("left")}
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {hasRight && !opening && !pageClosing && screen !== "planner" && (
        <button
          className="btn-glass-circle book-focus__arrow book-focus__arrow--right"
          type="button"
          aria-label="Próximo livro"
          onClick={() => handleNavigate("right")}
        >
          <ChevronRight size={20} />
        </button>
      )}

      <div
        className={`book-focus__content book-focus__content--slide-${slideState} book-focus__content--dir-${slideDirection}`}
        style={{
          "--book-from-x": `${fromX}px`,
          "--book-from-y": `${fromY}px`,
          "--book-from-scale": fromScale,
        } as CSSProperties}
      >
        <div className="book-focus__title">
          <span>
            <strong>{book.title}</strong>
          </span>
          <button className="btn-glass-circle" type="button" aria-label="Fechar selecao" onClick={onDismiss}>
            &times;
          </button>
        </div>
        {metadata.length > 0 && <div className="book-focus__meta">{metadata.join(" - ")}</div>}
        <div className="book-focus__book3d">
          <ComponenteBook3D
            key={book.id} // Recriação limpa e perfeita do Three.js para renderizar as novas texturas da capa
            currentBook={toComponenteBook3DData(book)}
            isOpen={localBookOpen}
            setIsOpen={setOpening}
            activeSheetIndex={activeSheetIndex}
            setActiveSheetIndex={setActiveSheetIndex}
            zoomMode={zoomMode}
            setZoomMode={setZoomMode}
            coverCanvas={coverCanvas}
            showControls={false}
            showGuide={false}
            showSpreadIndicator={false}
          />
        </div>
        <div className="book-focus__actions">
          {onEditCover && (
            <button className="book-focus__edit" type="button" onClick={onEditCover} disabled={opening}>
              <Pencil size={15} />
              Editar capa
            </button>
          )}
          <button className="book-focus__open" type="button" onClick={handleOpen} disabled={opening}>
            Abrir
          </button>
        </div>
      </div>
    </div>
  );
}

function formatBookDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}
