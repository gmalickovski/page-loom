import {
  AlignLeft,
  BookOpen,
  CalendarDays,
  CheckSquare,
  Clock3,
  Copy,
  Droplets,
  FileText,
  GripVertical,
  Grid3X3,
  Hash,
  Image,
  LayoutTemplate,
  ListChecks,
  Move,
  Plus,
  Quote,
  Smile,
  Sparkles,
  Target,
  Trash2,
  Utensils,
  WalletCards,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { type CSSProperties, type PointerEvent as ReactPointerEvent, useMemo, useRef, useState } from "react";
import type {
  PaperPattern,
  PaperTone,
  PlannerBlockType,
  PlannerBook,
  PlannerInteriorPlan,
  PlannerInteriorSection,
  PlannerLayoutBlock,
  PlannerPage,
} from "../../types/library";

const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const BINDING_MARGIN_MM = 20;
const OUTER_MARGIN_MM = 10;
const CUT_MARGIN_MM = 10;
const BLEED_MM = 3;
const SNAP_MM = 5;

const PAPER_TONES: Record<PaperTone, { label: string; color: string; ink: string }> = {
  offset: { label: "Offset branco", color: "#fffdf8", ink: "#2d2420" },
  pollen: { label: "Polen suave", color: "#fbf3df", ink: "#2d2420" },
  recycled: { label: "Reciclado", color: "#ded0b2", ink: "#2d2420" },
  rice: { label: "Vegetal", color: "rgba(255, 255, 255, 0.72)", ink: "#2d2420" },
  black: { label: "Black paper", color: "#1f1f1d", ink: "#f6f1e7" },
};

const PAPER_PATTERNS: Record<PaperPattern, { label: string; icon: LucideIcon }> = {
  blank: { label: "Branco", icon: FileText },
  lined: { label: "Pautado", icon: AlignLeft },
  dot_grid: { label: "Pontilhado", icon: Grid3X3 },
  grid: { label: "Quadriculado", icon: Hash },
};

interface BlockPreset {
  id: string;
  type: PlannerBlockType;
  title: string;
  variant: string;
  category: "Tempo" | "Bem-estar" | "Organizacao" | "Criativo";
  widthMm: number;
  heightMm: number;
  icon: LucideIcon;
}

const BLOCK_PRESETS: BlockPreset[] = [
  { id: "date-header", type: "date_header", title: "Datador", variant: "Cabecalho", category: "Tempo", widthMm: 108, heightMm: 18, icon: CalendarDays },
  { id: "schedule-vertical", type: "schedule", title: "Cronograma", variant: "Vertical 06-22h", category: "Tempo", widthMm: 48, heightMm: 128, icon: Clock3 },
  { id: "calendar-month", type: "calendar", title: "Calendário", variant: "Mensal 1/2 Página", category: "Tempo", widthMm: 108, heightMm: 92, icon: CalendarDays },
  { id: "calendar-mini", type: "calendar", title: "Mini calendario", variant: "Referencia 4cm", category: "Tempo", widthMm: 40, heightMm: 40, icon: CalendarDays },
  { id: "habit-linear", type: "habit_tracker", title: "Habit tracker", variant: "31 marcadores", category: "Bem-estar", widthMm: 108, heightMm: 24, icon: ListChecks },
  { id: "mood-compact", type: "mood_tracker", title: "Mood tracker", variant: "Humor diario", category: "Bem-estar", widthMm: 52, heightMm: 34, icon: Smile },
  { id: "water-log", type: "water_tracker", title: "Hidratacao", variant: "8 copos", category: "Bem-estar", widthMm: 52, heightMm: 28, icon: Droplets },
  { id: "meal-plan", type: "meal_plan", title: "Refeicoes", variant: "Cafe/almoco/jantar", category: "Bem-estar", widthMm: 58, heightMm: 64, icon: Utensils },
  { id: "checklist", type: "checklist", title: "Checklist", variant: "Prioridades", category: "Organizacao", widthMm: 58, heightMm: 82, icon: CheckSquare },
  { id: "finance", type: "finance_table", title: "Financeiro", variant: "Entrada/saida", category: "Organizacao", widthMm: 108, heightMm: 54, icon: WalletCards },
  { id: "eisenhower", type: "eisenhower", title: "Eisenhower", variant: "4 quadrantes", category: "Organizacao", widthMm: 108, heightMm: 78, icon: Target },
  { id: "notes", type: "notes", title: "Notas", variant: "Linhas livres", category: "Criativo", widthMm: 108, heightMm: 72, icon: AlignLeft },
  { id: "photo", type: "photo", title: "Foto", variant: "Moldura polaroid", category: "Criativo", widthMm: 44, heightMm: 56, icon: Image },
  { id: "quote", type: "quote", title: "Citacao", variant: "Destaque", category: "Criativo", widthMm: 62, heightMm: 34, icon: Quote },
];

const CATEGORY_ORDER: BlockPreset["category"][] = ["Tempo", "Bem-estar", "Organizacao", "Criativo"];

interface PageInteriorDesignerProps {
  compact: boolean;
  capacity: PlannerBook["pages"];
  plan: PlannerInteriorPlan;
  onCapacityChange: (capacity: PlannerBook["pages"]) => void;
  onPlanChange: (plan: PlannerInteriorPlan) => void;
}

export function createDefaultInteriorPlan(
  capacity: PlannerBook["pages"] = 160,
  templateType: PlannerBook["templateType"] = "agenda_2026",
): PlannerInteriorPlan {
  const plan: PlannerInteriorPlan = {
    format: "A5",
    capacity,
    bindingMarginMm: BINDING_MARGIN_MM,
    outerMarginMm: OUTER_MARGIN_MM,
    topMarginMm: CUT_MARGIN_MM,
    bottomMarginMm: CUT_MARGIN_MM,
    bleedMm: BLEED_MM,
    snapMm: SNAP_MM,
    sections: [],
  };

  if (templateType === "custom_planner") {
    plan.sections = [
      section("sec-custom", "Template Livre", "Miolo Personalizado", capacity, "dot_grid", "offset", [
        block("b-custom-date", "date_header", "Datador", "Cabecalho", 20, 12, 108, 18),
        block("b-custom-notes", "notes", "Notas", "Linhas livres", 20, 42, 108, 112),
      ]),
    ];
    return normalizeInteriorPlan(plan, capacity);
  }

  if (templateType === "notes_notebook") {
    plan.sections = [
      section("sec-index", "Abertura", "Indice e metas", 8, "dot_grid", "pollen", [
        block("b-date-index", "date_header", "Datador", "Cabecalho", 20, 12, 108, 18),
        block("b-notes-index", "notes", "Mapa do book", "Linhas livres", 20, 40, 108, 88),
      ]),
      section("sec-notes", "Notas pautadas", "Folha de escrita longa", Math.max(24, capacity - 24), "lined", "offset", [
        block("b-notes-main", "notes", "Notas", "Pagina cheia", 20, 18, 108, 156),
      ]),
      section("sec-free", "Pontilhadas livres", "Bullet journal", 16, "dot_grid", "recycled", [
        block("b-mini-free", "calendar", "Mini calendario", "Referencia 4cm", 20, 16, 40, 40),
        block("b-free-notes", "notes", "Notas", "Area livre", 20, 66, 108, 92),
      ]),
    ];
    return normalizeInteriorPlan(plan, capacity);
  }

  plan.sections = [
    section("sec-opening", "Abertura e Metas", "Metas do Ano", 8, "dot_grid", "pollen", [
      block("b-open-date", "date_header", "Datador", "Cabecalho", 20, 12, 108, 18),
      block("b-open-calendar", "calendar", "Calendário", "Mensal 1/2 Página", 20, 40, 108, 92),
      block("b-open-quote", "quote", "Citacao", "Destaque", 43, 144, 62, 34),
    ]),
    section("sec-daily", "Planejamento Diário", "Time Blocking + Tarefas", Math.max(24, capacity - 48), "lined", "offset", [
      block("b-daily-date", "date_header", "Datador", "Cabecalho", 20, 12, 108, 18),
      block("b-daily-schedule", "schedule", "Cronograma", "Vertical 06-22h", 20, 38, 48, 128),
      block("b-daily-check", "checklist", "Checklist", "Prioridades", 74, 38, 54, 70),
      block("b-daily-water", "water_tracker", "Hidratacao", "8 copos", 74, 116, 52, 28),
      block("b-daily-mood", "mood_tracker", "Mood tracker", "Humor diario", 74, 150, 52, 28),
    ]),
    section("sec-review", "Revisão Mensal", "Hábitos e Finanças", 24, "grid", "pollen", [
      block("b-review-habit", "habit_tracker", "Habit tracker", "31 marcadores", 20, 18, 108, 24),
      block("b-review-finance", "finance_table", "Financeiro", "Entrada/saida", 20, 52, 108, 54),
      block("b-review-eisenhower", "eisenhower", "Eisenhower", "4 quadrantes", 20, 118, 108, 60),
    ]),
    section("sec-notes", "Notas Livres", "Pontilhado Premium", 16, "dot_grid", "recycled", [
      block("b-notes-mini", "calendar", "Mini calendario", "Referencia 4cm", 20, 18, 40, 40),
      block("b-notes-main", "notes", "Notas", "Linhas livres", 20, 68, 108, 92),
    ]),
  ];

  return normalizeInteriorPlan(plan, capacity);
}

export function normalizeInteriorPlan(plan: PlannerInteriorPlan, capacity: PlannerBook["pages"]): PlannerInteriorPlan {
  const sections = plan.sections.map((sectionItem) => ({
    ...sectionItem,
    pageCount: Math.max(1, Math.round(sectionItem.pageCount)),
    blocks: sectionItem.blocks.map((layoutBlock) => clampBlock(layoutBlock, "odd")),
  }));

  let total = sections.reduce((sum, sectionItem) => sum + sectionItem.pageCount, 0);
  if (total > capacity) {
    let overflow = total - capacity;
    for (let index = sections.length - 1; index >= 0 && overflow > 0; index -= 1) {
      const removable = Math.max(0, sections[index].pageCount - 1);
      const amount = Math.min(removable, overflow);
      sections[index] = { ...sections[index], pageCount: sections[index].pageCount - amount };
      overflow -= amount;
    }
    total = sections.reduce((sum, sectionItem) => sum + sectionItem.pageCount, 0);
  }

  return {
    ...plan,
    capacity,
    format: "A5",
    bindingMarginMm: BINDING_MARGIN_MM,
    outerMarginMm: OUTER_MARGIN_MM,
    topMarginMm: CUT_MARGIN_MM,
    bottomMarginMm: CUT_MARGIN_MM,
    bleedMm: BLEED_MM,
    snapMm: SNAP_MM,
    sections,
  };
}

export function getInteriorPlanPageCount(plan: PlannerInteriorPlan) {
  return plan.sections.reduce((sum, sectionItem) => sum + sectionItem.pageCount, 0);
}

export function createPagesFromInteriorPlan(plan: PlannerInteriorPlan, title: string, description: string): PlannerPage[] {
  const plannerPages: PlannerPage[] = [
    {
      id: "cover",
      title: "Contracapa",
      date: "A5",
      template: "cover",
      pageData: {
        notes: description || "Planner personalizado Pageloom.",
        ownerName: "Usuario Pageloom",
        ownerEmail: "contato@pageloom.com",
        ownerPhone: "+55 (11) 99999-9999",
      },
    },
  ];

  let printedPageNumber = 1;

  plan.sections.forEach((sectionItem) => {
    const spreads = Math.max(1, Math.ceil(sectionItem.pageCount / 2));
    Array.from({ length: spreads }).forEach((_, spreadIndex) => {
      plannerPages.push({
        id: `${sectionItem.id}-spread-${spreadIndex + 1}`,
        title: spreadIndex === 0 ? sectionItem.title : `${sectionItem.title} ${spreadIndex + 1}`,
        date: `${Math.min(sectionItem.pageCount, (spreadIndex + 1) * 2)} pags`,
        template: "custom",
        pageData: {
          notes: "",
          sectionTitle: sectionItem.title,
          paperPattern: sectionItem.paperPattern,
          paperTone: sectionItem.paperTone,
          layoutBlocks: sectionItem.blocks,
          pageNumberMode: sectionItem.pageNumberMode,
          printedPageNumber,
        },
      });
      printedPageNumber += 2;
    });
  });

  if (plannerPages.length === 1) {
    plannerPages.push({
      id: "custom-empty",
      title: title || "Miolo Personalizado",
      date: "A5",
      template: "custom",
      pageData: {
        sectionTitle: "Miolo Personalizado",
        paperPattern: "dot_grid",
        paperTone: "offset",
        layoutBlocks: [block("b-empty-notes", "notes", "Notas", "Linhas livres", 20, 20, 108, 120)],
        pageNumberMode: "auto",
        printedPageNumber: 1,
      },
    });
  }

  return plannerPages;
}

export function PageInteriorDesigner({
  compact,
  capacity,
  plan,
  onCapacityChange,
  onPlanChange,
}: PageInteriorDesignerProps) {
  const [selectedSectionId, setSelectedSectionId] = useState(() => plan.sections[0]?.id ?? "");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewSide, setPreviewSide] = useState<"odd" | "even">("odd");
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  const selectedSection = plan.sections.find((sectionItem) => sectionItem.id === selectedSectionId) ?? plan.sections[0];
  const selectedBlock = selectedSection?.blocks.find((layoutBlock) => layoutBlock.id === selectedBlockId) ?? null;
  const totalPages = getInteriorPlanPageCount(plan);
  const availablePages = capacity - totalPages;
  const progress = Math.min(100, Math.max(0, (totalPages / capacity) * 100));

  const groupedPresets = useMemo(
    () => CATEGORY_ORDER.map((category) => ({
      category,
      items: BLOCK_PRESETS.filter((preset) => preset.category === category),
    })),
    [],
  );

  const emitPlan = (nextPlan: PlannerInteriorPlan) => onPlanChange(normalizeInteriorPlan(nextPlan, capacity));

  const updateSection = (sectionId: string, updater: (sectionItem: PlannerInteriorSection) => PlannerInteriorSection) => {
    emitPlan({
      ...plan,
      sections: plan.sections.map((sectionItem) => (sectionItem.id === sectionId ? updater(sectionItem) : sectionItem)),
    });
  };

  const handleCapacityClick = (nextCapacity: PlannerBook["pages"]) => {
    onCapacityChange(nextCapacity);
    onPlanChange(normalizeInteriorPlan({ ...plan, capacity: nextCapacity }, nextCapacity));
  };

  const handleSectionDrop = (targetId: string) => {
    if (!draggedSectionId || draggedSectionId === targetId) return;

    const nextSections = [...plan.sections];
    const draggedIndex = nextSections.findIndex((sectionItem) => sectionItem.id === draggedSectionId);
    const targetIndex = nextSections.findIndex((sectionItem) => sectionItem.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) return;

    const [draggedSection] = nextSections.splice(draggedIndex, 1);
    nextSections.splice(targetIndex, 0, draggedSection);
    setDraggedSectionId(null);
    emitPlan({ ...plan, sections: nextSections });
  };

  const addSection = () => {
    const remaining = Math.max(1, capacity - totalPages);
    const nextSection = section(
      `sec-${Date.now()}`,
      "Novo grupo",
      "Template personalizado",
      Math.min(16, Math.max(4, remaining)),
      "dot_grid",
      "offset",
      [
        block(`b-${Date.now()}-date`, "date_header", "Datador", "Cabecalho", 20, 12, 108, 18),
        block(`b-${Date.now()}-notes`, "notes", "Notas", "Linhas livres", 20, 42, 108, 96),
      ],
    );

    emitPlan({ ...plan, sections: [...plan.sections, nextSection] });
    setSelectedSectionId(nextSection.id);
    setSelectedBlockId(nextSection.blocks[0]?.id ?? null);
  };

  const duplicateSection = (sectionItem: PlannerInteriorSection) => {
    const cloned: PlannerInteriorSection = {
      ...sectionItem,
      id: `sec-${Date.now()}`,
      title: `${sectionItem.title} copia`,
      blocks: sectionItem.blocks.map((layoutBlock) => ({ ...layoutBlock, id: `${layoutBlock.id}-${Date.now()}` })),
    };
    emitPlan({ ...plan, sections: [...plan.sections, cloned] });
    setSelectedSectionId(cloned.id);
  };

  const removeSection = (sectionId: string) => {
    if (plan.sections.length <= 1) return;
    const nextSections = plan.sections.filter((sectionItem) => sectionItem.id !== sectionId);
    emitPlan({ ...plan, sections: nextSections });
    setSelectedSectionId(nextSections[0]?.id ?? "");
    setSelectedBlockId(null);
  };

  const addBlockFromPreset = (preset: BlockPreset) => {
    if (!selectedSection) return;

    const index = selectedSection.blocks.length;
    const rawBlock = block(
      `${preset.id}-${Date.now()}`,
      preset.type,
      preset.title,
      preset.variant,
      20 + (index % 2) * 54,
      18 + Math.floor(index / 2) * 34,
      preset.widthMm,
      preset.heightMm,
    );
    const nextBlock = clampBlock(rawBlock, previewSide);

    updateSection(selectedSection.id, (sectionItem) => ({
      ...sectionItem,
      blocks: [...sectionItem.blocks, nextBlock],
    }));
    setSelectedBlockId(nextBlock.id);
  };

  const deleteBlock = (blockId: string) => {
    if (!selectedSection) return;

    updateSection(selectedSection.id, (sectionItem) => ({
      ...sectionItem,
      blocks: sectionItem.blocks.filter((layoutBlock) => layoutBlock.id !== blockId),
    }));
    setSelectedBlockId(null);
  };

  const moveBlock = (blockId: string, xMm: number, yMm: number) => {
    if (!selectedSection) return;

    updateSection(selectedSection.id, (sectionItem) => ({
      ...sectionItem,
      blocks: sectionItem.blocks.map((layoutBlock) =>
        layoutBlock.id === blockId
          ? clampBlock({ ...layoutBlock, xMm: snap(xMm), yMm: snap(yMm) }, previewSide)
          : layoutBlock,
      ),
    }));
  };

  const handleBlockPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, layoutBlock: PlannerLayoutBlock) => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    event.preventDefault();
    event.stopPropagation();
    setSelectedBlockId(layoutBlock.id);

    const rect = pageElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const blockStartX = layoutBlock.xMm;
    const blockStartY = layoutBlock.yMm;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * A5_WIDTH_MM;
      const dy = ((moveEvent.clientY - startY) / rect.height) * A5_HEIGHT_MM;
      moveBlock(layoutBlock.id, blockStartX + dx, blockStartY + dy);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  if (!selectedSection) {
    return (
      <div className="interior-designer interior-designer--empty">
        <button type="button" className="btn-wizard-primary" onClick={addSection}>
          <Plus size={16} />
          Criar Grupo de Páginas
        </button>
      </div>
    );
  }

  const safeAreaStyle = getSafeAreaStyle(previewSide);
  const paperTone = PAPER_TONES[selectedSection.paperTone];

  return (
    <div className={`interior-designer ${compact ? "interior-designer--compact" : ""}`}>
      <aside className="interior-sidebar interior-sidebar--structure">
        <div className="interior-panel-heading">
          <span><BookOpen size={14} /> Estrutura</span>
          <button type="button" onClick={addSection} aria-label="Adicionar grupo">
            <Plus size={15} />
          </button>
        </div>

        <div className="interior-capacity">
          <div className="interior-capacity__numbers">
            <strong>{totalPages} / {capacity}</strong>
            <span>{availablePages >= 0 ? `${availablePages} livres` : `${Math.abs(availablePages)} acima`}</span>
          </div>
          <div className={`interior-capacity__bar ${availablePages < 0 ? "is-over" : ""}`}>
            <i style={{ width: `${progress}%` }} />
          </div>
          <div className="interior-capacity__segments">
            {([80, 160, 240] as const).map((amount) => (
              <button
                key={amount}
                type="button"
                className={capacity === amount ? "is-active" : ""}
                onClick={() => handleCapacityClick(amount)}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        <div className="interior-section-list">
          {plan.sections.map((sectionItem) => (
            <button
              key={sectionItem.id}
              type="button"
              draggable
              className={`interior-section-row ${selectedSection.id === sectionItem.id ? "is-active" : ""}`}
              onClick={() => {
                setSelectedSectionId(sectionItem.id);
                setSelectedBlockId(sectionItem.blocks[0]?.id ?? null);
              }}
              onDragStart={() => setDraggedSectionId(sectionItem.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleSectionDrop(sectionItem.id)}
            >
              <GripVertical size={14} />
              <span>
                <strong>{sectionItem.title}</strong>
                <small>{sectionItem.pageCount} pags · {sectionItem.templateName}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="interior-canvas-column">
        <div className="interior-toolbar">
          <div className="interior-toolbar__title">
            <span><LayoutTemplate size={14} /> Template A5</span>
            <strong>{selectedSection.templateName}</strong>
          </div>
          <div className="interior-page-side-toggle" aria-label="Lado da Página">
            <button type="button" className={previewSide === "odd" ? "is-active" : ""} onClick={() => setPreviewSide("odd")}>
              Impar
            </button>
            <button type="button" className={previewSide === "even" ? "is-active" : ""} onClick={() => setPreviewSide("even")}>
              Par
            </button>
          </div>
        </div>

        <div className="interior-page-stage">
          <div
            ref={pageRef}
            className={`interior-page-preview interior-page-preview--${selectedSection.paperTone} interior-page-preview--${selectedSection.paperPattern} interior-page-preview--${previewSide}`}
            style={{
              "--paper-color": paperTone.color,
              "--paper-ink": paperTone.ink,
            } as CSSProperties}
          >
            <div className="interior-page-preview__bleed" aria-hidden="true" />
            <div className="interior-page-preview__binding-zone" aria-hidden="true" />
            <div className="interior-page-preview__safe-zone" style={safeAreaStyle} aria-hidden="true" />

            {selectedSection.blocks.map((layoutBlock) => (
              <button
                key={layoutBlock.id}
                type="button"
                className={`interior-layout-block interior-layout-block--${layoutBlock.type} ${selectedBlockId === layoutBlock.id ? "is-active" : ""}`}
                style={blockStyle(layoutBlock)}
                onPointerDown={(event) => handleBlockPointerDown(event, layoutBlock)}
                onClick={() => setSelectedBlockId(layoutBlock.id)}
              >
                <BlockArtwork block={layoutBlock} />
              </button>
            ))}
          </div>
        </div>
      </section>

      <aside className="interior-sidebar interior-sidebar--tools">
        <div className="interior-section-editor">
          <label>
            <span>Grupo</span>
            <input
              type="text"
              value={selectedSection.title}
              onChange={(event) => updateSection(selectedSection.id, (sectionItem) => ({ ...sectionItem, title: event.target.value }))}
            />
          </label>
          <label>
            <span>Template</span>
            <input
              type="text"
              value={selectedSection.templateName}
              onChange={(event) => updateSection(selectedSection.id, (sectionItem) => ({ ...sectionItem, templateName: event.target.value }))}
            />
          </label>
          <label>
            <span>Páginas</span>
            <input
              type="number"
              min={1}
              max={capacity}
              value={selectedSection.pageCount}
              onChange={(event) => updateSection(selectedSection.id, (sectionItem) => ({
                ...sectionItem,
                pageCount: Math.max(1, Number(event.target.value) || 1),
              }))}
            />
          </label>
        </div>

        <div className="interior-surface-tools">
          <span className="interior-tools-label"><Sparkles size={13} /> Papel</span>
          <div className="interior-paper-swatches">
            {(Object.keys(PAPER_TONES) as PaperTone[]).map((tone) => (
              <button
                key={tone}
                type="button"
                className={selectedSection.paperTone === tone ? "is-active" : ""}
                onClick={() => updateSection(selectedSection.id, (sectionItem) => ({ ...sectionItem, paperTone: tone }))}
                title={PAPER_TONES[tone].label}
                aria-label={PAPER_TONES[tone].label}
              >
                <i style={{ background: PAPER_TONES[tone].color }} />
              </button>
            ))}
          </div>
          <div className="interior-pattern-tabs">
            {(Object.keys(PAPER_PATTERNS) as PaperPattern[]).map((pattern) => {
              const PatternIcon = PAPER_PATTERNS[pattern].icon;
              return (
                <button
                  key={pattern}
                  type="button"
                  className={selectedSection.paperPattern === pattern ? "is-active" : ""}
                  onClick={() => updateSection(selectedSection.id, (sectionItem) => ({ ...sectionItem, paperPattern: pattern }))}
                  title={PAPER_PATTERNS[pattern].label}
                  aria-label={PAPER_PATTERNS[pattern].label}
                >
                  <PatternIcon size={14} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="interior-block-library">
          <span className="interior-tools-label"><Move size={13} /> Blocos</span>
          {groupedPresets.map((group) => (
            <div className="interior-block-group" key={group.category}>
              <strong>{group.category}</strong>
              <div className="interior-block-preset-grid">
                {group.items.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button key={preset.id} type="button" onClick={() => addBlockFromPreset(preset)}>
                      <Icon size={15} />
                      <span>
                        <b>{preset.title}</b>
                        <small>{preset.variant}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="interior-selected-tools">
          {selectedBlock ? (
            <>
              <span className="interior-tools-label"><CheckSquare size={13} /> Bloco selecionado</span>
              <div className="interior-selected-block">
                <strong>{selectedBlock.title}</strong>
                <small>{selectedBlock.variant} · {selectedBlock.widthMm} x {selectedBlock.heightMm} mm</small>
                <button type="button" onClick={() => deleteBlock(selectedBlock.id)}>
                  <Trash2 size={14} />
                  Remover
                </button>
              </div>
            </>
          ) : (
            <div className="interior-selected-block interior-selected-block--empty">
              <span>Blocos em tamanho fixo</span>
              <small>Snap de {SNAP_MM} mm · margem interna de {BINDING_MARGIN_MM} mm · sangria de {BLEED_MM} mm</small>
            </div>
          )}
        </div>

        <div className="interior-section-actions">
          <button type="button" onClick={() => duplicateSection(selectedSection)}>
            <Copy size={14} />
            Duplicar
          </button>
          <button type="button" onClick={() => removeSection(selectedSection.id)} disabled={plan.sections.length <= 1}>
            <Trash2 size={14} />
            Excluir
          </button>
        </div>
      </aside>
    </div>
  );
}

export function BlockArtwork({ block }: { block: PlannerLayoutBlock }) {
  if (block.type === "page_background") {
    return (
      <span className={`block-art block-art--page-background block-art--page-background-${block.variant}`}>
        <b>{block.title}</b>
        {Array.from({ length: 12 }).map((_, index) => <i key={index} />)}
      </span>
    );
  }

  if (block.type === "date_header") {
    return (
      <span className="block-art block-art--date">
        <b>{block.title}</b>
        <i />
      </span>
    );
  }

  if (block.type === "schedule") {
    return (
      <span className="block-art block-art--schedule">
        {Array.from({ length: 8 }).map((_, index) => (
          <i key={index}><em>{`${6 + index * 2}:00`}</em><b /></i>
        ))}
      </span>
    );
  }

  if (block.type === "calendar") {
    return (
      <span className="block-art block-art--calendar">
        <b>{block.title}</b>
        <span>
          {Array.from({ length: 35 }).map((_, index) => <i key={index} />)}
        </span>
      </span>
    );
  }

  if (block.type === "habit_tracker") {
    return (
      <span className="block-art block-art--habit">
        <b>{block.title}</b>
        <span>{Array.from({ length: 31 }).map((_, index) => <i key={index} />)}</span>
      </span>
    );
  }

  if (block.type === "mood_tracker") {
    return (
      <span className="block-art block-art--mood">
        <b>{block.title}</b>
        <span>{Array.from({ length: 5 }).map((_, index) => <i key={index} />)}</span>
      </span>
    );
  }

  if (block.type === "water_tracker") {
    return (
      <span className="block-art block-art--water">
        <b>{block.title}</b>
        <span>{Array.from({ length: 8 }).map((_, index) => <i key={index} />)}</span>
      </span>
    );
  }

  if (block.type === "meal_plan") {
    return (
      <span className="block-art block-art--rows">
        <b>{block.title}</b>
        {["Cafe", "Almoco", "Jantar", "Lanche"].map((label) => <i key={label}>{label}</i>)}
      </span>
    );
  }

  if (block.type === "checklist") {
    return (
      <span className="block-art block-art--checklist">
        <b>{block.title}</b>
        {Array.from({ length: 6 }).map((_, index) => <i key={index}><em /><span /></i>)}
      </span>
    );
  }

  if (block.type === "finance_table") {
    return (
      <span className="block-art block-art--finance">
        <b>{block.title}</b>
        <span>{["Entrada", "Saida", "Saldo"].map((label) => <i key={label}>{label}</i>)}</span>
        {Array.from({ length: 3 }).map((_, index) => <em key={index} />)}
      </span>
    );
  }

  if (block.type === "eisenhower") {
    return (
      <span className="block-art block-art--eisenhower">
        <b>{block.title}</b>
        <span>{Array.from({ length: 4 }).map((_, index) => <i key={index} />)}</span>
      </span>
    );
  }

  if (block.type === "photo") {
    return (
      <span className="block-art block-art--photo">
        <Image size={16} />
        <i />
      </span>
    );
  }

  if (block.type === "quote") {
    return (
      <span className="block-art block-art--quote">
        <Quote size={15} />
        <i />
        <i />
      </span>
    );
  }

  return (
    <span className="block-art block-art--notes">
      <b>{block.title}</b>
      {Array.from({ length: 8 }).map((_, index) => <i key={index} />)}
    </span>
  );
}

function section(
  id: string,
  title: string,
  templateName: string,
  pageCount: number,
  paperPattern: PaperPattern,
  paperTone: PaperTone,
  blocks: PlannerLayoutBlock[],
): PlannerInteriorSection {
  return {
    id,
    title,
    templateName,
    pageCount,
    paperPattern,
    paperTone,
    blocks,
    pageNumberMode: "auto",
  };
}

function block(
  id: string,
  type: PlannerBlockType,
  title: string,
  variant: string,
  xMm: number,
  yMm: number,
  widthMm: number,
  heightMm: number,
): PlannerLayoutBlock {
  return { id, type, title, variant, xMm, yMm, widthMm, heightMm };
}

function snap(value: number) {
  return Math.round(value / SNAP_MM) * SNAP_MM;
}

function clampBlock(layoutBlock: PlannerLayoutBlock, side: "odd" | "even") {
  const leftMargin = side === "odd" ? BINDING_MARGIN_MM : OUTER_MARGIN_MM;
  const rightMargin = side === "odd" ? OUTER_MARGIN_MM : BINDING_MARGIN_MM;
  const minX = leftMargin;
  const maxX = A5_WIDTH_MM - rightMargin - layoutBlock.widthMm;
  const minY = CUT_MARGIN_MM;
  const maxY = A5_HEIGHT_MM - CUT_MARGIN_MM - layoutBlock.heightMm;

  return {
    ...layoutBlock,
    widthMm: Math.min(layoutBlock.widthMm, A5_WIDTH_MM - leftMargin - rightMargin),
    heightMm: Math.min(layoutBlock.heightMm, A5_HEIGHT_MM - CUT_MARGIN_MM * 2),
    xMm: Math.max(minX, Math.min(Math.max(minX, maxX), layoutBlock.xMm)),
    yMm: Math.max(minY, Math.min(Math.max(minY, maxY), layoutBlock.yMm)),
  };
}

function getSafeAreaStyle(side: "odd" | "even"): CSSProperties {
  const leftMargin = side === "odd" ? BINDING_MARGIN_MM : OUTER_MARGIN_MM;
  const rightMargin = side === "odd" ? OUTER_MARGIN_MM : BINDING_MARGIN_MM;

  return {
    left: `${(leftMargin / A5_WIDTH_MM) * 100}%`,
    right: `${(rightMargin / A5_WIDTH_MM) * 100}%`,
    top: `${(CUT_MARGIN_MM / A5_HEIGHT_MM) * 100}%`,
    bottom: `${(CUT_MARGIN_MM / A5_HEIGHT_MM) * 100}%`,
  };
}

function blockStyle(layoutBlock: PlannerLayoutBlock): CSSProperties {
  return {
    left: `${(layoutBlock.xMm / A5_WIDTH_MM) * 100}%`,
    top: `${(layoutBlock.yMm / A5_HEIGHT_MM) * 100}%`,
    width: `${(layoutBlock.widthMm / A5_WIDTH_MM) * 100}%`,
    height: `${(layoutBlock.heightMm / A5_HEIGHT_MM) * 100}%`,
  };
}
