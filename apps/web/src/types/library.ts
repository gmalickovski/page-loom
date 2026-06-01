export type DeviceMode = "mobile" | "tablet" | "desktop";
export type ScreenName = "home" | "shelf" | "contents" | "planner" | "create" | "templates" | "template-editor" | "admin-print";
export type ScheduleKind = "meeting" | "focus" | "personal";
export type PageTemplate = "daily" | "notes" | "meeting" | "cover" | "calendar" | "goals" | "custom" | "separator";
export type PaperPattern = "blank" | "lined" | "dot_grid" | "grid";
export type PaperTone = "offset" | "pollen" | "recycled" | "rice" | "black";
export type PlannerBlockType =
  | "page_background"
  | "date_header"
  | "schedule"
  | "calendar"
  | "habit_tracker"
  | "mood_tracker"
  | "water_tracker"
  | "meal_plan"
  | "checklist"
  | "finance_table"
  | "eisenhower"
  | "notes"
  | "photo"
  | "quote"
  | "separator"
  | "password_tracker";

export interface PlannerLayoutBlock {
  id: string;
  type: PlannerBlockType;
  title: string;
  variant: string;
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  pageSide?: "left" | "right";
}

export interface PlannerInteriorSection {
  id: string;
  title: string;
  templateName: string;
  pageCount: number;
  paperPattern: PaperPattern;
  paperTone: PaperTone;
  blocks: PlannerLayoutBlock[];
  pageNumberMode: "auto" | "manual" | "none";
  layoutMode?: "single" | "double";
  divider?: {
    color: string;
    label: string;
    tabPosition: number;
  };
  singlePageSide?: "odd" | "even";
}

export interface PlannerInteriorPlan {
  format: "A5";
  capacity: 80 | 160 | 240;
  holePunching: "none" | "discs" | "binder";
  bindingMarginMm: number;
  outerMarginMm: number;
  topMarginMm: number;
  bottomMarginMm: number;
  bleedMm: number;
  snapMm: number;
  sections: PlannerInteriorSection[];
}

export interface PlannerInteriorTemplate {
  id: string;
  name: string;
  description: string;
  category: "agenda" | "notebook" | "wellness" | "finance" | "custom";
  createdAt: string;
  updatedAt: string;
  plan: PlannerInteriorPlan;
  printPolicy: "admin_only" | "customer_order";
  isSystem?: boolean;
}

export interface PageData {
  notes?: string;
  tasks?: PlannerTask[];
  schedule?: ScheduleBlock[];
  waterIntake?: number; // 0 to 8 cups
  mood?: "great" | "good" | "meh" | "bad" | null;
  ownerName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  goals?: string[];
  sectionTitle?: string;
  paperPattern?: PaperPattern;
  paperTone?: PaperTone;
  layoutBlocks?: PlannerLayoutBlock[];
  pageNumberMode?: PlannerInteriorSection["pageNumberMode"];
  printedPageNumber?: number;
}

export interface PlannerBook {
  id: string;
  title: string;
  pages: 80 | 160 | 240;
  color: string;
  dark: string;
  label?: string;
  subtitle?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Full layout canvas dataURL (back + spine + front) — used for 3D preview */
  coverImage?: string;
  /** Cropped front-cover only dataURL — used for shelf spine visual */
  coverFrontImage?: string;
  /** Cropped spine-strip only dataURL — used for shelf spine label */
  coverSpineImage?: string;
  description?: string;
  shelfId?: string;
  templateType?: "agenda_2026" | "weekly_planner" | "notes_notebook" | "custom_planner";
  customPages?: PlannerPage[];
  interiorPlan?: PlannerInteriorPlan;
  coverDesignerItems?: CoverDesignerItem[];
}

export interface CoverDesignerItem {
  id: string;
  type: "sticker" | "label";
  name: string;
  stickerId?: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  style?: "light" | "dark" | "leather" | "classic";
  shape?: "rectangular" | "rounded" | "circular" | "pill";
  background?: "transparent" | "sticker";
  color?: string;
  font?: "serif" | "sans" | "mono";
}

export interface BookClickOrigin {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Shelf {
  id: string;
  name: string;
  books: PlannerBook[];
}

export interface PlannerPage {
  id: string;
  title: string;
  date: string;
  template: PageTemplate;
  pageData?: PageData;
}

export interface PlannerTask {
  id: number;
  text: string;
  done: boolean;
}

export interface ScheduleBlock {
  time: string;
  label: string | null;
  kind: ScheduleKind | null;
}
