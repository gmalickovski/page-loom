import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
}

export function NotesBlock({ block, paperColor = "#f0eae3" }: Props) {
  const isRounded = block.variant === "rounded";

  return (
    <div 
      className={`w-full h-full flex flex-col border-2 border-black/10 overflow-hidden p-2 ${isRounded ? "rounded-xl" : "rounded-none"}`}
      style={{ backgroundColor: paperColor }}
    >
      {block.title && (
        <div className="text-[12px] font-bold uppercase tracking-widest text-[#a59990] mb-1">
          {block.title}
        </div>
      )}
      <div className="flex-1" />
    </div>
  );
}
