import { PlannerLayoutBlock } from "@/types/library";
import { TodoListBlock } from "./TodoListBlock";
import { DateBlock } from "./DateBlock";
import { ScheduleBlock } from "./ScheduleBlock";
import { NotesBlock } from "./NotesBlock";
import { QuoteBlock } from "./QuoteBlock";
import { PasswordTrackerBlock } from "./PasswordTrackerBlock";
import { CalendarBlock } from "./CalendarBlock";
import { MiniCalendarBlock } from "./MiniCalendarBlock";

interface Props {
  block: PlannerLayoutBlock;
}

export function PlannerBlockThumbnail({ block }: Props) {
  // We use a fixed paper color for the thumbnail to make it look nice
  const paperColor = "#fffdf8"; 

  // Dynamically calculate scale so the block fits and fills the thumbnail container (264x64) elegantly
  const maxW = 240; // width of thumbnail viewport minus some margin
  const maxH = 50;  // height of thumbnail viewport minus some margin
  const scale = Math.min(maxW / block.widthMm, maxH / block.heightMm);

  const content = (() => {
    let innerContent = null;
    switch (block.type) {
      case "checklist": innerContent = <TodoListBlock block={block} />; break;
      case "date_header": innerContent = <DateBlock block={block} scale={scale} />; break;
      case "schedule": innerContent = <ScheduleBlock block={block} />; break;
      case "notes": innerContent = <NotesBlock block={block} />; break;
      case "quote": innerContent = <QuoteBlock block={block} />; break;
      case "password_tracker": innerContent = <PasswordTrackerBlock block={block} />; break;
      case "calendar":
        if (block.variant === "4cm" || block.variant === "Referencia 4cm") {
          innerContent = <MiniCalendarBlock block={block} />;
        } else {
          innerContent = <CalendarBlock block={block} />;
        }
        break;
      default: innerContent = <div className="text-[10px] text-black/40">{block.type}</div>; break;
    }
    return (
      <div 
        className="w-full h-full p-2.5 flex flex-col overflow-hidden items-center justify-center" 
        style={{ backgroundColor: paperColor, borderRadius: "4px" }}
      >
        {innerContent}
      </div>
    );
  })();

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-[#faf8f5] flex items-center justify-center p-1 pointer-events-none overflow-hidden">
      <div 
        className="relative bg-white shadow-sm border border-black/5 overflow-hidden rounded-[4px]" 
        style={{ 
          width: `${block.widthMm * scale}px`, 
          height: `${block.heightMm * scale}px`,
          minWidth: "max-content",
          minHeight: "max-content",
          transformOrigin: 'center center',
        }}
      >
        {content}
      </div>
    </div>
  );
}
