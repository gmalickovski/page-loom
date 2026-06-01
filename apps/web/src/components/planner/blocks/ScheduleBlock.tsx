import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
  paperPattern?: string;
}

import { getGridSnapSteps } from "@/lib/grid-snap";

export function ScheduleBlock({ block, paperColor = "#f0eae3", paperPattern = "blank" }: Props) {
  const [_, stepYMm] = getGridSnapSteps(paperPattern as any);
  // Default to 7mm if step is too small
  const lineHeightMm = stepYMm >= 5 ? stepYMm : 7;

  // Let's assume standard hours are 06:00 to 22:00 (17 hours)
  const hours = Array.from({ length: 17 }).map((_, i) => i + 6);
  
  // Calculate how many lines we can actually fit based on height
  const maxLines = Math.floor(block.heightMm / lineHeightMm);
  const visibleHours = hours.slice(0, maxLines);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {block.title && (
        <div className="text-[14px] font-bold font-serif px-1 pt-1 pb-2 border-b border-black/10">
          {block.title}
        </div>
      )}
      <div className="flex-1 flex flex-col">
        {visibleHours.map((hour) => (
          <div key={hour} className="flex items-start gap-2 border-b border-black/10 last:border-b-0" style={{ height: `${lineHeightMm}mm`, minHeight: `${lineHeightMm}mm` }}>
            <div className="w-[12mm] text-right text-[10px] text-black/40 font-medium pt-[1mm]">
              {hour.toString().padStart(2, '0')}:00
            </div>
            <div className="flex-1 h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
