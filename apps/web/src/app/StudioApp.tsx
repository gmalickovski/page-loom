import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TemplateEditorScreen, TemplateGalleryScreen } from "../components/planner/TemplateStudio";
import { createDefaultInteriorPlan } from "../components/planner/PageInteriorDesigner";
import type { PlannerInteriorTemplate } from "../types/library";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export function StudioApp() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PlannerInteriorTemplate[]>(() => createInitialTemplates());
  const [screen, setScreen] = useState<"templates" | "editor">("templates");
  const [editingTemplate, setEditingTemplate] = useState<PlannerInteriorTemplate | null>(null);

  // Checar sessão Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login?redirect=/studio");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (screen === "editor") {
    return (
      <div className="w-screen h-screen bg-[#faf8f5] overflow-hidden">
        <TemplateEditorScreen
          compact={false}
          template={editingTemplate}
          activePanel={null}
          onClosePanel={() => {}}
          onCancel={() => {
            setScreen("templates");
            setEditingTemplate(null);
          }}
          onSave={(template) => {
            setTemplates((current) => {
              const exists = current.some((item) => item.id === template.id);
              return exists
                ? current.map((item) => (item.id === template.id ? template : item))
                : [template, ...current];
            });
            setScreen("templates");
            setEditingTemplate(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-[#faf8f5] overflow-auto">
      {/* Cabeçalho Minimalista para o Studio */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8e4da] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-serif text-[#2d2420]">PageLoom Studio</h1>
          <span className="text-xs font-semibold px-2 py-1 bg-[#f0eae3] text-[#6d5f57] rounded-md tracking-widest uppercase">
            Beta
          </span>
        </div>
        <button
          onClick={() => navigate("/app")}
          className="text-sm font-medium text-[#6d5f57] hover:text-[#d26c36] transition-colors"
        >
          Ir para a Biblioteca
        </button>
      </header>

      <main className="p-6">
        <TemplateGalleryScreen
          compact={false}
          templates={templates}
          onCreateTemplate={() => {
            setEditingTemplate(null);
            setScreen("editor");
          }}
          onEditTemplate={(template) => {
            setEditingTemplate(template);
            setScreen("editor");
          }}
        />
      </main>
    </div>
  );
}

function createInitialTemplates(): PlannerInteriorTemplate[] {
  const today = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return [
    {
      id: "tpl-agenda-performance",
      name: "Agenda performance A5",
      description: "Time blocking, prioridades, hidratacao e humor em grupos prontos para refil.",
      category: "agenda",
      createdAt: today,
      updatedAt: today,
      plan: createDefaultInteriorPlan(240, "agenda_2026"),
      printPolicy: "admin_only",
      isSystem: true,
    },
    {
      id: "tpl-notas-classico",
      name: "Notas classico",
      description: "Template pautado e pontilhado para cadernos de escrita, estudo e ideias.",
      category: "notebook",
      createdAt: today,
      updatedAt: today,
      plan: createDefaultInteriorPlan(160, "notes_notebook"),
      printPolicy: "admin_only",
      isSystem: true,
    },
  ];
}
