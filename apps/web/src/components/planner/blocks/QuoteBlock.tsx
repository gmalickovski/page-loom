import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
}

export function QuoteBlock({ block, paperColor = "#f0eae3" }: Props) {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 text-center" style={{ backgroundColor: paperColor }}>
      <div className="text-[18px] font-serif italic text-[#6d5f57] leading-relaxed relative">
        <span className="absolute -top-4 -left-4 text-4xl text-[#d26c36]/20 font-serif">"</span>
        {block.title || ""}
        <span className="absolute -bottom-6 -right-4 text-4xl text-[#d26c36]/20 font-serif">"</span>
      </div>
    </div>
  );
}
