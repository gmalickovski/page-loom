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
  const [mobileSide, setMobileSide] = useState<"left" | "right">("left");

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
    if (compact) {
      if (mobileSide === "right") {
        setMobileSide("left");
      } else if (activeIndex > 0) {
        setIsFlipping(true);
        setTimeout(() => {
          onNavigatePage(pages[activeIndex - 1]);
          setMobileSide("right");
          setIsFlipping(false);
        }, 260);
      }
    } else {
      if (activeIndex > 0) {
        onNavigatePage(pages[activeIndex - 1]);
      }
    }
  };

  const goNext = () => {
    if (compact) {
      if (mobileSide === "left") {
        setMobileSide("right");
      } else if (activeIndex < pages.length - 1) {
        setIsFlipping(true);
        setTimeout(() => {
          onNavigatePage(pages[activeIndex + 1]);
          setMobileSide("left");
          setIsFlipping(false);
        }, 260);
      }
    } else {
      if (activeIndex < pages.length - 1) {
        onNavigatePage(pages[activeIndex + 1]);
      }
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

  // Swipe gesture listeners for mobile viewpage slide focus
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragCurrentX, setDragCurrentX] = useState<number | null>(null);

  const handleDragStart = (clientX: number) => {
    setDragStartX(clientX);
    setDragCurrentX(clientX);
  };

  const handleDragMove = (clientX: number) => {
    if (dragStartX === null) return;
    setDragCurrentX(clientX);
  };

  const handleDragEnd = () => {
    if (dragStartX === null || dragCurrentX === null) return;
    const diffX = dragCurrentX - dragStartX;
    const threshold = 55;

    if (Math.abs(diffX) > threshold) {
      if (diffX < 0) {
        goNext();
      } else {
        goPrev();
      }
    }
    setDragStartX(null);
    setDragCurrentX(null);
  };

  const PASTEL_COLORS = [
    "#E2DBD5", // Capa - Cinza Argila
    "#EADBC8", // Cal - Rosa Antigo
    "#F3ECE0", // Metas - Trigo Claro
    "#CBD5D0", // Jan - Azul Névoa
    "#D2DCD0", // Fev - Verde Sálvia
    "#DACBD5", // Mar - Lavanda
  ];

  // Dynamic tabs list extracted from the book pages
  const dynamicTabs = (() => {
    const list: Array<{
      id: string;
      label: string;
      short: string;
      color?: string;
      type: "system" | "custom";
      targetPageId: string;
    }> = [];

    const hasCover = pages.some(p => p.id === "cover");
    if (hasCover) {
      list.push({ id: "cover", label: "Capa", short: "Capa", type: "system", targetPageId: "cover" });
    }
    const hasCalendar = pages.some(p => p.id === "calendar");
    if (hasCalendar) {
      list.push({ id: "calendar", label: "Calendário", short: "Cal", type: "system", targetPageId: "calendar" });
    }
    const hasGoals = pages.some(p => p.id === "goals");
    if (hasGoals) {
      list.push({ id: "goals", label: "Metas", short: "Metas", type: "system", targetPageId: "goals" });
    }

    const customSeparators: typeof list = [];
    pages.forEach((page) => {
      if (page.template === "separator") {
        customSeparators.push({
          id: page.id,
          label: page.title,
          short: page.title.substring(0, 5),
          color: (page.pageData as any)?.separatorColor || "#CBD5D0",
          type: "custom",
          targetPageId: page.id
        });
      } else {
        const sepBlock = page.pageData?.layoutBlocks?.find(b => b.type === "separator");
        if (sepBlock) {
          customSeparators.push({
            id: `sep-${sepBlock.id}`,
            label: sepBlock.title,
            short: sepBlock.title.substring(0, 5),
            color: sepBlock.variant || "#CBD5D0",
            type: "custom",
            targetPageId: page.id
          });
        }
      }
    });

    if (customSeparators.length > 0) {
      list.push(...customSeparators);
    } else {
      // Fallback: 4 spacious stationery categories instead of 12 crowded months
      const hasMay13 = pages.some(p => p.id === "d-2026-05-13");
      const targetDailyId = hasMay13 ? "d-2026-05-13" : (pages.find(p => p.id.startsWith("d-"))?.id || "cover");

      list.push({
        id: "diary-tab",
        label: "Diário",
        short: "Diário",
        color: "#CBD5D0",
        type: "system",
        targetPageId: targetDailyId
      });
    }

    return list;
  })();

  // Resolve active tab index dynamically
  const getActiveTab = () => {
    const tabsWithIndices = dynamicTabs.map(tab => {
      let pageIdx = -1;
      if (tab.type === "custom") {
        pageIdx = pages.findIndex(p => p.id === tab.targetPageId);
      } else {
        if (tab.id === "cover") pageIdx = pages.findIndex(p => p.id === "cover");
        else if (tab.id === "calendar") pageIdx = pages.findIndex(p => p.id === "calendar");
        else if (tab.id === "goals") pageIdx = pages.findIndex(p => p.id === "goals");
        else {
          const monthsMapping: Record<string, string> = {
            Jan: "01", Fev: "02", Mar: "03", Abr: "04", Mai: "05", Jun: "06",
            Jul: "07", Ago: "08", Set: "09", Out: "10", Nov: "11", Dez: "12"
          };
          const mNum = monthsMapping[tab.id];
          if (mNum) {
            pageIdx = pages.findIndex(p => p.id.startsWith(`d-2026-${mNum}-`));
          }
        }
      }
      return { ...tab, pageIdx };
    }).filter(t => t.pageIdx !== -1)
      .sort((a, b) => a.pageIdx - b.pageIdx);

    let activeTabId = dynamicTabs[0]?.id || "cover";
    for (let i = 0; i < tabsWithIndices.length; i++) {
      if (activeIndex >= tabsWithIndices[i].pageIdx) {
        activeTabId = tabsWithIndices[i].id;
      }
    }
    return activeTabId;
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tab: typeof dynamicTabs[0]) => {
    if (tab.type === "custom") {
      const found = pages.find((p) => p.id === tab.targetPageId);
      if (found) onNavigatePage(found);
    } else {
      const tabId = tab.id;
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
    }
  };

  const getPaperTextureClass = (page: PlannerPage) => {
    if (page.template === "separator" || page.template === "cover") {
      return "";
    }
    const pattern = page.pageData?.paperPattern || (page.template === "daily" ? "dot_grid" : "blank");
    if (pattern === "lined") return "paper-texture-ruled";
    if (pattern === "dot_grid") return "paper-texture-dotted";
    if (pattern === "grid") return "paper-texture-grid";
    return "";
  };

  const renderBindingRings = () => {
    if (compact) {
      return null;
    }
    const ringPositions = [12, 23, 34, 45, 56, 67, 78, 89];
    return (
      <div className="desktop-binding-spine">
        {ringPositions.map((pos, idx) => (
          <div key={idx} className="binding-element" style={{ top: `${pos}%` }}>
            <div className="binding-hole-cutout binding-hole-cutout--left" />
            <div className="binding-hole-cutout binding-hole-cutout--right" />
            <div className="binding-ring-disc" />
          </div>
        ))}
      </div>
    );
  };

  // Render Left Page content
  const renderLeftPage = () => {
    if (activePage.template === "separator") {
      const titleText = activePage.pageData?.sectionTitle || activePage.title;
      const bgColor = (activePage.pageData as any)?.separatorColor || "#CBD5D0";
      return (
        <div 
          className="open-page__inner open-page__inner--separator"
          style={{ 
            backgroundColor: bgColor,
            color: "#57534e",
            boxShadow: "inset -10px 0 20px rgba(0,0,0,0.05)"
          }}
        >
          <div className="separator-page-content left">
            <div className="separator-card-embossed">
              <h2>{titleText.toUpperCase()}</h2>
              <div className="separator-card-line" />
              <p>PAGELOOM INDEX DIVIDER</p>
            </div>
          </div>
        </div>
      );
    }

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
        <p>Página de Template Simples.</p>
      </div>
    );
  };

  // Render Right Page content
  const renderRightPage = () => {
    if (activePage.template === "separator") {
      const titleText = activePage.pageData?.sectionTitle || activePage.title;
      const bgColor = (activePage.pageData as any)?.separatorColor || "#CBD5D0";
      return (
        <div 
          className="open-page__inner open-page__inner--separator"
          style={{ 
            backgroundColor: bgColor,
            color: "#57534e",
            boxShadow: "inset 10px 0 20px rgba(0,0,0,0.05)"
          }}
        >
          <div className="separator-page-content right">
            <div className="separator-card-embossed">
              <h2>{titleText.toUpperCase()}</h2>
              <div className="separator-card-line" />
              <small>SEÇÃO ATIVA · 2026 EDITION</small>
            </div>
          </div>
        </div>
      );
    }

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
            <span>A5 PREMIUM · PÓLEN SOFT · 2026 EDITION</span>
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
        <p>Página de Template Simples oposta.</p>
      </div>
    );
  };

  const showTabs = activePage.id !== "cover" && activePage.template !== "cover";
  const hasTabs = dynamicTabs.length > 0 && showTabs;

  const hasPrevPage = activeIndex > 0 || (compact && mobileSide === "right");
  const hasNextPage = activeIndex < pages.length - 1 || (compact && mobileSide === "left");

  return (
    <div className={`book-open-planner ${compact ? "book-open-planner--compact" : ""}`}>
      {/* Mini floating page counter pill */}
      <div className="planner-pill-counter">
        Página {compact ? `${activeIndex * 2 + (mobileSide === "left" ? 1 : 2)}` : `${activeIndex * 2 + 1} - ${activeIndex * 2 + 2}`} de {pages.length * 2}
      </div>

      {/* Outer book binder */}
      <div className="planner-stage">
        {/* Subtle dynamic paging arrows */}
        {hasPrevPage && (
          <button 
            type="button" 
            className="planner-flip-arrow planner-flip-arrow--left" 
            onClick={goPrev}
            aria-label="Página anterior"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        {hasNextPage && (
          <button 
            type="button" 
            className="planner-flip-arrow planner-flip-arrow--right" 
            onClick={goNext}
            aria-label="Próxima página"
          >
            <ChevronRight size={20} />
          </button>
        )}

        <div 
          className={`planner-sheet-container ${hasTabs ? "has-tabs" : ""}`}
          style={{
            transform: compact 
              ? (mobileSide === "left" 
                ? (hasTabs ? "translateX(calc(25% + 6px))" : "translateX(25%)")
                : (hasTabs ? "translateX(calc(-25% + 4px))" : "translateX(-25%)"))
              : "none",
            transition: compact ? "transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)" : "none"
          }}
        >
          {/* Hardcover Backer */}
          <div 
            className="book-hardcover-backer"
            style={{ backgroundColor: book.color || "#4B443B" }}
          />

          <div 
            className={`open-book-frame ${isFlipping ? "is-flipping" : ""}`}
            onTouchStart={(e) => handleDragStart(e.touches[0].clientX)}
            onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
            onTouchEnd={handleDragEnd}
            onMouseDown={(e) => handleDragStart(e.clientX)}
            onMouseMove={(e) => handleDragMove(e.clientX)}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            style={{ cursor: compact ? "grab" : "default" }}
          >
            {/* Central spine fold seam - flat and extremely subtle line instead of a rounded cylinder */}
            <div className="book-spine-seam" />

            {/* Render the realistic disc/ring binding system */}
            {renderBindingRings()}

            {/* Book Pages Slider: shows both pages side-by-side inside the frame */}
            <div 
              className="open-book-pages-slider" 
              style={{ 
                display: "flex", 
                width: "100%", 
                height: "100%"
              }}
            >
              {/* Left Page Sheet */}
              <div className={`open-page open-page--left ${getPaperTextureClass(activePage)}`} style={{ flex: 1 }}>
                {renderLeftPage()}
                {/* Page number */}
                <span className="page-number-visual page-number-visual--left">
                  Pág. {activeIndex * 2 + 1}
                </span>
              </div>

              {/* Right Page Sheet */}
              <div className={`open-page open-page--right ${getPaperTextureClass(activePage)}`} style={{ flex: 1 }}>
                {renderRightPage()}
                {/* Page number */}
                <span className="page-number-visual page-number-visual--right">
                  Pág. {activeIndex * 2 + 2}
                </span>
              </div>
            </div>
          </div>

          {/* Physical Month Tabs overlapping on the right side ("Estilo Escama") - conditionally hidden on cover */}
          {hasTabs && (
            <div className="escama-tabs-container">
              {dynamicTabs.map((tab, idx) => {
                const tabColor = tab.color || PASTEL_COLORS[idx % PASTEL_COLORS.length];
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`escama-tab-btn ${currentActiveTab === tab.id ? "is-active" : ""}`}
                    onClick={() => handleTabClick(tab)}
                    title={tab.label}
                    style={{
                      backgroundColor: tabColor,
                      zIndex: currentActiveTab === tab.id ? 12 : 5 + idx,
                    }}
                  >
                    <span className="tab-label-text">{compact ? tab.short : tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomLayoutSpreadPage({ page, side }: { page: PlannerPage; side: "left" | "right" }) {
  const blocks = page.pageData?.layoutBlocks ?? [];
  const paperTone = page.pageData?.paperTone ?? "offset";
  const paperPattern = page.pageData?.paperPattern ?? "blank";

  const TONE_COLORS: Record<string, string> = {
    offset: "#fffdf8",
    pollen: "#fbf3df",
    recycled: "#ded0b2",
    rice: "#ffffff",
    black: "#1f1f1d"
  };
  const paperBgColor = TONE_COLORS[paperTone] || "#fffdf8";

  // In print layouts: left page is even, right page is odd.
  // Standard A5 safety margins: inner spine is 20mm, outer side is 10mm
  const isOdd = side === "right";
  const leftMargin = isOdd ? 20 : 10;
  const rightMargin = isOdd ? 10 : 20;

  return (
    <div className={`open-page__inner open-page__inner--custom custom-layout-sheet custom-layout-sheet--${paperTone} custom-layout-sheet--${side}`} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg 
        viewBox="0 0 148 210" 
        width="100%" 
        height="100%" 
        style={{ display: "block", width: "100%", height: "100%", overflow: "hidden" }}
      >
        <defs>
          {/* Lined pattern: strict physical 7mm pauta spacing, starting 10mm from top */}
          <pattern id={`ruled-${page.id}`} width="148" height="7" patternUnits="userSpaceOnUse" patternTransform="translate(0, 10)">
            <line x1="0" y1="7" x2="148" y2="7" stroke={paperTone === "black" ? "rgba(246, 241, 231, 0.15)" : "rgba(123, 172, 194, 0.22)"} strokeWidth="0.25" />
          </pattern>
          {/* Dotted pattern: strict physical 5mm grid spacing */}
          <pattern id={`dotted-${page.id}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="translate(2.5, 2.5)">
            <circle cx="2.5" cy="2.5" r="0.45" fill={paperTone === "black" ? "rgba(246, 241, 231, 0.25)" : "rgba(87, 83, 78, 0.22)"} />
          </pattern>
          {/* Grid pattern: strict physical 5mm x 5mm grid */}
          <pattern id={`grid-${page.id}`} width="5" height="5" patternUnits="userSpaceOnUse">
            <rect width="5" height="5" fill="none" stroke={paperTone === "black" ? "rgba(246, 241, 231, 0.1)" : "rgba(87, 83, 78, 0.12)"} strokeWidth="0.25" />
          </pattern>
        </defs>

        {/* Paper solid background tone */}
        <rect width="148" height="210" fill={paperBgColor} />

        {/* Paper texture overlay based on selected pattern */}
        {paperPattern === "lined" && (
          <rect width="148" height="210" fill={`url(#ruled-${page.id})`} />
        )}
        {paperPattern === "dot_grid" && (
          <rect width="148" height="210" fill={`url(#dotted-${page.id})`} />
        )}
        {paperPattern === "grid" && (
          <rect width="148" height="210" fill={`url(#grid-${page.id})`} />
        )}

        {/* Binding zone shadow mask */}
        <rect 
          x={isOdd ? 0 : 128} 
          y="0" 
          width="20" 
          height="210" 
          fill={paperTone === "black" ? "rgba(255,255,255,0.02)" : "rgba(45, 36, 32, 0.035)"} 
          pointerEvents="none" 
        />

        {/* Safe area boundary guideline */}
        <rect 
          x={leftMargin} 
          y="10" 
          width={148 - leftMargin - rightMargin} 
          height="190" 
          fill="none" 
          stroke={paperTone === "black" ? "rgba(246, 241, 231, 0.08)" : "rgba(123, 172, 194, 0.18)"} 
          strokeWidth="0.3" 
          strokeDasharray="1 1" 
          pointerEvents="none" 
        />

        {/* Render Blocks */}
        {blocks.map((layoutBlock) => {
          return (
            <g key={layoutBlock.id} transform={`translate(${layoutBlock.xMm}, ${layoutBlock.yMm})`}>
              {/* Opaque Block Masking: solid rect behind each block to cover page background texture */}
              <rect 
                width={layoutBlock.widthMm} 
                height={layoutBlock.heightMm} 
                fill={paperBgColor} 
                rx="1.5" 
                style={{ filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.02))" }}
              />
              
              {/* HTML Block Content rendered inside SVG coordinates using foreignObject */}
              <foreignObject 
                x="0" 
                y="0" 
                width={layoutBlock.widthMm} 
                height={layoutBlock.heightMm}
              >
                <div 
                  className={`custom-layout-block custom-layout-block--${layoutBlock.type}`}
                  style={{ width: "100%", height: "100%", margin: 0, padding: 0 }}
                >
                  <BlockArtwork block={layoutBlock} />
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
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
