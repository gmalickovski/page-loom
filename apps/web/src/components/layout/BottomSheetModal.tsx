import * as React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface BottomSheetModalProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  headerActions?: React.ReactNode;
  title: string;
}

export function BottomSheetModal({
  children,
  className = "",
  contentClassName = "",
  isOpen,
  onClose,
  headerActions,
  title,
}: BottomSheetModalProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent 
        side="bottom" 
        className={`choice-modal rounded-t-[20px] max-h-[85vh] overflow-hidden flex flex-col p-6 bg-[#faf8f5] text-[#2d2420] border-t border-stone-200/50 shadow-2xl focus:outline-none ${className}`}
      >
        <SheetHeader className="choice-modal__header flex flex-row items-center justify-between pb-3 border-b border-stone-200/60">
          <SheetTitle className="text-base font-bold text-stone-800 tracking-wide mt-1">{title}</SheetTitle>
          {headerActions && <div className="choice-modal__header-actions">{headerActions}</div>}
        </SheetHeader>
        <div className={`choice-modal__scroll overflow-y-auto flex-1 mt-4 ${contentClassName}`}>
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
