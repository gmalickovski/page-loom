import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
  paperPattern?: string;
}

import { getGridSnapSteps } from "@/lib/grid-snap";

export function TodoListBlock({ block, paperColor = "#f0eae3", paperPattern = "blank" }: Props) {
  const [_, stepYMm] = getGridSnapSteps(paperPattern as any);
  // Default to 7mm if step is too small, but sync to paper grid if possible
  const lineHeightMm = stepYMm >= 5 ? stepYMm : 7;
  
  // Se for com_titulo, gastamos 1 linha (lineHeightMm) para o título
  const titleHeightMm = block.variant === "com_titulo" ? lineHeightMm : 0;
  const availableLinesHeightMm = block.heightMm - titleHeightMm;
  const lineCount = Math.max(1, Math.floor(availableLinesHeightMm / lineHeightMm));

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {block.variant === "com_titulo" && (
        <div className="flex items-end px-1 border-b border-black/20" style={{ height: `${lineHeightMm}mm` }}>
           <span className="text-[10px] font-bold text-black/30 mr-2 tracking-wide mb-[1px]">TÍTULO:</span>
           <div className="flex-1" />
        </div>
      )}
      
      <div className="flex-1 flex flex-col">
        {Array.from({ length: lineCount }).map((_, i) => (
          <div key={i} className="flex items-end gap-2 px-1 border-b border-black/10 last:border-b-0" style={{ height: `${lineHeightMm}mm` }}>
            <div className="w-[4mm] h-[4mm] border-2 border-black/20 rounded-[2px] flex-shrink-0 mb-[1.5px]" />
            <div className="flex-1" />
          </div>
        ))}
      </div>
    </div>
  );
}
