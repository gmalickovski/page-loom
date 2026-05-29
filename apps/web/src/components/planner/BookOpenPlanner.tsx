import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Check, Plus, Trash2, Calendar, FileText, Smile, Sparkles, User, Mail, Phone, Moon } from "lucide-react";
import type { PlannerBook, PlannerPage, PlannerTask, ScheduleBlock, PageTemplate } from "../../types/library";
import { BlockArtwork } from "./PageInteriorDesigner";

interface BookOpenPlannerProps {
  book: PlannerBook;
  activePage: PlannerPage | null;
  compact: boolean;
  onNavigatePage: (page: PlannerPage) => void;
  onUpdateBookPages: (pages: PlannerPage[]) => void;
}

export function BookOpenPlanner({
  book,
  activePage,
  compact,
  onNavigatePage,
  onUpdateBookPages,
}: BookOpenPlannerProps) {
  const pages = book.customPages || [];
  const activeIndex = pages.findIndex((p) => p.id === activePage?.id);

  // local state for page turn animation triggers
  const [isFlipping, setIsFlipping] = useState(false);

  useEffect(() => {
    setIsFlipping(true);
    const timer = setTimeout(() => setIsFlipping(false), 260);
    return () => clearTimeout(timer);
  }, [activePage?.id]);

  if (pages.length === 0 || !activePage) {
    return (
      <div className="planner-empty-state">
        <Sparkles size={28} />
        <h3>Nenhuma página encontrada</h3>
        <p>Este caderno parece estar vazio ou não inicializado corretamente.</p>
      </div>
    );
  }

  // Navigation helpers
  const goPrev = () => {
    if (activeIndex > 0) {
      onNavigatePage(pages[activeIndex - 1]);
    }
  };

  const goNext = () => {
    if (activeIndex < pages.length - 1) {
      onNavigatePage(pages[activeIndex + 1]);
    }
  };

  // State update helpers for pageData
  const updateActivePageData = (updatedFields: any) => {
    const updatedPages = pages.map((p) => {
      if (p.id === activePage.id) {
        return {
          ...p,
          pageData: {
            ...(p.pageData || {}),
            ...updatedFields,
          },
        };
      }
      return p;
    });
    onUpdateBookPages(updatedPages);
  };

  // Tabs on the right edge ("Estilo Escama")
  const tabsList = [
    { id: "cover", label: "Capa", short: "C" },
    { id: "calendar", label: "Cal.", short: "Ca" },
    { id: "goals", label: "Metas", short: "M" },
    { id: "Jan", label: "Jan", short: "J" },
    { id: "Fev", label: "Fev", short: "F" },
    { id: "Mar", label: "Mar", short: "M" },
    { id: "Abr", label: "Abr", short: "A" },
    { id: "Mai", label: "Mai", short: "M" },
    { id: "Jun", label: "Jun", short: "J" },
    { id: "Jul", label: "Jul", short: "J" },
    { id: "Ago", label: "Ago", short: "A" },
    { id: "Set", label: "Set", short: "S" },
    { id: "Out", label: "Out", short: "O" },
    { id: "Nov", label: "Nov", short: "N" },
    { id: "Dez", label: "Dez", short: "D" },
  ];

  // Resolve which tab is currently active
  const getActiveTab = () => {
    if (activePage.id === "cover") return "cover";
    if (activePage.id === "calendar") return "calendar";
    if (activePage.id === "goals") return "goals";
    
    // Check if it's a day page and resolve month
    if (activePage.id.startsWith("d-2026-")) {
      const parts = activePage.id.split("-");
      const mNum = parts[2]; // "01" to "12"
      const monthsMapping: Record<string, string> = {
        "01": "Jan", "02": "Fev", "03": "Mar", "04": "Abr", "05": "Mai", "06": "Jun",
        "07": "Jul", "08": "Ago", "09": "Set", "10": "Out", "11": "Nov", "12": "Dez"
      };
      return monthsMapping[mNum] || "cover";
    }
    return "cover";
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tabId: string) => {
    if (tabId === "cover") {
      const found = pages.find((p) => p.id === "cover");
      if (found) onNavigatePage(found);
    } else if (tabId === "calendar") {
      const found = pages.find((p) => p.id === "calendar");
      if (found) onNavigatePage(found);
    } else if (tabId === "goals") {
      const found = pages.find((p) => p.id === "goals");
      if (found) onNavigatePage(found);
    } else {
      // Month mapping
      const monthsMapping: Record<string, string> = {
        Jan: "01", Fev: "02", Mar: "03", Abr: "04", Mai: "05", Jun: "06",
        Jul: "07", Ago: "08", Set: "09", Out: "10", Nov: "11", Dez: "12"
      };
      const mNum = monthsMapping[tabId];
      if (mNum) {
        const found = pages.find((p) => p.id.startsWith(`d-2026-${mNum}-`));
        if (found) onNavigatePage(found);
      }
    }
  };

  // Render Left Page content
  const renderLeftPage = () => {
    if (activePage.template === "cover") {
      return (
        <div className="open-page__inner open-page__inner--cover-left">
          <div className="book-inside-logo">
            <span style={{ backgroundColor: book.color }} />
            <div className="inside-stamp">
              <strong>PAGELOOM</strong>
              <small>HANDMADE IN 2026</small>
            </div>
          </div>
        </div>
      );
    }

    if (activePage.template === "calendar") {
      return (
        <div className="open-page__inner open-page__inner--calendar-left">
          <h3>Primeiro Semestre 2026</h3>
          <div className="calendar-half-grid">
            {["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho"].map((month, idx) => (
              <CalendarMonthGrid key={month} monthName={month} monthIndex={idx} onSelectDay={onNavigatePage} pages={pages} />
            ))}
          </div>
        </div>
      );
    }

    if (activePage.template === "goals") {
      const goalsList = activePage.pageData?.goals || [];
      const handleToggleGoal = (gIdx: number) => {
        const updated = [...goalsList];
        // Toggle simulation (custom syntax or toggle state)
        // For simple demo, we can just save it or toggle list items
      };
      
      return (
        <div className="open-page__inner open-page__inner--goals-left">
          <div className="section-title-stamp">
            <Sparkles size={16} />
            <h3>Grandes Metas Pessoais</h3>
          </div>
          <p className="goals-subtitle">O que você planeja realizar no ano de 2026? Escreva seus objetivos mais ambiciosos.</p>
          
          <div className="goals-list-editor">
            {goalsList.map((g, idx) => (
              <div className="goal-item" key={idx}>
                <span className="goal-item__number">{idx + 1}</span>
                <input
                  type="text"
                  value={g}
                  onChange={(e) => {
                    const nextGoals = [...goalsList];
                    nextGoals[idx] = e.target.value;
                    updateActivePageData({ goals: nextGoals });
                  }}
                  placeholder="Ex: Aprender a tocar piano..."
                />
              </div>
            ))}
            <button
              className="btn-add-goal"
              type="button"
              onClick={() => {
                updateActivePageData({ goals: [...goalsList, ""] });
              }}
            >
              <Plus size={14} /> Adicionar Objetivo
            </button>
          </div>
        </div>
      );
    }

    if (activePage.template === "daily") {
      const scheduleItems = activePage.pageData?.schedule || [];
      const tasks = activePage.pageData?.tasks || [];

      const handleToggleTask = (tId: number) => {
        const nextTasks = tasks.map((t) => (t.id === tId ? { ...t, done: !t.done } : t));
        updateActivePageData({ tasks: nextTasks });
      };

      const handleAddTask = () => {
        const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
        const text = prompt("Digite a nova tarefa:");
        if (text && text.trim()) {
          updateActivePageData({ tasks: [...tasks, { id: nextId, text: text.trim(), done: false }] });
        }
      };

      const handleDeleteTask = (tId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        updateActivePageData({ tasks: tasks.filter((t) => t.id !== tId) });
      };

      const handleUpdateSchedule = (timeStr: string, label: string) => {
        const nextSchedule = scheduleItems.map((sch) => {
          if (sch.time === timeStr) {
            let kind: ScheduleBlock["kind"] = null;
            const lowercase = label.toLowerCase();
            if (lowercase.includes("reuniao") || lowercase.includes("meeting") || lowercase.includes("call")) {
              kind = "meeting";
            } else if (lowercase.includes("foco") || lowercase.includes("focus") || lowercase.includes("estudar") || lowercase.includes("code")) {
              kind = "focus";
            } else if (label.trim()) {
              kind = "personal";
            }
            return { ...sch, label: label.trim() ? label : null, kind };
          }
          return sch;
        });
        updateActivePageData({ schedule: nextSchedule });
      };

      // Extract day and weekday
      const [weekday, dayMonth] = activePage.title.split(", ");

      return (
        <div className="open-page__inner open-page__inner--daily-left">
          <header className="page-header">
            <span className="page-header__weekday">{weekday}</span>
            <h2 className="page-header__date">{dayMonth} 2026</h2>
          </header>

          <div className="daily-schedule-section">
            <div className="section-header-compact">
              <h4>Compromissos do Dia</h4>
            </div>
            <div className="hourly-blocks-scroll">
              {scheduleItems.map((block) => (
                <div className="hourly-block-input" key={block.time}>
                  <span className="hour-label">{block.time}</span>
                  <div className={`hour-input-wrapper ${block.kind ? `hour-input-wrapper--${block.kind}` : ""}`}>
                    <input
                      type="text"
                      value={block.label || ""}
                      onChange={(e) => handleUpdateSchedule(block.time, e.target.value)}
                      placeholder="Livre..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="daily-priorities-section">
            <div className="section-header-compact">
              <h4>Prioridades</h4>
              <button type="button" onClick={handleAddTask} className="btn-icon-add">
                <Plus size={14} />
              </button>
            </div>
            <div className="planner-tasks-list">
              {tasks.map((task) => (
                <div key={task.id} className={`planner-task-row ${task.done ? "is-completed" : ""}`} onClick={() => handleToggleTask(task.id)}>
                  <div className="planner-task-checkbox">
                    {task.done && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span className="planner-task-text">{task.text}</span>
                  <button type="button" className="btn-delete-task" onClick={(e) => handleDeleteTask(task.id, e)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activePage.template === "custom") {
      return <CustomLayoutSpreadPage page={activePage} side="left" />;
    }

    return (
      <div className="open-page__inner">
        <h3>{activePage.title}</h3>
        <p>Página de Miolo Simples.</p>
      </div>
    );
  };

  // Render Right Page content
  const renderRightPage = () => {
    if (activePage.template === "cover") {
      const handleUpdateColophonName = (val: string) => {
        updateActivePageData({ ownerName: val });
      };
      const handleUpdateColophonEmail = (val: string) => {
        updateActivePageData({ ownerEmail: val });
      };
      const handleUpdateColophonPhone = (val: string) => {
        updateActivePageData({ ownerPhone: val });
      };
      const handleUpdateColophonDesc = (val: string) => {
        updateActivePageData({ notes: val });
      };

      return (
        <div className="open-page__inner open-page__inner--cover-right">
          <div className="colophon-title">
            <h2>{book.title.toUpperCase()}</h2>
            <div className="colophon-divider" />
          </div>

          <div className="colophon-details">
            <div className="colophon-field">
              <label><User size={13} /> Proprietário</label>
              <input
                type="text"
                value={activePage.pageData?.ownerName || ""}
                onChange={(e) => handleUpdateColophonName(e.target.value)}
                placeholder="Seu Nome Completo..."
              />
            </div>
            <div className="colophon-field">
              <label><Mail size={13} /> E-mail</label>
              <input
                type="email"
                value={activePage.pageData?.ownerEmail || ""}
                onChange={(e) => handleUpdateColophonEmail(e.target.value)}
                placeholder="seu-email@exemplo.com..."
              />
            </div>
            <div className="colophon-field">
              <label><Phone size={13} /> Telefone</label>
              <input
                type="text"
                value={activePage.pageData?.ownerPhone || ""}
                onChange={(e) => handleUpdateColophonPhone(e.target.value)}
                placeholder="(00) 99999-9999..."
              />
            </div>
          </div>

          <div className="colophon-contracapa">
            <label>Propósito deste Livro (Texto da Contracapa)</label>
            <textarea
              value={activePage.pageData?.notes || ""}
              onChange={(e) => handleUpdateColophonDesc(e.target.value)}
              placeholder="Digite aqui o propósito ou descrição do caderno..."
              rows={4}
            />
          </div>

          <div className="colophon-manufacturing-stamp">
            <p>Confeccionado reativamente por <strong>Pageloom Stationery Corp.</strong></p>
            <span>A5 PREMIUM · PÓLEN SOFT MIOLO · 2026 EDITION</span>
          </div>
        </div>
      );
    }

    if (activePage.template === "calendar") {
      return (
        <div className="open-page__inner open-page__inner--calendar-right">
          <h3>Segundo Semestre 2026</h3>
          <div className="calendar-half-grid">
            {["Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"].map((month, idx) => (
              <CalendarMonthGrid key={month} monthName={month} monthIndex={idx + 6} onSelectDay={onNavigatePage} pages={pages} />
            ))}
          </div>
        </div>
      );
    }

    if (activePage.template === "goals") {
      const notesContent = activePage.pageData?.notes || "";
      return (
        <div className="open-page__inner open-page__inner--goals-right">
          <div className="section-title-stamp">
            <Sparkles size={16} />
            <h3>Carta de Intenções para o Ano</h3>
          </div>
          <p className="goals-subtitle">Escreva uma reflexão livre sobre o que você deseja para a sua mente e espírito em 2026.</p>
          
          <div className="goals-notes-notepad">
            <textarea
              value={notesContent}
              onChange={(e) => updateActivePageData({ notes: e.target.value })}
              placeholder="Digite aqui suas reflexões livres..."
              rows={15}
            />
            {/* Lined paper lines mock background */}
            <div className="notepad-lines-visual" />
          </div>
        </div>
      );
    }

    if (activePage.template === "daily") {
      const notesContent = activePage.pageData?.notes || "";
      const currentMood = activePage.pageData?.mood || null;
      const waterIntake = activePage.pageData?.waterIntake || 0;

      const handleMoodClick = (mood: "great" | "good" | "meh" | "bad") => {
        updateActivePageData({ mood: currentMood === mood ? null : mood });
      };

      const handleWaterCupClick = (idx: number) => {
        const nextWater = idx === waterIntake ? idx - 1 : idx;
        updateActivePageData({ waterIntake: Math.max(0, Math.min(8, nextWater)) });
      };

      return (
        <div className="open-page__inner open-page__inner--daily-right">
          <div className="daily-trackers-row">
            <div className="mood-tracker-container">
              <h5>Humor do Dia</h5>
              <div className="mood-icons-grid">
                {[
                  { id: "great", label: "Ótimo", color: "#8baf8e", text: "😀" },
                  { id: "good", label: "Bom", color: "#7bacc2", text: "🙂" },
                  { id: "meh", label: "Ok", color: "#e4a84e", text: "😐" },
                  { id: "bad", label: "Ruim", color: "#b58e8a", text: "🙁" }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    className={`mood-icon-btn ${currentMood === item.id ? "is-selected" : ""}`}
                    onClick={() => handleMoodClick(item.id as any)}
                    style={{
                      borderColor: currentMood === item.id ? item.color : "transparent",
                      backgroundColor: currentMood === item.id ? `${item.color}22` : "transparent"
                    }}
                  >
                    <span className="mood-emoji">{item.text}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="water-tracker-container">
              <h5>Hidratação (Copos D'água)</h5>
              <div className="water-glasses-row">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((cup) => (
                  <button
                    key={cup}
                    type="button"
                    className={`water-cup-btn ${cup <= waterIntake ? "is-filled" : ""}`}
                    onClick={() => handleWaterCupClick(cup)}
                    title={`${cup} copos bebidos`}
                  >
                    <span className="cup-shape" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="daily-lined-notes-notepad">
            <div className="section-header-compact">
              <h4>Notas & Memórias</h4>
            </div>
            <div className="daily-notes-textarea-wrapper">
              <textarea
                value={notesContent}
                onChange={(e) => updateActivePageData({ notes: e.target.value })}
                placeholder="Escreva aqui suas reflexões livres do dia..."
              />
              <div className="notes-notepad-lines" />
            </div>
          </div>
        </div>
      );
    }

    if (activePage.template === "custom") {
      return <CustomLayoutSpreadPage page={activePage} side="right" />;
    }

    return (
      <div className="open-page__inner">
        <p>Página de Miolo Simples oposta.</p>
      </div>
    );
  };

  return (
    <div className={`book-open-planner ${compact ? "book-open-planner--compact" : ""}`}>
      {/* Outer book binder */}
      <div className="planner-stage">
        <div className={`open-book-frame ${isFlipping ? "is-flipping" : ""}`}>
          {/* Central spine fold shadow */}
          <div className="book-spine-fold" />

          {/* Left Page Sheet */}
          <div className="open-page open-page--left">
            {renderLeftPage()}
            {/* Page number */}
            <span className="page-number-visual page-number-visual--left">
              Pág. {activeIndex * 2 + 1}
            </span>
          </div>

          {/* Right Page Sheet */}
          <div className="open-page open-page--right">
            {renderRightPage()}
            {/* Page number */}
            <span className="page-number-visual page-number-visual--right">
              Pág. {activeIndex * 2 + 2}
            </span>
          </div>
        </div>

        {/* Physical Month Tabs overlapping on the right side ("Estilo Escama") */}
        <div className="escama-tabs-container">
          {tabsList.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`escama-tab-btn ${currentActiveTab === tab.id ? "is-active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
              title={tab.label}
            >
              <span className="tab-label-text">{compact ? tab.short : tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer Navigation bar */}
      <footer className="planner-navigator-footer">
        <button className="navigator-nav-btn" type="button" onClick={goPrev} disabled={activeIndex <= 0}>
          <ChevronLeft size={16} />
          Página Anterior
        </button>
        <span className="navigator-index-text">
          Páginas <strong>{activeIndex * 2 + 1} - {activeIndex * 2 + 2}</strong> de {pages.length * 2}
        </span>
        <button className="navigator-nav-btn" type="button" onClick={goNext} disabled={activeIndex >= pages.length - 1}>
          Próxima Página
          <ChevronRight size={16} />
        </button>
      </footer>
    </div>
  );
}

function CustomLayoutSpreadPage({ page, side }: { page: PlannerPage; side: "left" | "right" }) {
  const blocks = page.pageData?.layoutBlocks ?? [];
  const paperTone = page.pageData?.paperTone ?? "offset";
  const paperPattern = page.pageData?.paperPattern ?? "blank";

  return (
    <div className={`open-page__inner open-page__inner--custom custom-layout-sheet custom-layout-sheet--${paperTone} custom-layout-sheet--${paperPattern} custom-layout-sheet--${side}`}>
      <div className="custom-layout-sheet__binding-zone" aria-hidden="true" />
      <div className="custom-layout-sheet__safe-zone" aria-hidden="true" />
      <div className="custom-layout-sheet__blocks">
        {blocks.map((layoutBlock) => (
          <div
            key={layoutBlock.id}
            className={`custom-layout-block custom-layout-block--${layoutBlock.type}`}
            style={{
              left: `${(layoutBlock.xMm / 148) * 100}%`,
              top: `${(layoutBlock.yMm / 210) * 100}%`,
              width: `${(layoutBlock.widthMm / 148) * 100}%`,
              height: `${(layoutBlock.heightMm / 210) * 100}%`,
            }}
          >
            <BlockArtwork block={layoutBlock} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Internal Calendar Month Grid component to render a premium interactive month view */
interface CalendarMonthGridProps {
  monthName: string;
  monthIndex: number;
  onSelectDay: (page: PlannerPage) => void;
  pages: PlannerPage[];
}

function CalendarMonthGrid({ monthName, monthIndex, onSelectDay, pages }: CalendarMonthGridProps) {
  // 2026 Specific month details
  const daysInMonths2026 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  // Calculate day of the week for the 1st of this month in 2026
  // Year 2026: Jan 1st is Thursday (getDay() = 4)
  const firstDayOfWeek = new Date(2026, monthIndex, 1).getDay();
  const totalDays = daysInMonths2026[monthIndex];

  const blankDays = Array(firstDayOfWeek).fill(null);
  const calendarDays = Array.from({ length: totalDays }, (_, i) => i + 1);

  const monthsShort = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const mStr = monthsShort[monthIndex];

  const handleDayClick = (day: number) => {
    const dStr = day.toString().padStart(2, "0");
    const mNum = (monthIndex + 1).toString().padStart(2, "0");
    const targetId = `d-2026-${mNum}-${dStr}`;
    const pageObj = pages.find((p) => p.id === targetId);
    if (pageObj) onSelectDay(pageObj);
  };

  const hasPage = (day: number) => {
    const dStr = day.toString().padStart(2, "0");
    const mNum = (monthIndex + 1).toString().padStart(2, "0");
    const targetId = `d-2026-${mNum}-${dStr}`;
    return pages.some((p) => p.id === targetId);
  };

  return (
    <div className="calendar-month-item">
      <h5>{monthName}</h5>
      <div className="month-days-header">
        <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
      </div>
      <div className="month-days-grid">
        {blankDays.map((_, i) => (
          <span key={`blank-${i}`} className="day-blank" />
        ))}
        {calendarDays.map((day) => {
          const active = hasPage(day);
          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={!active}
              className={`day-cell-btn ${active ? "is-linked" : ""}`}
              onClick={() => handleDayClick(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
