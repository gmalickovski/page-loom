import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Copy,
  Edit3,
  FileText,
  LayoutTemplate,
  Plus,
  Printer,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  PlannerBlockType,
  PlannerBook,
  PlannerInteriorPlan,
  PlannerInteriorSection,
  PlannerInteriorTemplate,
  PlannerLayoutBlock,
  PaperPattern,
} from "../../types/library";
import { BottomSheetModal } from "../layout/BottomSheetModal";
import { BlockArtwork, createDefaultInteriorPlan, getInteriorPlanPageCount, normalizeInteriorPlan } from "./PageInteriorDesigner";

const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const BINDING_MARGIN_MM = 20;
const OUTER_MARGIN_MM = 10;
const CUT_MARGIN_MM = 10;
const SNAP_MM = 5;
const MIN_BLOCK_WIDTH_MM = 24;
const MIN_BLOCK_HEIGHT_MM = 18;

type EditorPanel = "pages" | "blocks" | null;
type BlockCategory = "Tempo" | "Bem-estar" | "Organizacao" | "Criativo";
type PageBackgroundChoice = Extract<PaperPattern, "blank" | "lined" | "dot_grid">;

interface TemplateGalleryScreenProps {
  compact: boolean;
  templates: PlannerInteriorTemplate[];
  onCreateTemplate: () => void;
  onEditTemplate: (template: PlannerInteriorTemplate) => void;
}

interface TemplateEditorScreenProps {
  compact: boolean;
  template?: PlannerInteriorTemplate | null;
  activePanel?: EditorPanel;
  onClosePanel?: () => void;
  onCancel: () => void;
  onSave: (template: PlannerInteriorTemplate) => void;
}

interface BlockPreset {
  id: string;
  type: PlannerBlockType;
  title: string;
  variant: string;
  category: BlockCategory;
  widthMm: number;
  heightMm: number;
}

const BLOCK_PRESETS: BlockPreset[] = [
  { id: "date-header", type: "date_header", title: "Datador", variant: "Cabecalho", category: "Tempo", widthMm: 108, heightMm: 18 },
  { id: "schedule", type: "schedule", title: "Cronograma", variant: "06-22h", category: "Tempo", widthMm: 48, heightMm: 128 },
  { id: "calendar", type: "calendar", title: "Calendário", variant: "Mensal", category: "Tempo", widthMm: 108, heightMm: 92 },
  { id: "mini-calendar", type: "calendar", title: "Mini calendario", variant: "4cm", category: "Tempo", widthMm: 40, heightMm: 40 },
  { id: "habit", type: "habit_tracker", title: "Hábitos", variant: "31 dias", category: "Bem-estar", widthMm: 108, heightMm: 24 },
  { id: "mood", type: "mood_tracker", title: "Humor", variant: "Diario", category: "Bem-estar", widthMm: 52, heightMm: 34 },
  { id: "water", type: "water_tracker", title: "Hidratacao", variant: "8 copos", category: "Bem-estar", widthMm: 52, heightMm: 28 },
  { id: "meals", type: "meal_plan", title: "Refeicoes", variant: "4 linhas", category: "Bem-estar", widthMm: 58, heightMm: 64 },
  { id: "checklist", type: "checklist", title: "Checklist", variant: "Prioridades", category: "Organizacao", widthMm: 58, heightMm: 82 },
  { id: "finance", type: "finance_table", title: "Financeiro", variant: "Entrada/saida", category: "Organizacao", widthMm: 108, heightMm: 54 },
  { id: "eisenhower", type: "eisenhower", title: "Eisenhower", variant: "4 quadrantes", category: "Organizacao", widthMm: 108, heightMm: 78 },
  { id: "notes", type: "notes", title: "Notas", variant: "Linhas livres", category: "Criativo", widthMm: 108, heightMm: 72 },
  { id: "photo", type: "photo", title: "Foto", variant: "Polaroid", category: "Criativo", widthMm: 44, heightMm: 56 },
  { id: "quote", type: "quote", title: "Citacao", variant: "Destaque", category: "Criativo", widthMm: 62, heightMm: 34 },
];

