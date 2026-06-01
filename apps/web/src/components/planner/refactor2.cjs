const fs = require('fs');
const path = 'c:\\Dev\\pageloom\\apps\\web\\src\\components\\planner\\TemplateStudio.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Simplify Layout mode labels
content = content.replace(/"single">Página Simples \(Espelho\)<\/option>/g, '"single">Simples</option>');
content = content.replace(/"single">Página Simples<\/option>/g, '"single">Simples</option>');
content = content.replace(/"double">Livro Aberto \(Dupla\)<\/option>/g, '"double">Dupla</option>');
content = content.replace(/"double">Livro Aberto<\/option>/g, '"double">Dupla</option>');

// 2. Fix page count input
content = content.replace(
    /value=\{section\.pageCount\}\s*onChange=\{\(e\) => updateSection\(section\.id, \{ pageCount: parseInt\(e\.target\.value\) \|\| 1 \}\)\}/g,
    'value={section.pageCount || ""}\n                              onChange={(e) => updateSection(section.id, { pageCount: parseInt(e.target.value) || 0 })}\n                              onBlur={(e) => { if (!section.pageCount || section.pageCount < 1) updateSection(section.id, { pageCount: 1 }) }}'
);

// 3. Add Preview mode state
if (!content.includes('const [isPreviewMode')) {
    content = content.replace(
        /const \[pageZoom, setPageZoom\] = useState\(0\.85\);/,
        'const [pageZoom, setPageZoom] = useState(0.85);\n  const [isPreviewMode, setIsPreviewMode] = useState(false);'
    );
}

// 4. Add Preview button to toolbar
if (!content.includes('Preview Realista')) {
    content = content.replace(
        /(<button\s+className="p-2 rounded-lg hover:bg-stone-100 text-stone-600"\s+onClick=\{\(\) => setPageZoom\(Math\.max\(0\.2, pageZoom - 0\.1\)\)\}\s*>\s*<ZoomOut className="w-4 h-4" \/>\s*<\/button>)/,
        '$1\n          <div className="w-px h-6 bg-stone-200 mx-1" />\n          <button className={`p-2 rounded-lg flex items-center gap-2 ${isPreviewMode ? "bg-orange-100 text-orange-600" : "hover:bg-stone-100 text-stone-600"}`} onClick={() => setIsPreviewMode(!isPreviewMode)}>\n            <Sparkles className="w-4 h-4" />\n            <span className="text-sm font-medium">Preview Realista</span>\n          </button>'
    );
}

// 5. Hide bounds and change background in Preview Mode
content = content.replace(
    /className="flex-1 bg-\[#f4f3f0\] overflow-auto flex items-center justify-center p-8 relative"/,
    'className="flex-1 bg-[#f4f3f0] overflow-auto flex items-center justify-center p-8 relative"\n        style={isPreviewMode ? { backgroundImage: "url(\'/desk-bg.png\')", backgroundSize: "cover", backgroundPosition: "center" } : {}}'
);

content = content.replace(
    /className="absolute border border-cyan-500\/30 pointer-events-none"\s+style=\{\{([\s\S]*?)\}\}/,
    'className="absolute border border-cyan-500/30 pointer-events-none"\n                        style={{ $1, opacity: isPreviewMode ? 0 : 1 }}'
);

content = content.replace(
    /className="absolute top-0 bottom-0 border-dashed border-\[#d26c36\]\/40 bg-\[#d26c36\]\/5 pointer-events-none"\s+style=\{\{([\s\S]*?)\}\}/,
    'className="absolute top-0 bottom-0 border-dashed border-[#d26c36]/40 bg-[#d26c36]/5 pointer-events-none"\n                        style={{ $1, opacity: isPreviewMode ? 0 : 1 }}'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Refactored successfully.");
