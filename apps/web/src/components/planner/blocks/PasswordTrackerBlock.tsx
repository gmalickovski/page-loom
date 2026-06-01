import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
}

export function PasswordTrackerBlock({ block, paperColor = "#f0eae3" }: Props) {
  // A password line is typically 8mm high to allow writing
  const lineCount = Math.max(1, Math.floor(block.heightMm / 8));

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ backgroundColor: paperColor }}>
      {block.title && (
        <div className="text-[14px] font-bold font-serif px-1 pt-1 pb-2 border-b-2 border-black/20 text-center">
          {block.title}
        </div>
      )}
      
      <div className="flex h-[6mm] border-b-2 border-black/20 bg-black/5">
        <div className="flex-[2] border-r border-black/10" />
        <div className="flex-[2] border-r border-black/10" />
        <div className="flex-[1.5]" />
      </div>

      <div className="flex-1 flex flex-col">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="flex h-[8mm] border-b border-black/10 last:border-b-0">
            <div className="flex-[2] border-r border-black/10" />
            <div className="flex-[2] border-r border-black/10" />
            <div className="flex-[1.5]" />
          </div>
        ))}
      </div>
    </div>
  );
}