const BLOCK_CATEGORIES: BlockCategory[] = ["Tempo", "Bem-estar", "Organizacao", "Criativo"];
const PAGE_BACKGROUND_OPTIONS: Array<{ id: PageBackgroundChoice; label: string; description: string }> = [
  { id: "blank", label: "Em Branco", description: "Área Livre" },
];

export function TemplateGalleryScreen({
  compact,
  templates,
  onCreateTemplate,
  onEditTemplate,
}: TemplateGalleryScreenProps) {
  const sortedTemplates = useMemo(
    () => [...templates].sort((a, b) => Number(Boolean(a.isSystem)) - Number(Boolean(b.isSystem))),
    [templates],
  );

  return (
    <main className={`screen screen-templates ${compact ? "screen--compact" : ""}`}>
      <div className="screen__headline template-gallery__headline">
        <div>
          <h2>Templates</h2>
          <p>Miolos A5 salvos para books, refis e impressao fisica.</p>
        </div>
        <button className="screen__headline-action" type="button" onClick={onCreateTemplate}>
          <Plus size={18} />
          Novo template
        </button>
      </div>

      <section className="template-gallery">
        <div className="template-gallery__actions">
          <button type="button" className="template-gallery__primary" onClick={onCreateTemplate}>
            <Plus size={18} />
            Criar template
          </button>
          <button type="button" className="template-gallery__ghost" disabled title="Acesso de impressao reservado ao admin">
            <ShieldCheck size={17} />
            Impressao admin
          </button>
        </div>

        <div className="template-gallery__grid">
          {sortedTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} onEdit={() => onEditTemplate(template)} />
          ))}
        </div>
      </section>
    </main>
  );
}

