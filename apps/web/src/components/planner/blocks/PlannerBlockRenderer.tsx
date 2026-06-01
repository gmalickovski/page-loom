import { X } from "lucide-react";
import { Rnd } from "react-rnd";
import { PlannerLayoutBlock, PaperPattern } from "@/types/library";
import { getGridSnapSteps, snapToNearest } from "@/lib/grid-snap";
import { TodoListBlock } from "./TodoListBlock";
import { DateBlock } from "./DateBlock";
import { ScheduleBlock } from "./ScheduleBlock";
import { NotesBlock } from "./NotesBlock";
import { QuoteBlock } from "./QuoteBlock";
import { PasswordTrackerBlock } from "./PasswordTrackerBlock";
import { CalendarBlock } from "./CalendarBlock";
import { MiniCalendarBlock } from "./MiniCalendarBlock";
import { BlockArtwork } from "../PageInteriorDesigner";

interface Props {
  block: PlannerLayoutBlock;
  paperPattern: PaperPattern;
  paperColor?: string;
  pageZoom: number;
  isSelected: boolean;
  leftMargin?: number;
  topMargin?: number;
  boundsSelector?: string;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<PlannerLayoutBlock>) => void;
  onDelete: (id: string) => void;
}

const MM_TO_PX = 3.77;

export function isBlockResizable(block: PlannerLayoutBlock): boolean {
  if (block.type === "date_header") return false;
  if (block.type === "separator") return false;
  if (block.type === "calendar" && (block.variant === "4cm" || block.variant === "Referencia 4cm")) return false;
  return true;
}

export function PlannerBlockRenderer({ block, paperPattern, paperColor = "#fffdf8", pageZoom, isSelected, leftMargin = 15, topMargin = 8, boundsSelector = "parent", onSelect, onUpdate, onDelete }: Props) {
  const scale = MM_TO_PX * pageZoom;
  const [stepXMm, stepYMm] = getGridSnapSteps(paperPattern);
  const canResize = isBlockResizable(block);

  const getMinConstraints = (type: string) => {
    switch(type) {
      case "checklist": return { w: 40, h: 14 };
      case "date_header": return { w: 40, h: 10 };
      case "schedule": return { w: 40, h: 20 };
      case "password_tracker": return { w: 60, h: 16 };
      case "notes": return { w: 20, h: 20 };
      case "quote": return { w: 30, h: 20 };
      default: return { w: 10, h: 10 };
    }
  };
  const minConstraints = getMinConstraints(block.type);

  const renderContent = () => {
    let content = null;
    switch (block.type) {
      case "checklist":
        content = <TodoListBlock block={block} paperPattern={paperPattern} />; break;
      case "date_header":
        content = <DateBlock block={block} scale={scale} />; break;
      case "schedule":
        content = <ScheduleBlock block={block} paperPattern={paperPattern} />; break;
      case "habit_tracker":
      case "mood_tracker":
      case "water_tracker":
      case "meal_plan":
        content = <BlockArtwork block={block} />; break;
      case "notes":
        content = <NotesBlock block={block} />; break;
      case "quote":
        content = <QuoteBlock block={block} />; break;
      case "password_tracker":
        content = <PasswordTrackerBlock block={block} />; break;
      case "calendar":
        if (block.variant === "4cm" || block.variant === "Referencia 4cm") {
          content = <MiniCalendarBlock block={block} />;
        } else {
          content = <CalendarBlock block={block} />;
        }
        break;
      default:
        content = <div className="text-xs text-black/40">{block.type}</div>; break;
    }

    return (
      <div 
        className="w-full h-full p-2.5 flex flex-col overflow-hidden items-center justify-center" 
        style={{ backgroundColor: paperColor, borderRadius: "4px" }}
      >
        {content}
      </div>
    );
  };

  return (
    <Rnd
      size={{ width: block.widthMm * scale, height: block.heightMm * scale }}
      position={{ x: block.xMm * scale, y: block.yMm * scale }}
      minWidth={minConstraints.w * scale}
      minHeight={minConstraints.h * scale}
      bounds={boundsSelector}
      onDragStart={onSelect}
      onDragStop={(e, d) => {
        const newXMm = d.x / scale;
        const newYMm = d.y / scale;
        
        const relX = newXMm - leftMargin;
        const relY = newYMm - topMargin;
        const snappedRelX = snapToNearest(relX, stepXMm);
        const snappedRelY = snapToNearest(relY, stepYMm);

        onUpdate(block.id, { 
          xMm: leftMargin + snappedRelX, 
          yMm: topMargin + snappedRelY 
        });
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        const newWidthMm = parseFloat(ref.style.width) / scale;
        const newHeightMm = parseFloat(ref.style.height) / scale;
        const newXMm = position.x / scale;
        const newYMm = position.y / scale;
        
        const relX = newXMm - leftMargin;
        const relY = newYMm - topMargin;
        const snappedRelX = snapToNearest(relX, stepXMm);
        const snappedRelY = snapToNearest(relY, stepYMm);
        
        onUpdate(block.id, {
          widthMm: Math.max(stepXMm, snapToNearest(newWidthMm, stepXMm)),
          heightMm: Math.max(stepYMm, snapToNearest(newHeightMm, stepYMm)),
          xMm: leftMargin + snappedRelX,
          yMm: topMargin + snappedRelY
        });
      }}
      dragGrid={[stepXMm * scale, stepYMm * scale]}
      resizeGrid={[stepXMm * scale, stepYMm * scale]}
      className={`absolute transition-shadow group ${isSelected ? "ring-2 ring-[#d26c36] shadow-lg z-50" : "hover:ring-1 hover:ring-[#d26c36]/50 z-40"}`}
      style={{ minWidth: "max-content", minHeight: "max-content" }}
      enableResizing={{
        top: canResize,
        right: canResize,
        bottom: canResize,
        left: canResize,
        topRight: canResize,
        topLeft: canResize,
        bottomLeft: canResize,
        bottomRight: canResize
      }}
    >
      {renderContent()}
      
      {/* Subtle resize grip marker in the bottom-right corner (only if block is resizable) */}
      {canResize && (
        <div 
          className="absolute bottom-1 right-1 w-3.5 h-3.5 flex items-end justify-end pointer-events-none opacity-30 group-hover:opacity-80 transition-opacity text-[#d26c36]" 
          aria-hidden="true"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="8" y1="2" x2="2" y2="8" />
            <line x1="8" y1="5" x2="5" y2="8" />
            <line x1="8" y1="8" x2="7.5" y2="8" />
          </svg>
        </div>
      )}
      
      {isSelected && (
        <button
          className="absolute -top-8 -right-8 bg-white border border-red-200 text-red-500 rounded-full p-2 shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors pointer-events-auto z-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(block.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <X size={12} />
        </button>
      )}
    </Rnd>
  );
}
