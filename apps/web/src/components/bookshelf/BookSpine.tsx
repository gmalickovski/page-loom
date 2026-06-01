import type { MouseEvent } from "react";
import type { BookClickOrigin, PlannerBook } from "../../types/library";

const widthByPages: Record<PlannerBook["pages"], number> = {
  80: 12,
  160: 20,
  240: 30,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

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
  const shadowWidth = Math.max(2, Math.round(width * 0.12));
  const jointOffset = Math.max(1, Math.round(width * 0.11));
  const jointWidth = Math.max(1.5, Math.round(width * 0.1));

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
  const hasCustomCover = !!(book.coverSpineImage || book.coverImage);
  
  const spineStyle: React.CSSProperties = {
    backgroundColor: book.color,
  };

  if (book.coverSpineImage) {
    spineStyle.backgroundImage = `url(${book.coverSpineImage})`;
    spineStyle.backgroundSize = "cover";
    spineStyle.backgroundPosition = "center center";
    spineStyle.backgroundRepeat = "no-repeat";
  } else if (book.coverImage) {
    const spineWidth = book.pages === 80 ? 20 : book.pages === 160 ? 38 : 56;
    const totalW = 986 + spineWidth;
    const leftPercent = (493 / (totalW - spineWidth)) * 100;
    spineStyle.backgroundImage = `url(${book.coverImage})`;
    spineStyle.backgroundSize = `calc(100% / ${spineWidth / totalW}) 100%`;
    spineStyle.backgroundPosition = `${leftPercent}% center`;
    spineStyle.backgroundRepeat = "no-repeat";
  }

  // Find custom spine label from cover designer items
  const spineLabelItem = book.coverDesignerItems?.find(
    (item) => item.type === "label" && (item.id === "default-spine-label" || (item.x >= 493 - 15 && item.x <= 493 + (book.pages === 80 ? 20 : book.pages === 160 ? 38 : 56) + 15))
  );

  // Fallback to default spine label if none exists
  const spineLabel = spineLabelItem || {
    id: "default-spine-label",
    type: "label",
    name: book.title.toUpperCase(),
    shape: "rectangular" as const,
    background: "sticker" as const,
    color: "#1c1917",
    font: "sans" as const,
    scale: 0.9,
  };

  const renderSpineLabel = () => {
    if (hasCustomCover) return null;

    const fontStyle = 
      spineLabel.font === "sans" 
        ? "'Outfit', 'Inter', sans-serif" 
        : spineLabel.font === "mono" 
          ? "'Fira Code', 'Courier New', monospace" 
          : "'Cormorant Garamond', 'Georgia', serif";

    const borderRadius = 
      spineLabel.shape === "rounded" 
        ? "3px" 
        : spineLabel.shape === "circular" 
          ? "50%" 
          : spineLabel.shape === "pill" 
            ? "9999px" 
            : "0px";

    const backgroundStyle = 
      spineLabel.background === "transparent" 
        ? "transparent" 
        : "#ffffff";

    const borderStyle = "none";

    const shadowStyle = "none";

    const padding = (book.pages === 80 ? 2 : book.pages === 160 ? 3 : 4) * scale;
    const labelWidth = Math.max(width - padding * 2, 4);
    
    // Height scaled down to look perfectly proportionate to the new thin spine
    const labelHeight = Math.round(clamp(spineLabel.name.length * 6.5 * scale * (spineLabel.scale || 0.9), 46 * scale, 126 * scale));

    const labelStyle: React.CSSProperties = {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(0deg)",
      zIndex: 3,
      width: labelWidth,
      height: labelHeight,
      backgroundColor: backgroundStyle,
      border: borderStyle,
      borderRadius: borderRadius,
      boxShadow: shadowStyle,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      boxSizing: "border-box",
    };

    const textStyle: React.CSSProperties = {
      color: spineLabel.color || "#1c1917",
      fontFamily: fontStyle,
      fontWeight: "bold",
      fontSize: `${Math.max(5.4, Math.min(8.6, 7.6 * scale * (spineLabel.scale || 0.9)))}px`,
      letterSpacing: "0.02em",
      writingMode: "vertical-rl",
      textOrientation: "mixed",
      transform: "rotate(180deg)",
      whiteSpace: "nowrap",
      textAlign: "center",
      maxHeight: "92%",
      maxWidth: "100%",
    };

    return (
      <div style={labelStyle}>
        <span style={textStyle}>{spineLabel.name}</span>
      </div>
    );
  };

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
        {/* Physical 3D rounded joint creases ("dois canos de abertura") - scaled inline to match thin width perfectly */}
        <span className="book-spine__joint book-spine__joint--left" style={{ left: `${jointOffset}px`, width: `${jointWidth}px` }} />
        <span className="book-spine__joint book-spine__joint--right" style={{ right: `${jointOffset}px`, width: `${jointWidth}px` }} />
        {renderSpineLabel()}
      </button>
    </div>
  );
}