export function TemplateEditorScreen({
  compact,
  template,
  activePanel = null,
  onClosePanel = () => undefined,
  onCancel,
  onSave,
}: TemplateEditorScreenProps) {
  const [name] = useState(template?.name ?? "Novo template de miolo");
  const [description] = useState(template?.description ?? "Template A5 personalizado para planner impresso.");
  const [capacity] = useState<PlannerBook["pages"]>(template?.plan.capacity ?? 160);
  const [plan, setPlan] = useState<PlannerInteriorPlan>(
    forceWhitePaperPlan(template?.plan ? clonePlan(template.plan) : createDefaultInteriorPlan(160, "custom_planner")),
  );
  const [activeSectionId, setActiveSectionId] = useState(() => plan.sections[0]?.id ?? "");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeBlockCategory, setActiveBlockCategory] = useState<BlockCategory | null>(null);
  const [isAddPageModalOpen, setIsAddPageModalOpen] = useState(false);
  const [newPageName, setNewPageName] = useState("Template Livre");
  const [newPageBackground, setNewPageBackground] = useState<PageBackgroundChoice>("blank");
  const [pageZoom, setPageZoom] = useState(1);
  const [isPageCountOpen, setIsPageCountOpen] = useState(false);
  const [savedPlanSnapshot, setSavedPlanSnapshot] = useState(() => JSON.stringify(normalizeInteriorPlan(plan, capacity)));
  const pageRef = useRef<HTMLDivElement>(null);
  const editorToolbarRef = useRef<HTMLDivElement>(null);

  const activeSection = plan.sections.find((section) => section.id === activeSectionId) ?? plan.sections[0];
  const activeSectionIndex = Math.max(0, plan.sections.findIndex((section) => section.id === activeSection?.id));
  const pageCount = activeSection?.pageCount ?? 1;
  const planSnapshot = useMemo(() => JSON.stringify(normalizeInteriorPlan(plan, capacity)), [capacity, plan]);
  const hasUnsavedChanges = planSnapshot !== savedPlanSnapshot;
  const controlScale = 1 / pageZoom;

  const updatePageZoom = (delta: number) => {
    setPageZoom((currentZoom) => Math.max(0.8, Math.min(1.6, Math.round((currentZoom + delta) * 10) / 10)));
  };

  useEffect(() => {
    if (!isPageCountOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (editorToolbarRef.current?.contains(event.target as Node)) return;
      setIsPageCountOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isPageCountOpen]);

  const handleSave = () => {
    const now = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    setSavedPlanSnapshot(planSnapshot);
    onSave({
      id: template?.id ?? `template-${Date.now()}`,
      name: name.trim() || "Template sem nome",
      description: description.trim() || "Template A5 personalizado.",
      category: template?.category ?? "custom",
      createdAt: template?.createdAt ?? now,
      updatedAt: now,
      plan: normalizeInteriorPlan(plan, capacity),
      printPolicy: template?.printPolicy ?? "admin_only",
      isSystem: template?.isSystem,
    });
  };

  const updateActiveSection = (updater: (section: PlannerInteriorSection) => PlannerInteriorSection) => {
    if (!activeSection) return;
    setPlan((currentPlan) => ({
      ...currentPlan,
      sections: currentPlan.sections.map((section) => (section.id === activeSection.id ? updater(section) : section)),
    }));
  };

  const updatePageCount = (nextPageCount: number) => {
    const cleanCount = Math.max(1, Math.min(240, Math.round(nextPageCount) || 1));
    updateActiveSection((section) => ({ ...section, pageCount: cleanCount }));
  };

  const addSection = (options?: { title?: string; paperPattern?: PageBackgroundChoice }) => {
    const paperPattern = options?.paperPattern ?? "blank";
    const title = options?.title?.trim() || `Pagina ${plan.sections.length + 1}`;
    const nextSection: PlannerInteriorSection = {
      id: `sec-${Date.now()}`,
      title,
      templateName: `Fundo ${getBackgroundLabel(paperPattern).toLowerCase()}`,
      pageCount: 8,
      paperPattern: "blank",
      paperTone: "offset",
      pageNumberMode: "auto",
      blocks: [createBackgroundBlock(paperPattern)],
    };
    setPlan((currentPlan) => ({ ...currentPlan, sections: [...currentPlan.sections, nextSection] }));
    setActiveSectionId(nextSection.id);
    setActiveBlockId(nextSection.blocks[0]?.id ?? null);
  };

  const handleCreatePage = () => {
    addSection({ title: newPageName, paperPattern: newPageBackground });
    setIsAddPageModalOpen(false);
    setNewPageName("Template Livre");
    setNewPageBackground("blank");
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    const index = plan.sections.findIndex((section) => section.id === sectionId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= plan.sections.length) return;
    const nextSections = [...plan.sections];
    const [section] = nextSections.splice(index, 1);
    nextSections.splice(targetIndex, 0, section);
    setPlan((currentPlan) => ({ ...currentPlan, sections: nextSections }));
  };

  const deleteSection = (sectionId: string) => {
    if (plan.sections.length <= 1) return;
    const nextSections = plan.sections.filter((section) => section.id !== sectionId);
    setPlan((currentPlan) => ({ ...currentPlan, sections: nextSections }));
    setActiveSectionId(nextSections[0]?.id ?? "");
  };

  const addBlock = (preset: BlockPreset, xMm = 20, yMm = 36) => {
    if (!activeSection) return;
    const nextBlock = clampBlock(createBlockFromPreset(preset, xMm, yMm));
    updateActiveSection((section) => ({ ...section, blocks: fitBackgroundBlock([...section.blocks, nextBlock]) }));
    setActiveBlockId(nextBlock.id);
  };

  const moveBlock = (blockId: string, xMm: number, yMm: number) => {
    updateActiveSection((section) => ({
      ...section,
      blocks: fitBackgroundBlock(
        section.blocks.map((block) => (block.id === blockId ? clampBlock({ ...block, xMm: snap(xMm), yMm: snap(yMm) }) : block)),
        blockId,
      ),
    }));
  };

  const resizeBlock = (blockId: string, widthMm: number, heightMm: number) => {
    updateActiveSection((section) => ({
      ...section,
      blocks: fitBackgroundBlock(
        section.blocks.map((block) => (block.id === blockId ? clampBlock({ ...block, widthMm: snap(widthMm), heightMm: snap(heightMm) }) : block)),
        blockId,
      ),
    }));
  };

  const deleteBlock = (blockId: string) => {
    updateActiveSection((section) => ({
      ...section,
      blocks: fitBackgroundBlock(section.blocks.filter((block) => block.id !== blockId)),
    }));
    setActiveBlockId(null);
  };

  const handleBlockPointerDown = (event: ReactPointerEvent<HTMLElement>, block: PlannerLayoutBlock) => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    event.preventDefault();
    event.stopPropagation();
    setActiveBlockId(block.id);

    const rect = pageElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const blockStartX = block.xMm;
    const blockStartY = block.yMm;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * A5_WIDTH_MM;
      const dy = ((moveEvent.clientY - startY) / rect.height) * A5_HEIGHT_MM;
      moveBlock(block.id, blockStartX + dx, blockStartY + dy);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleResizePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, block: PlannerLayoutBlock) => {
    const pageElement = pageRef.current;
    if (!pageElement) return;

    event.preventDefault();
    event.stopPropagation();
    setActiveBlockId(block.id);

    const rect = pageElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const blockStartWidth = block.widthMm;
    const blockStartHeight = block.heightMm;

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * A5_WIDTH_MM;
      const dy = ((moveEvent.clientY - startY) / rect.height) * A5_HEIGHT_MM;
      resizeBlock(block.id, blockStartWidth + dx, blockStartHeight + dy);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    const presetId = event.dataTransfer.getData("application/pageloom-block");
    const preset = BLOCK_PRESETS.find((item) => item.id === presetId);
    const pageElement = pageRef.current;
    if (!preset || !pageElement) return;

    event.preventDefault();
    const rect = pageElement.getBoundingClientRect();
    const xMm = ((event.clientX - rect.left) / rect.width) * A5_WIDTH_MM;
    const yMm = ((event.clientY - rect.top) / rect.height) * A5_HEIGHT_MM;
    addBlock(preset, xMm, yMm);
    onClosePanel();
  };

  const quantityControls = (
    <div className="template-editor-mini-header" ref={editorToolbarRef}>
      <button
        type="button"
        className={`template-page-count-pill ${isPageCountOpen ? "is-active" : ""}`}
        onClick={() => setIsPageCountOpen((isOpen) => !isOpen)}
      >
        <span>Páginas</span>
        <b>{pageCount}</b>
      </button>
      {compact && hasUnsavedChanges && (
        <button type="button" className="template-save-pill" onClick={handleSave}>
          Salvar
        </button>
      )}
      <div className="template-zoom-controls" aria-label="Zoom da folha">
        <button type="button" onClick={() => updatePageZoom(-0.1)} disabled={pageZoom <= 0.8} aria-label="Diminuir zoom da folha">
          <ZoomOut size={17} />
        </button>
        <span>{Math.round(pageZoom * 100)}%</span>
        <button type="button" onClick={() => updatePageZoom(0.1)} disabled={pageZoom >= 1.6} aria-label="Aumentar zoom da folha">
          <ZoomIn size={17} />
        </button>
      </div>
      {isPageCountOpen && (
        <div className="template-page-count-popover">
          <div>
            <span>Quantidade de Páginas</span>
            <strong>{activeSection?.templateName ?? "Miolo Personalizado"}</strong>
          </div>
          <label>
            <input
              type="range"
              min={1}
              max={capacity}
              value={pageCount}
              onChange={(event) => updatePageCount(Number(event.target.value))}
            />
            <input
              type="number"
              min={1}
              max={capacity}
              value={pageCount}
              onChange={(event) => updatePageCount(Number(event.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );

  const pageMockup = (
    <div
      ref={pageRef}
      className="template-page-mockup template-page-mockup--offset template-page-mockup--blank"
      style={{
        "--template-page-zoom": pageZoom,
        "--template-control-scale": controlScale,
      } as CSSProperties}
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest(".template-page-block")) return;
        setActiveBlockId(null);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="template-page-mockup__binding-zone" aria-hidden="true" />
      <div className="template-page-mockup__safe-zone" aria-hidden="true" />
      {(activeSection?.blocks ?? []).map((block) => (
        <div
          key={block.id}
          role="button"
          tabIndex={0}
          className={`template-page-block ${activeBlockId === block.id ? "is-active" : ""}`}
          style={blockStyle(block)}
          onClick={() => setActiveBlockId(block.id)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setActiveBlockId(block.id);
          }}
          onPointerDown={(event) => handleBlockPointerDown(event, block)}
        >
          <BlockArtwork block={block} />
          {activeBlockId === block.id && (
            <>
              <button
                type="button"
                className="template-page-block__control template-page-block__control--delete"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  deleteBlock(block.id);
                }}
                onPointerDown={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                }}
                aria-label="Excluir bloco"
              >
                <Trash2 size={12} />
              </button>
              <button
                type="button"
                className="template-page-block__control template-page-block__control--resize"
                onPointerDown={(event) => handleResizePointerDown(event, block)}
                aria-label="Ajustar tamanho do bloco"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );

  const canvasStage = (
    <div
      className="template-canvas-stage"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest(".template-page-block")) return;
        setActiveBlockId(null);
      }}
    >
      {pageMockup}
    </div>
  );

  return (
    <main className={`screen screen-template-editor ${compact ? "screen--compact" : ""}`}>
      <section className="template-studio template-studio--canvas-only">
        {!compact && (
          <header className="template-studio__topbar">
            <button type="button" className="template-studio__icon-action" onClick={onCancel} aria-label="Voltar">
              <ArrowLeft size={19} />
            </button>
            <div className="template-studio__title">
              <span><Sparkles size={13} /> Studio de miolo</span>
              <strong>{activeSection?.title ?? name}</strong>
            </div>
            <div className="template-studio__actions">
              <button type="button" className="template-studio__save" onClick={handleSave}>
                <Save size={16} />
                Salvar
              </button>
            </div>
          </header>
        )}

        {compact ? (
          <>
            {quantityControls}
            {canvasStage}
          </>
        ) : (
          <div className="template-studio__desktop-workbench">
            <aside className="template-studio__desktop-panel template-studio__desktop-panel--pages">
              <div className="template-studio__panel-heading">
                <span><FileText size={14} /> Páginas</span>
              </div>
              <PageSheet
                sections={plan.sections}
                activeSectionId={activeSection?.id}
                onSelect={(sectionId) => {
                  setActiveSectionId(sectionId);
                  setActiveBlockId(null);
                }}
                onAdd={() => setIsAddPageModalOpen(true)}
                onMove={moveSection}
                onDelete={deleteSection}
              />
            </aside>
            <section className="template-studio__desktop-center">
              {quantityControls}
              {canvasStage}
            </section>
            <aside className="template-studio__desktop-panel template-studio__desktop-panel--blocks">
              <div className="template-studio__panel-heading">
                <span><LayoutTemplate size={14} /> Blocos</span>
              </div>
              <BlockSheet
                activeCategory={activeBlockCategory}
                onCategory={setActiveBlockCategory}
                onAddBlock={(preset) => addBlock(preset)}
              />
            </aside>
          </div>
        )}
      </section>

      {compact && (
        <>
          <BottomSheetModal isOpen={activePanel === "pages"} onClose={onClosePanel} title="Páginas do Template" contentClassName="template-sheet-content">
            <PageSheet
              sections={plan.sections}
              activeSectionId={activeSection?.id}
              onSelect={(sectionId) => {
                setActiveSectionId(sectionId);
                setActiveBlockId(null);
                onClosePanel();
              }}
              onAdd={() => setIsAddPageModalOpen(true)}
              onMove={moveSection}
              onDelete={deleteSection}
            />
          </BottomSheetModal>

          <BottomSheetModal isOpen={activePanel === "blocks"} onClose={onClosePanel} title="Blocos" contentClassName="template-sheet-content">
            <BlockSheet
              activeCategory={activeBlockCategory}
              onCategory={setActiveBlockCategory}
              onAddBlock={(preset) => {
                addBlock(preset);
                onClosePanel();
              }}
            />
          </BottomSheetModal>
        </>
      )}

      {isAddPageModalOpen && (
        <AddPageDialog
          name={newPageName}
          background={newPageBackground}
          onNameChange={setNewPageName}
          onBackgroundChange={setNewPageBackground}
          onCancel={() => setIsAddPageModalOpen(false)}
          onCreate={handleCreatePage}
        />
      )}
    </main>
  );
}

function AddPageDialog({
  name,
  background,
  onNameChange,
  onBackgroundChange,
  onCancel,
  onCreate,
}: {
  name: string;
  background: PageBackgroundChoice;
  onNameChange: (value: string) => void;
  onBackgroundChange: (value: PageBackgroundChoice) => void;
  onCancel: () => void;
  onCreate: () => void;
}) {
  return (
    <div className="template-floating-modal-backdrop" onClick={onCancel}>
      <form
        className="template-floating-modal"
        onClick={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          onCreate();
        }}
      >
        <div className="template-floating-modal__header">
          <div>
            <span>Nova Página</span>
            <strong>Adicionar Bloco de Miolo</strong>
          </div>
          <button type="button" onClick={onCancel} aria-label="Fechar">
            <X size={16} />
          </button>
        </div>

        <label className="template-floating-modal__field">
          <span>Nome do Bloco</span>
          <input
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Ex: Rotina diária"
            autoFocus
          />
        </label>

        <div className="template-floating-modal__field">
          <span>Fundo Padrão</span>
          <div className="template-background-options">
            {PAGE_BACKGROUND_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={background === option.id ? "is-active" : ""}
                onClick={() => onBackgroundChange(option.id)}
              >
                <i className={`template-background-swatch template-background-swatch--${option.id}`} />
                <strong>{option.label}</strong>
                <small>{option.description}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="template-floating-modal__actions">
          <button type="button" onClick={onCancel}>Cancelar</button>
          <button type="submit">Adicionar</button>
        </div>
      </form>
    </div>
  );
}

function PageSheet({
  sections,
  activeSectionId,
  onSelect,
  onAdd,
  onMove,
  onDelete,
}: {
  sections: PlannerInteriorSection[];
  activeSectionId?: string;
  onSelect: (sectionId: string) => void;
  onAdd: () => void;
  onMove: (sectionId: string, direction: -1 | 1) => void;
  onDelete: (sectionId: string) => void;
}) {
  return (
    <div className="template-pages-sheet">
      <div className="template-pages-list">
        {sections.map((section, index) => (
          <article className={`template-page-card ${activeSectionId === section.id ? "is-active" : ""}`} key={section.id}>
            <button type="button" className="template-page-card__main" onClick={() => onSelect(section.id)}>
              <span>{index + 1}</span>
              <strong>{section.title}</strong>
              <small>{section.pageCount} páginas - {section.templateName}</small>
            </button>
            <div className="template-page-card__tools">
              <button type="button" onClick={() => onMove(section.id, -1)} disabled={index === 0} aria-label="Subir Página">
                <ArrowUp size={14} />
              </button>
              <button type="button" onClick={() => onMove(section.id, 1)} disabled={index === sections.length - 1} aria-label="Descer Página">
                <ArrowDown size={14} />
              </button>
              <button type="button" onClick={() => onDelete(section.id)} disabled={sections.length <= 1} aria-label="Excluir Página">
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <button type="button" className="template-pages-sheet__add" onClick={onAdd}>
        <Plus size={17} />
        Adicionar Página
      </button>
    </div>
  );
}

function BlockSheet({
  activeCategory,
  onCategory,
  onAddBlock,
}: {
  activeCategory: BlockCategory | null;
  onCategory: (category: BlockCategory) => void;
  onAddBlock: (preset: BlockPreset) => void;
}) {
  const category = activeCategory ?? BLOCK_CATEGORIES[0];
  const visiblePresets = BLOCK_PRESETS.filter((preset) => preset.category === category);
  const stripRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  const updateScrollState = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const maxScrollLeft = strip.scrollWidth - strip.clientWidth;
    setScrollState({
      left: strip.scrollLeft > 4,
      right: strip.scrollLeft < maxScrollLeft - 4,
    });
  };

  useEffect(() => {
    window.requestAnimationFrame(updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [category, visiblePresets.length]);

  const scrollBlocks = (direction: -1 | 1) => {
    const strip = stripRef.current;
    if (!strip) return;
    strip.scrollBy({ left: direction * Math.round(strip.clientWidth * 0.76), behavior: "smooth" });
  };

  return (
    <div className="template-blocks-sheet">
      <div className="template-block-categories">
        {BLOCK_CATEGORIES.map((item) => (
          <button key={item} type="button" className={category === item ? "is-active" : ""} onClick={() => onCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      <div className="template-block-carousel">
        {scrollState.left && (
          <button
            type="button"
            className="template-block-scroll-arrow template-block-scroll-arrow--left"
            onClick={() => scrollBlocks(-1)}
            aria-label="Ver blocos anteriores"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        <div
          ref={stripRef}
          className="template-block-strip"
          aria-label={`Blocos de ${category}`}
          onScroll={updateScrollState}
        >
          {visiblePresets.map((preset) => {
            const previewBlock = createBlockFromPreset(preset, 20, 20);
            return (
              <button
                key={preset.id}
                type="button"
                draggable
                onDragStart={(event) => event.dataTransfer.setData("application/pageloom-block", preset.id)}
                onClick={() => onAddBlock(preset)}
              >
                <span>
                  <BlockArtwork block={previewBlock} />
                </span>
                <strong>{preset.title}</strong>
                <small>{preset.variant}</small>
              </button>
            );
          })}
        </div>
        {scrollState.right && (
          <button
            type="button"
            className="template-block-scroll-arrow template-block-scroll-arrow--right"
            onClick={() => scrollBlocks(1)}
            aria-label="Ver mais blocos"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function TemplateCard({ template, onEdit }: { template: PlannerInteriorTemplate; onEdit: () => void }) {
  const pageCount = getInteriorPlanPageCount(template.plan);
  const firstSection = template.plan.sections[0];

  return (
    <article className="template-card">
      <div className="template-card__preview" aria-hidden="true">
        <div className={`template-card__paper template-card__paper--${firstSection?.paperTone ?? "offset"}`}>
          {(firstSection?.blocks ?? []).slice(0, 4).map((block) => (
            <i
              key={block.id}
              style={{
                left: `${(block.xMm / A5_WIDTH_MM) * 100}%`,
                top: `${(block.yMm / A5_HEIGHT_MM) * 100}%`,
                width: `${(block.widthMm / A5_WIDTH_MM) * 100}%`,
                height: `${(block.heightMm / A5_HEIGHT_MM) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
      <div className="template-card__body">
        <div className="template-card__title">
          <LayoutTemplate size={15} />
          <strong>{template.name}</strong>
        </div>
        <p>{template.description}</p>
        <div className="template-card__meta">
          <span>{pageCount} páginas</span>
          <span>{template.plan.sections.length} grupos</span>
          {template.isSystem && <span>Padrao</span>}
        </div>
        <div className="template-card__actions">
          <button type="button" onClick={onEdit}>
            <Edit3 size={14} />
            Editar
          </button>
          <button type="button" disabled title="Apenas admin imprime o arquivo tecnico">
            <Printer size={14} />
            Imprimir
          </button>
          <button type="button" disabled title="Fluxo de compra fisica sera configurado depois">
            <Copy size={14} />
            Comprar impresso
          </button>
        </div>
      </div>
    </article>
  );
}

function createBlockFromPreset(preset: BlockPreset, xMm: number, yMm: number): PlannerLayoutBlock {
  return {
    id: `${preset.id}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type: preset.type,
    title: preset.title,
    variant: preset.variant,
    xMm,
    yMm,
    widthMm: preset.widthMm,
    heightMm: preset.heightMm,
  };
}

function createBackgroundBlock(pattern: PageBackgroundChoice): PlannerLayoutBlock {
  return {
    id: `page-background-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type: "page_background",
    title: "Fundo",
    variant: pattern,
    xMm: BINDING_MARGIN_MM,
    yMm: CUT_MARGIN_MM,
    widthMm: A5_WIDTH_MM - BINDING_MARGIN_MM - OUTER_MARGIN_MM,
    heightMm: A5_HEIGHT_MM - CUT_MARGIN_MM * 2,
  };
}

function fitBackgroundBlock(blocks: PlannerLayoutBlock[], changedBlockId?: string) {
  const backgroundBlock = blocks.find((block) => block.type === "page_background");
  if (!backgroundBlock || changedBlockId === backgroundBlock.id) return blocks;

  const contentBlocks = blocks.filter((block) => block.type !== "page_background");
  const occupiedBottom = contentBlocks.reduce((bottom, block) => Math.max(bottom, block.yMm + block.heightMm), CUT_MARGIN_MM);
  const nextY = Math.min(A5_HEIGHT_MM - CUT_MARGIN_MM - 24, Math.max(CUT_MARGIN_MM, snap(occupiedBottom + SNAP_MM)));
  const nextHeight = Math.max(24, A5_HEIGHT_MM - CUT_MARGIN_MM - nextY);

  return blocks.map((block) =>
    block.id === backgroundBlock.id
      ? { ...block, yMm: nextY, heightMm: nextHeight }
      : block,
  );
}

function getBackgroundLabel(pattern: PageBackgroundChoice) {
  return PAGE_BACKGROUND_OPTIONS.find((option) => option.id === pattern)?.label ?? "Em Branco";
}

function forceWhitePaperPlan(plan: PlannerInteriorPlan): PlannerInteriorPlan {
  return {
    ...plan,
    sections: plan.sections.map((section) => ({
      ...section,
      paperPattern: "blank",
      paperTone: "offset",
      blocks: section.blocks.map((block) =>
        block.type === "page_background" ? { ...block, variant: "blank" } : block,
      ),
    })),
  };
}

function snap(value: number) {
  return Math.round(value / SNAP_MM) * SNAP_MM;
}

function clampBlock(block: PlannerLayoutBlock): PlannerLayoutBlock {
  const maxWidth = A5_WIDTH_MM - OUTER_MARGIN_MM - block.xMm;
  const maxHeight = A5_HEIGHT_MM - CUT_MARGIN_MM - block.yMm;
  const widthMm = Math.max(MIN_BLOCK_WIDTH_MM, Math.min(Math.max(MIN_BLOCK_WIDTH_MM, maxWidth), block.widthMm));
  const heightMm = Math.max(MIN_BLOCK_HEIGHT_MM, Math.min(Math.max(MIN_BLOCK_HEIGHT_MM, maxHeight), block.heightMm));
  const maxX = A5_WIDTH_MM - OUTER_MARGIN_MM - widthMm;
  const maxY = A5_HEIGHT_MM - CUT_MARGIN_MM - heightMm;

  return {
    ...block,
    widthMm,
    heightMm,
    xMm: Math.max(BINDING_MARGIN_MM, Math.min(Math.max(BINDING_MARGIN_MM, maxX), block.xMm)),
    yMm: Math.max(CUT_MARGIN_MM, Math.min(Math.max(CUT_MARGIN_MM, maxY), block.yMm)),
  };
}

function blockStyle(block: PlannerLayoutBlock): CSSProperties {
  return {
    left: `${(block.xMm / A5_WIDTH_MM) * 100}%`,
    top: `${(block.yMm / A5_HEIGHT_MM) * 100}%`,
    width: `${(block.widthMm / A5_WIDTH_MM) * 100}%`,
    height: `${(block.heightMm / A5_HEIGHT_MM) * 100}%`,
  };
}

function clonePlan(plan: PlannerInteriorPlan): PlannerInteriorPlan {
  return JSON.parse(JSON.stringify(plan)) as PlannerInteriorPlan;
}
