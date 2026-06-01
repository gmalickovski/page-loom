import re

file_path = r"c:\Dev\pageloom\apps\web\src\components\planner\TemplateStudio.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update clampBlock
content = re.sub(
    r"function clampBlock\(block: PlannerLayoutBlock\): PlannerLayoutBlock \{[\s\S]*?return \{[\s\S]*?yMm: Math\.max\(SAFE_MARGIN_MM, Math\.min\(A5_HEIGHT_MM - SAFE_MARGIN_MM - block\.heightMm, block\.yMm\)\),\n  \};\n\}",
    """function clampBlock(block: PlannerLayoutBlock, punchSide: "left" | "right" = "left"): PlannerLayoutBlock {
  if (block.type === "page_background") return block;
  const leftMargin = punchSide === "left" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM;
  const rightMargin = punchSide === "right" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM;
  return {
    ...block,
    xMm: Math.max(leftMargin, Math.min(A5_WIDTH_MM - rightMargin - block.widthMm, block.xMm)),
    yMm: Math.max(SAFE_MARGIN_MM, Math.min(A5_HEIGHT_MM - SAFE_MARGIN_MM - block.heightMm, block.yMm)),
  };
}""",
    content
)

# 2. Update Icons import
if "ChevronDown" not in content:
    content = content.replace("Trash2,", "Trash2,\n  ChevronDown,\n  ChevronUp,\n  BookOpen,")

# 3. Add states
state_addition = """  const [activeSidebarMode, setActiveSidebarMode] = useState<"pages" | "blocks">("pages");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(() => plan.sections[0]?.id ?? null);
  const [singlePageSide, setSinglePageSide] = useState<"odd" | "even">("odd");"""
content = re.sub(r'  const \[activeSidebarMode, setActiveSidebarMode\] = useState<"pages" \| "blocks">\("pages"\);', state_addition, content)

# 4. Rewrite addBlock, moveBlock, deleteBlock, handleBlockPointerDown, handleDrop
drag_logic = """  const addBlock = (preset: BlockPreset, xMm = 20, yMm = 36, targetPageSide: "left" | "right" = "right") => {
    if (!activeSection) return;
    const punchSide = activeSection.layoutMode === "double" ? (targetPageSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
    const nextBlock = clampBlock({ ...createBlockFromPreset(preset, xMm, yMm), pageSide: targetPageSide }, punchSide);
    updateActiveSection((section) => ({ ...section, blocks: fitBackgroundBlock([...section.blocks, nextBlock]) }));
    setActiveBlockId(nextBlock.id);
  };

  const moveBlock = (blockId: string, xMm: number, yMm: number, pageSide: "left" | "right") => {
    updateActiveSection((section) => {
      const punchSide = section.layoutMode === "double" ? (pageSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
      return {
        ...section,
        blocks: fitBackgroundBlock(
          section.blocks.map((block) => (block.id === blockId ? clampBlock({ ...block, xMm: snap(xMm), yMm: snap(yMm), pageSide }, punchSide) : block)),
          blockId,
        ),
      };
    });
  };

  const deleteBlock = (blockId: string) => {
    updateActiveSection((section) => ({
      ...section,
      blocks: fitBackgroundBlock(section.blocks.filter((block) => block.id !== blockId)),
    }));
    setActiveBlockId(null);
  };

  const handleBlockPointerDown = (event: ReactPointerEvent<HTMLElement>, block: PlannerLayoutBlock) => {
    event.preventDefault();
    event.stopPropagation();
    setActiveBlockId(block.id);

    const pageElement = (event.currentTarget as HTMLElement).closest(".a5-page-mockup") as HTMLDivElement;
    if (!pageElement) return;

    const rect = pageElement.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const blockStartX = block.xMm;
    const blockStartY = block.yMm;
    const initialPageSide = block.pageSide || "right";

    const onPointerMove = (moveEvent: PointerEvent) => {
      const dx = ((moveEvent.clientX - startX) / rect.width) * A5_WIDTH_MM;
      const dy = ((moveEvent.clientY - startY) / rect.height) * A5_HEIGHT_MM;
      moveBlock(block.id, blockStartX + dx, blockStartY + dy, initialPageSide);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const handleDrop = (event: ReactDragEvent<HTMLDivElement>, targetPageSide: "left" | "right") => {
    const presetId = event.dataTransfer.getData("application/pageloom-block");
    const preset = BLOCK_PRESETS.find((item) => item.id === presetId);
    if (!preset) return;

    event.preventDefault();
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    const xMm = ((event.clientX - rect.left) / rect.width) * A5_WIDTH_MM;
    const yMm = ((event.clientY - rect.top) / rect.height) * A5_HEIGHT_MM;
    addBlock(preset, xMm, yMm, targetPageSide);
    onClosePanel();
  };"""
content = re.sub(
    r"  const addBlock = \([\s\S]*?onClosePanel\(\);\n  \};",
    drag_logic,
    content
)

