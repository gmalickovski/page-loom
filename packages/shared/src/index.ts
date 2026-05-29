export type BookThickness = "slim" | "standard" | "master";

export type PaperBackground = "blank" | "lined" | "dotted" | "grid";

export interface BookTemplateLot {
  id: string;
  template: string;
  background: PaperBackground;
  startPage: number;
  endPage: number;
}

export { supabase } from "./supabaseClient";
