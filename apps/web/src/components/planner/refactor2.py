import re

file_path = r"c:\Dev\pageloom\apps\web\src\components\planner\TemplateStudio.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Simplify Layout mode labels
content = content.replace('"single">Página Simples (Espelho)</option>', '"single">Simples</option>')
content = content.replace('"single">Página Simples</option>', '"single">Simples</option>')
content = content.replace('"double">Livro Aberto (Dupla)</option>', '"double">Dupla</option>')
content = content.replace('"double">Livro Aberto</option>', '"double">Dupla</option>')

# 2. Fix page count input
# Old: onChange={(e) => updateSection(section.id, { pageCount: parseInt(e.target.value) || 1 })}
content = re.sub(
    r'value=\{section\.pageCount\}\s*onChange=\{\(e\) => updateSection\(section\.id, \{ pageCount: parseInt\(e\.target\.value\) \|\| 1 \}\)\}',
    r'value={section.pageCount || ""}\n                              onChange={(e) => updateSection(section.id, { pageCount: parseInt(e.target.value) || 0 })}\n                              onBlur={(e) => { if (!section.pageCount || section.pageCount < 1) updateSection(section.id, { pageCount: 1 }) }}',
    content
)

# 3. Add Preview mode state
if "const [isPreviewMode, setIsPreviewMode]" not in content:
    content = re.sub(
        r'const \[pageZoom, setPageZoom\] = useState\(0\.85\);',
        r'const [pageZoom, setPageZoom] = useState(0.85);\n  const [isPreviewMode, setIsPreviewMode] = useState(false);',
        content
    )

# 4. Add Preview button to toolbar
if "Preview Realista" not in content:
    content = re.sub(
        r'(<button\s+className="p-2 rounded-lg hover:bg-stone-100 text-stone-600"\s+onClick=\{\(\) => setPageZoom\(Math\.max\(0\.2, pageZoom - 0\.1\)\)\}\s*>\s*<ZoomOut className="w-4 h-4" />\s*</button>)',
        r'\1\n          <div className="w-px h-6 bg-stone-200 mx-1" />\n          <button className={`p-2 rounded-lg flex items-center gap-2 ${isPreviewMode ? "bg-orange-100 text-orange-600" : "hover:bg-stone-100 text-stone-600"}`} onClick={() => setIsPreviewMode(!isPreviewMode)}>\n            <Sparkles className="w-4 h-4" />\n            <span className="text-sm font-medium">Preview Realista</span>\n          </button>',
        content
    )

# 5. Hide bounds and change background in Preview Mode
# Find the flex-1 container background
content = re.sub(
    r'className="flex-1 bg-\[\#f4f3f0\] overflow-auto flex items-center justify-center p-8 relative"',
    r'className="flex-1 bg-[#f4f3f0] overflow-auto flex items-center justify-center p-8 relative"\n        style={isPreviewMode ? { backgroundImage: "url(\'/desk-bg.png\')", backgroundSize: "cover", backgroundPosition: "center" } : {}}',
    content
)

# Hide cyan box
content = re.sub(
    r'className="absolute border border-cyan-500/30 pointer-events-none"\s+style=\{\{([^}]*)\}\}',
    r'className="absolute border border-cyan-500/30 pointer-events-none"\n                        style={{ \1, opacity: isPreviewMode ? 0 : 1 }}',
    content
)

# Hide punch margin
content = re.sub(
    r'className="absolute top-0 bottom-0 border-dashed border-\[\#d26c36\]/40 bg-\[\#d26c36\]/5 pointer-events-none"\s+style=\{\{([^}]*)\}\}',
    r'className="absolute top-0 bottom-0 border-dashed border-[#d26c36]/40 bg-[#d26c36]/5 pointer-events-none"\n                        style={{ \1, opacity: isPreviewMode ? 0 : 1 }}',
    content
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Refactoring complete.")
