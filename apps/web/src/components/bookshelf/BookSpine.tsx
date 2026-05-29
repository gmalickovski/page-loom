import type { MouseEvent } from "react";
import type { BookClickOrigin, PlannerBook } from "../../types/library";
import { RusticLabel } from "./RusticLabel";

const widthByPages: Record<PlannerBook["pages"], number> = {
  80: 20,
  160: 38,
  240: 56,
};

const getSpineRatio = (pages: PlannerBook["pages"]) => {
  const spineWidth = pages === 80 ? 20 : pages === 160 ? 38 : 56;
  const totalWidth = 986 + spineWidth;
  return spineWidth / totalWidth;
};

interface BookSpineProps {
  book: PlannerBook;
  onClick: (book: PlannerBook, origin: BookClickOrigin) => void;
  scale?: number;
  selected?: boolean;
  closing?: boolean;
  showSelectionLabel?: boolean;
  onOpenSelected?: (book: PlannerBook) => void;
  onDismissSelected?: () => void;
}

export function BookSpine({ book, onClick, scale = 1, selected = false, closing = false, showSelectionLabel = false, onOpenSelected, onDismissSelected }: BookSpineProps) {
  const width = Math.round(widthByPages[book.pages] * scale);
  const height = Math.round(180 * scale);
  const shadowWidth = Math.max(3, Math.round(width * 0.14));
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    onClick(book, {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
    });
  };

  // Decide which image to use for the spine cover display
  // Priority: pre-cropped spine strip > full layout crop > no image
  const hasCustomCover = !!(book.coverSpineImage || book.coverImage);
  
  const spineStyle: React.CSSProperties = {
    backgroundColor: book.color,
  };

  if (book.coverSpineImage) {
    // Best case: use the pre-cropped spine-strip image, fills the spine perfectly
    spineStyle.backgroundImage = `url(${book.coverSpineImage})`;
    spineStyle.backgroundSize = "cover";
    spineStyle.backgroundPosition = "center center";
    spineStyle.backgroundRepeat = "no-repeat";
  } else if (book.coverImage) {
    // Fallback: use full layout but crop to spine section via background-position
    const spineWidth = book.pages === 80 ? 20 : book.pages === 160 ? 38 : 56;
    const totalW = 986 + spineWidth;
    const leftPercent = (493 / (totalW - spineWidth)) * 100;
    spineStyle.backgroundImage = `url(${book.coverImage})`;
    spineStyle.backgroundSize = `calc(100% / ${spineWidth / totalW}) 100%`;
    spineStyle.backgroundPosition = `${leftPercent}% center`;
    spineStyle.backgroundRepeat = "no-repeat";
  }

  return (
    <div
      className={`book-spine ${selected ? "book-spine--selected" : ""} ${selected && closing ? "book-spine--closing" : ""}`}
      style={{ width, height }}
    >
      {showSelectionLabel && (
        <div className="shelf-selection-label">
          <span>
            <strong>{book.title}</strong>
            {book.label && <small>{book.label}</small>}
          </span>
          {onOpenSelected && (
            <button type="button" onClick={() => onOpenSelected(book)}>
              Abrir
            </button>
          )}
          {onDismissSelected && (
            <button className="shelf-selection-label__close" type="button" aria-label="Fechar selecao" onClick={onDismissSelected}>
              ×
            </button>
          )}
        </div>
      )}
      <button
        className="book-spine__cover"
        type="button"
        onClick={handleClick}
        style={spineStyle}
        aria-label={`Selecionar ${book.title}`}
      >
        <span className="book-spine__shadow" style={{ width: shadowWidth, backgroundColor: book.dark }} />
        {!hasCustomCover && <RusticLabel title={book.title} spineWidth={width} pages={book.pages} scale={scale} />}
      </button>
    </div>
  );
}
