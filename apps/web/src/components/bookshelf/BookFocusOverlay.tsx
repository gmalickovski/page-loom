import { useEffect, useState, useMemo, type CSSProperties } from "react";
import { ChevronLeft, ChevronRight, Pencil, X } from "lucide-react";
import type { BookClickOrigin, PlannerBook, ScreenName } from "../../types/library";
import ComponenteBook3D from "./ComponenteBook3D";
import { toComponenteBook3DData } from "./book3dData";
import { STICKERS } from "../../data/stickers";

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
    let active = true;
    const loadCover = async () => {
      if (book.coverImage) {
        const img = new Image();
        img.onload = () => {
          if (!active) return;
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
      } else if (book.coverDesignerItems && book.coverDesignerItems.length > 0) {
        const cv = await drawBookCoverToCanvas(book);
        if (active) {
          setCoverCanvas(cv);
        }
      } else {
        setCoverCanvas(null);
      }
    };
    loadCover();
    return () => {
      active = false;
    };
  }, [book.coverImage, book.coverDesignerItems, book.id]);

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
          <button className="btn-glass-circle book-focus__close-btn" type="button" aria-label="Fechar selecao" onClick={onDismiss}>
            <X size={14} />
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

function shadeColor(hex: string, percent: number) {
  if (hex.startsWith("hsl")) {
    try {
      const match = hex.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
      if (match) {
        const h = Number(match[1]);
        const s = Number(match[2]);
        const l = Number(match[3]);
        const newL = Math.max(0, Math.min(100, l + percent));
        return `hsl(${h}, ${s}%, ${newL}%)`;
      }
    } catch (e) {
      return hex;
    }
  }
  const num = parseInt(hex.replace("#", ""), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return (
    "#" +
    (
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

async function drawBookCoverToCanvas(book: PlannerBook): Promise<HTMLCanvasElement> {
  const spineWidth = book.pages === 80 ? 20 : book.pages === 160 ? 38 : 56;
  const totalWidth = 986 + spineWidth;
  
  const cv = document.createElement("canvas");
  const SCALE = 2;
  cv.width = totalWidth * SCALE;
  cv.height = 714 * SCALE;
  
  const ctx = cv.getContext("2d");
  if (!ctx) return cv;
  
  ctx.scale(SCALE, SCALE);
  
  ctx.fillStyle = book.color || "#C2773A";
  ctx.fillRect(0, 0, totalWidth, 714);
  
  const getPaperPattern = (c: CanvasRenderingContext2D) => {
    const pc = document.createElement("canvas");
    pc.width = 120;
    pc.height = 120;
    const pctx = pc.getContext("2d");
    if (pctx) {
      pctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      pctx.fillRect(0, 0, 120, 120);
      
      pctx.fillStyle = "rgba(0, 0, 0, 0.012)";
      for (let i = 0; i < 480; i++) {
        pctx.fillRect(Math.random() * 120, Math.random() * 120, 0.8, 0.8);
      }
      pctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let i = 0; i < 280; i++) {
        pctx.fillRect(Math.random() * 120, Math.random() * 120, 1.2, 1.2);
      }
      pctx.strokeStyle = "rgba(45, 36, 32, 0.015)";
      pctx.lineWidth = 0.45;
      for (let i = 0; i < 25; i++) {
        pctx.beginPath();
        const sx = Math.random() * 120;
        const sy = Math.random() * 120;
        const len = 3 + Math.random() * 12;
        const ang = Math.random() * Math.PI * 2;
        pctx.moveTo(sx, sy);
        pctx.lineTo(sx + Math.cos(ang) * len, sy + Math.sin(ang) * len);
        pctx.stroke();
      }
    }
    return c.createPattern(pc, 'repeat');
  };
  
  const pat = getPaperPattern(ctx);
  if (pat) {
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, totalWidth, 714);
  }
  
  const drawSpineJoint = (xPos: number) => {
    const jointGrad = ctx.createLinearGradient(xPos - 4, 0, xPos + 4, 0);
    jointGrad.addColorStop(0.0, "rgba(0, 0, 0, 0.12)");
    jointGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.15)");
    jointGrad.addColorStop(0.7, "rgba(255, 255, 255, 0.0)");
    jointGrad.addColorStop(1.0, "rgba(0, 0, 0, 0.18)");
    
    ctx.fillStyle = jointGrad;
    ctx.fillRect(xPos - 4, 0, 8, 714);
  };
  
  drawSpineJoint(493);
  drawSpineJoint(493 + spineWidth);
  
  const itemsList = book.coverDesignerItems || [];
  
  for (const item of itemsList) {
    ctx.save();
    ctx.translate(item.x, item.y);
    ctx.rotate((item.rotation * Math.PI) / 180);
    ctx.scale(item.scale, item.scale);
    
    if (item.type === "sticker" && item.stickerId) {
      const def = STICKERS.find((s) => s.id === item.stickerId);
      if (def) {
        const img = await new Promise<HTMLImageElement | null>((resolve) => {
          const tempImg = new Image();
          const blob = new Blob([def.svg], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          tempImg.onload = () => { URL.revokeObjectURL(url); resolve(tempImg); };
          tempImg.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
          tempImg.src = url;
        });
        
        if (img) {
          const imgSize = 80;
          const border = 13;
          const pad = 6;
          const offSize = imgSize + border * 2 + pad * 2;
          
          const sc = document.createElement('canvas');
          sc.width = offSize; sc.height = offSize;
          const sc2 = sc.getContext('2d')!;
          const cx2 = offSize / 2; const cy2 = offSize / 2;
          
          sc2.translate(cx2, cy2);
          
          sc2.shadowColor = "rgba(0,0,0,0.3)";
          sc2.shadowBlur = 4;
          sc2.shadowOffsetY = 2;
          
          sc2.beginPath();
          sc2.arc(0, 0, imgSize / 2 + border / 2, 0, Math.PI * 2);
          sc2.fillStyle = "#ffffff";
          sc2.fill();
          
          sc2.shadowColor = "transparent";
          sc2.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
          
          ctx.drawImage(sc, -offSize / 2, -offSize / 2, offSize, offSize);
        }
      }
    } else if (item.type === "label") {
      const shape = item.shape || "rounded";
      const background = item.background || "sticker";
      
      let bgStyle = background === "transparent" ? "transparent" : "#ffffff";
      let textStyle = item.color || "#1c1917";
      
      let fontStyle = "bold 13px sans-serif";
      if (item.font === "sans") {
        fontStyle = "bold 15px sans-serif";
      } else if (item.font === "mono") {
        fontStyle = "bold 14px monospace";
      } else {
        fontStyle = "bold 14px Georgia, serif";
      }
      
      ctx.font = fontStyle;
      const textWidth = ctx.measureText(item.name).width;
      const padX = 16;
      const padY = 9;
      let rectW = textWidth + padX * 2;
      let rectH = 16 + padY * 2;
      
      if (shape === "circular") {
        rectW = Math.max(rectW, rectH);
        rectH = rectW;
      }
      
      if (background !== "transparent") {
        ctx.fillStyle = bgStyle;
        ctx.beginPath();
        const r = shape === "rectangular"
          ? 0
          : shape === "pill"
            ? rectH / 2
            : shape === "circular"
              ? rectW / 2
              : 5;
        
        ctx.roundRect(-rectW / 2, -rectH / 2, rectW, rectH, r);
        ctx.fill();
        
        if (item.id === "default-spine-label") {
          ctx.strokeStyle = "transparent";
        } else {
          ctx.strokeStyle = "rgba(139, 110, 80, 0.25)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.roundRect(-rectW / 2, -rectH / 2, rectW, rectH, r);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      
      ctx.fillStyle = textStyle;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.name, 0, 1.5);
    }
    ctx.restore();
  }
  
  return cv;
}
