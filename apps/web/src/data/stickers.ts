/**
 * Flat-design SVG sticker library.
 * Each entry has an id, a label, and a full SVG string.
 * SVGs are 100x100 viewBox, flat colour, no strokes on main shapes —
 * ready to be rendered on canvas with a white vinyl-cut border.
 */

export interface StickerDef {
  id: string;
  label: string;
  svg: string;
}

export const STICKERS: StickerDef[] = [
  // ❤️ Heart
  {
    id: "heart",
    label: "Coração",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 85 C50 85 10 58 10 33 C10 20 20 12 32 14 C39 15 45 20 50 27 C55 20 61 15 68 14 C80 12 90 20 90 33 C90 58 50 85 50 85Z" fill="#FF4D6D"/>
      <ellipse cx="35" cy="30" rx="7" ry="5" fill="#FF8FA3" opacity="0.6" transform="rotate(-30 35 30)"/>
    </svg>`,
  },

  // ⭐ Star
  {
    id: "star",
    label: "Estrela",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,8 61,36 92,36 68,56 77,84 50,66 23,84 32,56 8,36 39,36" fill="#FFD60A"/>
      <polygon points="50,20 57,38 76,38 62,50 67,68 50,57 33,68 38,50 24,38 43,38" fill="#FFE566" opacity="0.55"/>
    </svg>`,
  },

  // 🌈 Rainbow
  {
    id: "rainbow",
    label: "Arco-íris",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M10 70 Q10 25 50 25 Q90 25 90 70" fill="none" stroke="#FF4D6D" stroke-width="9" stroke-linecap="round"/>
      <path d="M17 70 Q17 35 50 35 Q83 35 83 70" fill="none" stroke="#FF9F1C" stroke-width="9" stroke-linecap="round"/>
      <path d="M24 70 Q24 44 50 44 Q76 44 76 70" fill="none" stroke="#FFD60A" stroke-width="9" stroke-linecap="round"/>
      <path d="M31 70 Q31 52 50 52 Q69 52 69 70" fill="none" stroke="#2DC653" stroke-width="9" stroke-linecap="round"/>
      <path d="M38 70 Q38 60 50 60 Q62 60 62 70" fill="none" stroke="#3A86FF" stroke-width="9" stroke-linecap="round"/>
      <ellipse cx="18" cy="70" rx="10" ry="7" fill="white"/>
      <ellipse cx="82" cy="70" rx="10" ry="7" fill="white"/>
      <rect x="8" y="68" width="84" height="10" fill="white"/>
    </svg>`,
  },

  // 🌸 Cherry blossom
  {
    id: "blossom",
    label: "Flor",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="24" rx="13" ry="20" fill="#FFB3C6" transform="rotate(0 50 50)"/>
      <ellipse cx="50" cy="24" rx="13" ry="20" fill="#FFB3C6" transform="rotate(72 50 50)"/>
      <ellipse cx="50" cy="24" rx="13" ry="20" fill="#FFB3C6" transform="rotate(144 50 50)"/>
      <ellipse cx="50" cy="24" rx="13" ry="20" fill="#FFB3C6" transform="rotate(216 50 50)"/>
      <ellipse cx="50" cy="24" rx="13" ry="20" fill="#FFB3C6" transform="rotate(288 50 50)"/>
      <circle cx="50" cy="50" r="14" fill="#FFD6E0"/>
      <circle cx="50" cy="50" r="7" fill="#FF4D6D"/>
      <circle cx="47" cy="47" r="2.5" fill="#FF8FA3" opacity="0.8"/>
    </svg>`,
  },

  // 🦋 Butterfly
  {
    id: "butterfly",
    label: "Borboleta",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="28" cy="38" rx="22" ry="28" fill="#B388FF" transform="rotate(-20 28 38)"/>
      <ellipse cx="72" cy="38" rx="22" ry="28" fill="#B388FF" transform="rotate(20 72 38)"/>
      <ellipse cx="30" cy="64" rx="16" ry="18" fill="#CE93D8" transform="rotate(15 30 64)"/>
      <ellipse cx="70" cy="64" rx="16" ry="18" fill="#CE93D8" transform="rotate(-15 70 64)"/>
      <ellipse cx="28" cy="36" rx="9" ry="12" fill="#E040FB" opacity="0.4" transform="rotate(-20 28 36)"/>
      <ellipse cx="72" cy="36" rx="9" ry="12" fill="#E040FB" opacity="0.4" transform="rotate(20 72 36)"/>
      <path d="M50 20 Q46 50 46 80" stroke="#4A148C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M50 20 Q54 50 54 80" stroke="#4A148C" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M44 18 Q50 12 56 18" stroke="#4A148C" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <circle cx="44" cy="17" r="3" fill="#4A148C"/>
      <circle cx="56" cy="17" r="3" fill="#4A148C"/>
    </svg>`,
  },

  // ☕ Coffee cup
  {
    id: "coffee",
    label: "Café",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="18" y="42" width="52" height="38" rx="6" fill="#795548"/>
      <path d="M70 50 Q82 50 82 60 Q82 70 70 70" fill="none" stroke="#795548" stroke-width="7" stroke-linecap="round"/>
      <rect x="18" y="38" width="52" height="10" rx="4" fill="#5D4037"/>
      <path d="M32 30 Q35 22 32 15" fill="none" stroke="#90CAF9" stroke-width="4" stroke-linecap="round"/>
      <path d="M44 30 Q47 20 44 12" fill="none" stroke="#90CAF9" stroke-width="4" stroke-linecap="round"/>
      <path d="M56 30 Q59 22 56 15" fill="none" stroke="#90CAF9" stroke-width="4" stroke-linecap="round"/>
      <rect x="22" y="76" width="44" height="6" rx="3" fill="#4E342E"/>
      <rect x="18" y="82" width="52" height="6" rx="3" fill="#3E2723"/>
      <ellipse cx="44" cy="58" rx="12" ry="8" fill="#BCAAA4" opacity="0.3"/>
    </svg>`,
  },

  // 🚀 Rocket
  {
    id: "rocket",
    label: "Foguete",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 8 C50 8 30 30 30 60 L50 70 L70 60 C70 30 50 8 50 8Z" fill="#3A86FF"/>
      <ellipse cx="50" cy="42" rx="12" ry="15" fill="#90CAF9"/>
      <path d="M30 60 L18 75 L30 72 Z" fill="#FF4D6D"/>
      <path d="M70 60 L82 75 L70 72 Z" fill="#FF4D6D"/>
      <ellipse cx="50" cy="72" rx="10" ry="6" fill="#FF6B35"/>
      <path d="M42 75 Q50 90 58 75" fill="#FFD60A"/>
      <circle cx="50" cy="42" r="6" fill="#E3F2FD"/>
      <circle cx="50" cy="42" r="3" fill="#1565C0"/>
    </svg>`,
  },

  // 👑 Crown
  {
    id: "crown",
    label: "Coroa",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M10 72 L10 42 L28 58 L50 20 L72 58 L90 42 L90 72 Z" fill="#FFD60A"/>
      <rect x="10" y="72" width="80" height="14" rx="4" fill="#FFC300"/>
      <circle cx="50" cy="20" r="7" fill="#FF4D6D"/>
      <circle cx="10" cy="42" r="5" fill="#3A86FF"/>
      <circle cx="90" cy="42" r="5" fill="#3A86FF"/>
      <circle cx="26" cy="78" r="5" fill="#FF4D6D"/>
      <circle cx="50" cy="78" r="5" fill="#3A86FF"/>
      <circle cx="74" cy="78" r="5" fill="#FF4D6D"/>
    </svg>`,
  },

  // 🌙 Moon
  {
    id: "moon",
    label: "Lua",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M62 14 C40 14 22 32 22 54 C22 76 40 92 62 92 C70 92 78 89 84 84 C72 82 62 72 62 58 C62 44 72 34 84 32 C78 21 70 14 62 14Z" fill="#FFD60A"/>
      <circle cx="38" cy="32" r="4" fill="#FFC300" opacity="0.6"/>
      <circle cx="72" cy="20" r="5" fill="#FFE566" opacity="0.8"/>
      <circle cx="82" cy="40" r="3" fill="#FFE566" opacity="0.6"/>
      <circle cx="25" cy="22" r="3" fill="#FFE566" opacity="0.7"/>
    </svg>`,
  },

  // 🎀 Bow / Ribbon
  {
    id: "bow",
    label: "Laço",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 50 C50 50 20 25 10 30 C0 35 10 55 50 50Z" fill="#FF4D6D"/>
      <path d="M50 50 C50 50 80 25 90 30 C100 35 90 55 50 50Z" fill="#FF4D6D"/>
      <path d="M50 50 C50 50 20 75 10 70 C0 65 10 45 50 50Z" fill="#FF6B8A"/>
      <path d="M50 50 C50 50 80 75 90 70 C100 65 90 45 50 50Z" fill="#FF6B8A"/>
      <ellipse cx="50" cy="50" rx="10" ry="8" fill="#FF1744"/>
      <ellipse cx="22" cy="40" rx="6" ry="4" fill="#FF8FA3" opacity="0.5" transform="rotate(-20 22 40)"/>
      <ellipse cx="78" cy="40" rx="6" ry="4" fill="#FF8FA3" opacity="0.5" transform="rotate(20 78 40)"/>
    </svg>`,
  },

  // 🍓 Strawberry
  {
    id: "strawberry",
    label: "Morango",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 88 C50 88 18 62 18 40 C18 26 32 18 50 22 C68 18 82 26 82 40 C82 62 50 88 50 88Z" fill="#FF4D6D"/>
      <path d="M36 14 Q38 22 34 28" stroke="#2DC653" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M50 12 Q50 22 50 28" stroke="#2DC653" stroke-width="5" fill="none" stroke-linecap="round"/>
      <path d="M64 14 Q62 22 66 28" stroke="#2DC653" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="36" cy="14" rx="8" ry="5" fill="#2DC653"/>
      <ellipse cx="50" cy="12" rx="8" ry="5" fill="#2DC653"/>
      <ellipse cx="64" cy="14" rx="8" ry="5" fill="#2DC653"/>
      <circle cx="36" cy="44" r="3" fill="#FFB3C6"/>
      <circle cx="50" cy="38" r="3" fill="#FFB3C6"/>
      <circle cx="64" cy="44" r="3" fill="#FFB3C6"/>
      <circle cx="42" cy="58" r="3" fill="#FFB3C6"/>
      <circle cx="58" cy="58" r="3" fill="#FFB3C6"/>
      <circle cx="50" cy="68" r="3" fill="#FFB3C6"/>
    </svg>`,
  },

  // 🌻 Sunflower
  {
    id: "sunflower",
    label: "Girassol",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFD60A"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFD60A" transform="rotate(30 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFD60A" transform="rotate(60 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFD60A" transform="rotate(90 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFD60A" transform="rotate(120 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFD60A" transform="rotate(150 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFC300" transform="rotate(180 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFC300" transform="rotate(210 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFC300" transform="rotate(240 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFC300" transform="rotate(270 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFC300" transform="rotate(300 50 50)"/>
      <ellipse cx="50" cy="18" rx="9" ry="16" fill="#FFC300" transform="rotate(330 50 50)"/>
      <circle cx="50" cy="50" r="20" fill="#5D4037"/>
      <circle cx="44" cy="44" r="3" fill="#795548" opacity="0.6"/>
      <circle cx="53" cy="44" r="3" fill="#795548" opacity="0.6"/>
      <circle cx="47" cy="52" r="3" fill="#795548" opacity="0.6"/>
      <circle cx="56" cy="52" r="3" fill="#795548" opacity="0.6"/>
    </svg>`,
  },

  // 🐱 Cat face
  {
    id: "cat",
    label: "Gato",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <ellipse cx="50" cy="58" rx="36" ry="30" fill="#FFB74D"/>
      <path d="M20 42 L10 18 L32 36 Z" fill="#FFB74D"/>
      <path d="M80 42 L90 18 L68 36 Z" fill="#FFB74D"/>
      <path d="M20 42 L14 24 L32 36 Z" fill="#FF8F00"/>
      <path d="M80 42 L86 24 L68 36 Z" fill="#FF8F00"/>
      <ellipse cx="38" cy="58" rx="10" ry="12" fill="#263238"/>
      <ellipse cx="62" cy="58" rx="10" ry="12" fill="#263238"/>
      <circle cx="40" cy="56" r="4" fill="#ffffff"/>
      <circle cx="64" cy="56" r="4" fill="#ffffff"/>
      <ellipse cx="50" cy="72" rx="8" ry="5" fill="#FF8FA3"/>
      <path d="M50 72 Q42 76 36 74" stroke="#5D4037" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M50 72 Q58 76 64 74" stroke="#5D4037" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M50 72 Q42 80 34 80" stroke="#5D4037" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M50 72 Q58 80 66 80" stroke="#5D4037" stroke-width="2" fill="none" stroke-linecap="round"/>
    </svg>`,
  },

  // 💎 Diamond
  {
    id: "diamond",
    label: "Diamante",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <polygon points="50,15 80,40 50,90 20,40" fill="#60EFFF"/>
      <polygon points="50,15 80,40 65,40 50,22" fill="#B0F4FF"/>
      <polygon points="50,15 20,40 35,40 50,22" fill="#90EAF9"/>
      <polygon points="20,40 35,40 50,90" fill="#29B6F6"/>
      <polygon points="80,40 65,40 50,90" fill="#0288D1"/>
      <polygon points="35,40 65,40 50,90" fill="#4FC3F7"/>
    </svg>`,
  },

  // 🌿 Leaf
  {
    id: "leaf",
    label: "Folha",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 85 Q20 60 20 30 Q20 10 50 10 Q80 10 80 30 Q80 60 50 85Z" fill="#2DC653"/>
      <path d="M50 85 Q38 60 38 30 Q38 18 50 15 Q62 18 62 30 Q62 60 50 85Z" fill="#00C853" opacity="0.5"/>
      <line x1="50" y1="85" x2="50" y2="15" stroke="#1B5E20" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="30" y2="35" stroke="#1B5E20" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="50" y1="40" x2="32" y2="28" stroke="#1B5E20" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="70" y2="35" stroke="#1B5E20" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="50" y1="40" x2="68" y2="28" stroke="#1B5E20" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="50" y1="62" x2="35" y2="52" stroke="#1B5E20" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="50" y1="62" x2="65" y2="52" stroke="#1B5E20" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
  },

  // 💡 Lightbulb
  {
    id: "lightbulb",
    label: "Ideia",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 12 C32 12 18 26 18 44 C18 56 25 66 36 72 L36 80 L64 80 L64 72 C75 66 82 56 82 44 C82 26 68 12 50 12Z" fill="#FFD60A"/>
      <rect x="38" y="80" width="24" height="6" rx="3" fill="#FFC300"/>
      <rect x="40" y="86" width="20" height="6" rx="3" fill="#FFC300"/>
      <rect x="42" y="92" width="16" height="4" rx="2" fill="#FFB300"/>
      <ellipse cx="42" cy="36" rx="7" ry="10" fill="#FFFFFF" opacity="0.4"/>
      <line x1="50" y1="4" x2="50" y2="10" stroke="#FFD60A" stroke-width="3" stroke-linecap="round"/>
      <line x1="28" y1="10" x2="32" y2="15" stroke="#FFD60A" stroke-width="3" stroke-linecap="round"/>
      <line x1="72" y1="10" x2="68" y2="15" stroke="#FFD60A" stroke-width="3" stroke-linecap="round"/>
    </svg>`,
  },

  // 🎨 Paint palette
  {
    id: "palette",
    label: "Paleta",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 12 C28 12 10 30 10 52 C10 62 14 72 22 78 C28 84 36 88 50 88 C58 88 62 82 62 76 C62 70 66 66 72 66 C78 66 82 70 82 76 L86 76 C90 68 92 60 92 52 C92 30 72 12 50 12Z" fill="#FFF9C4"/>
      <circle cx="32" cy="38" r="9" fill="#FF4D6D"/>
      <circle cx="52" cy="28" r="9" fill="#FFD60A"/>
      <circle cx="70" cy="38" r="9" fill="#3A86FF"/>
      <circle cx="74" cy="58" r="9" fill="#2DC653"/>
      <circle cx="28" cy="58" r="9" fill="#B388FF"/>
      <circle cx="70" cy="74" r="8" fill="#1A1A2E"/>
    </svg>`,
  },

  // ✈️ Airplane
  {
    id: "plane",
    label: "Avião",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M88 50 L20 22 L30 48 L16 48 L10 58 L30 58 L20 78 L88 50Z" fill="#3A86FF"/>
      <path d="M88 50 L20 22 L26 40 L88 50Z" fill="#74B3FF"/>
      <path d="M30 48 L16 48 L10 58 L30 58 Z" fill="#1565C0"/>
    </svg>`,
  },

  // 🏆 Trophy
  {
    id: "trophy",
    label: "Troféu",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect x="36" y="76" width="28" height="10" rx="3" fill="#FFB300"/>
      <rect x="28" y="86" width="44" height="8" rx="3" fill="#FF8F00"/>
      <path d="M28 20 L28 52 Q28 70 50 70 Q72 70 72 52 L72 20 Z" fill="#FFD60A"/>
      <path d="M28 26 Q16 26 16 40 Q16 54 28 54" fill="none" stroke="#FFB300" stroke-width="7" stroke-linecap="round"/>
      <path d="M72 26 Q84 26 84 40 Q84 54 72 54" fill="none" stroke="#FFB300" stroke-width="7" stroke-linecap="round"/>
      <rect x="28" y="14" width="44" height="10" rx="4" fill="#FFC300"/>
      <ellipse cx="42" cy="42" rx="8" ry="12" fill="#FFE566" opacity="0.45"/>
      <path d="M46 38 L50 28 L54 38 L64 38 L56 44 L59 54 L50 48 L41 54 L44 44 L36 38 Z" fill="#FF8F00"/>
    </svg>`,
  },

  // 📖 Open book
  {
    id: "book",
    label: "Livro",
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <path d="M50 24 Q32 18 12 22 L12 78 Q32 74 50 80 Q68 74 88 78 L88 22 Q68 18 50 24Z" fill="#795548"/>
      <path d="M12 22 Q32 18 50 24 L50 80 Q32 74 12 78 Z" fill="#FFFDE7"/>
      <path d="M88 22 Q68 18 50 24 L50 80 Q68 74 88 78 Z" fill="#F5F5DC"/>
      <line x1="50" y1="24" x2="50" y2="80" stroke="#795548" stroke-width="3"/>
      <line x1="22" y1="34" x2="44" y2="32" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="42" x2="44" y2="40" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
      <line x1="22" y1="50" x2="44" y2="48" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
      <line x1="56" y1="32" x2="78" y2="34" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
      <line x1="56" y1="40" x2="78" y2="42" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
      <line x1="56" y1="48" x2="78" y2="50" stroke="#BDBDBD" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
  },
];
