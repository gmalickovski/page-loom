import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Copy,
  LayoutTemplate,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  X,
  ZoomIn,
  ZoomOut,
  Calendar,
  Grid,
} from "lucide-react";
import React, {
  type CSSProperties,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  PaperIcon, CalendarIcon, TasksIcon, PencilIcon, BookIcon, 
  PrinterIcon, PlusIcon, TemplatesIcon, QrCodeIcon, CameraIcon,
  SearchIcon, ShoppingBagIcon, ArrowRightIcon, CheckIcon, StarIcon,
  MenuIcon, XIcon, MailIcon, LockIcon, UserIcon, GoogleIcon,
  SectionIcon, DividerIcon, PlannerStudioIcon, HourglassIcon, LeafIcon, ClipboardListIcon
} from "@/components/ui/icons";
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
import { PlannerBlockRenderer } from "./blocks/PlannerBlockRenderer";
import { PlannerBlockThumbnail } from "./blocks/PlannerBlockThumbnail";
import { BlockArtwork, createDefaultInteriorPlan, normalizeInteriorPlan, PAPER_TONES } from "./PageInteriorDesigner";
import { getGridSnapSteps, snapToNearest } from "../../lib/grid-snap";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { Card } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const A5_WIDTH_MM = 148;
const A5_HEIGHT_MM = 210;
const SNAP_MM = 5;
const PUNCH_MARGIN_MM = 15;
const SAFE_MARGIN_MM = 8;

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
  { id: "date-completa", type: "date_header", title: "Data por Extenso", variant: "completa", category: "Tempo", widthMm: 85, heightMm: 10 },
  { id: "date-semicompleta", type: "date_header", title: "Dia da Semana + Data", variant: "semicompleta", category: "Tempo", widthMm: 80, heightMm: 10 },
  { id: "date-short", type: "date_header", title: "Data Curta", variant: "curta", category: "Tempo", widthMm: 45, heightMm: 10 },
  { id: "date-boxed", type: "date_header", title: "Data em Blocos", variant: "blocos", category: "Tempo", widthMm: 45, heightMm: 10 },
  { id: "schedule-am-pm", type: "schedule", title: "Cronograma", variant: "06-22h", category: "Tempo", widthMm: 70, heightMm: 125 },
  { id: "calendar-month", type: "calendar", title: "Mês (Grid)", variant: "Mensal", category: "Tempo", widthMm: 105, heightMm: 120 },
  { id: "mini-calendar", type: "calendar", title: "Mini calendário", variant: "4cm", category: "Tempo", widthMm: 40, heightMm: 40 },
  { id: "habit", type: "habit_tracker", title: "Hábitos", variant: "31 dias", category: "Bem-estar", widthMm: 105, heightMm: 25 },
  { id: "mood", type: "mood_tracker", title: "Humor", variant: "Diario", category: "Bem-estar", widthMm: 60, heightMm: 35 },
  { id: "water", type: "water_tracker", title: "Hidratação", variant: "8 copos", category: "Bem-estar", widthMm: 60, heightMm: 30 },
  { id: "meal", type: "meal_plan", title: "Refeições", variant: "Diário", category: "Bem-estar", widthMm: 70, heightMm: 45 },
  { id: "todo-title", type: "checklist", title: "Checklist com Título", variant: "com_titulo", category: "Organizacao", widthMm: 70, heightMm: 80 },
  { id: "todo-simple", type: "checklist", title: "Checklist Simples", variant: "sem_titulo", category: "Organizacao", widthMm: 70, heightMm: 80 },
  { id: "notes-plain", type: "notes", title: "Notas", variant: "plain", category: "Organizacao", widthMm: 105, heightMm: 60 },
  { id: "quote", type: "quote", title: "Citação", variant: "Inspiradora", category: "Organizacao", widthMm: 105, heightMm: 35 },
  { id: "password", type: "password_tracker", title: "Senhas", variant: "lista", category: "Organizacao", widthMm: 105, heightMm: 50 },
];

const BLOCK_CATEGORIES: BlockCategory[] = ["Tempo", "Bem-estar", "Organizacao"];
const DIVIDER_COLORS = ["#FCA5A5", "#FCD34D", "#86EFAC", "#93C5FD", "#C4B5FD", "#F9A8D4", "#E5E7EB", "#1F2937"];

/* ==========================================================================
   HELPERS
   ========================================================================== */

function getBackgroundLabel(pattern: PageBackgroundChoice) {
  return pattern === "lined" ? "Pautado" : pattern === "dot_grid" ? "Pontilhado" : "Em Branco";
}

function clonePlan(plan: PlannerInteriorPlan): PlannerInteriorPlan {
  return JSON.parse(JSON.stringify(plan));
}

function forceWhitePaperPlan(plan: PlannerInteriorPlan): PlannerInteriorPlan {
  const cloned = clonePlan(plan);
  cloned.sections.forEach((section) => {
    section.paperTone = "offset";
  });
  return cloned;
}

function createBackgroundBlock(pattern: PageBackgroundChoice): PlannerLayoutBlock {
  return {
    id: `bg-${Date.now()}`,
    type: "page_background",
    title: "Fundo de Página",
    variant: pattern,
    xMm: 0,
    yMm: 0,
    widthMm: A5_WIDTH_MM,
    heightMm: A5_HEIGHT_MM,
  };
}

function createBlockFromPreset(preset: BlockPreset, xMm: number, yMm: number): PlannerLayoutBlock {
  return {
    id: `block-${Date.now()}`,
    type: preset.type,
    title: preset.title,
    variant: preset.variant,
    xMm,
    yMm,
    widthMm: preset.widthMm,
    heightMm: preset.heightMm,
  };
}

function snap(value: number) {
  return Math.round(value / SNAP_MM) * SNAP_MM;
}

