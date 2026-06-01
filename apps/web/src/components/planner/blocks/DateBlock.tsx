import { PlannerLayoutBlock } from "@/types/library";

interface Props {
  block: PlannerLayoutBlock;
  paperColor?: string;
  scale?: number;
}

export function DateBlock({ block, paperColor = "#fffdf8", scale = 3.0 }: Props) {
  const v = block.variant;

  return (
    <div className="w-full h-full flex items-center justify-center">
      {v === "blocos" ? (
        <div className="w-full h-[85%] max-h-[28px] border border-black/35 rounded-[4px] bg-black/[0.01] flex items-stretch">
          <div className="flex-[1] flex items-center justify-center text-[9px] text-black/30 font-normal tracking-widest select-none uppercase">
            dia
          </div>
          <div className="w-[1px] bg-black/20 self-stretch my-1.5" />
          <div className="flex-[1] flex items-center justify-center text-[9px] text-black/30 font-normal tracking-widest select-none uppercase">
            mês
          </div>
          <div className="w-[1px] bg-black/20 self-stretch my-1.5" />
          <div className="flex-[1.5] flex items-center justify-center text-[9px] text-black/30 font-normal tracking-widest select-none uppercase">
            ano
          </div>
        </div>
      ) : v === "curta" ? (
        <div className="flex items-end justify-center gap-1 w-full h-full pb-1">
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${6 * scale}px` }} />
          <span className="text-black/40 text-[11px] font-light select-none leading-none px-0.5">/</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${6 * scale}px` }} />
          <span className="text-black/40 text-[11px] font-light select-none leading-none px-0.5">/</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${12 * scale}px` }} />
        </div>
      ) : v === "semicompleta" ? (
        <div className="flex items-end justify-center gap-1 w-full h-full pb-1">
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${25 * scale}px` }} />
          <span className="text-black/45 text-[11px] font-serif italic select-none leading-none px-0.5 relative -bottom-[0.5px]">,</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${6 * scale}px` }} />
          <span className="text-black/40 text-[9.5px] font-serif italic select-none leading-none px-0.5">de</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${20 * scale}px` }} />
          <span className="text-black/40 text-[9.5px] font-serif italic select-none leading-none px-0.5">de</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${12 * scale}px` }} />
        </div>
      ) : (
        // Completa
        <div className="flex items-end justify-center gap-1 w-full h-full pb-1">
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${6 * scale}px` }} />
          <span className="text-black/40 text-[9.5px] font-serif italic select-none leading-none px-0.5">de</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${25 * scale}px` }} />
          <span className="text-black/40 text-[9.5px] font-serif italic select-none leading-none px-0.5">de</span>
          <span className="border-b border-black/35 mb-[1.5px] shrink-0" style={{ width: `${12 * scale}px` }} />
        </div>
      )}
    </div>
  );
}
