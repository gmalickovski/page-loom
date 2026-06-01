import { BookOpen, Check, ChevronRight, FileText, Palette, Plus, Smile, Type, Tag, Settings, HelpCircle, ArrowRight, ArrowLeft, Sparkles, RotateCw, X, Folder, Calendar, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { pages, shelves } from "../data/demoLibrary";
import ComponenteBook3D from "../components/bookshelf/ComponenteBook3D";
import { toComponenteBook3DData } from "../components/bookshelf/book3dData";
import { ShelfUnit } from "../components/bookshelf/ShelfUnit";
import { DailyPlanner } from "../components/planner/DailyPlanner";
import {
  PageInteriorDesigner,
  createDefaultInteriorPlan,
  createPagesFromInteriorPlan,
  getInteriorPlanPageCount,
  normalizeInteriorPlan,
} from "../components/planner/PageInteriorDesigner";
import { BottomSheetModal } from "../components/layout/BottomSheetModal";
import type { BookClickOrigin, CoverDesignerItem, PlannerBook, PlannerInteriorPlan, PlannerInteriorTemplate, PlannerPage, Shelf } from "../types/library";
import { STICKERS } from "../data/stickers";
import type { StickerDef } from "../data/stickers";

export function BookCoverThumbnail({ book, className, style }: { book: PlannerBook; className: string; style?: React.CSSProperties }) {
  const hasCoverImage = !!(book.coverFrontImage || book.coverImage);
  
  // Find any custom designed label on the front cover from designer items
  const spineWidth = book.pages === 80 ? 20 : book.pages === 160 ? 38 : 56;
  const frontCoverOffset = 493 + spineWidth;
  const frontLabel = book.coverDesignerItems?.find(
    (item) => item.type === "label" && (item.id === "default-front-label" || item.x > frontCoverOffset)
  );

  const bgStyle: React.CSSProperties = {
    backgroundColor: book.color,
    position: "relative",
    overflow: "hidden",
    boxShadow: "2px 2px 6px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)",
    border: "1px solid rgba(0,0,0,0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "2px 5px 5px 2px",
    width: "100%",
    height: "100%",
    ...style
  };

  if (book.coverFrontImage) {
    bgStyle.backgroundImage = `url(${book.coverFrontImage})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  } else if (book.coverImage) {
    bgStyle.backgroundImage = `url(${book.coverImage})`;
    bgStyle.backgroundSize = "200% 100%";
    bgStyle.backgroundPosition = "right center";
  }

  // Calculate coordinates if custom front label exists to show pixel-perfect miniature label
  const renderCustomFrontLabel = () => {
    if (!frontLabel) return null;
    
    // Position relative to front cover canvas size (493 wide by 714 high)
    const relX = (frontLabel.x - frontCoverOffset) / 493;
    const relY = frontLabel.y / 714;
    
    const shape = frontLabel.shape || "rounded";
    const background = frontLabel.background || "sticker";
    
    const borderRadius = 
      shape === "pill" 
        ? "999px" 
        : shape === "circular" 
          ? "50%" 
          : shape === "rounded" 
            ? "1.5px" 
            : "0px";
            
    const borderStyle = background === "transparent" ? "none" : "0.5px solid rgba(0, 0, 0, 0.08)";
    const bgStyleStyle = background === "transparent" ? "transparent" : "#ffffff";
    const fontStyle = frontLabel.font === "sans" ? "sans-serif" : frontLabel.font === "mono" ? "monospace" : "Georgia, serif";
    
    return (
      <span style={{
        position: "absolute",
        left: `${relX * 100}%`,
        top: `${relY * 100}%`,
        transform: `translate(-50%, -50%) rotate(${frontLabel.rotation || 0}deg)`,
        backgroundColor: bgStyleStyle,
        border: borderStyle,
        borderRadius: borderRadius,
        padding: "1px 2px",
        fontSize: "4.5px", // elegant miniature visual
        fontWeight: "bold",
        color: frontLabel.color || "#1c1917",
        fontFamily: fontStyle,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        boxShadow: background === "transparent" ? "none" : "0.5px 0.5px 1.5px rgba(0,0,0,0.06)",
        maxWidth: "80%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
      }}>
        {frontLabel.name}
      </span>
    );
  };

  return (
    <span className={className} style={bgStyle}>
      {/* 3D joint crease effects representing physical "canos de abertura" */}
      <span style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "3px",
        width: "2.5px",
        background: "linear-gradient(to right, rgba(0,0,0,0.12) 0%, rgba(255,255,255,0.15) 40%, rgba(0,0,0,0.15) 100%)",
        pointerEvents: "none"
      }} />
      <span style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        width: "3px",
        background: "linear-gradient(to right, rgba(0,0,0,0.2), transparent)",
        pointerEvents: "none"
      }} />

      {/* Miniature styled label inside if no custom cover image exists */}
      {!hasCoverImage && (
        frontLabel ? renderCustomFrontLabel() : (
          <span style={{
            padding: "1px 3px",
            border: "0.5px dashed rgba(45,36,32,0.22)",
            borderRadius: "1px",
            backgroundColor: "#fffdfa",
            fontSize: "6.5px",
            fontWeight: 800,
            color: "#4a453f",
            fontFamily: "Georgia, serif",
            maxWidth: "84%",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            boxShadow: "1px 1px 2px rgba(0,0,0,0.05)",
            transform: "rotate(-0.5deg)",
            pointerEvents: "none"
          }}>
            {book.title.substring(0, 10)}
          </span>
        )
      )}
    </span>
  );
}

export function LibraryScreen({
  compact,
  onShelfClick,
  onBookClick,
  selectedBookId,
  selectedShelfId,
  selectionClosing,
  onOpenSelected,
  onDismissSelected,
  onCreateBook,
}: {
  compact: boolean;
  onShelfClick: (shelf: Shelf) => void;
  onBookClick: (shelf: Shelf, book: PlannerBook, origin: BookClickOrigin) => void;
  selectedBookId?: string;
  selectedShelfId?: string;
  selectionClosing?: boolean;
  onOpenSelected?: (shelf: Shelf, book: PlannerBook) => void;
  onDismissSelected?: () => void;
  onCreateBook: () => void;
}) {
  return (
    <main className={`screen screen-library ${compact ? "screen--compact" : ""}`}>
      <div className="screen__headline">
        <div>
          <h2>Minha Biblioteca</h2>
          <p>quarta-feira, 13 de maio</p>
        </div>
        <button className="screen__headline-action" type="button" onClick={onCreateBook}>
          <Plus size={18} />
          Novo book
        </button>
      </div>
      {shelves.map((shelf) => (
        <section className={`library-section ${selectedShelfId === shelf.id ? "is-focused" : ""}`} key={shelf.id}>
          <header>
            <h3>{shelf.name}</h3>
            <button type="button" onClick={() => onShelfClick(shelf)}>
              ver tudo
            </button>
          </header>
          <div className="library-section__shelf">
            <ShelfUnit
              books={shelf.books}
              onBookClick={(book, origin) => onBookClick(shelf, book, origin)}
              selectedBookId={selectedShelfId === shelf.id ? selectedBookId : undefined}
              selectionClosing={selectedShelfId === shelf.id ? selectionClosing : false}
              onOpenSelected={onOpenSelected ? (book) => onOpenSelected(shelf, book) : undefined}
              onDismissSelected={onDismissSelected}
              scale={compact ? 0.72 : 0.9}
              gap={compact ? 3 : 4}
            />
          </div>
        </section>
      ))}
    </main>
  );
}

export function ShelfDetailScreen({
  shelf,
  compact,
  onBookClick,
  selectedBookId,
  selectionClosing,
  onOpenSelected,
  onDismissSelected,
  onCreateBook,
}: {
  shelf: Shelf;
  compact: boolean;
  onBookClick: (book: PlannerBook, origin: BookClickOrigin) => void;
  selectedBookId?: string;
  selectionClosing?: boolean;
  onOpenSelected?: (book: PlannerBook) => void;
  onDismissSelected?: () => void;
  onCreateBook: () => void;
}) {
  const [viewMode, setViewMode] = useState<"shelf" | "list">("shelf");

  return (
    <main className={`screen screen-shelf ${compact ? "screen--compact" : ""}`}>
      <div className="screen__headline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h2>{shelf.name}</h2>
          <p>{shelf.books.length} {shelf.books.length === 1 ? "livro" : "livros"}</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Segmented control to toggle viewMode */}
          <div className="segmented-control" style={{ display: 'flex', gap: '4px', background: 'var(--color-bg-alt)', padding: '4px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <button
              type="button"
              onClick={() => setViewMode("shelf")}
              style={{
                border: '0',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === "shelf" ? 'var(--color-accent)' : 'transparent',
                color: viewMode === "shelf" ? '#ffffff' : 'var(--color-text)',
                transition: 'all 0.2s',
              }}
            >
              Estante
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              style={{
                border: '0',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                background: viewMode === "list" ? 'var(--color-accent)' : 'transparent',
                color: viewMode === "list" ? '#ffffff' : 'var(--color-text)',
                transition: 'all 0.2s',
              }}
            >
              Lista
            </button>
          </div>

          <button className="screen__headline-action" type="button" onClick={onCreateBook}>
            <Plus size={18} />
            Novo book
          </button>
        </div>
      </div>

      {viewMode === "shelf" ? (
        <div className={`screen-shelf__unit ${selectedBookId ? "is-focused" : ""}`}>
          <ShelfUnit
            books={shelf.books}
            onBookClick={onBookClick}
            selectedBookId={selectedBookId}
            selectionClosing={selectionClosing}
            onOpenSelected={onOpenSelected}
            onDismissSelected={onDismissSelected}
            scale={compact ? 0.82 : 1}
            gap={compact ? 4 : 6}
          />
        </div>
      ) : (
        <section className="book-list" style={{ padding: '12px 0' }}>
          <h3>Livros</h3>
          <div style={{ display: 'grid', gridTemplateColumns: compact ? '1fr' : '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            {shelf.books.map((book) => (
              <button
                type="button"
                key={book.id}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  onBookClick(book, { x: rect.left, y: rect.top, width: rect.width, height: rect.height });
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1.5px dashed var(--color-border)',
                  background: 'var(--color-bg-alt)',
                  width: '100%',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <BookCoverThumbnail 
                  book={book} 
                  className="book-list__thumb" 
                  style={{ width: '40px', height: '56px', flexShrink: 0 }} 
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <strong style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text)' }}>
                    {book.title}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    {book.pages} páginas • {book.label || 'Padrão'}
                  </span>
                </div>
                <ChevronRight size={18} style={{ color: 'var(--color-muted)' }} />
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export function BookContentsScreen({
  book,
  compact,
  onPageClick,
}: {
  book: PlannerBook;
  compact: boolean;
  onPageClick: (page: PlannerPage) => void;
}) {
  return (
    <main className={`screen screen-book ${compact ? "screen--compact" : ""}`}>
      <section className="book-card">
        <BookCoverThumbnail book={book} className="book-card__cover" />
        <div>
          <h2>{book.title}</h2>
          {book.label && <p>{book.label}</p>}
          <small>{pages.length} paginas</small>
        </div>
      </section>

      <section className="book-list">
        <h3>Paginas</h3>
        {pages.map((page) => (
          <button type="button" key={page.id} onClick={() => onPageClick(page)}>
            <span className="book-list__page">
              <FileText size={17} />
            </span>
            <strong>
              {page.title}
              <small>
                {page.date} · {page.template}
              </small>
            </strong>
            <ChevronRight size={18} />
          </button>
        ))}
        <button className="book-list__add" type="button">
          <Plus size={18} />
          Nova pagina
        </button>
      </section>
    </main>
  );
}

import { BookOpenPlanner } from "../components/planner/BookOpenPlanner";

export function PlannerScreen({
  book,
  activePage,
  compact,
  onNavigatePage,
  onUpdateBookPages,
}: {
  book: PlannerBook;
  activePage: PlannerPage | null;
  compact: boolean;
  onNavigatePage: (page: PlannerPage) => void;
  onUpdateBookPages: (pages: PlannerPage[]) => void;
}) {
  return (
    <main className={`screen screen-planner ${compact ? "screen--compact" : ""}`}>
      <BookOpenPlanner
        book={book}
        activePage={activePage}
        compact={compact}
        onNavigatePage={onNavigatePage}
        onUpdateBookPages={onUpdateBookPages}
      />
    </main>
  );
}

type DesignerItem = CoverDesignerItem;

export function CreateBookScreen({
  compact,
  shelves = [],
  templates = [],
  preselectedShelfId,
  editingBook,
  onDone,
}: {
  compact: boolean;
  shelves: Shelf[];
  templates?: PlannerInteriorTemplate[];
  preselectedShelfId?: string;
  editingBook?: PlannerBook | null;
  onDone: (book: PlannerBook) => void;
}) {
  const isEditingExistingBook = Boolean(editingBook);
  const [title, setTitle] = useState(editingBook?.title ?? "Meu Novo Planner");
  const [description, setDescription] = useState(editingBook?.description ?? "Caderno rústico para anotações e planejamento pessoal.");
  const [isEditingCover, setIsEditingCover] = useState(isEditingExistingBook);
  
  const [pages, setPages] = useState<PlannerBook["pages"]>(editingBook?.pages ?? 240); // default to 240 pages for agenda spine size
  const [color, setColor] = useState(editingBook?.color ?? "#8EA898");
  const [hue, setHue] = useState(140); // default green hue slider
  
  const [selectedShelfId, setSelectedShelfId] = useState(editingBook?.shelfId || preselectedShelfId || (shelves.length > 0 ? shelves[0].id : ""));
  const [selectedTemplate, setSelectedTemplate] = useState<"agenda_2026" | "notes_notebook" | "custom_planner">(
    editingBook?.templateType === "notes_notebook" ? "notes_notebook" : editingBook?.templateType === "custom_planner" ? "custom_planner" : "agenda_2026"
  );
  const [interiorSource, setInteriorSource] = useState<"standard" | "saved" | "custom">(editingBook?.templateType === "custom_planner" ? "custom" : "standard");
  const [selectedSavedTemplateId, setSelectedSavedTemplateId] = useState<string | null>(null);
  const [hasEditedInteriorPlan, setHasEditedInteriorPlan] = useState(Boolean(editingBook?.interiorPlan));
  const [interiorPlan, setInteriorPlan] = useState<PlannerInteriorPlan>(
    editingBook?.interiorPlan ?? createDefaultInteriorPlan(editingBook?.pages ?? 240, editingBook?.templateType ?? "agenda_2026")
  );
  const [createStep, setCreateStep] = useState(isEditingExistingBook ? 4 : 0);

  const [activeTab, setActiveTab] = useState<"colors" | "stickers" | "labels">("colors");
  const [items, setItems] = useState<DesignerItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  
  const [show3DPreview, setShow3DPreview] = useState(false);
  const [viewFocus, setViewFocus] = useState<"front" | "spine" | "back">("front");
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [modalTabSnapshots, setModalTabSnapshots] = useState<Record<string, string>>({});
  const [stickerUsage, setStickerUsage] = useState<Record<string, number>>({});
  const [selectedStickerIds, setSelectedStickerIds] = useState<string[]>([]);
  const [isStickerPickerOpen, setIsStickerPickerOpen] = useState(false);
  const [draggedSticker, setDraggedSticker] = useState<{ def: StickerDef; x: number; y: number } | null>(null);
  
  // States for Tag Label Creator
  const [labelText, setLabelText] = useState("");
  const [labelShape, setLabelShape] = useState<"rectangular" | "rounded" | "circular" | "pill">("rounded");
  const [labelBackground, setLabelBackground] = useState<"transparent" | "sticker">("sticker");
  const [labelFont, setLabelFont] = useState<"serif" | "sans" | "mono">("serif");
  const [labelColor, setLabelColor] = useState("#1c1917");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [activeLabelSnapshot, setActiveLabelSnapshot] = useState("");
  
  const designerRef = useRef<HTMLDivElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement>(null);
  const suppressStickerClickRef = useRef(false);
  // Cache of pre-loaded SVG HTMLImageElements keyed by sticker id
  const stickerImgCache = useRef<Map<string, HTMLImageElement>>(new Map());

  // Helper: load an SVG string as an HTMLImageElement (cached)
  const loadStickerImage = useCallback((def: StickerDef): Promise<HTMLImageElement> => {
    const cached = stickerImgCache.current.get(def.id);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve, reject) => {
      const img = new Image();
      const blob = new Blob([def.svg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      img.onload = () => { URL.revokeObjectURL(url); stickerImgCache.current.set(def.id, img); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('SVG load failed')); };
      img.src = url;
    });
  }, []);

  // Dynamic spine calculations based on chosen page count
  const spineWidth = pages === 80 ? 20 : pages === 160 ? 38 : 56;
  const totalWidth = 986 + spineWidth;
  const tabSignature = useMemo(() => {
    if (activeTab === "colors") return JSON.stringify({ color });
    if (activeTab === "stickers") return JSON.stringify({ items: items.filter(i => i.type === "sticker").map(({ id: _id, ...item }) => item) });
    if (activeTab === "labels") return JSON.stringify({ items: items.filter(i => i.type === "label").map(({ id: _id, ...item }) => item) });
    return "";
  }, [color, items, activeTab]);

  const hasModalChanges = (!compact || isToolsModalOpen) && modalTabSnapshots[activeTab] !== undefined && modalTabSnapshots[activeTab] !== tabSignature;

  const currentLabelSignature = useMemo(() => JSON.stringify({
    text: labelText,
    shape: labelShape,
    background: labelBackground,
    font: labelFont,
    color: labelColor
  }), [labelText, labelShape, labelBackground, labelFont, labelColor]);

  const hasActiveLabelChanges = activeLabelSnapshot !== "" && activeLabelSnapshot !== currentLabelSignature;

  useEffect(() => {
    if (!compact && Object.keys(modalTabSnapshots).length === 0) {
      setModalTabSnapshots({
        colors: JSON.stringify({ color }),
        stickers: JSON.stringify({ items: items.filter(i => i.type === "sticker").map(({ id: _id, ...item }) => item) }),
        labels: JSON.stringify({ items: items.filter(i => i.type === "label").map(({ id: _id, ...item }) => item) })
      });
    }
  }, [compact, modalTabSnapshots, color, items]);

  // Generate preview object
  const preview = useMemo<PlannerBook>(() => {
    const dark = shadeColor(color, -18);
    return {
      id: `book-${Date.now()}`,
      title: title || "Meu Diário",
      pages,
      color,
      dark,
      label: pages === 80 ? "Leve" : pages === 160 ? "Padrao" : "Master",
      createdAt: new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
      updatedAt: new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
      description: description || "Sem descrição",
    };
  }, [color, pages, title, description]);

  // Default color presets
  const presets = ["#C2773A", "#8EA898", "#7E8FA0", "#C9A4A0", "#8B6F4E", "#52616B"];

  // Initialize default labels on mount
  useEffect(() => {
    if (editingBook?.coverDesignerItems?.length) {
      setItems(editingBook.coverDesignerItems);
      return;
    }

    // Add default Title label on Front Cover (X relative to totalWidth)
    const defaultCoverLabel: DesignerItem = {
      id: "default-front-label",
      type: "label",
      name: title.toUpperCase(),
      x: Math.round(493 + spineWidth + 246.5), // center of front cover
      y: 260,
      scale: 1.2,
      rotation: 0,
      shape: "rectangular",
      background: "sticker",
      color: "#1c1917",
      font: "serif",
    };
    
    // Add default spine vertical text (centered on spine)
    const defaultSpineLabel: DesignerItem = {
      id: "default-spine-label",
      type: "label",
      name: title.toUpperCase(),
      x: Math.round(493 + spineWidth / 2), // center of spine
      y: 357,
      scale: 0.9,
      rotation: -90, // vertical
      shape: "rectangular",
      background: "sticker",
      color: "#1c1917",
      font: "sans",
    };

    setItems([defaultCoverLabel, defaultSpineLabel]);
  }, []);

  // Update default cover and spine labels dynamically when user types new title
  useEffect(() => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === "default-front-label") {
          return { ...item, name: title.toUpperCase() };
        }
        if (item.id === "default-spine-label") {
          return { ...item, name: title.toUpperCase() };
        }
        return item;
      })
    );
  }, [title]);

  // Redraw off-screen canvas whenever items, color, title, or spine width update
  useEffect(() => {
    const canvas = offscreenCanvasRef.current;
    if (canvas) {
      drawCanvas(canvas, color, items);
    }
  }, [color, items, title, spineWidth, isEditingCover]);

  // Listen to Backspace/Delete key to remove active element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeItemId) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteItem(activeItemId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItemId]);

  // Pre-load all sticker SVG images so canvas renders are crisp
  useEffect(() => {
    STICKERS.forEach((def) => loadStickerImage(def).catch(() => {}));
  }, [loadStickerImage]);

  const getPaperPattern = (ctx: CanvasRenderingContext2D) => {
    if (!(window as any).__paperPattern) {
      const pc = document.createElement("canvas");
      pc.width = 256;
      pc.height = 256;
      const pctx = pc.getContext("2d")!;
      const imgData = pctx.getImageData(0, 0, 256, 256);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const isWhite = Math.random() > 0.5;
        data[i] = isWhite ? 255 : 0;
        data[i+1] = isWhite ? 255 : 0;
        data[i+2] = isWhite ? 255 : 0;
        // Extremely faint noise for premium paper look
        data[i+3] = Math.random() * 14; 
      }
      pctx.putImageData(imgData, 0, 0);
      
      // Random subtle fibers
      for (let i = 0; i < 600; i++) {
        pctx.strokeStyle = Math.random() > 0.5 ? `rgba(255,255,255,${Math.random() * 0.06})` : `rgba(0,0,0,${Math.random() * 0.06})`;
        pctx.lineWidth = Math.random() * 0.8 + 0.2;
        pctx.beginPath();
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        pctx.moveTo(x, y);
        pctx.lineTo(x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12);
        pctx.stroke();
      }
      (window as any).__paperPattern = ctx.createPattern(pc, 'repeat');
    }
    return (window as any).__paperPattern;
  };

  const drawCanvas = async (cv: HTMLCanvasElement, coverBg: string, itemsList: DesignerItem[]) => {
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    
    // HIGH-RES TEXTURE: 3X scaling to ensure extremely crisp rendering when zooming in the 3D model!
    const SCALE = 3;
    
    // Set dynamic canvas width to match exactly the physical ratio
    cv.width = totalWidth * SCALE;
    cv.height = 714 * SCALE;
    
    // Scale the context so all the mathematical drawing logic remains identical
    ctx.scale(SCALE, SCALE);
    
    // Draw background color
    ctx.fillStyle = coverBg;
    ctx.fillRect(0, 0, totalWidth, 714);
    
    // Premium textured details (Realistic Paper/Cardboard)
    ctx.globalCompositeOperation = 'source-over';
    const pat = getPaperPattern(ctx);
    if (pat) {
      ctx.fillStyle = pat;
      ctx.fillRect(0, 0, totalWidth, 714);
    }
    
    // Draw "dois canos de abertura" (double vertical joint creases) running down the spine edges
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
    
    // Draw designer items
    itemsList.forEach((item) => {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(item.scale, item.scale);
      
      if (item.type === "sticker" && item.stickerId) {
        // Render as realistic flat vinyl-cut sticker with thick white border + drop shadow
        const def = STICKERS.find((s) => s.id === item.stickerId);
        const cachedImg = def ? stickerImgCache.current.get(def.id) : undefined;

        if (cachedImg) {
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
          sc2.drawImage(cachedImg, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
          
          ctx.drawImage(sc, -offSize / 2, -offSize / 2, offSize, offSize);
        } else if (def) {
          // Image not loaded yet — load and trigger redraw
          loadStickerImage(def).then(() => {
            const canvas = offscreenCanvasRef.current;
            if (canvas) drawCanvas(canvas, coverBg, itemsList);
          });
        }
      } else if (item.type === "label") {
        // Fallbacks for backward compatibility
        const shape = item.shape || "rounded";
        const background = item.background || (item.style === "leather" ? "transparent" : "sticker");
        
        let bgStyle = background === "transparent" ? "transparent" : "#ffffff";
        let textStyle = item.color || "#1c1917";
        if (item.style === "leather" && !item.color) {
          textStyle = shadeColor(coverBg, 45); // natural lighter print contrast for leather
        }
        
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

        // Draw background if not transparent
        if (background !== "transparent") {
          ctx.fillStyle = bgStyle;
          ctx.beginPath();
          const r = shape === "rectangular"
            ? 0
            : shape === "pill"
              ? rectH / 2
              : shape === "circular"
                ? rectW / 2
                : 5; // rounded (default)
          ctx.roundRect(-rectW / 2, -rectH / 2, rectW, rectH, r);
          ctx.fill();
          
          // Draw border
          ctx.strokeStyle = "rgba(139, 110, 80, 0.25)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.roundRect(-rectW / 2, -rectH / 2, rectW, rectH, r);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        
        // Text
        ctx.fillStyle = textStyle;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(item.name, 0, 1.5);
      }
      ctx.restore();
    });
    
    // Dispatch event so the 3D View knows exactly when to securely upload the new 4K texture to VRAM!
    window.dispatchEvent(new Event('cover-applied'));
  };

  // Resize-only handler (scales uniformly from center)
  const handleResizePointerDown = (e: React.PointerEvent<HTMLDivElement>, item: DesignerItem) => {
    e.stopPropagation();
    e.preventDefault();

    const designerEl = designerRef.current;
    if (!designerEl) return;
    const rect = designerEl.getBoundingClientRect();

    const itemScreenX = rect.left + (item.x / totalWidth) * rect.width;
    const startDist = Math.abs(e.clientX - itemScreenX);
    const startScale = item.scale;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentDist = Math.abs(moveEvent.clientX - itemScreenX);
      const scaleFactor = currentDist / startDist;
      
      setIsDirty(true);
      setItems((current) =>
        current.map((it) => {
          if (it.id === item.id) {
            let nextScale = Math.max(0.5, Math.min(3, startScale * scaleFactor));
            if (it.type === "label" && it.x > 493 && it.x <= 493 + spineWidth) {
              const maxSpineScale = spineWidth === 20 ? 0.5 : spineWidth === 38 ? 0.8 : 0.9;
              nextScale = Math.min(nextScale, maxSpineScale);
            }
            return { ...it, scale: nextScale };
          }
          return it;
        })
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleElementPointerDown = (e: React.PointerEvent<HTMLDivElement>, item: DesignerItem) => {
    e.stopPropagation();
    setActiveItemId(item.id);

    const designerEl = designerRef.current;
    if (!designerEl) return;
    const rect = designerEl.getBoundingClientRect();

    const startX = e.clientX;
    const startY = e.clientY;
    const itemStartX = item.x;
    const itemStartY = item.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      const designDx = (dx / rect.width) * totalWidth;
      const designDy = (dy / rect.height) * 714;

      setIsDirty(true);
      setItems((current) =>
        current.map((it) => {
          if (it.id === item.id) {
            const nextX = Math.round(Math.max(0, Math.min(totalWidth, itemStartX + designDx)));
            const nextY = Math.round(Math.max(0, Math.min(714, itemStartY + designDy)));
            let nextScale = it.scale;
            if (it.type === "label" && nextX > 493 && nextX <= 493 + spineWidth) {
              const maxSpineScale = spineWidth === 20 ? 0.5 : spineWidth === 38 ? 0.8 : 0.9;
              nextScale = Math.min(nextScale, maxSpineScale);
            }
            return {
              ...it,
              x: nextX,
              y: nextY,
              scale: nextScale
            };
          }
          return it;
        })
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleRotatePointerDown = (e: React.PointerEvent<HTMLDivElement>, item: DesignerItem) => {
    e.stopPropagation();
    e.preventDefault();

    const designerEl = designerRef.current;
    if (!designerEl) return;
    const rect = designerEl.getBoundingClientRect();

    const itemCenterX = rect.left + (item.x / totalWidth) * rect.width;
    const itemCenterY = rect.top + (item.y / 714) * rect.height;

    const startAngle = Math.atan2(e.clientY - itemCenterY, e.clientX - itemCenterX);
    const startRotation = item.rotation;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const currentAngle = Math.atan2(moveEvent.clientY - itemCenterY, moveEvent.clientX - itemCenterX);
      const angleDiff = ((currentAngle - startAngle) * 180) / Math.PI;

      setIsDirty(true);
      setItems((current) =>
        current.map((it) =>
          it.id === item.id
            ? { ...it, rotation: Math.round(startRotation + angleDiff) }
            : it
        )
      );
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const addSticker = (def: StickerDef, position?: { x: number; y: number }) => {
    setStickerUsage((current) => ({
      ...current,
      [def.id]: (current[def.id] ?? 0) + 1,
    }));
    setSelectedStickerIds((current) => (
      current.includes(def.id) ? current : [...current, def.id]
    ));
    addItem("sticker", { stickerId: def.id, ...position }, false);
  };

  const getDesignerPointFromClient = (clientX: number, clientY: number) => {
    const designerEl = designerRef.current;
    if (!designerEl) return null;

    const rect = designerEl.getBoundingClientRect();
    const isInside =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (!isInside) return null;

    return {
      x: Math.round(((clientX - rect.left) / rect.width) * totalWidth),
      y: Math.round(((clientY - rect.top) / rect.height) * 714),
    };
  };

  const handleStickerPointerDown = (e: React.PointerEvent<HTMLButtonElement>, def: StickerDef) => {
    if (e.button !== 0) return;

    const startX = e.clientX;
    const startY = e.clientY;
    let didDrag = false;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const distance = Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY);
      if (!didDrag && distance < 8) return;

      didDrag = true;
      suppressStickerClickRef.current = true;
      setDraggedSticker({ def, x: moveEvent.clientX, y: moveEvent.clientY });
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);

      if (didDrag) {
        const dropPoint = getDesignerPointFromClient(upEvent.clientX, upEvent.clientY);
        if (dropPoint) addSticker(def, dropPoint);
        setDraggedSticker(null);
        window.setTimeout(() => {
          suppressStickerClickRef.current = false;
        }, 0);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const removeStickerItems = (stickerId: string) => {
    setItems((current) => current.filter((item) => item.stickerId !== stickerId));
    setActiveItemId((current) => {
      const activeItem = items.find((item) => item.id === current);
      return activeItem?.stickerId === stickerId ? null : current;
    });
    setIsDirty(true);
  };

  const toggleStickerSelection = (def: StickerDef) => {
    addSticker(def);
  };

  const clearStickerSelections = () => {
    if (!selectedStickerIds.length) return;
    const selectedIds = new Set(selectedStickerIds);
    setItems((current) => current.filter((item) => !item.stickerId || !selectedIds.has(item.stickerId)));
    setSelectedStickerIds([]);
    setActiveItemId(null);
    setIsDirty(true);
  };

  const recentStickers = useMemo(() => {
    const used = STICKERS
      .filter((def) => stickerUsage[def.id])
      .sort((a, b) => (stickerUsage[b.id] ?? 0) - (stickerUsage[a.id] ?? 0));

    const remaining = STICKERS.filter((def) => !stickerUsage[def.id]);
    return [...used, ...remaining].slice(0, 8);
  }, [stickerUsage]);

  const addLabel = () => {
    if (!labelText.trim()) return;
    addItem("label", {
      name: labelText.toUpperCase(),
      shape: labelShape,
      background: labelBackground,
      font: labelFont,
      color: labelColor,
    });
    setLabelText("");
  };

  const getLabelLocation = (x: number) => {
    if (x <= 493) return "Capa de Trás";
    if (x > 493 && x <= 493 + spineWidth) return "Lombada";
    return "Capa da Frente";
  };

  const saveActiveLabel = () => {
    if (!labelText.trim() || !editingLabelId) return;

    if (editingLabelId === "new") {
      const frontStartX = 493 + spineWidth;
      const frontWidth = 493;
      const centerX = frontStartX + (frontWidth / 2);
      
      const newItem: DesignerItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: "label",
        name: labelText.toUpperCase(),
        shape: labelShape,
        background: labelBackground,
        font: labelFont,
        color: labelColor,
        x: centerX,
        y: 357,
        rotation: 0,
        scale: 1,
      };
      setItems([...items, newItem]);
    } else {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === editingLabelId
            ? {
                ...item,
                name: labelText.toUpperCase(),
                shape: labelShape,
                background: labelBackground,
                font: labelFont,
                color: labelColor,
              }
            : item
        )
      );
    }
    
    setEditingLabelId(null);
    setLabelText("");
    setIsDirty(true);
  };

  const addItem = (type: "sticker" | "label", extra: any = {}, activate = true) => {
    const frontStartX = 493 + spineWidth;
    const frontWidth = 493;
    const centerX = frontStartX + (frontWidth / 2);

    const randomOffsetX = type === "sticker" ? (Math.random() - 0.5) * 160 : 0;
    const randomOffsetY = type === "sticker" ? (Math.random() - 0.5) * 160 : 0;

    const newItem: DesignerItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x: centerX + randomOffsetX, 
      y: 357 + randomOffsetY, 
      rotation: 0,
      scale: 1,
      ...extra,
    };
    setItems((current) => [...current, newItem]);
    if (activate) setActiveItemId(newItem.id);
    setIsDirty(true);
  };

  const deleteItem = (id: string) => {
    const removedItem = items.find((it) => it.id === id);
    const nextItems = items.filter((it) => it.id !== id);

    setItems(nextItems);
    if (removedItem?.stickerId && !nextItems.some((it) => it.stickerId === removedItem.stickerId)) {
      setSelectedStickerIds((current) => current.filter((stickerId) => stickerId !== removedItem.stickerId));
    }
    if (activeItemId === id) setActiveItemId(null);
    setIsDirty(true);
  };

  // When pages change, adjust spine width dynamically, AND shift elements!
  const handlePagesChange = (newPages: number) => {
    const oldSpineWidth = pages === 80 ? 20 : pages === 160 ? 38 : 56;
    const newSpineWidth = newPages === 80 ? 20 : newPages === 160 ? 38 : 56;
    
    setItems((currentItems) => {
      return currentItems.map(item => {
        if (item.x <= 493) {
          return item;
        }
        if (item.x > 493 && item.x <= 493 + oldSpineWidth) {
          const relativePos = (item.x - 493) / oldSpineWidth;
          const newX = 493 + relativePos * newSpineWidth;
          let newScale = item.scale;
          if (item.type === "label") {
            if (newSpineWidth === 20) {
              newScale = Math.min(item.scale, 0.5);
            } else if (newSpineWidth === 38) {
              newScale = Math.min(item.scale, 0.8);
            }
          }
          return { ...item, x: Math.round(newX), scale: newScale };
        }
        const offsetFromFrontStart = item.x - (493 + oldSpineWidth);
        const newX = 493 + newSpineWidth + offsetFromFrontStart;
        return { ...item, x: Math.round(newX) };
      });
    });
    setPages(newPages as PlannerBook["pages"]);
    setIsDirty(true);
  };

  const handleSave = () => {
    const canvas = offscreenCanvasRef.current;
    if (!canvas) return;

    // Save using JPEG 0.9 for 80% smaller file size to prevent local storage bloat!
    const fullDataUrl = canvas.toDataURL("image/jpeg", 0.9);

    const SCALE = 3;

    // Crop only the FRONT cover section into its own canvas for the shelf spine
    const frontX = (493 + spineWidth) * SCALE; 
    const frontW = 493 * SCALE;              
    const fullH = 714 * SCALE;

    const frontCanvas = document.createElement("canvas");
    frontCanvas.width = frontW;
    frontCanvas.height = fullH;
    const frontCtx = frontCanvas.getContext("2d");
    if (frontCtx) {
      frontCtx.drawImage(canvas, frontX, 0, frontW, fullH, 0, 0, frontW, fullH);
    }
    const frontDataUrl = frontCanvas.toDataURL("image/jpeg", 0.9);

    // Crop only the SPINE section for potential use
    const spineCanvas = document.createElement("canvas");
    spineCanvas.width = spineWidth * SCALE;
    spineCanvas.height = fullH;
    const spineCtx = spineCanvas.getContext("2d");
    if (spineCtx) {
      spineCtx.drawImage(canvas, 493 * SCALE, 0, spineWidth * SCALE, fullH, 0, 0, spineWidth * SCALE, fullH);
    }
    const spineDataUrl = spineCanvas.toDataURL("image/jpeg", 0.9);

    const normalizedInteriorPlan = normalizeInteriorPlan(interiorPlan, pages);
    const bookPages: PlannerPage[] = createPagesFromInteriorPlan(
      normalizedInteriorPlan,
      title || "Meu Planner",
      description
    );

    /*
      bookPages = [
        {
          id: "cover",
          title: "Contracapa",
          date: "2026",
          template: "cover",
          pageData: { notes: description || "Caderno para anotações livres." }
        },
        {
          id: "goals",
          title: "Metas Pessoais",
          date: "2026",
          template: "goals",
          pageData: { goals: ["Organizar ideias", "Escrever pensamentos diários"], notes: "Reflexões..." }
        },
        {
          id: "notes-1",
          title: "Anotação 1",
          date: "1 Jan",
          template: "notes",
          pageData: { notes: "Linhas livres para redação do caderno clássico..." }
        },
        {
          id: "notes-2",
          title: "Anotação 2",
          date: "2 Jan",
          template: "notes",
          pageData: { notes: "Escreva o que desejar..." }
        }
      ];
    */

    const savedBook: PlannerBook = {
      ...preview,
      ...(editingBook ?? {}),
      title: title || "Meu Diário",
      description: description,
      shelfId: selectedShelfId,
      templateType: selectedTemplate,
      interiorPlan: normalizedInteriorPlan,
      customPages: editingBook?.customPages ?? bookPages,
      coverImage: fullDataUrl,       // full layout kept for 3D preview
      coverFrontImage: frontDataUrl, // front-only crop for shelf spine display
      coverSpineImage: spineDataUrl, // spine-only crop
      coverDesignerItems: items,
      updatedAt: new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()),
    };
    onDone(savedBook);
  };

  const handleCoverSave = () => {
    if (isEditingExistingBook) {
      handleSave();
      return;
    }

    setIsDirty(false);
    setIsToolsModalOpen(false);
    setActiveItemId(null);
    setEditingLabelId(null);
    setCreateStep(4);
    setIsEditingCover(false);
  };

  const createSteps = [
    { title: "Identificação Geral", eyebrow: "Passo 01" },
    { title: "Formato Físico", eyebrow: "Passo 02" },
    { title: "Biblioteca", eyebrow: "Passo 03" },
    { title: "Template do Planner", eyebrow: "Passo 04" },
    { title: "Resumo", eyebrow: "Passo 05" },
  ];

  const canAdvanceCreateStep = createStep !== 0 || title.trim().length > 0;
  const interiorPageCount = getInteriorPlanPageCount(interiorPlan);
  const selectedInteriorSection = interiorPlan.sections[0];
  const selectedSavedTemplate = templates.find((template) => template.id === selectedSavedTemplateId) ?? null;
  const handleTemplateChoice = (template: "agenda_2026" | "notes_notebook") => {
    setInteriorSource("standard");
    setSelectedTemplate(template);
    setSelectedSavedTemplateId(null);
    setHasEditedInteriorPlan(false);
    setInteriorPlan(createDefaultInteriorPlan(pages, template));
  };
  const handleSavedTemplateChoice = (template: PlannerInteriorTemplate) => {
    setInteriorSource("saved");
    setSelectedTemplate("custom_planner");
    setSelectedSavedTemplateId(template.id);
    setHasEditedInteriorPlan(false);
    handlePagesChange(template.plan.capacity);
    setInteriorPlan(normalizeInteriorPlan(template.plan, template.plan.capacity));
  };
  const handleCustomTemplateChoice = () => {
    setInteriorSource("custom");
    setSelectedTemplate("custom_planner");
    setSelectedSavedTemplateId(null);
    setHasEditedInteriorPlan(true);
    setInteriorPlan(createDefaultInteriorPlan(pages, "custom_planner"));
  };
  const handleInteriorPlanChange = (nextPlan: PlannerInteriorPlan) => {
    setInteriorSource("custom");
    setSelectedTemplate("custom_planner");
    setSelectedSavedTemplateId(null);
    setHasEditedInteriorPlan(true);
    setInteriorPlan(nextPlan);
  };

  const renderCreateFlowStep = () => {
    if (createStep === 0) {
      return (
        <div className="create-flow-step">
          <div className="create-flow-step__intro">
            <span>{createSteps[createStep].eyebrow}</span>
            <p>Defina o nome e a descrição que vão acompanhar este planner.</p>
          </div>
          <div className="wizard-field">
            <label htmlFor="wizard-title">Título do Planner *</label>
            <input
              id="wizard-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Projetos 2026, Meu Diário Rústico..."
              autoFocus
            />
          </div>
          <div className="wizard-field">
            <label htmlFor="wizard-desc">Texto da Contracapa (Descrição)</label>
            <textarea
              id="wizard-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escreva um texto inspirador ou descrição do propósito deste caderno..."
              rows={3}
            />
          </div>
        </div>
      );
    }

    if (createStep === 1) {
      return (
        <div className="create-flow-step">
          <div className="create-flow-step__intro">
            <span>{createSteps[createStep].eyebrow}</span>
            <p>Escolha o formato físico do caderno. Por enquanto o A5 padrão está selecionado.</p>
          </div>
          <div className="format-selection-card">
            <div className="format-card is-active">
              <div className="format-card__spec">A5</div>
              <div className="format-card__info">
                <h4>Formato A5 Padrão</h4>
                <p>148 x 210 mm · O tamanho confortável para carregar, planejar e escrever.</p>
              </div>
              <div className="format-card__badge">Selecionado</div>
            </div>
            <p className="format-selection-hint">Outros formatos como A4 e A6 estarão disponíveis para confecção física em breve.</p>
          </div>
        </div>
      );
    }

    if (createStep === 2) {
      return (
        <div className="create-flow-step">
          <div className="create-flow-step__intro">
            <span>{createSteps[createStep].eyebrow}</span>
            <p>Escolha em qual estante este planner será guardado.</p>
          </div>
          <div className="wizard-shelves-grid">
            {shelves.map((sh) => (
              <button
                key={sh.id}
                type="button"
                className={`wizard-shelf-card ${selectedShelfId === sh.id ? "is-active" : ""}`}
                onClick={() => setSelectedShelfId(sh.id)}
              >
                <Folder size={18} />
                <strong>{sh.name}</strong>
                <small>{sh.books.length} cadernos</small>
                {selectedShelfId === sh.id && <span className="active-dot" />}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (createStep === 3) {
      return (
        <div className="create-flow-step create-flow-step--interior">
          <div className="create-flow-step__intro">
            <span>{createSteps[createStep].eyebrow}</span>
            <p>Escolha um template padrao, aplique um template salvo ou crie um personalizado do zero.</p>
          </div>
          <div className="interior-source-switcher">
            <button
              type="button"
              className={interiorSource === "standard" ? "is-active" : ""}
              onClick={() => {
                setInteriorSource("standard");
                if (selectedTemplate === "custom_planner") handleTemplateChoice("agenda_2026");
              }}
            >
              <Calendar size={15} />
              Padroes
            </button>
            <button
              type="button"
              className={interiorSource === "saved" ? "is-active" : ""}
              onClick={() => {
                setInteriorSource("saved");
                if (!selectedSavedTemplate && templates[0]) handleSavedTemplateChoice(templates[0]);
              }}
            >
              <BookOpen size={15} />
              Templates
            </button>
            <button
              type="button"
              className={interiorSource === "custom" ? "is-active" : ""}
              onClick={handleCustomTemplateChoice}
            >
              <Palette size={15} />
              Do zero
            </button>
          </div>
          {interiorSource === "standard" && (
            <div className="book-interior-choice-grid">
              <button
                type="button"
                className={`wizard-template-item ${selectedTemplate === "agenda_2026" ? "is-active" : ""}`}
                onClick={() => handleTemplateChoice("agenda_2026")}
              >
                <div className="template-item__icon template-item__icon--agenda">
                  <Calendar size={22} />
                </div>
                <div className="template-item__content">
                  <div className="flex items-center gap-2">
                    <h4>Agenda Diaria Padrao 2026</h4>
                    <span className="recommended-badge">Recomendado</span>
                  </div>
                  <p>Calendario anual, planejamento diario, prioridades, habitos e notas livres.</p>
                </div>
                {selectedTemplate === "agenda_2026" && <span className="active-dot-large" />}
              </button>

              <button
                type="button"
                className={`wizard-template-item ${selectedTemplate === "notes_notebook" ? "is-active" : ""}`}
                onClick={() => handleTemplateChoice("notes_notebook")}
              >
                <div className="template-item__icon template-item__icon--notebook">
                  <FileText size={22} />
                </div>
                <div className="template-item__content">
                  <h4>Caderno de Notas Classico</h4>
                  <p>Pautado, pontilhado e areas de escrita longa para estudos e ideias.</p>
                </div>
                {selectedTemplate === "notes_notebook" && <span className="active-dot-large" />}
              </button>
            </div>
          )}

          {interiorSource === "saved" && (
            <div className="saved-template-picker">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  className={selectedSavedTemplateId === template.id ? "is-active" : ""}
                  onClick={() => handleSavedTemplateChoice(template)}
                >
                  <span>
                    <strong>{template.name}</strong>
                    <small>{getInteriorPlanPageCount(template.plan)} pags · {template.plan.sections.length} grupos</small>
                  </span>
                  {template.isSystem && <em>Padrao</em>}
                </button>
              ))}
            </div>
          )}

          {interiorSource === "custom" && (
            <PageInteriorDesigner
              compact={compact}
              capacity={pages}
              plan={interiorPlan}
              onCapacityChange={(nextPages) => {
                handlePagesChange(nextPages);
                setHasEditedInteriorPlan(true);
              }}
              onPlanChange={handleInteriorPlanChange}
            />
          )}
        </div>
      );
    }

    if (createStep === 3) {
      return (
        <div className="create-flow-step">
          <div className="create-flow-step__intro">
            <span>{createSteps[createStep].eyebrow}</span>
            <p>Selecione a estrutura interna de páginas para começar o planner.</p>
          </div>
          <div className="wizard-templates-list">
            <button
              type="button"
              className={`wizard-template-item ${selectedTemplate === "agenda_2026" ? "is-active" : ""}`}
              onClick={() => setSelectedTemplate("agenda_2026")}
            >
              <div className="template-item__icon template-item__icon--agenda">
                <Calendar size={22} />
              </div>
              <div className="template-item__content">
                <div className="flex items-center gap-2">
                  <h4>Agenda Diária Padrão 2026</h4>
                  <span className="recommended-badge">Recomendado</span>
                </div>
                <p>Agenda física com calendário anual, spreads diários, compromissos, prioridades, anotações livres e mood tracker.</p>
              </div>
              {selectedTemplate === "agenda_2026" && <span className="active-dot-large" />}
            </button>

            <button
              type="button"
              className={`wizard-template-item ${selectedTemplate === "notes_notebook" ? "is-active" : ""}`}
              onClick={() => setSelectedTemplate("notes_notebook")}
            >
              <div className="template-item__icon template-item__icon--notebook">
                <FileText size={22} />
              </div>
              <div className="template-item__content">
                <h4>Caderno de Notas Clássico</h4>
                <p>Ficha de introdução, folha de metas pessoais e páginas pautadas minimalistas para anotações espontâneas.</p>
              </div>
              {selectedTemplate === "notes_notebook" && <span className="active-dot-large" />}
            </button>
          </div>
        </div>
      );
    }

    const selectedShelf = shelves.find((shelf) => shelf.id === selectedShelfId);
    return (
      <div className="create-flow-step">
        <div className="create-flow-step__intro">
          <span>{createSteps[createStep].eyebrow}</span>
          <p>Revise as escolhas e siga para editar a capa ou criar o planner.</p>
        </div>
        <div className="create-flow-summary">
          <button type="button" onClick={() => setCreateStep(0)}>
            <span>Título</span>
            <strong>{title || "Meu Novo Planner"}</strong>
          </button>
          <button type="button" onClick={() => setCreateStep(1)}>
            <span>Formato</span>
            <strong>A5 padrão · {pages} páginas</strong>
          </button>
          <button type="button" onClick={() => setCreateStep(2)}>
            <span>Estante</span>
            <strong>{selectedShelf?.name ?? "Não selecionada"}</strong>
          </button>
          <button type="button" onClick={() => setCreateStep(3)}>
            <span>Template</span>
            <strong>{interiorPageCount} pags · {selectedInteriorSection?.templateName ?? "Personalizado"}</strong>
          </button>
        </div>
      </div>
    );
  };

  if (!isEditingCover) {
    return (
      <main className={`screen screen-create screen-create--flow ${compact ? "screen--compact" : ""}`}>
        <canvas ref={offscreenCanvasRef} height={714} style={{ display: "none" }} />
        <BottomSheetModal
          isOpen
          onClose={() => undefined}
          title={createSteps[createStep].title}
          className={`choice-modal-backdrop--contained create-flow-backdrop ${createStep === 3 ? "create-flow-backdrop--interior" : ""}`}
          contentClassName={`create-flow-modal ${createStep === 3 ? "create-flow-modal--interior" : ""}`}
          headerActions={<span className="create-flow-counter">{createStep + 1} / {createSteps.length}</span>}
        >
          {renderCreateFlowStep()}
          <div className="create-flow-progress" aria-hidden="true">
            {createSteps.map((step, index) => (
              <span
                key={step.title}
                className={index <= createStep ? "is-active" : ""}
              />
            ))}
          </div>
          <div className="create-flow-nav">
            {createStep < createSteps.length - 1 ? (
              <>
                <button
                  type="button"
                  className="btn-wizard-secondary"
                  onClick={() => setCreateStep((step) => Math.max(0, step - 1))}
                  disabled={createStep === 0}
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>
                <button
                  type="button"
                  className="btn-wizard-primary"
                  onClick={() => setCreateStep((step) => Math.min(createSteps.length - 1, step + 1))}
                  disabled={!canAdvanceCreateStep}
                >
                  Avançar
                  <ChevronRight size={16} />
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-wizard-secondary"
                  onClick={() => setIsEditingCover(true)}
                  disabled={!title.trim()}
                >
                  <Palette size={16} />
                  Editar Capa
                </button>
                <button
                  type="button"
                  className="btn-wizard-primary"
                  onClick={handleSave}
                  disabled={!title.trim() || !selectedShelfId}
                >
                  <Check size={16} />
                  Criar Planner
                </button>
              </>
            )}
          </div>
        </BottomSheetModal>
      </main>
    );
  }

  if (!isEditingCover) {
    return (
      <main className={`screen screen-create ${compact ? "screen--compact" : ""}`}>
        <div className="screen__headline">
          <div>
            <h2>Criar Novo Planner ou Agenda</h2>
            <p>Configure as especificações físicas e templates do seu caderno rústico</p>
          </div>
        </div>

        <section className="create-wizard">
          <div className="create-wizard__form">
            {/* Passo 1: Informações Gerais */}
            <div className="wizard-section">
              <span className="wizard-section__badge">01</span>
              <h3>Identificação Geral</h3>
              
              <div className="wizard-field">
                <label htmlFor="wizard-title">Título do Planner *</label>
                <input
                  id="wizard-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Projetos 2026, Meu Diário Rústico..."
                  autoFocus
                />
              </div>

              <div className="wizard-field">
                <label htmlFor="wizard-desc">Texto da Contracapa (Descrição)</label>
                <textarea
                  id="wizard-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Escreva um texto inspirador ou descrição do propósito deste caderno..."
                  rows={3}
                />
              </div>
            </div>

            {/* Passo 2: Formato */}
            <div className="wizard-section">
              <span className="wizard-section__badge">02</span>
              <h3>Formato & Dimensão Física</h3>
              <div className="format-selection-card">
                <div className="format-card is-active">
                  <div className="format-card__spec">A5</div>
                  <div className="format-card__info">
                    <h4>Formato A5 Padrão</h4>
                    <p>148 x 210 mm · O tamanho perfeito de alta papelaria para carregar consigo e escrever confortavelmente.</p>
                  </div>
                  <div className="format-card__badge">Selecionado</div>
                </div>
                <p className="format-selection-hint">Outros formatos como A4 e A6 estarão disponíveis para confecção física em breve.</p>
              </div>
            </div>

            {/* Passo 3: Associação de Estante */}
            <div className="wizard-section">
              <span className="wizard-section__badge">03</span>
              <h3>Organizar na Biblioteca</h3>
              <label>Escolha em qual estante este caderno será guardado:</label>
              <div className="wizard-shelves-grid">
                {shelves.map((sh) => (
                  <button
                    key={sh.id}
                    type="button"
                    className={`wizard-shelf-card ${selectedShelfId === sh.id ? "is-active" : ""}`}
                    onClick={() => setSelectedShelfId(sh.id)}
                  >
                    <Folder size={18} />
                    <strong>{sh.name}</strong>
                    <small>{sh.books.length} cadernos</small>
                    {selectedShelfId === sh.id && <span className="active-dot" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Passo 4: Templates do Sistema */}
            <div className="wizard-section">
              <span className="wizard-section__badge">04</span>
              <h3>Modelos de Template Inteligentes</h3>
              <label>Escolha a predefinição interna de páginas para o template:</label>
              <div className="wizard-templates-list">
                <button
                  type="button"
                  className={`wizard-template-item ${selectedTemplate === "agenda_2026" ? "is-active" : ""}`}
                  onClick={() => setSelectedTemplate("agenda_2026")}
                >
                  <div className="template-item__icon template-item__icon--agenda">
                    <Calendar size={22} />
                  </div>
                  <div className="template-item__content">
                    <div className="flex items-center gap-2">
                      <h4>Agenda Diária Padrão 2026</h4>
                      <span className="recommended-badge">Recomendado</span>
                    </div>
                    <p>Agenda física clássica: página de introdução, calendário anual de 2026 completo para consulta e spreads diários de duas páginas para o mesmo dia: esquerda (compromissos horários 08h-20h + checklist prioridades) e direita (bloco pautado livre + mood tracker + copos d'água).</p>
                  </div>
                  {selectedTemplate === "agenda_2026" && <span className="active-dot-large" />}
                </button>

                <button
                  type="button"
                  className={`wizard-template-item ${selectedTemplate === "notes_notebook" ? "is-active" : ""}`}
                  onClick={() => setSelectedTemplate("notes_notebook")}
                >
                  <div className="template-item__icon template-item__icon--notebook">
                    <FileText size={22} />
                  </div>
                  <div className="template-item__content">
                    <h4>Caderno de Notas Clássico</h4>
                    <p>Ficha técnica rústica de introdução, folha de metas pessoais e páginas pautadas minimalistas livres para anotações espontâneas.</p>
                  </div>
                  {selectedTemplate === "notes_notebook" && <span className="active-dot-large" />}
                </button>
              </div>
            </div>

            {/* Passo 5: Ações Principais */}
            <div className="wizard-actions">
              <button
                type="button"
                className="btn-wizard-secondary"
                disabled={!title.trim()}
                onClick={() => {
                  if (!title.trim()) return;
                  setIsEditingCover(true);
                }}
              >
                <Palette size={16} />
                Editar Capa (Stickers, Etiquetas & Cores)
              </button>

              <button
                type="button"
                className="btn-wizard-primary"
                disabled={!title.trim() || !selectedShelfId}
                onClick={() => {
                  if (!title.trim() || !selectedShelfId) return;
                  handleSave();
                }}
              >
                <Check size={16} />
                Criar e Concluir
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const renderHeaderActions = () => {
    if (activeTab === "labels" && editingLabelId !== null) {
      return (
        <>
          {hasActiveLabelChanges && (
            <button
              type="button"
              className="choice-modal__confirm-btn"
              onClick={saveActiveLabel}
              disabled={!labelText.trim()}
              style={{ opacity: labelText.trim() ? 1 : 0.5, cursor: labelText.trim() ? 'pointer' : 'not-allowed' }}
              title="Salvar Etiqueta"
            >
              <Check size={18} />
            </button>
          )}
          <button
            type="button"
            onClick={() => setEditingLabelId(null)}
            className="choice-modal__close-btn"
            title="Voltar"
          >
            <ArrowLeft size={18} />
          </button>
        </>
      );
    }
    
    return (
      <>
        {hasModalChanges && (
          <button
            type="button"
            className="choice-modal__confirm-btn"
            onClick={() => {
              setModalTabSnapshots(prev => ({ ...prev, [activeTab]: tabSignature }));
            }}
            title="Salvar Alterações da Aba"
          >
            <Check size={18} />
          </button>
        )}
        <button
          type="button"
          className="choice-modal__close-btn"
            onClick={() => {
            if (!compact) {
               handleCoverSave();
            } else {
               setIsToolsModalOpen(false);
            }
          }}
          title="Fechar"
        >
          <X size={18} />
        </button>
      </>
    );
  };

  const renderToolsPanel = () => {
    return (
      <div className="create-book__panel" style={compact ? { border: "none", background: "none", padding: 0 } : undefined} onClick={(e) => e.stopPropagation()}>
        {!compact && (
          <div className="choice-modal__header" style={{ padding: "0 0 16px 0", borderBottom: "none", marginBottom: 0 }}>
            <h3 style={{ fontSize: "20px", fontWeight: "bold", fontFamily: "var(--font-serif)", margin: 0 }}>
              {activeTab === "labels" && editingLabelId !== null ? "Nova Etiqueta" : "Ferramentas de Edição"}
            </h3>
            <div className="choice-modal__header-actions">
              {renderHeaderActions()}
            </div>
          </div>
        )}
        <div className="designer-tabs">
          <button className={activeTab === "colors" ? "is-active" : ""} type="button" onClick={() => setActiveTab("colors")}>
            <Palette size={14} />
            Cor Capa
          </button>
          <button className={activeTab === "stickers" ? "is-active" : ""} type="button" onClick={() => setActiveTab("stickers")}>
            <Smile size={14} />
            Adesivos
          </button>
          <button className={activeTab === "labels" ? "is-active" : ""} type="button" onClick={() => setActiveTab("labels")}>
            <Tag size={14} />
            Etiquetas
          </button>
        </div>

        <div className="designer-tools">
          {activeTab === "colors" && (
            <div className="designer-tools__section">
              <span className="designer-tools__title">Cores Clássicas</span>
              <div className="create-book__swatches">
                {presets.map((swatch) => (
                  <button 
                    className={color === swatch ? "is-active" : ""} 
                    type="button" 
                    key={swatch} 
                    onClick={() => {
                      setColor(swatch);
                      setIsDirty(true);
                    }} 
                    style={{ backgroundColor: swatch }}
                    aria-label={`Selecionar preset ${swatch}`}
                  >
                    {color === swatch && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === "stickers" && (
            <div className="designer-tools__section">
              <div className="sticker-filter-row">
                <span className="designer-tools__title">Recentes</span>
                <div className="sticker-filter-row__actions">
                  {selectedStickerIds.length > 0 && (
                    <button type="button" onClick={clearStickerSelections}>
                      Limpar
                    </button>
                  )}
                  <button type="button" onClick={() => setIsStickerPickerOpen(true)}>
                    Ver todos
                  </button>
                </div>
              </div>
              <div className="sticker-grid sticker-grid--svg">
                {recentStickers.map((def) => (
                  <button
                    key={def.id}
                    type="button"
                    title={def.label}
                    onPointerDown={(e) => handleStickerPointerDown(e, def)}
                    onClick={() => {
                      if (suppressStickerClickRef.current) return;
                      toggleStickerSelection(def);
                    }}
                    className={`sticker-grid__item ${selectedStickerIds.includes(def.id) ? "is-selected" : ""}`}
                  >
                    <img
                      src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(def.svg)}`}
                      alt={def.label}
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
          {activeTab === "labels" && (
            <div className="designer-tools__section">
              {editingLabelId === null ? (
                /* List View of existing tags */
                <div className="labels-list-view">
                  <div className="labels-list-header">
                    <span className="designer-tools__title" style={{ marginBottom: "2px" }}>Minhas Etiquetas ({items.filter((it) => it.type === "label").length})</span>
                  </div>

                  <div className="labels-list">
                    {items
                      .filter((it) => it.type === "label")
                      .map((labelItem) => {
                        const loc = getLabelLocation(labelItem.x);
                        return (
                          <div
                            key={labelItem.id}
                            onClick={() => {
                              setEditingLabelId(labelItem.id);
                              setLabelText(labelItem.name);
                              setLabelShape(labelItem.shape || "rounded");
                              setLabelBackground(labelItem.background || (labelItem.style === "leather" ? "transparent" : "sticker"));
                              setLabelColor(labelItem.color || (labelItem.style === "leather" ? "rgba(255,255,255,0.7)" : "#1c1917"));
                              setLabelFont(labelItem.font || "serif");
                              setActiveLabelSnapshot(JSON.stringify({
                                text: labelItem.name,
                                shape: labelItem.shape || "rounded",
                                background: labelItem.background || (labelItem.style === "leather" ? "transparent" : "sticker"),
                                font: labelItem.font || "serif",
                                color: labelItem.color || (labelItem.style === "leather" ? "rgba(255,255,255,0.7)" : "#1c1917")
                              }));
                            }}
                            className="label-card"
                          >
                            <div className="label-card__info">
                              <strong className="label-card__name" style={{ fontFamily: labelItem.font === "sans" ? "sans-serif" : labelItem.font === "mono" ? "monospace" : "Georgia, serif" }}>
                                {labelItem.name}
                              </strong>
                              <span className="label-card__location">
                                {loc}
                              </span>
                            </div>
                            
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteItem(labelItem.id);
                              }}
                              className="label-card__delete"
                              title="Excluir Etiqueta"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        );
                      })}

                    {/* Fake Container Card to Add New Label */}
                    <div
                      onClick={() => {
                        setEditingLabelId("new");
                        setLabelText("");
                        setLabelShape("rounded");
                        setLabelBackground("sticker");
                        setLabelFont("serif");
                        setLabelColor("#1c1917");
                        setActiveLabelSnapshot(JSON.stringify({
                          text: "",
                          shape: "rounded",
                          background: "sticker",
                          font: "serif",
                          color: "#1c1917"
                        }));
                      }}
                      className="label-card-add"
                    >
                      <Plus size={18} />
                      <span>
                        Adicionar Nova Etiqueta
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Edit Detail View (Submodal Layout) */
                <div className="label-edit-view">
                  {/* (Submodal Header actions moved to main modal header) */}

                  {/* Section 1: Texto */}
                  <div className="label-edit-section">
                    <span className="designer-tools__title">Texto da Etiqueta</span>
                    <input
                      value={labelText}
                      onChange={(e) => setLabelText(e.target.value)}
                      placeholder="Digite o texto..."
                      maxLength={16}
                      className="label-edit-input"
                    />
                  </div>

                  {/* Divider Line */}
                  <div className="label-edit-divider" />

                  {/* Section 2: Formato */}
                  <div className="label-edit-section">
                    <span className="designer-tools__title">Formato da Etiqueta</span>
                    <div className="label-font-selector">
                      <button 
                        className={labelShape === "rectangular" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelShape("rectangular")}
                      >
                        Retangular
                      </button>
                      <button 
                        className={labelShape === "rounded" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelShape("rounded")}
                      >
                        Cantos Arredondados
                      </button>
                      <button 
                        className={labelShape === "circular" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelShape("circular")}
                      >
                        Circular/Elipse
                      </button>
                      <button 
                        className={labelShape === "pill" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelShape("pill")}
                      >
                        Pílula
                      </button>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="label-edit-divider" />

                  {/* Section 3: Background */}
                  <div className="label-edit-section">
                    <span className="designer-tools__title">Fundo ou Background</span>
                    <div className="label-font-selector">
                      <button 
                        className={labelBackground === "transparent" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelBackground("transparent")}
                      >
                        Transparente
                      </button>
                      <button 
                        className={labelBackground === "sticker" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelBackground("sticker")}
                      >
                        Padrão (Adesivo)
                      </button>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="label-edit-divider" />

                  {/* Section 4: Font */}
                  <div className="label-edit-section">
                    <span className="designer-tools__title">Fonte Tipográfica</span>
                    <div className="label-font-selector label-font-selector--3col">
                      <button 
                        className={labelFont === "serif" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelFont("serif")}
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        Georgia
                      </button>
                      <button 
                        className={labelFont === "sans" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelFont("sans")}
                        style={{ fontFamily: "sans-serif" }}
                      >
                        Sans-serif
                      </button>
                      <button 
                        className={labelFont === "mono" ? "is-active" : ""} 
                        type="button" 
                        onClick={() => setLabelFont("mono")}
                        style={{ fontFamily: "monospace" }}
                      >
                        Courier
                      </button>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="label-edit-divider" />

                  {/* Section 5: Font Color */}
                  <div className="label-edit-section">
                    <span className="designer-tools__title">Cor da Fonte</span>
                    <div className="create-book__swatches" style={{ gap: "8px" }}>
                      {["#1c1917", "#ffffff", ...presets].map((swatch) => (
                        <button 
                          className={labelColor === swatch ? "is-active" : ""} 
                          type="button" 
                          key={swatch} 
                          onClick={() => setLabelColor(labelColor === swatch ? "" : swatch)} 
                          style={{ 
                            width: "30px",
                            height: "30px",
                            backgroundColor: swatch, 
                            border: swatch === "#ffffff" ? "1px solid var(--color-border-mid)" : "2px solid rgba(255, 255, 255, 0.85)",
                            boxShadow: labelColor === swatch 
                              ? "0 0 0 2px var(--color-accent), 0 8px 18px rgba(45, 36, 32, 0.16)" 
                              : "0 0 0 1px var(--color-border-mid), 0 6px 14px rgba(45, 36, 32, 0.12)"
                          }}
                          aria-label={`Selecionar cor de fonte ${swatch}`}
                        >
                          {labelColor === swatch && <Check size={12} style={{ color: swatch === "#ffffff" ? "#1c1917" : "#ffffff" }} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* (Save button moved to header) */}
                </div>
              )}
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex gap-3 mt-auto pt-3 border-t border-stone-200">
            <>
              <button
                className="btn-glass flex-1 flex items-center justify-center gap-1.5 h-11"
                type="button"
                onClick={handleCoverSave}
              >
                <ArrowRight className="rotate-180" size={16} />
                Voltar ao resumo
              </button>
              <button
                className="create-book__save flex-1 flex items-center justify-center gap-2 h-11"
                type="button"
                onClick={handleCoverSave}
              >
                <Check size={18} />
                Salvar Capa
              </button>
            </>
          </div>
        )}
      </div>
    );
  };

  return (
    <main
      className={`screen screen-create screen-create--cover ${compact ? "screen--compact" : ""} ${compact && isToolsModalOpen ? "screen-create--tools-open" : ""}`}
      onClick={() => {
        setActiveItemId(null);
        if (compact && isToolsModalOpen) setIsToolsModalOpen(false);
      }}
    >
      <section className="create-book">
        <div className="designer-workspace">
          <div className="designer-workspace__section">
            <div className="designer-workspace__header">
              <span className="designer-workspace__eyebrow">
                <Sparkles size={13} style={{ color: "#a8a29e" }} />
                Planificação da Capa
              </span>
              <div className="designer-workspace__header-actions">
                <button
                  type="button"
                  className="cover-action-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShow3DPreview(true);
                  }}
                >
                  Preview
                </button>
              </div>
            </div>

            <div className="cover-designer-shell">
              <div 
                ref={designerRef}
                className="cover-designer"
                style={{ 
                  backgroundColor: color,
                  aspectRatio: `${totalWidth} / 714`,
                  containerType: "inline-size",
                  ['--grid-size-x' as any]: `${(15 / totalWidth) * 100}%`,
                  ['--grid-size-y' as any]: `${(15 / 714) * 100}%`,
                }}
              >
              <div className="cover-designer__grid" aria-hidden="true" />
              <div className="cover-designer__texture" />
              
              <div 
                className="cover-designer__spine"
                style={{
                  left: `${(493 / totalWidth) * 100}%`,
                  width: `${(spineWidth / totalWidth) * 100}%`
                }}
              />
              
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`designer-element ${activeItemId === item.id ? "is-active" : ""}`}
                  style={{
                    left: `${(item.x / totalWidth) * 100}%`,
                    top: `${(item.y / 714) * 100}%`,
                    transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale})`,
                    zIndex: activeItemId === item.id ? 20 : 10,
                    ['--control-scale' as any]: 1 / item.scale,
                    ['--control-hover-scale' as any]: 1.04 / item.scale,
                    ['--counter-rotation' as any]: `${-item.rotation}deg`,
                  }}
                  onPointerDown={(e) => handleElementPointerDown(e, item)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {item.type === "sticker" && item.stickerId ? (
                    (() => {
                      const def = STICKERS.find((s) => s.id === item.stickerId);
                      const svgSrc = def
                         ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(def.svg)}`
                         : '';
                      const sizeCqw = `${(80 / totalWidth) * 100}cqw`;
                      return (
                        <span
                          className="designer-element__sticker"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: sizeCqw,
                            height: sizeCqw,
                            background: 'white',
                            borderRadius: '50%',
                            padding: `${(8 / totalWidth) * 100}cqw`,
                            boxShadow: 'none',
                            filter: 'none',
                          }}
                        >
                          <img
                            src={svgSrc}
                            alt={def?.label ?? ''}
                            style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', pointerEvents: 'none' }}
                            draggable={false}
                          />
                        </span>
                      );
                    })()
                  ) : (
                    (() => {
                      const shape = item.shape || "rounded";
                      const background = item.background || (item.style === "leather" ? "transparent" : "sticker");
                      const color = item.color || (item.style === "leather" ? "rgba(255,255,255,0.7)" : "#1c1917");
                      const font = item.font || "serif";
                      
                      return (
                        <span 
                          className="designer-element__tag"
                          style={{ 
                            fontFamily: font === "sans" ? "sans-serif" : font === "mono" ? "monospace" : "Georgia, serif",
                            fontSize: `${(16 / totalWidth) * 100}cqw`,
                            padding: shape === "circular" 
                              ? `${(14 / totalWidth) * 100}cqw ${(18 / totalWidth) * 100}cqw` 
                              : `${(9 / totalWidth) * 100}cqw ${(16 / totalWidth) * 100}cqw`,
                            borderRadius: shape === "rectangular" 
                              ? "0" 
                              : shape === "pill" 
                                ? "9999px" 
                                : shape === "circular" 
                                  ? "50%" 
                                  : `${(5 / totalWidth) * 100}cqw`, // rounded (default)
                            border: background === "transparent" ? "none" : `${(1.2 / totalWidth) * 100}cqw dashed rgba(139, 110, 80, 0.25)`,
                            backgroundColor: background === "transparent" ? "transparent" : "#ffffff",
                            color: color,
                            boxShadow: background === "transparent" ? "none" : "0 2px 6px rgba(0,0,0,0.04)",
                            display: "inline-block",
                            whiteSpace: "nowrap"
                          }}
                        >
                          {item.name}
                        </span>
                      );
                    })()
                  )}
                  
                  {activeItemId === item.id && (
                    <div
                      className="designer-element__selection"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {(['nw','n','ne','e','se','s','sw','w'] as const).map((dir) => (
                        <div
                          key={dir}
                          className={`designer-element__resize-handle designer-element__resize-handle--${dir}`}
                          onPointerDown={(e) => handleResizePointerDown(e, item)}
                        />
                      ))}
                      <button
                        className="designer-element__delete-handle"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteItem(item.id);
                        }}
                        title="Excluir elemento"
                        aria-label="Excluir elemento"
                      >
                        <Trash2 size={12} strokeWidth={2.3} />
                      </button>
                      <div
                        className="designer-element__rotate-handle"
                        onPointerDown={(e) => handleRotatePointerDown(e, item)}
                        title="Arraste para girar"
                      >
                        ↻
                      </div>
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          </div>
          
          {compact && (
            <div className="designer-workspace__actions" onClick={(e) => e.stopPropagation()}>
              <button
                className="btn-wizard-secondary designer-workspace__edit-action"
                type="button"
                onClick={() => {
                  setActiveItemId(null);
                  setModalTabSnapshots({
                    colors: JSON.stringify({ color }),
                    stickers: JSON.stringify({ items: items.filter(i => i.type === "sticker").map(({ id: _id, ...item }) => item) }),
                    labels: JSON.stringify({ items: items.filter(i => i.type === "label").map(({ id: _id, ...item }) => item) })
                  });
                  setIsToolsModalOpen(true);
                }}
              >
                <Palette size={16} />
                Editar
              </button>
              {isDirty && (
                  <button
                    className="btn-wizard-primary designer-workspace__save-action"
                    type="button"
                    onClick={handleCoverSave}
                  >
                    <Check size={16} />
                    Salvar
                  </button>
              )}
            </div>
          )}
        </div>

        {/* Lado Direito: O Painel de Controle das Customizações (Somente Desktop) */}
        {!compact && renderToolsPanel()}
      </section>
      
      {/* Se estiver no mobile (compact), exibe o painel de ferramentas dentro do modal reaproveitável */}
      {compact && (
        <BottomSheetModal
          isOpen={isToolsModalOpen}
          onClose={() => {
            if (activeTab === "labels" && editingLabelId !== null) {
              setEditingLabelId(null);
            } else {
              setIsToolsModalOpen(false);
            }
          }}
          className="choice-modal-backdrop--editor"
          title={activeTab === "labels" && editingLabelId !== null ? "Nova Etiqueta" : "Ferramentas de Edição"}
          headerActions={renderHeaderActions()}
        >
          <div className="tools-modal-content">
            {renderToolsPanel()}
          </div>
        </BottomSheetModal>
      )}
      
      {compact && isStickerPickerOpen && (
        <div className="sticker-picker-overlay" onClick={() => setIsStickerPickerOpen(false)}>
          <div className="sticker-picker-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sticker-picker-modal__header">
              <h3>Todos os adesivos</h3>
              <button type="button" onClick={() => setIsStickerPickerOpen(false)} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="sticker-picker-grid">
              {STICKERS.map((def) => (
                <button
                  key={def.id}
                  type="button"
                  title={def.label}
                  onPointerDown={(e) => handleStickerPointerDown(e, def)}
                  onClick={() => {
                    if (suppressStickerClickRef.current) return;
                    toggleStickerSelection(def);
                  }}
                  className={`sticker-grid__item ${selectedStickerIds.includes(def.id) ? "is-selected" : ""}`}
                >
                  <img
                    src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(def.svg)}`}
                    alt={def.label}
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {draggedSticker && (
        <div
          className="sticker-drag-preview"
          style={{
            left: draggedSticker.x,
            top: draggedSticker.y,
          }}
          aria-hidden="true"
        >
          <img
            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(draggedSticker.def.svg)}`}
            alt=""
            draggable={false}
          />
        </div>
      )}

      {/* Hidden offscreen canvas to render cover in dynamic high-resolution */}
      <canvas ref={offscreenCanvasRef} height={714} style={{ display: "none" }} />

      {/* Screen Separate Overlay for high-fidelity 3D Book Preview */}
      {show3DPreview && (
        <div className="creator-preview-overlay" onClick={(e) => e.stopPropagation()}>
          {/* Clean Floating Close Button fitting the stationery aesthetic */}
          <button 
            className="creator-preview-overlay__close-btn" 
            type="button" 
            onClick={() => setShow3DPreview(false)}
            aria-label="Fechar visualização 3D"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {/* 3D View Stage Container */}
          <div className="creator-preview-overlay__stage">
            <ComponenteBook3D
              currentBook={toComponenteBook3DData(preview)}
              isOpen={false}
              setIsOpen={() => {}}
              activeSheetIndex={1}
              setActiveSheetIndex={() => {}}
              zoomMode="book"
              setZoomMode={() => {}}
              coverCanvas={offscreenCanvasRef.current}
              showControls={false} // Disable standard controls
              showGuide={false}
              showSpreadIndicator={false}
              viewFocus={viewFocus} // Inject our active focus target!
              isHighFidelityPreview={true}
            />
          </div>

          {/* Bottom Bar Custom Focus Button Bar */}
          <footer className="creator-preview-overlay__footer">
            <div className="preview-focus-selector">
              <button 
                className={viewFocus === "front" ? "is-active" : ""} 
                type="button" 
                onClick={() => setViewFocus("front")}
              >
                Capa da Frente
              </button>
              <button 
                className={viewFocus === "spine" ? "is-active" : ""} 
                type="button" 
                onClick={() => setViewFocus("spine")}
              >
                Lombada
              </button>
              <button 
                className={viewFocus === "back" ? "is-active" : ""} 
                type="button" 
                onClick={() => setViewFocus("back")}
              >
                Capa de Trás
              </button>
            </div>
          </footer>
        </div>
      )}
    </main>
  );
}

function shadeColor(hex: string, percent: number) {
  // Handle HSL format (if luxury hue color slider is active)
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

  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  const amount = Math.round(2.55 * percent);
  const red = Math.max(0, Math.min(255, (number >> 16) + amount));
  const green = Math.max(0, Math.min(255, ((number >> 8) & 0x00ff) + amount));
  const blue = Math.max(0, Math.min(255, (number & 0x0000ff) + amount));
  return `#${(0x1000000 + red * 0x10000 + green * 0x100 + blue).toString(16).slice(1)}`;
}