# 5. Sidebar Card changes
card_old = """                      onClick={() => {
                        setActiveSectionId(section.id);
                        setActiveBlockId(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[#d26c36] font-bold text-lg">{index + 1}</span>
                        <div className="flex gap-1">
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1); }} disabled={index === 0}>
                            <ArrowUp size={14} />
                          </button>
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1); }} disabled={index === plan.sections.length - 1}>
                            <ArrowDown size={14} />
                          </button>
                          <button className="p-1.5 text-[#a59990] hover:bg-[#fce8e8] hover:text-red-600 rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} disabled={plan.sections.length <= 1}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="font-medium text-[#2d2420] text-sm">
                        {section.title}
                      </div>

                      {/* Editor for Active Section */}
                      {activeSectionId === section.id && ("""
card_new = """                      onClick={() => {
                        setActiveSectionId(section.id);
                        setExpandedSectionId(expandedSectionId === section.id ? null : section.id);
                        setActiveBlockId(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <span className="text-[#d26c36] font-bold text-lg">{index + 1}</span>
                           <div className="font-medium text-[#2d2420] text-sm">{section.title}</div>
                        </div>
                        <div className="flex gap-1">
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); moveSection(section.id, -1); }} disabled={index === 0}>
                            <ArrowUp size={14} />
                          </button>
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); moveSection(section.id, 1); }} disabled={index === plan.sections.length - 1}>
                            <ArrowDown size={14} />
                          </button>
                          <button className="p-1.5 text-[#a59990] hover:bg-[#fce8e8] hover:text-red-600 rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); deleteSection(section.id); }} disabled={plan.sections.length <= 1}>
                            <Trash2 size={14} />
                          </button>
                          <div className="w-px h-6 bg-[#e8e4da] mx-1 self-center" />
                          <button className="p-1.5 text-[#a59990] hover:bg-[#e8e4da] rounded-md transition-colors">
                             {expandedSectionId === section.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Editor for Active Section */}
                      {expandedSectionId === section.id && ("""
content = content.replace(card_old, card_new)

# 6. Layout mode input
layout_input = """
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-[#a59990] tracking-wider">Modo de Layout</label>
                            <select
                              value={section.layoutMode || "single"}
                              onChange={(e) => updateActiveSection((s) => ({ ...s, layoutMode: e.target.value as "single" | "double" }))}
                              className="w-full bg-white border border-[#e8e4da] rounded-md px-2 py-1.5 text-sm focus:outline-none focus:border-[#d26c36] text-[#2d2420]"
                            >
                              <option value="single">Página Simples</option>
                              <option value="double">Livro Aberto (Dupla)</option>
                            </select>
                          </div>
"""
content = content.replace('<label className="text-[10px] uppercase font-bold text-[#a59990] tracking-wider">Fundo de Página</label>', layout_input + '\n                          <label className="text-[10px] uppercase font-bold text-[#a59990] tracking-wider">Fundo de Página</label>')

# 7. Canvas Toolbar
toolbar_replacement = """          {/* Zoom Controls & Page Mode */}
          <div className="p-4 border-b border-[#e8e4da] bg-white flex justify-between items-center z-10 shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#6d5f57]">Páginas <span className="bg-[#faf8f5] px-2 py-1 rounded text-[#d26c36]">{pageCount}</span></span>
              
              {activeSection?.layoutMode !== "double" && (
                <div className="flex bg-[#faf8f5] p-1 rounded-full border border-[#e8e4da]">
                  <button 
                    onClick={() => setSinglePageSide("even")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${singlePageSide === "even" ? "bg-white shadow text-[#d26c36]" : "text-[#a59990]"}`}
                  >
                    Página Par (Esq)
                  </button>
                  <button 
                    onClick={() => setSinglePageSide("odd")}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${singlePageSide === "odd" ? "bg-white shadow text-[#d26c36]" : "text-[#a59990]"}`}
                  >
                    Página Ímpar (Dir)
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 bg-[#faf8f5] rounded-full p-1 border border-[#e8e4da]">
"""
content = re.sub(
    r"          \{\/\* Zoom Controls \*\/\}[\s\S]*?<div className=\"flex items-center gap-2 bg-\[\#faf8f5\] rounded-full p-1 border border-\[\#e8e4da\]\">",
    toolbar_replacement,
    content
)


