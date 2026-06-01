import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
}

export function CalendarBlock({ block, paperColor = "#f0eae3" }: Props) {
  // A standard monthly calendar has 7 columns and usually 5 or 6 rows.
  // We'll draw a 7x6 grid.
  const cols = 7;
  const rows = 6;
  
  return (
    <div className="w-full h-full flex flex-col border border-black/20" style={{ backgroundColor: paperColor }}>
      {/* Header row for days of the week (empty as requested by user, just cells) */}
      <div className="flex border-b border-black/20" style={{ height: "8mm" }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={`head-${i}`} className={`flex-1 ${i < cols - 1 ? "border-r border-black/20" : ""} bg-black/5`} />
        ))}
      </div>
      
      {/* Grid rows for days */}
      <div className="flex flex-col flex-1">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className={`flex flex-1 ${rowIndex < rows - 1 ? "border-b border-black/20" : ""}`}>
            {Array.from({ length: cols }).map((_, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className={`flex-1 ${colIndex < cols - 1 ? "border-r border-black/20" : ""} relative`}>
                {/* Small box for the day number */}
                <div className="absolute top-1 right-1 w-[4mm] h-[4mm] border border-black/10" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