function getDynamicMargins(punchSide: "left" | "right", pattern: string = "blank") {
  const [spacingX, spacingY] = getGridSnapSteps(pattern as any);

  let leftMargin = punchSide === "left" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM;
  let rightMargin = punchSide === "right" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM;
  if (spacingX > 0) {
    const availableWidth = A5_WIDTH_MM - leftMargin - rightMargin;
    // Round to the nearest multiple to maximize space without eating too much margin
    const exactWidth = Math.round(availableWidth / spacingX) * spacingX;
    const difference = availableWidth - exactWidth; // if exact > available, this is negative
    
    // Distribute difference to the outer margin (keeps punch margin intact)
    if (punchSide === "left") rightMargin += difference;
    else leftMargin += difference;
  }

  let topMargin = SAFE_MARGIN_MM;
  let bottomMargin = SAFE_MARGIN_MM;
  if (spacingY > 0) {
    const availableHeight = A5_HEIGHT_MM - topMargin - bottomMargin;
    const exactHeight = Math.round(availableHeight / spacingY) * spacingY;
    const difference = availableHeight - exactHeight;
    // Ancorar no bottom: a margem inferior fica intacta, e a margem superior absorve toda a diferença
    topMargin += difference;
  }

  return { leftMargin, rightMargin, topMargin, bottomMargin };
}

function snapBlockToGrid(
  block: PlannerLayoutBlock,
  leftMargin: number,
  topMargin: number,
  stepX: number,
  stepY: number
): PlannerLayoutBlock {
  if (block.type === "page_background") return block;
  
  const widthMm = Math.max(stepX, snapToNearest(block.widthMm, stepX));
  const heightMm = Math.max(stepY, snapToNearest(block.heightMm, stepY));
  
  const relX = block.xMm - leftMargin;
  const relY = block.yMm - topMargin;
  const snappedRelX = snapToNearest(relX, stepX);
  const snappedRelY = snapToNearest(relY, stepY);
  
  return {
    ...block,
    widthMm,
    heightMm,
    xMm: leftMargin + snappedRelX,
    yMm: topMargin + snappedRelY,
  };
}

function clampBlock(block: PlannerLayoutBlock, punchSide: "left" | "right" = "left", pattern: string = "blank"): PlannerLayoutBlock {
  if (block.type === "page_background") return block;
  const { leftMargin, rightMargin, topMargin, bottomMargin } = getDynamicMargins(punchSide, pattern);
  const availableWidth = A5_WIDTH_MM - leftMargin - rightMargin;
  const availableHeight = A5_HEIGHT_MM - topMargin - bottomMargin;

  const [stepX, stepY] = getGridSnapSteps(pattern as any);
  const clampedWidth = Math.min(block.widthMm, availableWidth);
  const clampedHeight = Math.min(block.heightMm, availableHeight);

  const maxRelativeX = Math.floor((availableWidth - clampedWidth) / stepX) * stepX;
  const maxRelativeY = Math.floor((availableHeight - clampedHeight) / stepY) * stepY;

  const currentRelativeX = block.xMm - leftMargin;
  const currentRelativeY = block.yMm - topMargin;

  const clampedRelativeX = Math.max(0, Math.min(maxRelativeX, currentRelativeX));
  const clampedRelativeY = Math.max(0, Math.min(maxRelativeY, currentRelativeY));

  return {
    ...block,
    widthMm: clampedWidth,
    heightMm: clampedHeight,
    xMm: leftMargin + clampedRelativeX,
    yMm: topMargin + clampedRelativeY,
  };
}

function fitBackgroundBlock(blocks: PlannerLayoutBlock[], activeBlockId?: string): PlannerLayoutBlock[] {
  const bgBlock = blocks.find((b) => b.type === "page_background");
  const otherBlocks = blocks.filter((b) => b.type !== "page_background");
  if (bgBlock && activeBlockId === bgBlock.id) {
    return [bgBlock, ...otherBlocks];
  }
  return bgBlock ? [bgBlock, ...otherBlocks] : otherBlocks;
}

function blockStyle(block: PlannerLayoutBlock): CSSProperties {
  return {
    position: "absolute",
    left: `${(block.xMm / A5_WIDTH_MM) * 100}%`,
    top: `${(block.yMm / A5_HEIGHT_MM) * 100}%`,
    width: `${(block.widthMm / A5_WIDTH_MM) * 100}%`,
    height: `${(block.heightMm / A5_HEIGHT_MM) * 100}%`,
    zIndex: block.type === "page_background" ? 0 : 10,
  };
}

/* ==========================================================================
   COMPONENTS
   ========================================================================== */

