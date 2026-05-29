import type { PlannerBook } from "../../types/library";

interface RusticLabelProps {
  title: string;
  spineWidth: number;
  pages: PlannerBook["pages"];
  scale?: number;
  variant?: "shelf" | "focus";
}

const labelByPages: Record<
  PlannerBook["pages"],
  { className: string; shelfPadding: number; shelfFontSize: number }
> = {
  80: { className: "rustic-label--slim", shelfPadding: 2, shelfFontSize: 8.6 },
  160: { className: "rustic-label--standard", shelfPadding: 4, shelfFontSize: 9 },
  240: { className: "rustic-label--master", shelfPadding: 8, shelfFontSize: 9.4 },
};

const shelfWidthByPages: Record<PlannerBook["pages"], number> = {
  80: 20,
  160: 34,
  240: 52,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getTextDrivenSize(title: string, baseFontSize: number, minHeight: number, maxHeight: number, verticalPadding: number) {
  const textLength = Math.max(1, title.trim().length);
  const desiredTextHeight = textLength * baseFontSize * 0.74;
  const desiredHeight = desiredTextHeight + verticalPadding * 2;
  const height = Math.round(clamp(desiredHeight, minHeight, maxHeight));
  const fontSize = desiredHeight > maxHeight ? clamp((maxHeight - verticalPadding * 2) / (textLength * 0.74), 7.4, baseFontSize) : baseFontSize;

  return { height, fontSize };
}

export function RusticLabel({ title, spineWidth, pages, scale = 1, variant = "shelf" }: RusticLabelProps) {
  const config = labelByPages[pages];
  const isFocus = variant === "focus";
  const visualScale = isFocus ? spineWidth / shelfWidthByPages[pages] : Math.max(0.86, Math.min(1, scale));
  const focusBoost = isFocus ? 1.14 : 1;
  const padding = config.shelfPadding * visualScale;
  const width = Math.max(spineWidth - padding * 2, isFocus ? 10 : 8);
  const baseFontSize = config.shelfFontSize * visualScale * focusBoost;
  const maxHeight = 146 * visualScale;
  const minHeight = 54 * visualScale;
  const { height, fontSize } = getTextDrivenSize(title, baseFontSize, minHeight, maxHeight, (isFocus ? 7 : 5) * visualScale);

  return (
    <div
      className={`rustic-label ${config.className} rustic-label--${variant}`}
      style={{
        width,
        height,
      }}
    >
      <span style={{ fontSize }}>{title}</span>
    </div>
  );
}
