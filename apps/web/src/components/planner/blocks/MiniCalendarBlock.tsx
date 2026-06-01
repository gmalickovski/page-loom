import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
}

export function MiniCalendarBlock({ block, paperColor = "#f0eae3" }: Props) {
  // A mini calendar is just a small 7x7 grid (1 row for headers, 6 for days)
  const cols = 7;
  const rows = 7;
  
  return (
    <div className="w-full h-full flex flex-col p-1" style={{ backgroundColor: paperColor }}>
      {/* Month/Year Title area placeholder */}
      <div className="w-full h-[4mm] mb-1 flex justify-center">
        <div className="w-3/4 h-full border-b-2 border-black/20" />
      </div>
      
      {/* Grid */}
      <div className="flex flex-col flex-1 gap-[1px]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex flex-1 gap-[1px]">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                className={`flex-1 ${rowIndex === 0 ? "border-b border-black/30" : ""} bg-black/5 rounded-[1px]`} 
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
