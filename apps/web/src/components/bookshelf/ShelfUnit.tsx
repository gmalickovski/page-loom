import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import type { BookClickOrigin, PlannerBook } from "../../types/library";
import { BookSpine } from "./BookSpine";

interface ShelfUnitProps {
  books: PlannerBook[];
  onBookClick: (book: PlannerBook, origin: BookClickOrigin) => void;
  selectedBookId?: string;
  selectionClosing?: boolean;
  onOpenSelected?: (book: PlannerBook) => void;
  onDismissSelected?: () => void;
  scale?: number;
  gap?: number;
}

export function ShelfUnit({ books, onBookClick, selectedBookId, selectionClosing = false, onOpenSelected, onDismissSelected, scale = 1, gap = 4 }: ShelfUnitProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollAffordance, setScrollAffordance] = useState({ left: false, right: false });

  const updateScrollAffordance = () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const maxLeft = viewport.scrollWidth - viewport.clientWidth;
    setScrollAffordance({
      left: viewport.scrollLeft > 2,
      right: maxLeft - viewport.scrollLeft > 2,
    });
  };

  const scrollShelf = (direction: -1 | 1) => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    viewport.scrollBy({
      left: direction * Math.max(180, viewport.clientWidth * 0.56),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const id = window.requestAnimationFrame(updateScrollAffordance);
    window.addEventListener("resize", updateScrollAffordance);

    return () => {
      window.cancelAnimationFrame(id);
      window.removeEventListener("resize", updateScrollAffordance);
    };
  }, [books]);

  useEffect(() => {
    if (!selectedBookId || !viewportRef.current) return;

    // Encontra a lombada do livro selecionado e rola suavemente a estante para centralizá-lo
    const viewport = viewportRef.current;
    
    // Pequeno atraso para garantir que o DOM renderizou as novas classes de seleção
    const timer = window.setTimeout(() => {
      const selectedSpine = viewport.querySelector(".book-spine--selected");
      if (selectedSpine) {
        selectedSpine.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }, 50);

    return () => window.clearTimeout(timer);
  }, [selectedBookId]);

  return (
    <div className="shelf-unit" style={{ "--shelf-scale": scale } as CSSProperties}>
      <button
        className={`shelf-unit__arrow shelf-unit__arrow--left ${scrollAffordance.left ? "is-visible" : ""}`}
        type="button"
        aria-label="Rolar estante para a esquerda"
        aria-hidden={!scrollAffordance.left}
        tabIndex={scrollAffordance.left ? 0 : -1}
        onClick={() => scrollShelf(-1)}
      >
        <ChevronLeft size={17} />
      </button>
      <div className="shelf-unit__viewport" ref={viewportRef} onScroll={updateScrollAffordance}>
        <div className="shelf-unit__track">
          <div className="shelf-unit__books" style={{ gap, paddingLeft: Math.round(8 * scale), paddingRight: Math.round(8 * scale) }}>
            {books.map((book) => (
              <BookSpine
                key={book.id}
                book={book}
                onClick={(clickedBook, origin) => {
                  onBookClick(clickedBook, origin);
                }}
                scale={scale}
                selected={book.id === selectedBookId}
                closing={selectionClosing}
                onOpenSelected={onOpenSelected}
                onDismissSelected={onDismissSelected}
              />
            ))}
          </div>
          <div className="shelf-unit__plank">
            <span />
            <i />
          </div>
        </div>
      </div>
      <button
        className={`shelf-unit__arrow shelf-unit__arrow--right ${scrollAffordance.right ? "is-visible" : ""}`}
        type="button"
        aria-label="Rolar estante para a direita"
        aria-hidden={!scrollAffordance.right}
        tabIndex={scrollAffordance.right ? 0 : -1}
        onClick={() => scrollShelf(1)}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