export function TemplateGalleryScreen({
  compact,
  templates,
  onCreateTemplate,
  onEditTemplate,
}: TemplateGalleryScreenProps) {
  return (
    <div className={`p-6 max-w-5xl mx-auto flex flex-col gap-8 ${compact ? "pt-20" : ""}`}>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-serif text-[#2d2420]">Templates</h2>
          <p className="text-[#6d5f57] text-sm">Templates A5 salvos para books, refis e impressão física.</p>
        </div>
        <button
          onClick={onCreateTemplate}
          className="flex items-center gap-2 bg-[#d26c36] text-white px-4 py-2 rounded-full font-medium hover:bg-[#b0572b] transition-colors"
        >
          <Plus size={18} />
          Novo template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-5 flex flex-col gap-4 cursor-pointer hover:border-[#d26c36] transition-colors" onClick={() => onEditTemplate(template)}>
            <div className="w-full h-32 bg-[#faf8f5] rounded-md flex items-center justify-center border border-[#e8e4da]">
              <LayoutTemplate className="text-[#d26c36] opacity-50" size={32} />
            </div>
            <div>
              <h3 className="font-semibold text-[#2d2420]">{template.name}</h3>
              <p className="text-xs text-[#6d5f57] mt-1">{template.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

class BlockErrorBoundary extends React.Component<{ children: React.ReactNode, blockId: string }, { hasError: boolean, error: string }> {
  constructor(props: { children: React.ReactNode, blockId: string }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: error.toString() };
  }
  render() {
    if (this.state.hasError) {
      return <div className="absolute bg-red-100 text-red-500 border border-red-500 p-2 z-50 text-xs" style={{ width: 100, height: 100 }}>Error: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

export function TemplateEditorScreen({
  compact,
  template,
  activePanel = null,
  onClosePanel = () => undefined,
  onCancel,
  onSave,
}: TemplateEditorScreenProps) {
  const [name] = useState(template?.name ?? "Novo template");
  const [capacity] = useState<PlannerBook["pages"]>(template?.plan.capacity ?? 160);
  const [plan, setPlan] = useState<PlannerInteriorPlan>(
    forceWhitePaperPlan(template?.plan ? clonePlan(template.plan) : createDefaultInteriorPlan(160, "custom_planner")),
  );
  const [activeSectionId, setActiveSectionId] = useState(() => plan.sections[0]?.id ?? "");
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeBlockCategory, setActiveBlockCategory] = useState<BlockCategory>("Tempo");
  
  const [activeSidebarMode, setActiveSidebarMode] = useState<"pages" | "blocks">("pages");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(() => plan.sections[0]?.id ?? null);
  const [singlePageSide, setSinglePageSide] = useState<"odd" | "even">("odd");
  const [baseScale, setBaseScale] = useState(0);
  const [userZoom, setUserZoom] = useState(1);
  const pageZoom = (baseScale || 1) * userZoom;
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const activeSection = plan.sections.find((s) => s.id === activeSectionId);
  const pageCount = activeSection?.pageCount ?? 1;

  const handleSave = () => {
    const now = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    onSave({
      id: template?.id ?? `template-${Date.now()}`,
      name: name.trim() || "Template sem nome",
      description: "Template A5 personalizado.",
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

  useEffect(() => {
    if (!activeSection) return;
    const [stepX, stepY] = getGridSnapSteps(activeSection.paperPattern);
    
    // Check if any block is off-grid
    const needsSnap = activeSection.blocks.some(b => {
      if (b.type === "page_background") return false;
      const punchSide = activeSection.layoutMode === "double" 
        ? (b.pageSide === "left" ? "right" : "left") 
        : (singlePageSide === "odd" ? "left" : "right");
      const { leftMargin, topMargin } = getDynamicMargins(punchSide, activeSection.paperPattern);
      
      const relX = b.xMm - leftMargin;
      const relY = b.yMm - topMargin;
      
      return (
        Math.abs(relX - snapToNearest(relX, stepX)) > 0.01 ||
        Math.abs(relY - snapToNearest(relY, stepY)) > 0.01 ||
        Math.abs(b.widthMm - Math.max(stepX, snapToNearest(b.widthMm, stepX))) > 0.01 ||
        Math.abs(b.heightMm - Math.max(stepY, snapToNearest(b.heightMm, stepY))) > 0.01
      );
    });

    if (needsSnap) {
      updateActiveSection(section => {
        const snappedBlocks = section.blocks.map(b => {
          if (b.type === "page_background") return b;
          const punchSide = section.layoutMode === "double" 
            ? (b.pageSide === "left" ? "right" : "left") 
            : (section.singlePageSide === "odd" ? "left" : "right");
          const { leftMargin, topMargin } = getDynamicMargins(punchSide, section.paperPattern);
          
          const snapped = snapBlockToGrid(b, leftMargin, topMargin, stepX, stepY);
          return clampBlock(snapped, punchSide, section.paperPattern);
        });
        return { ...section, blocks: snappedBlocks };
      });
    }
  }, [activeSection?.paperPattern, activeSection?.layoutMode, activeSection?.singlePageSide]);

  const handleUpdateBlock = (id: string, updates: Partial<PlannerLayoutBlock>) => {
    updateActiveSection((section) => ({
      ...section,
      blocks: section.blocks.map(b => {
        if (b.id !== id) return b;
        
        const punchSide = section.layoutMode === "double" 
          ? (b.pageSide === "left" ? "right" : "left") 
          : (section.singlePageSide === "odd" ? "left" : "right");
          
        return clampBlock({ ...b, ...updates }, punchSide, section.paperPattern);
      }),
    }));
  };

  const updateSection = (id: string, updates: Partial<PlannerInteriorSection>) => {
    setPlan((currentPlan) => ({
      ...currentPlan,
      sections: currentPlan.sections.map((section) => (section.id === id ? { ...section, ...updates } : section)),
    }));
  };

  const addSection = () => {
    const nextSection: PlannerInteriorSection = {
      id: `sec-${Date.now()}`,
      title: `Página ${plan.sections.length + 1}`,
      templateName: `Fundo em branco`,
      pageCount: 8,
      paperPattern: "blank",
      paperTone: "offset",
      pageNumberMode: "auto",
      blocks: [],
    };
    setPlan((currentPlan) => ({ ...currentPlan, sections: [...currentPlan.sections, nextSection] }));
    setActiveSectionId(nextSection.id);
    setActiveBlockId(null);
  };

  const addDividerSection = () => {
    const existingDividers = plan.sections.filter(s => s.divider);
    const lastPosition = existingDividers.length > 0 ? existingDividers[existingDividers.length - 1].divider!.tabPosition : 0;
    const nextPosition = (lastPosition % 6) + 1; // Loop 1 to 6
    const nextColor = DIVIDER_COLORS[(nextPosition - 1) % DIVIDER_COLORS.length];

    const nextSection: PlannerInteriorSection = {
      id: `sec-${Date.now()}`,
      title: `Separador ${existingDividers.length + 1}`,
      templateName: `Divisória`,
      pageCount: 0,
      paperPattern: "blank",
      paperTone: "offset",
      pageNumberMode: "none",
      blocks: [],
      divider: {
        color: nextColor,
        label: `Aba ${existingDividers.length + 1}`,
        tabPosition: nextPosition,
      }
    };
    setPlan((currentPlan) => ({ ...currentPlan, sections: [...currentPlan.sections, nextSection] }));
    setActiveSectionId(nextSection.id);
    setActiveBlockId(null);
  };

  const handleSectionReorder = (dragIndex: number, hoverIndex: number) => {
    setPlan((currentPlan) => {
      const newSections = [...currentPlan.sections];
      const draggedSection = newSections[dragIndex];
      newSections.splice(dragIndex, 1);
      newSections.splice(hoverIndex, 0, draggedSection);
      return { ...currentPlan, sections: newSections };
    });
  };

  const getTabPosition = (sectionId: string) => {
    const dividerSections = plan.sections.filter(s => s.divider);
    const idx = dividerSections.findIndex(s => s.id === sectionId);
    return idx >= 0 ? idx % 6 : 0;
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

  const addBlock = (preset: BlockPreset, rawXMm = 20, rawYMm = 35, targetPageSide: "left" | "right" = "right") => {
    if (!activeSection) return;
    const [stepX, stepY] = getGridSnapSteps(activeSection.paperPattern);
    const punchSide = activeSection.layoutMode === "double" ? (targetPageSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
    const margins = getDynamicMargins(punchSide, activeSection.paperPattern);

    const rawBlock = createBlockFromPreset({ ...preset, widthMm: preset.widthMm, heightMm: preset.heightMm }, rawXMm, rawYMm);
    rawBlock.pageSide = targetPageSide;

    const snappedBlock = snapBlockToGrid(rawBlock, margins.leftMargin, margins.topMargin, stepX, stepY);
    const finalBlock = clampBlock(snappedBlock, punchSide, activeSection.paperPattern);

    updateActiveSection((section) => ({ ...section, blocks: fitBackgroundBlock([...section.blocks, finalBlock]) }));
    setActiveBlockId(finalBlock.id);
  };

  const moveBlock = (blockId: string, xMm: number, yMm: number, pageSide: "left" | "right") => {
    updateActiveSection((section) => {
      const punchSide = section.layoutMode === "double" ? (pageSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
      const margins = getDynamicMargins(punchSide, section.paperPattern);
      const [stepX, stepY] = getGridSnapSteps(section.paperPattern);

      return {
        ...section,
        blocks: fitBackgroundBlock(
          section.blocks.map((block) => {
            if (block.id !== blockId) return block;
            
            const rawBlock = { ...block, xMm, yMm };
            const snappedBlock = snapBlockToGrid(rawBlock, margins.leftMargin, margins.topMargin, stepX, stepY);
            return clampBlock(snappedBlock, punchSide, section.paperPattern);
          }),
          blockId,
        ),
      };
    });
  };

  const deleteBlock = (blockId: string) => {
    updateActiveSection((section) => ({
      ...section,
      blocks: fitBackgroundBlock(section.blocks.filter((block) => block.id !== blockId)),
    }));
    setActiveBlockId(null);
  };

  const handleBlockPointerDown = (event: ReactPointerEvent<HTMLElement>, block: PlannerLayoutBlock) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveBlockId(block.id);

    const pageElement = (event.currentTarget as HTMLElement).closest(".a5-page-mockup") as HTMLDivElement;
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const blockStartX = block.xMm;
    const blockStartY = block.yMm;
    const initialPageSide = block.pageSide || "right";

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * A5_WIDTH_MM;
      const dy = ((moveEvent.clientY - startY) / rect.height) * A5_HEIGHT_MM;
      moveBlock(block.id, blockStartX + dx, blockStartY + dy, initialPageSide);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>, targetPageSide: "left" | "right") => {
    const presetId = event.dataTransfer.getData("application/pageloom-block");
    const preset = BLOCK_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    event.preventDefault();
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const xMm = ((event.clientX - rect.left) / rect.width) * A5_WIDTH_MM;
    const yMm = ((event.clientY - rect.top) / rect.height) * A5_HEIGHT_MM;
    addBlock(preset, xMm, yMm, targetPageSide);
    onClosePanel();
  };

  return (
    <div 
      className={`flex flex-col h-screen bg-[#faf8f5] ${compact ? "pt-16" : ""}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      {/* Topbar */}
      {!compact && (
        <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-[#e8e4da] shrink-0 relative">
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="p-2 text-[#6d5f57] hover:bg-[#faf8f5] rounded-full transition-colors flex items-center gap-2">
              <ArrowLeft size={20} />
              <span className="text-sm font-semibold">Meus Templates</span>
            </button>
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <PlannerStudioIcon className="h-6 w-6 text-[#d26c36]" />
            <h1 className="text-xl font-serif text-[#2d2420]">Studio de Planners</h1>
          </div>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#d26c36] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#b0572b] transition-colors"
          >
            <Save size={16} />
            Salvar
          </button>
        </header>
      )}

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left-most Icon Nav */}
        {!compact && (
          <nav className="w-16 bg-white border-r border-[#e8e4da] flex flex-col items-center py-4 gap-6 shrink-0 z-20">
            <button
              onClick={() => setActiveSidebarMode("pages")}
              className={`group relative flex items-center justify-center p-3 rounded-lg transition-colors ${
                activeSidebarMode === "pages" ? "text-[#d26c36] bg-[#faf8f5]" : "text-[#a59990] hover:text-[#6d5f57] hover:bg-[#faf8f5]"
              }`}
            >
              <SectionIcon className="h-6 w-6" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#2d2420] text-white text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                Páginas
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-[#2d2420]" />
              </div>
            </button>
            <div className="flex flex-col items-center w-full">
              <button
                onClick={() => {
                  if (!activeSection?.divider) {
                    setActiveSidebarMode("blocks");
                  }
                }}
                disabled={!!activeSection?.divider}
                className={`group relative flex items-center justify-center p-3 rounded-lg transition-colors w-full ${
                  activeSection?.divider ? "opacity-30 cursor-not-allowed grayscale" :
                  activeSidebarMode === "blocks" ? "text-[#d26c36] bg-[#faf8f5]" : "text-[#a59990] hover:text-[#6d5f57] hover:bg-[#faf8f5]"
                }`}
              >
                <LayoutTemplate size={24} strokeWidth={2} />
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#2d2420] text-white text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                  {activeSection?.divider ? "Blocos não permitidos em Separadores" : "Blocos"}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-[#2d2420]" />
                </div>
              </button>

              {/* Animated Sub-menu for Block Categories */}
              <div 
                className={`flex flex-col items-center w-full transition-all duration-500 ease-in-out ${
                  activeSidebarMode === "blocks" && !activeSection?.divider ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                }`}
              >
                <div className={`w-8 h-[1px] shrink-0 bg-[#e8e4da] my-3 transition-opacity duration-300 ${activeSidebarMode === "blocks" ? "opacity-100 delay-150" : "opacity-0 delay-0"}`} />
                
                <div className="flex flex-col w-full gap-2 px-2 pb-3">
                  {BLOCK_CATEGORIES.map((cat, idx) => {
                    let Icon = ClipboardListIcon;
                    if (cat === "Tempo") Icon = HourglassIcon;
                    if (cat === "Bem-estar") Icon = LeafIcon;
                    
                    const isActive = activeBlockCategory === cat;
                    const delay = activeSidebarMode === "blocks" ? (idx * 75) + 200 : 0;

                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveBlockCategory(cat)}
                        style={{ transitionDelay: `${delay}ms` }}
                        className={`group relative flex items-center justify-center p-3 w-full rounded-lg transition-all duration-300 ${
                          activeSidebarMode === "blocks" ? "translate-y-0 opacity-100 pointer-events-auto" : "-translate-y-4 opacity-0 pointer-events-none"
                        } ${
                          isActive ? "text-[#d26c36] bg-[#faf8f5] shadow-sm border border-[#e8e4da]" : "text-[#a59990] hover:text-[#6d5f57] hover:bg-[#faf8f5] border border-transparent"
                        }`}
                      >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#2d2420] text-white text-xs font-bold rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md">
                          {cat}
                          <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-[5px] border-transparent border-r-[#2d2420]" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </nav>
        )}

        {/* Unified Left Sidebar */}
        {!compact && (
          <aside className="w-80 bg-white border-r border-[#e8e4da] flex flex-col shrink-0 z-10">
            {activeSidebarMode === "pages" ? (
              <>
                <div className="p-4 border-b border-[#e8e4da] flex items-center">
                  <h2 className="text-sm font-bold text-[#6d5f57] tracking-wider uppercase">Páginas</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {plan.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`flex flex-col gap-2 p-3 rounded-xl border-2 transition-all ${
                        activeSectionId === section.id ? "border-[#d26c36] bg-[#faf8f5]" : "border-[#e8e4da] hover:border-[#d26c36]/50 bg-white cursor-pointer"
                      }`}
                      onClick={() => {
                        setActiveSectionId(section.id);
                        setExpandedSectionId(expandedSectionId === section.id ? null : section.id);
                        setActiveBlockId(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <span className="text-[#d26c36] font-bold text-lg">{index + 1}</span>
                           <div className="font-medium text-[#2d2420] text-sm">{section.title}</div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1); }} disabled={index === 0}>
                            <ArrowUp size={14} />
                          </button>
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1); }} disabled={index === plan.sections.length - 1}>
                            <ArrowDown size={14} />
                          </button>
                          <button className="p-1.5 text-[#a59990] hover:bg-[#fce8e8] hover:text-red-600 rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} disabled={plan.sections.length <= 1}>
                            <Trash2 size={14} />
                          </button>
                          <div className="w-px h-6 bg-[#e8e4da] mx-1 self-center" />
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors">
                             {expandedSectionId === section.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Editor for Active Section */}
                      <AnimatePresence initial={false}>
                        {expandedSectionId === section.id && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pt-3 border-t border-[#e8e4da] flex flex-col gap-3" onClick={(e) => e.stopPropagation()}>
                          
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#a59990] tracking-wider uppercase">Nome da Seção</label>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              className="w-full px-3 py-2 text-sm border border-[#e8e4da] rounded-md focus:outline-none focus:ring-2 focus:ring-[#d26c36]/20 focus:border-[#d26c36] text-[#2d2420]"
                            />
                          </div>

                          {section.divider && (
                            <div className="flex flex-col gap-3 p-3 bg-white border border-[#e8e4da] rounded-lg">
                              <label className="text-[10px] font-bold text-[#a59990] tracking-wider uppercase flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: section.divider.color }} />
                                Página Separadora
                              </label>
                              <div className="flex flex-col gap-1 mt-2">
                                <label className="text-[10px] text-[#a59990] uppercase tracking-wider">Cor da Aba</label>
                                <div className="flex flex-wrap gap-2">
                                  {DIVIDER_COLORS.map(color => (
                                    <button
                                      key={color}
                                      onClick={(e) => { e.stopPropagation(); updateSection(section.id, { divider: { ...section.divider!, color } }); }}
                                      className={`w-6 h-6 rounded-full border-2 transition-all ${section.divider!.color === color ? "border-black shadow-md scale-110" : "border-transparent hover:scale-110"}`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {!section.divider && (
                            <>
                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-[#a59990] tracking-wider">Páginas (Qtd)</label>
                                <input
                                  type="number"
                                  min="1"
                                  max="260"
                                  value={section.pageCount}
                                  onChange={(e) => updateActiveSection((s) => ({ ...s, pageCount: parseInt(e.target.value) || 1 }))}
                                  className="w-full bg-white border border-[#e8e4da] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[#d26c36] text-[#2d2420]"
                                />
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-[#a59990] tracking-wider">Modo de Layout</label>
                                <div className="relative">
                                  <select
                                    value={section.layoutMode || "single"}
                                    onChange={(e) => updateActiveSection((s) => ({ ...s, layoutMode: e.target.value as "single" | "double" }))}
                                    className="w-full appearance-none bg-white border border-[#e8e4da] rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:border-[#d26c36] text-[#2d2420]"
                                  >
                                    <option value="single">Simples</option>
                                    <option value="double">Dupla</option>
                                  </select>
                                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6d5f57] pointer-events-none" />
                                </div>
                              </div>

                              <div className="flex flex-col gap-1">
                                <label className="text-[10px] uppercase font-bold text-[#a59990] tracking-wider">Fundo de Página</label>
                                <div className="relative">
                                  <select
                                    value={section.paperPattern}
                                    onChange={(e) => updateActiveSection((s) => ({ ...s, paperPattern: e.target.value as PaperPattern }))}
                                    className="w-full appearance-none bg-white border border-[#e8e4da] rounded-md pl-3 pr-8 py-1.5 text-sm focus:outline-none focus:border-[#d26c36] text-[#2d2420]"
                                  >
                                    <option value="blank">Em Branco</option>
                                    <option value="lined">Pautado (Linhas)</option>
                                    <option value="dot_grid">Pontilhado</option>
                                    <option value="grid">Quadriculado</option>
                                  </select>
                                  <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6d5f57] pointer-events-none" />
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                  ))}
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="mt-2 flex items-center justify-center gap-2 w-full py-3 border-2 border-dashed border-[#e8e4da] rounded-xl text-[#d26c36] font-semibold hover:border-[#d26c36] hover:bg-[#faf8f5] transition-all">
                        <Plus size={18} />
                        Adicionar
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" sideOffset={16} className="w-[280px]">
                      <DropdownMenuItem onClick={addSection} className="py-3 cursor-pointer focus:bg-[#f0eae3] data-[highlighted]:bg-[#f0eae3]">
                        <SectionIcon className="mr-3 h-5 w-5 text-[#d26c36]" />
                        <div className="flex flex-col">
                          <span className="font-medium text-[#2d2420]">Seção de Páginas</span>
                          <span className="text-xs text-[#a59990]">Páginas em branco para editar</span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={addDividerSection} className="py-3 cursor-pointer focus:bg-[#f0eae3] data-[highlighted]:bg-[#f0eae3]">
                        <DividerIcon className="mr-3 h-5 w-5 text-[#d26c36]" />
                        <div className="flex flex-col">
                          <span className="font-medium text-[#2d2420]">Separador Físico</span>
                          <span className="text-xs text-[#a59990]">Aba colorida em PVC</span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-[#e8e4da] flex items-center">
                  <h2 className="text-sm font-bold text-[#6d5f57] tracking-wider uppercase">Blocos</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {BLOCK_PRESETS.filter(p => p.category === activeBlockCategory).map(preset => (
                    <div
                      key={preset.id}
                      draggable
                      onDragStart={(event) => event.dataTransfer.setData("application/pageloom-block", preset.id)}
                      onClick={() => addBlock(preset)}
                      className="bg-white border border-[#e8e4da] rounded-lg p-3 cursor-grab hover:border-[#d26c36] hover:shadow-md transition-all flex flex-col gap-3"
                    >
                      {/* Miniature representation */}
                      <div className="w-full h-16 bg-[#faf8f5] rounded border border-[#e8e4da] overflow-hidden relative pointer-events-none">
                         <PlannerBlockThumbnail block={{ ...preset, id: "preview", xMm: 0, yMm: 0 }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#2d2420]">{preset.title}</h3>
                        <p className="text-xs text-[#a59990]">{preset.variant}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </aside>
        )}

        {/* Center Canvas */}
        <section className="flex-1 relative flex flex-col bg-[#f0eae3]">
          {/* Zoom & Page Info Bar */}
          <div className="absolute top-4 w-full flex justify-center z-20 pointer-events-none">
            <motion.div layout className="flex items-center gap-4 px-4 py-2 rounded-full transition-all duration-300 bg-white/40 backdrop-blur-md border border-white/50 shadow-sm hover:bg-white hover:border-[#e8e4da] pointer-events-auto" style={{ borderRadius: 9999 }}>
              {activeSection?.divider ? (
              <div className="flex items-center gap-2 text-sm font-medium text-[#6d5f57]">
                <span>Separador</span>
                <span className="w-5 h-5 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: activeSection.divider.color }} />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm font-medium text-[#6d5f57]">
                <span>Páginas</span>
                <span className="bg-[#f0eae3] text-[#d26c36] px-2 py-0.5 rounded-md font-bold">{pageCount}</span>
              </div>
            )}
            <div className="w-px h-4 bg-[#e8e4da]" />
            <div className="flex items-center gap-3 text-[#6d5f57]">
              <button onClick={() => setUserZoom(z => Math.max(0.2, z - 0.1))} className="hover:text-[#d26c36]">
                <ZoomOut size={16} />
              </button>
              <span className="text-sm font-medium w-12 text-center">{Math.round(userZoom * 100)}%</span>
              <button onClick={() => setUserZoom(z => Math.min(2, z + 0.1))} className="hover:text-[#d26c36]">
                <ZoomIn size={16} />
              </button>
            </div>
            <div className="w-px h-4 bg-[#e8e4da]" />
            <button 
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className={`flex items-center justify-center px-3 py-1.5 rounded-md transition-colors ${isPreviewMode ? "bg-[#d26c36] text-white shadow-sm" : "hover:bg-[#e8e4da]/50 text-[#6d5f57]"}`}
            >
              <span className="text-xs font-bold uppercase tracking-wider">{isPreviewMode ? "Sair do Preview" : "Preview"}</span>
            </button>
          </motion.div>
          </div>

          <div
            className="flex-1 flex items-center justify-center relative overflow-auto transition-colors duration-500 pt-24 pb-12"
            style={isPreviewMode ? { backgroundColor: "#e9e5df" } : {}}
            ref={(node) => {
              if (node && baseScale === 0) {
                // Auto-fit zoom on first render
                const PADDING = 60; // 60px padding top/bottom
                const availableHeight = node.clientHeight - PADDING * 2;
                const availableWidth = node.clientWidth - PADDING * 2;
                const naturalHeight = A5_HEIGHT_MM * 3.77;
                const naturalWidth = A5_WIDTH_MM * 3.77;
                const scaleY = availableHeight / naturalHeight;
                const scaleX = availableWidth / naturalWidth;
                const fitScale = Math.min(scaleX, scaleY, 1.5); // cap at 1.5x
                setBaseScale(Number(fitScale.toFixed(2)));
              }
            }}
            onPointerDown={(event) => {
              if ((event.target as HTMLElement).closest(".template-page-block")) return;
              setActiveBlockId(null);
            }}
          >
            {/* The Pages Render */}
            <div className="relative z-10">
              {/* Layer Stack (Notebook Thickness) */}
              {plan.sections
                .slice(plan.sections.findIndex(s => s.id === activeSection?.id) + 1)
                .slice(0, 10)
                .map((section, idx) => {
                  const offset = (idx + 1) * 3; // 3px offset per layer
                  const activeIsDouble = activeSection?.layoutMode === "double";
                  const leftShift = activeIsDouble ? (A5_WIDTH_MM * 3.77 * pageZoom) + 4 : 0;
                  
                  return (
                    <div 
                      key={`stack-layer-${section.id}`}
                      className="absolute pointer-events-none"
                      style={{
                        top: offset * pageZoom,
                        left: leftShift + (offset * pageZoom),
                        width: A5_WIDTH_MM * 3.77 * pageZoom,
                        height: A5_HEIGHT_MM * 3.77 * pageZoom,
                        backgroundColor: section.divider ? section.divider.color : "#fefefe",
                        borderRight: "1px solid #e0ddd7",
                        borderBottom: "1px solid #e0ddd7",
                        boxShadow: "1px 1px 2px rgba(0,0,0,0.02)",
                        zIndex: -1 - idx,
                      }}
                    >
                      {/* Stacked Divider Tab */}
                      {section.divider && (
                        <div 
                          className="absolute rounded-r-md shadow-sm border border-l-0 border-black/5"
                          style={{
                            width: 12 * 3.77 * pageZoom,
                            height: "16.66%",
                            right: -(12 * 3.77 * pageZoom),
                            top: `${getTabPosition(section.id) * 16.66}%`,
                            backgroundColor: section.divider.color,
                          }}
                        />
                      )}
                    </div>
                  );
                })}

              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeSection?.id || "empty"}
                  initial={{ opacity: 0, x: -20, rotateY: -5, scale: 0.98 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, rotateY: 5, scale: 0.98 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="flex gap-1" 
                  style={{ 
                    width: activeSection?.layoutMode === "double" ? (A5_WIDTH_MM * 3.77 * pageZoom * 2) + 4 : A5_WIDTH_MM * 3.77 * pageZoom, 
                    zIndex: 10, 
                    position: "relative",
                    perspective: 1200
                  }}
                >
                {["left", "right"].map((side) => {
                 const isDouble = activeSection?.layoutMode === "double";
                 if (side === "left" && !isDouble) return null;
                 
                 const pSide = side as "left" | "right";
                 const punchSide = isDouble ? (pSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
                 const margins = getDynamicMargins(punchSide, activeSection?.paperPattern);
                 
                 return (
                    <div
                      key={side}
                      id={`page-${side}`}
                      className="a5-page-mockup"
                      style={{
                        width: A5_WIDTH_MM * 3.77 * pageZoom,
                        height: A5_HEIGHT_MM * 3.77 * pageZoom,
                        backgroundColor: activeSection?.divider ? activeSection.divider.color : "white",
                        position: "relative",
                        boxShadow: isPreviewMode 
                          ? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 2px 0 rgba(0, 0, 0, 0.1)" 
                          : "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                        border: isPreviewMode ? "none" : "1px solid #e8e4da",
                        transition: "box-shadow 0.3s ease",
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(e) => handleDrop(e, pSide)}
                    >
                      {/* Photorealistic Paper Texture & Lighting */}
                      {isPreviewMode && (
                        <>
                          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                          <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply bg-gradient-to-br from-white via-transparent to-[#4a3f35]" />
                          <div className="absolute inset-0 pointer-events-none opacity-[0.3] mix-blend-screen bg-gradient-to-tl from-transparent via-white/50 to-white" />
                        </>
                      )}

                      {/* Safe Area Background Layer (SVG Vector Engine) */}
                      <div 
                        className="absolute pointer-events-none"
                        id={`safe-area-${pSide}`}
                        style={{
                          left: margins.leftMargin * 3.77 * pageZoom,
                          right: margins.rightMargin * 3.77 * pageZoom,
                          top: margins.topMargin * 3.77 * pageZoom,
                          bottom: margins.bottomMargin * 3.77 * pageZoom,
                        }}
                      >
                        {(() => {
                          const exactWidthMm = A5_WIDTH_MM - margins.leftMargin - margins.rightMargin;
                          const exactHeightMm = A5_HEIGHT_MM - margins.topMargin - margins.bottomMargin;
                          
                          const paperPattern = activeSection?.paperPattern ?? "blank";
                          if (paperPattern === "blank") return null;

                          let spacingX = 0; let spacingY = 0;
                          if (paperPattern === "dot_grid" || paperPattern === "grid") { spacingX = 5; spacingY = 5; }
                          else if (paperPattern === "lined") { spacingY = 7.1; }

                          const numCols = spacingX > 0 ? Math.round(exactWidthMm / spacingX) : 1;
                          const numRows = spacingY > 0 ? Math.round(exactHeightMm / spacingY) : 1;

                          return (
                            <svg width="100%" height="100%" style={{ overflow: "visible" }}>
                              {paperPattern === "dot_grid" && (
                                <g fill="#d0ccc5">
                                  {Array.from({ length: numCols + 1 }).map((_, i) =>
                                    Array.from({ length: numRows + 1 }).map((_, j) => (
                                      <circle 
                                        key={`${i}-${j}`} 
                                        cx={`${(i / numCols) * 100}%`} 
                                        cy={`${(j / numRows) * 100}%`} 
                                        r={Math.max(1.2, 3.77 * 0.35 * pageZoom)} 
                                      />
                                    ))
                                  )}
                                </g>
                              )}
                              
                              {(paperPattern === "grid" || paperPattern === "lined") && (
                                <g stroke="#e8e4da" strokeWidth="1">
                                  {Array.from({ length: numRows + 1 }).map((_, j) => (
                                    <line 
                                      key={`h-${j}`} 
                                      x1="0" 
                                      y1={`${(j / numRows) * 100}%`} 
                                      x2="100%" 
                                      y2={`${(j / numRows) * 100}%`} 
                                    />
                                  ))}
                                  {paperPattern === "grid" && Array.from({ length: numCols + 1 }).map((_, i) => (
                                    <line 
                                      key={`v-${i}`} 
                                      x1={`${(i / numCols) * 100}%`} 
                                      y1="0" 
                                      x2={`${(i / numCols) * 100}%`} 
                                      y2="100%" 
                                    />
                                  ))}
                                </g>
                              )}
                            </svg>
                          );
                        })()}
                      </div>
                      
                      {/* Binding margin indicator */}
                      <div 
                        className="absolute top-0 bottom-0 border-dashed border-[#d26c36]/40 bg-[#d26c36]/5 pointer-events-none z-[100]"
                        style={{  
                          [punchSide]: 0, 
                          width: PUNCH_MARGIN_MM * 3.77 * pageZoom,
                          borderRightWidth: punchSide === "left" ? 1 : 0,
                          borderLeftWidth: punchSide === "right" ? 1 : 0,
                          opacity: isPreviewMode ? 0 : 1 }}
                      >
                         <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                           <span className="text-[10px] font-bold text-[#d26c36]/40 uppercase tracking-[0.2em] -rotate-90 whitespace-nowrap">
                             Área de Perfuração
                           </span>
                         </div>
                      </div>
                      
                      {/* Safe zone indicator */}
                      <div 
                        className="absolute border border-cyan-500/30 pointer-events-none z-[100]"
                        style={{  
                          left: margins.leftMargin * 3.77 * pageZoom,
                          right: margins.rightMargin * 3.77 * pageZoom,
                          top: margins.topMargin * 3.77 * pageZoom,
                          bottom: margins.bottomMargin * 3.77 * pageZoom,
                          opacity: isPreviewMode || activeSection?.divider ? 0 : 1 }}
                      />

                      {/* Render Blocks */}
                      {(activeSection?.blocks ?? [])
                        .filter(block => block.type === "page_background" || (isDouble ? block.pageSide === pSide : true))
                        .map((block) => {
                          if (block.type === "page_background") {
                            return (
                              <div
                                key={block.id}
                                className={`template-page-block absolute transition-shadow ${
                                  activeBlockId === block.id ? "ring-2 ring-[#d26c36] shadow-lg z-50" : "hover:ring-1 hover:ring-[#d26c36]/50"
                                }`}
                                style={blockStyle(block)}
                                onPointerDown={(event) => handleBlockPointerDown(event, block)}
                              >
                                <BlockArtwork block={block} />
                                {activeBlockId === block.id && (
                                  <button
                                    className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteBlock(block.id);
                                    }}
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            );
                          }
                          
                          return (
                            <BlockErrorBoundary key={block.id} blockId={block.id}>
                              <PlannerBlockRenderer
                                block={block}
                                paperPattern={activeSection?.paperPattern ?? "blank"}
                                paperColor={activeSection ? PAPER_TONES[activeSection.paperTone].color : "#fffdf8"}
                                pageZoom={pageZoom}
                                leftMargin={margins.leftMargin}
                                topMargin={margins.topMargin}
                                boundsSelector={`#safe-area-${pSide}`}
                                isSelected={activeBlockId === block.id}
                                onSelect={() => setActiveBlockId(block.id)}
                                onUpdate={(id, updates) => {
                                  updateActiveSection((s) => {
                                    const punchSide = s.layoutMode === "double" ? (pSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
                                    return {
                                      ...s,
                                      blocks: s.blocks.map(b => b.id === id ? clampBlock({ ...b, ...updates }, punchSide, s.paperPattern) : b)
                                    };
                                  });
                                }}
                                onDelete={deleteBlock}
                              />
                            </BlockErrorBoundary>
                          );
                        })}

                      {/* Active Divider Tab */}
                      {activeSection?.divider && pSide === "right" && (
                        <div 
                          className="absolute rounded-r-md shadow-md border border-l-0 border-black/10 flex items-center justify-center overflow-hidden"
                          style={{
                            width: 12 * 3.77 * pageZoom,
                            height: "16.66%",
                            right: -(12 * 3.77 * pageZoom),
                            top: `${getTabPosition(activeSection.id) * 16.66}%`,
                            backgroundColor: activeSection.divider.color,
                            zIndex: 5,
                          }}
                        />
                      )}
                    </div>
                 );
              })}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>


      </div>

      {compact && (
        <BottomSheetModal isOpen={activePanel === "pages"} onClose={onClosePanel} title="Páginas">
          <div className="p-4">Mobile pages view...</div>
        </BottomSheetModal>
      )}
      {compact && (
        <BottomSheetModal isOpen={activePanel === "blocks"} onClose={onClosePanel} title="Blocos">
          <div className="p-4">Mobile blocks view...</div>
        </BottomSheetModal>
      )}
    </div>
  );
}