# 8. Canvas Render
canvas_render_old = r"            \{\/\* The A5 Page Mockup \*\/\}[\s\S]*?onDrop=\{handleDrop\}\n            >[\s\S]*?\{\/\* Render Blocks \*\/\}[\s\S]*?div>"
canvas_render_new = """            {/* The Pages Render */}
            <div className="flex gap-1" style={{ width: activeSection?.layoutMode === "double" ? (A5_WIDTH_MM * 3.77 * pageZoom * 2) + 4 : A5_WIDTH_MM * 3.77 * pageZoom }}>
              {["left", "right"].map((side) => {
                 const isDouble = activeSection?.layoutMode === "double";
                 if (side === "left" && !isDouble) return null;
                 
                 const pSide = side as "left" | "right";
                 const punchSide = isDouble ? (pSide === "left" ? "right" : "left") : (singlePageSide === "odd" ? "left" : "right");
                 
                 return (
                    <div
                      key={side}
                      id={`page-${side}`}
                      className="a5-page-mockup"
                      style={{
                        width: A5_WIDTH_MM * 3.77 * pageZoom,
                        height: A5_HEIGHT_MM * 3.77 * pageZoom,
                        backgroundColor: "white",
                        position: "relative",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
                        border: "1px solid #e8e4da",
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(e) => handleDrop(e, pSide)}
                    >
                      {/* Safe Area Background Layer */}
                      <div 
                        className="absolute pointer-events-none"
                        style={{
                          left: (punchSide === "left" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM) * 3.77 * pageZoom,
                          right: (punchSide === "right" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM) * 3.77 * pageZoom,
                          top: SAFE_MARGIN_MM * 3.77 * pageZoom,
                          bottom: SAFE_MARGIN_MM * 3.77 * pageZoom,
                          ...(() => {
                            const mmToPx = (mm: number) => mm * 3.77 * pageZoom;
                            const paperPattern = activeSection?.paperPattern ?? "blank";
                            if (paperPattern === "lined") {
                              const spacing = mmToPx(7.1);
                              return {
                                backgroundImage: `repeating-linear-gradient(transparent, transparent ${spacing - 1}px, #e8e4da ${spacing - 1}px, #e8e4da ${spacing}px)`,
                                backgroundSize: `100% ${spacing}px`,
                                backgroundPosition: "0 0",
                              };
                            }
                            if (paperPattern === "dot_grid") {
                              const spacing = mmToPx(5);
                              const dotSize = Math.max(1, Math.round(mmToPx(0.5)));
                              return {
                                backgroundImage: `radial-gradient(circle at ${dotSize}px ${dotSize}px, #d0ccc5 ${dotSize}px, transparent ${dotSize}px)`,
                                backgroundSize: `${spacing}px ${spacing}px`,
                                backgroundPosition: "0 0",
                              };
                            }
                            if (paperPattern === "grid") {
                              const spacing = mmToPx(5);
                              return {
                                backgroundImage: `linear-gradient(#e8e4da 1px, transparent 1px), linear-gradient(90deg, #e8e4da 1px, transparent 1px)`,
                                backgroundSize: `${spacing}px ${spacing}px`,
                                backgroundPosition: "0 0",
                              };
                            }
                            return {};
                          })()
                        }}
                      />
                      
                      {/* Binding margin indicator */}
                      <div 
                        className="absolute top-0 bottom-0 border-dashed border-[#d26c36]/40 bg-[#d26c36]/5 pointer-events-none" 
                        style={{ 
                          [punchSide]: 0, 
                          width: PUNCH_MARGIN_MM * 3.77 * pageZoom,
                          borderRightWidth: punchSide === "left" ? 1 : 0,
                          borderLeftWidth: punchSide === "right" ? 1 : 0,
                        }}
                      >
                         <span className={`absolute bottom-2 ${punchSide === "left" ? "left-2" : "right-2"} text-[8px] font-bold text-[#d26c36]/60 rotate-[-90deg] origin-bottom-${punchSide === "left" ? "left" : "right"} uppercase tracking-widest`}>Furação</span>
                      </div>
                      
                      {/* Safe zone indicator */}
                      <div 
                        className="absolute border border-cyan-500/30 pointer-events-none" 
                        style={{ 
                          left: (punchSide === "left" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM) * 3.77 * pageZoom,
                          right: (punchSide === "right" ? PUNCH_MARGIN_MM : SAFE_MARGIN_MM) * 3.77 * pageZoom,
                          top: SAFE_MARGIN_MM * 3.77 * pageZoom,
                          bottom: SAFE_MARGIN_MM * 3.77 * pageZoom,
                        }}
                      />

                      {/* Render Blocks */}
                      {(activeSection?.blocks ?? [])
                        .filter(block => block.type === "page_background" || (isDouble ? block.pageSide === pSide : true))
                        .map((block) => (
                        <div
                          key={block.id}
                          className={`template-page-block absolute cursor-move transition-shadow ${
                            activeBlockId === block.id ? "ring-2 ring-[#d26c36] shadow-lg z-50" : "hover:ring-1 hover:ring-[#d26c36]/50"
                          }`}
                          style={blockStyle(block)}
                          onPointerDown={(event) => handleBlockPointerDown(event, block)}
                        >
                          <BlockArtwork block={block} />
                          {activeBlockId === block.id && block.type !== "page_background" && (
                            <button
                              className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-1 shadow-md hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                 );
              })}
            </div>"""

content = re.sub(r"            \{\/\* The A5 Page Mockup \*\/\}[\s\S]*?            </div>", canvas_render_new, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
