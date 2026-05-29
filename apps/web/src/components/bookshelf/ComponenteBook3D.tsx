import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ZoomIn, ZoomOut, Book, ArrowLeftRight, HelpCircle, RotateCw } from 'lucide-react';

export enum PaperStyle {
  BLANK = 'blank',
  RULED = 'ruled',
  GRID = 'grid',
  DOTTED = 'dotted'
}

export interface PageAnnotation {
  title: string;
  content: string;
  date: string;
  paperStyle: PaperStyle;
  tag?: string;
}

export interface BookData {
  id: string;
  name: string;
  createdAt: string;
  cover: {
    color: string;
    textureType: 'matte' | 'leather' | 'linen' | 'rough';
    stickers: [];
    texts: [];
    labels?: [];
  };
  annotations: Record<number, PageAnnotation>;
  totalPages: number;
  coverImage?: string;
  pages?: number;
}

// [REUTILIZÃVEL - ARQUEAMENTO 3D DAS PÃGINAS]
// Esta funÃ§Ã£o deforma os vÃ©rtices de uma geometria plana ou tridimensional (BoxGeometry) utilizando uma curva senoidal
// para simular pÃ¡ginas reais se curvando fisicamente ao abrir o livro.
// - `geometry`: A geometria do Three.js a ser modificada.
// - `flatPositions`: Um backup imutÃ¡vel dos vÃ©rtices originais (planos) para recriar a curva de forma previsÃ­vel e sem perdas a cada frame.
// - `isLeft`: Define se o bloco Ã© a pÃ¡gina da esquerda (curva abaula no Z negativo) ou da direita (curva abaula no Z positivo).
// - `W`: Largura da pÃ¡gina.
// - `D`: Espessura do miolo (para ajustar o fator de atenuaÃ§Ã£o de deformaÃ§Ã£o).
// - `openProg`: Progresso de rotaÃ§Ã£o/abertura (garante que fechado o livro fique 100% plano e aberto fique organicamente curvo).
function updatePagesCurve(
  geometry: THREE.BufferGeometry,
  flatPositions: Float32Array,
  isLeft: boolean,
  W: number,
  D: number,
  openProg: number
) {
  const posAttr = geometry.attributes.position;
  if (!posAttr || !flatPositions) return;
  
  // Altura mÃ¡xima do arqueamento das folhas, proporcional ao quÃ£o aberto o caderno estÃ¡.
  const MAX_CURVE = 0.16 * openProg; 

  for (let i = 0; i < posAttr.count; i++) {
    const x = flatPositions[i * 3];
    const y = flatPositions[i * 3 + 1];
    const z = flatPositions[i * 3 + 2];

    // Calcula `u` (valor normalizado de 0 a 1 representando a distÃ¢ncia do vinco/dobra central atÃ© as bordas externas)
    let u = 0;
    if (isLeft) {
      u = (W / 2 - x) / W; // Vinco central estÃ¡ em x = W / 2
    } else {
      u = (x + W / 2) / W; // Vinco central estÃ¡ em x = -W / 2
    }
    u = Math.max(0, Math.min(1, u));

    // Perfil de curva baseado em seno: Curva comeÃ§a em 0 no miolo (vinco), sobe em arco,
    // tem seu ponto Ã¡ureo prÃ³ximo a 0.45 da largura, e decai suavemente de volta a 0 na margem externa.
    const curveHeight = MAX_CURVE * Math.sin(u * Math.PI) * (1.1 - 0.45 * u);

    let newZ = z;
    if (isLeft) {
      // PÃ¡gina da Esquerda: A face ativa que exibe o texto Ã© a face -Z do bloco 3D.
      // Deslocamos para baixo (-Z) usando um fator proporcional para nÃ£o deformar a face oposta que encosta na capa.
      const factor = 0.5 - z / D; // 1 em z = -D/2 (topo ativo), 0 em z = +D/2 (fundo de papel)
      newZ = z - factor * curveHeight;
    } else {
      // PÃ¡gina da Direita: A face ativa Ã© +Z.
      // Deslocamos para cima (+Z) atenuando proporcionalmente atÃ© tocar a capa de trÃ¡s.
      const factor = z / D + 0.5; // 1 em z = +D/2 (topo ativo), 0 em z = -D/2 (fundo de papel)
      newZ = z + factor * curveHeight;
    }

    posAttr.setXYZ(i, x, y, newZ);
  }

  // Comandos cruciais do Three.js para renderizar as normais e recalcular luzes apÃ³s mutar coordenadas dos vÃ©rtices
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

function roundOuterCornersOfCover(geometry: THREE.BufferGeometry, W: number, H: number, R: number) {
  const posAttr = geometry.attributes.position;
  if (!posAttr) return;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    // Round the outer opening edge (x > W / 2 - R)
    if (x > W / 2 - R) {
      if (y > H / 2 - R) {
        // Top right outer corner
        const cx = W / 2 - R;
        const cy = H / 2 - R;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > R) {
          const scale = R / dist;
          posAttr.setXYZ(i, cx + dx * scale, cy + dy * scale, z);
        }
      } else if (y < -H / 2 + R) {
        // Bottom right outer corner
        const cx = W / 2 - R;
        const cy = -H / 2 + R;
        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > R) {
          const scale = R / dist;
          posAttr.setXYZ(i, cx + dx * scale, cy + dy * scale, z);
        }
      }
    }
  }
  posAttr.needsUpdate = true;
  geometry.computeVertexNormals();
}

interface ComponenteBook3DProps {
  currentBook: BookData;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeSheetIndex: number; // 1 to totalPageSheets
  setActiveSheetIndex: (index: number) => void;
  zoomMode: 'book' | 'page';
  setZoomMode: (mode: 'book' | 'page') => void;
  coverCanvas: HTMLCanvasElement | null;
  showControls?: boolean;
  showGuide?: boolean;
  showSpreadIndicator?: boolean;
  startOpenForClosing?: boolean;
  className?: string;
  viewFocus?: 'front' | 'spine' | 'back' | 'none';
  isHighFidelityPreview?: boolean;
}

export default function ComponenteBook3D({
  currentBook,
  isOpen,
  setIsOpen,
  activeSheetIndex,
  setActiveSheetIndex,
  zoomMode,
  setZoomMode,
  coverCanvas,
  showControls = true,
  showGuide = true,
  showSpreadIndicator = true,
  startOpenForClosing = false,
  className = "",
  viewFocus,
  isHighFidelityPreview = false,
}: ComponenteBook3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);

  // Keep references to animate properties dynamically without rebuilding Three.js
  const stateRef = useRef({
    isOpen,
    activeSheetIndex,
    zoomMode,
    currentBook,
    is3DMode: false,
    viewFocus,
  });

  useEffect(() => {
    stateRef.current = { isOpen, activeSheetIndex, zoomMode, currentBook, is3DMode: stateRef.current.is3DMode, viewFocus };
  }, [isOpen, activeSheetIndex, zoomMode, currentBook, viewFocus]);

  // Helper canvases to render left and right pages onto textures dynamically
  const leftPageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rightPageCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const leftTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const rightTextureRef = useRef<THREE.CanvasTexture | null>(null);
  const coverTextureRef = useRef<THREE.CanvasTexture | THREE.Texture | null>(null);
  const backCoverOuterTexRef = useRef<THREE.Texture | null>(null);
  const spineOuterTexRef = useRef<THREE.Texture | null>(null);
  const frontCoverOuterTexRef = useRef<THREE.Texture | null>(null);
  const coverEdgeMatRef = useRef<THREE.MeshBasicMaterial | null>(null);

  // Track page turn guide overlay
  const [showTooltip, setShowTooltip] = useState(true);
  const [is3DMode, setIs3DMode] = useState(false);
  
  // Track forced camera transition trigger
  const [resetTrigger, setResetTrigger] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setIs3DMode(false);
    }
  }, [isOpen]);

  useEffect(() => {
    stateRef.current.is3DMode = is3DMode;
  }, [is3DMode]);

  useEffect(() => {
    // Setup canvases for page texture painting
    const lCanvas = document.createElement('canvas');
    const rCanvas = document.createElement('canvas');
    lCanvas.width = 512;
    lCanvas.height = 728;
    rCanvas.width = 512;
    rCanvas.height = 728;
    leftPageCanvasRef.current = lCanvas;
    rightPageCanvasRef.current = rCanvas;

    leftTextureRef.current = new THREE.CanvasTexture(lCanvas);
    rightTextureRef.current = new THREE.CanvasTexture(rCanvas);
    if ('colorSpace' in leftTextureRef.current) {
      leftTextureRef.current.colorSpace = THREE.SRGBColorSpace;
      rightTextureRef.current.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in leftTextureRef.current) {
      (leftTextureRef.current as any).encoding = 3001;
      (rightTextureRef.current as any).encoding = 3001;
    }

    // Initial drawings
    paintPageText(lCanvas, currentBook.annotations[activeSheetIndex * 2 - 1], activeSheetIndex * 2 - 1);
    paintPageText(rCanvas, currentBook.annotations[activeSheetIndex * 2], activeSheetIndex * 2);
    leftTextureRef.current.needsUpdate = true;
    rightTextureRef.current.needsUpdate = true;

    return () => {
      lCanvas.remove();
      rCanvas.remove();
    };
  }, []);

  // Whenever annotations, active page, or book updates, paint the pages on canvases
  useEffect(() => {
    const lCanvas = leftPageCanvasRef.current;
    const rCanvas = rightPageCanvasRef.current;
    if (!lCanvas || !rCanvas || !leftTextureRef.current || !rightTextureRef.current) return;

    const leftIdx = activeSheetIndex * 2 - 1;
    const rightIdx = activeSheetIndex * 2;

    paintPageText(lCanvas, currentBook.annotations[leftIdx], leftIdx);
    paintPageText(rCanvas, currentBook.annotations[rightIdx], rightIdx);

    leftTextureRef.current.needsUpdate = true;
    rightTextureRef.current.needsUpdate = true;
  }, [currentBook.annotations, activeSheetIndex, currentBook.id]);

  // Paint single page with styled ruled, dotted lines or typed annotations
  const paintPageText = (canvas: HTMLCanvasElement, ann?: PageAnnotation, pageNum?: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // 1. Draw solid cream page background (polen paper feeling)
    ctx.fillStyle = '#fffdf6'; // beautiful cream yellowish-white
    ctx.fillRect(0, 0, w, h);

    // Paper edges shading for realistic paper thickness/curving
    const pageShade = ctx.createLinearGradient(0, 0, w, 0);
    const isLeftPage = pageNum ? pageNum % 2 !== 0 : true;
    if (isLeftPage) {
      pageShade.addColorStop(0, 'rgba(0,0,0,0.01)');
      pageShade.addColorStop(0.85, 'rgba(0,0,0,0.0)');
      pageShade.addColorStop(1, 'rgba(139, 92, 26, 0.08)'); // Dark gutter on the right edge
    } else {
      pageShade.addColorStop(0, 'rgba(139, 92, 26, 0.08)'); // Dark gutter on the left edge
      pageShade.addColorStop(0.15, 'rgba(0,0,0,0.0)');
      pageShade.addColorStop(1, 'rgba(0,0,0,0.01)');
    }
    ctx.fillStyle = pageShade;
    ctx.fillRect(0, 0, w, h);

    // Draw page guidelines depending on PaperStyle
    const style = ann?.paperStyle || PaperStyle.BLANK;
    ctx.strokeStyle = 'rgba(180, 150, 110, 0.22)'; // soft vintage sepia guide line
    ctx.lineWidth = 1.2;

    if (style === PaperStyle.RULED) {
      const lineGap = 24;
      for (let y = 110; y < h - 40; y += lineGap) {
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(w - 35, y);
        ctx.stroke();
      }
    } else if (style === PaperStyle.GRID) {
      const gridSz = 22;
      for (let x = 30; x < w - 30; x += gridSz) {
        ctx.beginPath();
        ctx.moveTo(x, 100);
        ctx.lineTo(x, h - 45);
        ctx.stroke();
      }
      for (let y = 100; y < h - 40; y += gridSz) {
        ctx.beginPath();
        ctx.moveTo(30, y);
        ctx.lineTo(w - 30, y);
        ctx.stroke();
      }
    } else if (style === PaperStyle.DOTTED) {
      const dotGap = 20;
      ctx.fillStyle = 'rgba(180, 150, 110, 0.5)';
      for (let x = 35; x < w - 30; x += dotGap) {
        for (let y = 105; y < h - 40; y += dotGap) {
          ctx.beginPath();
          ctx.arc(x, y, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw styled Page Header Text
    if (pageNum) {
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#b45309'; // amber text
      ctx.textAlign = isLeftPage ? 'left' : 'right';
      ctx.fillText(`PÃGINA ${pageNum}`, isLeftPage ? 35 : w - 35, 45);

      if (ann?.tag) {
        ctx.font = 'italic bold 9px sans-serif';
        ctx.fillStyle = '#292524';
        ctx.fillText(`â€¢ ${ann.tag.toUpperCase()}`, isLeftPage ? 35 : w - 35, 60);
      }
    }

    // 3. Draw Title (Serif pairing)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#1c1917'; // very dark charcoal
    ctx.font = 'bold 22px Georgia, serif';
    const displayTitle = ann?.title || 'Folha Sem TÃ­tulo';
    ctx.fillText(displayTitle, w / 2, 85);

    // Subtle line divider
    ctx.strokeStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(w / 2 - 30, 97);
    ctx.lineTo(w / 2 + 30, 97);
    ctx.stroke();

    // 4. Draw Wrapped Content Text along the lines for realism!
    if (ann?.content) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#292524';
      ctx.font = '13px "Courier New", monospace, Georgia, serif';

      const text = ann.content;
      const lines = text.split('\n');
      let currentLineY = 125;
      const maxWidth = w - 76;
      const lineSpacingHeight = 24;

      lines.forEach((pText) => {
        const words = pText.split(' ');
        let currentString = '';

        for (let n = 0; n < words.length; n++) {
          const testLine = currentString + words[n] + ' ';
          const metrics = ctx.measureText(testLine);
          const testWidth = metrics.width;

          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(currentString, 38, currentLineY);
            currentString = words[n] + ' ';
            currentLineY += lineSpacingHeight;
            if (currentLineY > h - 45) break;
          } else {
            currentString = testLine;
          }
        }
        if (currentLineY <= h - 45) {
          ctx.fillText(currentString, 38, currentLineY);
          currentLineY += lineSpacingHeight + 3; // slight gap for paragraph
        }
      });
    } else {
      ctx.textAlign = 'center';
      ctx.font = 'italic 12px Georgia, serif';
      ctx.fillStyle = 'rgba(120, 110, 90, 0.5)';
      ctx.fillText('Clique em "Escrever" para registrar uma anotaÃ§Ã£o.', w / 2, h / 2 - 20);
    }

    // Subtle physical fold shading at vertical center
    const verticalGlaze = ctx.createLinearGradient(0, 0, w, 0);
    if (isLeftPage) {
      verticalGlaze.addColorStop(0.9, 'rgba(0,0,0,0)');
      verticalGlaze.addColorStop(1, 'rgba(0,0,0,0.05)');
    } else {
      verticalGlaze.addColorStop(0, 'rgba(0,0,0,0.05)');
      verticalGlaze.addColorStop(0.1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = verticalGlaze;
    ctx.fillRect(0, 0, w, h);
  };

  // ThreeJS canvas lifecycle
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Dimensions
    const container = containerRef.current;
    const width = container ? container.clientWidth : 700;
    const height = container ? container.clientHeight : 500;

    // --- 1. Scene, Camera, WebGLRenderer ---
    const scene = new THREE.Scene();
    scene.background = null;

    // Ambient Fog
    scene.fog = new THREE.FogExp2('#ffffff', 0.04);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    
    // Instantly snap camera to correct position depending on initial mode to prevent diagonal swooping
    if (stateRef.current.is3DMode) {
      if (stateRef.current.viewFocus === 'spine') {
        camera.position.set(0, 0, 6.6);
      } else if (stateRef.current.viewFocus === 'back') {
        camera.position.set(-1.1, 0, 6.6);
      } else {
        camera.position.set(1.1, 0, 6.6);
      }
    } else {
      // START AT PERFECT DEFAULT 2D VIEW POSITION: Looking directly down at the flat book cover!
      camera.position.set(1.1, 8.8, 0.01);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xffffff, 0);
    renderer.shadowMap.enabled = false; // Shadow map completely disabled to remove all shadows (floating book look!)
    renderer.toneMapping = THREE.NoToneMapping; // Disable tone mapping to preserve exact colors!
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if ('colorSpace' in (renderer as any)) {
      (renderer as any).colorSpace = THREE.SRGBColorSpace;
    } else if ('outputEncoding' in renderer) {
      (renderer as any).outputEncoding = 3001;
    }

    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    // Allow complete 360-degree rotation vertically so user can see under the book and inspect the back cover!
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 1.2;
    controls.maxDistance = 10.0;

    // Instantly snap target to correct position depending on initial mode to prevent diagonal swooping
    if (stateRef.current.is3DMode) {
      if (stateRef.current.viewFocus === 'spine') {
        controls.target.set(0, 0, 0);
      } else if (stateRef.current.viewFocus === 'back') {
        controls.target.set(-1.1, 0, 0);
      } else {
        controls.target.set(1.1, 0, 0);
      }
    } else {
      controls.target.set(1.1, 0, 0); // Target is center of the closed book as default in 2D
    }
    controls.update();

    // --- 3. Studio Lights (Extremely polished bright museum lighting) ---
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.96); // Warm, bright uniform lighting for exact color fidelity
    scene.add(ambientLight);

    // Dynamic directional light to add extremely soft form accent without desaturating colors
    const dirLight = new THREE.DirectionalLight('#ffffff', 0.04);
    dirLight.position.set(1.5, 5, 2);
    dirLight.castShadow = false; // Shadow casting disabled to prevent back shadow projection
    scene.add(dirLight);

    // Soft sky light gradient (extremely low to avoid washing/whitening colors)
    const hemiLight = new THREE.HemisphereLight('#ffffff', '#ebebeb', 0.02);
    scene.add(hemiLight);

    // --- 4. Book Mesh Construction Setup and Proportions ---
    const A5_W = 2.2;
    const A5_H = 3.1;
    
    // Real, elegant, physical-proportioned dimensions for premium bookbinding
    const COVER_THK = 0.024; // Slim and highly realistic hardcover cardboard thickness (approx. 2.4mm)
    const PAGES_THK = 0.16;  // Highly balanced page miolo block thickness (approx. 16mm, very beautiful)

    // No shadow Plane added to context (allowing clean infinite white void space)

    // Build cover texture
    let coverTexture: THREE.CanvasTexture | THREE.Texture;
    if (coverCanvas) {
      coverTexture = new THREE.CanvasTexture(coverCanvas);
    } else if (currentBook.coverImage) {
      // Use the high-fidelity pre-rendered base64 image saved in the library!
      const img = new Image();
      img.src = currentBook.coverImage;
      const tex = new THREE.Texture(img);
      img.onload = () => {
        tex.needsUpdate = true;
        
        // Trigger a re-render to ensure the texture is shown!
        const mount = mountRef.current;
        if (mount) {
          mount.dispatchEvent(new Event('cover-applied'));
        }
      };
      coverTexture = tex;
    } else {
      const emptyCanvas = document.createElement('canvas');
      emptyCanvas.width = 1024;
      emptyCanvas.height = 714;
      const emptyCtx = emptyCanvas.getContext('2d');
      if (emptyCtx) {
        emptyCtx.fillStyle = currentBook.cover?.color || '#1c1917';
        emptyCtx.fillRect(0, 0, emptyCanvas.width, emptyCanvas.height);
      }
      coverTexture = new THREE.CanvasTexture(emptyCanvas);
    }
    
    if ('colorSpace' in coverTexture) {
      coverTexture.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in coverTexture) {
      (coverTexture as any).encoding = 3001;
    }
    coverTextureRef.current = coverTexture;

    // Calculate exact dynamic ratios to prevent texture bleeding!
    const pagesCount = currentBook.pages || 160;
    const spinePx = pagesCount === 80 ? 20 : pagesCount === 160 ? 38 : 56;
    const totalPx = 986 + spinePx;
    const backRatio = 493 / totalPx;
    const spineRatio = spinePx / totalPx;

    // Splitting cover texture dynamically for back, spine and front covers
    const backCoverOuterTex = coverTexture.clone();
    backCoverOuterTex.repeat.set(backRatio, 1);
    backCoverOuterTex.offset.set(0, 0);
    if ('colorSpace' in backCoverOuterTex) {
      backCoverOuterTex.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in backCoverOuterTex) {
      (backCoverOuterTex as any).encoding = 3001;
    }
    backCoverOuterTexRef.current = backCoverOuterTex;

    const spineOuterTex = coverTexture.clone();
    spineOuterTex.repeat.set(spineRatio, 1);
    spineOuterTex.offset.set(backRatio, 0);
    if ('colorSpace' in spineOuterTex) {
      spineOuterTex.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in spineOuterTex) {
      (spineOuterTex as any).encoding = 3001;
    }
    spineOuterTexRef.current = spineOuterTex;

    const frontCoverOuterTex = coverTexture.clone();
    frontCoverOuterTex.repeat.set(backRatio, 1);
    frontCoverOuterTex.offset.set(backRatio + spineRatio, 0);
    if ('colorSpace' in frontCoverOuterTex) {
      frontCoverOuterTex.colorSpace = THREE.SRGBColorSpace;
    } else if ('encoding' in frontCoverOuterTex) {
      (frontCoverOuterTex as any).encoding = 3001;
    }
    frontCoverOuterTexRef.current = frontCoverOuterTex;

    // Custom matte material for the cover's cardboard edges using the exact cover background color!
    const coverColorHex = currentBook.cover?.color || '#1c1917';
    const coverEdgeMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(coverColorHex),
    });
    coverEdgeMatRef.current = coverEdgeMat;

    const coverOuterMatFront = new THREE.MeshBasicMaterial({
      map: frontCoverOuterTex,
    });

    const coverOuterMatBack = new THREE.MeshBasicMaterial({
      map: backCoverOuterTex,
    });

    const coverSpineMat = new THREE.MeshBasicMaterial({
      map: spineOuterTex,
    });

    const coverInnerMat = new THREE.MeshBasicMaterial({
      color: '#fffbf2', // warm cardboard cream back/inner cover
    });

    // Materials arrays for 3D boxes - wrapped with coverColor edge matches to look stunningly seamless
    const frontCoverMats = [
      coverEdgeMat, // Right edge +X (matches cover color seamlessly)
      coverEdgeMat, // Left edge -X (Hinge edge should match cover color precisely for a folded look!)
      coverEdgeMat, // Top edge +Y
      coverEdgeMat, // Bottom edge -Y
      coverOuterMatFront, // Front face +Z (Custom Designed cover canvas!)
      coverInnerMat, // Back face -Z (inside)
    ];

    const backCoverMats = [
      coverEdgeMat, // Right edge
      coverEdgeMat, // Left/Hinge edge (Hinge edge should match cover color precisely for a folded look!)
      coverEdgeMat, // Top edge
      coverEdgeMat, // Bottom edge
      coverInnerMat, // Front face +Z (Inside)
      coverOuterMatBack, // Back face -Z (Outward)
    ];

    // Master Book Group: Rotated -Math.PI / 2 around X so the entire book lies flat horizontally on the table!
    const bookGroup = new THREE.Group();

    // Build Spine (Lomba) - wrapping continuous with the front and back covers.
    // Width is COVER_THK, height is A5_H. Depth is SPINE_D (PAGES_THK + 2 * COVER_THK)
    const SPINE_D = PAGES_THK + 2 * COVER_THK;
    // Overlap margin to eliminate WebGL hairline cracks between adjacent meshes (spine & cover)
    const OVERLAP = 0.008; 
    
    // Globally optimized spine geometry (8 segments is enough for a smooth curve and super lightweight!)
    const spineGeo = new THREE.BoxGeometry(COVER_THK + OVERLAP, A5_H, SPINE_D, 8, 1, 24);
    
    const spinePosAttr = spineGeo.attributes.position;
    if (spinePosAttr) {
      for (let i = 0; i < spinePosAttr.count; i++) {
        const x = spinePosAttr.getX(i);
        const y = spinePosAttr.getY(i);
        const z = spinePosAttr.getZ(i);
        
        let newX = x;

        // Apply a gentle curve to the outer face of the spine (-X)
        if (x < 0) {
           const u = Math.max(-1, Math.min(1, z / (SPINE_D / 2)));
           const cosVal = Math.cos(u * Math.PI / 2);
           const spineCurveDepth = 0.003; 
           newX -= spineCurveDepth * cosVal;
        }
        
        spinePosAttr.setXYZ(i, newX, y, z);
      }
      spinePosAttr.needsUpdate = true;
      spineGeo.computeVertexNormals();
    }

    const spineMats = [
      coverInnerMat,     // +X (Facing pages inside)
      coverSpineMat,     // -X (Facing outward - back of the book spine!)
      coverEdgeMat,      // +Y (Top lombo face - matches the cover color precisely so no dark line appears!)
      coverEdgeMat,      // -Y (Bottom lombo face - matches the cover color precisely so no dark line appears!)
      coverEdgeMat,      // +Z (Matches outer front cover margin seamlessly)
      coverEdgeMat,      // -Z (Matches outer back cover margin seamlessly)
    ];
    const spineMesh = new THREE.Mesh(spineGeo, spineMats);
    // Shift spine slightly right by OVERLAP/2 so its outer left edge stays perfectly at -COVER_THK
    spineMesh.position.set(-COVER_THK / 2 + OVERLAP / 2, 0, 0);
    spineMesh.castShadow = true;
    spineMesh.receiveShadow = true;
    bookGroup.add(spineMesh);

    // === DYNAMIC LOD (LEVEL OF DETAIL) ENGINE ===
    // Universally applied to eliminate the 150ms rendering stutter when clicking to open books!
    const hardwareCores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // High-end defaults (Max visually smooth while keeping vertices under 5,000 for instant loading)
    let segmentsW = 60;
    let segmentsH = 80;
    
    if (isMobile) {
      if (hardwareCores >= 8) {
         // High-end Mobile (iPhone Pro)
         segmentsW = 45;
         segmentsH = 60;
      } else {
         // Low-end Mobile - Hard corners to save battery and guarantee 60fps
         segmentsW = 1;
         segmentsH = 1;
      }
    } else {
      if (hardwareCores < 4) {
         // Old weak PC
         segmentsW = 30;
         segmentsH = 40;
      }
    }

    // Build Front Cover Pivot (Hinges at X = 0)
    const frontCoverPivot = new THREE.Group();
    frontCoverPivot.position.set(0, 0, 0);
    
    const frontCoverGeo = new THREE.BoxGeometry(A5_W, A5_H, COVER_THK, segmentsW, segmentsH, 1);
    // Only round corners on devices that have enough geometry resolution to draw the curve correctly
    if (segmentsW > 1) {
      roundOuterCornersOfCover(frontCoverGeo, A5_W, A5_H, 0.05);
    }
    const frontCoverMesh = new THREE.Mesh(frontCoverGeo, frontCoverMats);
    frontCoverMesh.position.set(A5_W / 2, 0, PAGES_THK / 2 + COVER_THK / 2);
    frontCoverMesh.castShadow = true;
    frontCoverMesh.receiveShadow = true;
    frontCoverPivot.add(frontCoverMesh);
    bookGroup.add(frontCoverPivot);

    // Build Back Cover Pivot (Lies flat under the sheets)
    const backCoverPivot = new THREE.Group();
    backCoverPivot.position.set(0, 0, 0);

    const backCoverGeo = new THREE.BoxGeometry(A5_W, A5_H, COVER_THK, segmentsW, segmentsH, 1);
    if (segmentsW > 1) {
      roundOuterCornersOfCover(backCoverGeo, A5_W, A5_H, 0.05);
    }
    const backCoverMesh = new THREE.Mesh(backCoverGeo, backCoverMats);
    backCoverMesh.position.set(A5_W / 2, 0, -(PAGES_THK / 2 + COVER_THK / 2));
    backCoverMesh.castShadow = true;
    backCoverMesh.receiveShadow = true;
    backCoverPivot.add(backCoverMesh);
    bookGroup.add(backCoverPivot);

    // --- 5. STATIC SOLID 3D WHITE MIOLO BLOCKS (AS REQUESTED: "miolo cheio de folha") ---
    // Instead of glitched single wire sheets, we build two dense solid blocks resembling real stacking page pads!
    const paperEdgesTexture = createPaperEdgesTexture();
    const paperBlockMat = new THREE.MeshBasicMaterial({
      color: '#fffbf4', // warm polen white paper edge color
      map: paperEdgesTexture,
    });

    const standardPaperMat = new THREE.MeshBasicMaterial({
      color: '#fffdf6',
    });

    const leftActiveMat = new THREE.MeshBasicMaterial({
      map: leftTextureRef.current || undefined,
    });

    const rightActiveMat = new THREE.MeshBasicMaterial({
      map: rightTextureRef.current || undefined,
    });

    // Left block of pages (attaches on front cover pivot so it opens dynamically with a high-fidelity curve!)
    const leftPadGeo = new THREE.BoxGeometry(A5_W - 0.05, A5_H - 0.08, PAGES_THK / 2, 40, 1, 1);
    const leftFlatPositions = (leftPadGeo.attributes.position.array as Float32Array).slice();

    const paperBlockLeftMats = [
      paperBlockMat,    // +X (Outer pages stack edge)
      paperBlockMat,    // -X (Gutter/spine edge)
      paperBlockMat,    // +Y (Top pages stack edge)
      paperBlockMat,    // -Y (Bottom pages stack edge)
      standardPaperMat, // +Z (Bottom surface touching cover inside)
      leftActiveMat,    // -Z (Top written page active surface facing user when book is open!)
    ];
    const paperLeftMesh = new THREE.Mesh(leftPadGeo, paperBlockLeftMats);
    // position in local space of frontCoverPivot
    paperLeftMesh.position.set((A5_W - 0.05) / 2 + 0.02, 0, PAGES_THK / 4);
    paperLeftMesh.castShadow = true;
    paperLeftMesh.receiveShadow = true;
    paperLeftMesh.visible = false; // Hidden when closed
    frontCoverPivot.add(paperLeftMesh);

    // Right block of pages (stays flat resting over back cover, with a high-fidelity curve!)
    const rightPadGeo = new THREE.BoxGeometry(A5_W - 0.05, A5_H - 0.08, PAGES_THK / 2, 40, 1, 1);
    const rightFlatPositions = (rightPadGeo.attributes.position.array as Float32Array).slice();

    const paperBlockRightMats = [
      paperBlockMat,    // +X (Outer pages stack edge)
      paperBlockMat,    // -X (Gutter edge)
      paperBlockMat,    // +Y (Top pages stack edge)
      paperBlockMat,    // -Y (Bottom pages stack edge)
      rightActiveMat,   // +Z (Top written active page surface facing user!)
      standardPaperMat, // -Z (Bottom surface touching back cover inside)
    ];
    const paperRightMesh = new THREE.Mesh(rightPadGeo, paperBlockRightMats);
    paperRightMesh.position.set((A5_W - 0.05) / 2 + 0.02, 0, 0); // Position Z will scale smoothly
    paperRightMesh.castShadow = true;
    paperRightMesh.receiveShadow = true;
    bookGroup.add(paperRightMesh);

    // Apply entire book master group lay flat and add it to the scene!
    bookGroup.rotation.x = -Math.PI / 2;
    // Instantly snap to the correct 3D orientation if starting in 3D Mode to avoid the weird diagonal startup spin!
    if (stateRef.current.is3DMode) {
      if (stateRef.current.viewFocus === 'spine') {
        bookGroup.rotation.y = -Math.PI / 2;
      } else if (stateRef.current.viewFocus === 'back') {
        bookGroup.rotation.y = Math.PI;
      }
    }
    scene.add(bookGroup);

    // --- 6. Interactive Raycaster Click Handler (Page Turn / Open) ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      // Calculate container click dimensions
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      const intersects = raycaster.intersectObjects([paperLeftMesh, paperRightMesh, backCoverMesh, frontCoverMesh], true);
      
      if (intersects.length > 0) {
        if (!stateRef.current.isOpen) {
          // If 3D Mode is active, clicking on the notebook cover is DISABLED as requested
          if (stateRef.current.is3DMode) {
            return;
          }
          setIsOpen(true);
          return;
        }

        const hitPoint = intersects[0].point;
        // User clicked right page: go corresponding notebook forward
        if (hitPoint.x > 0.08) {
          triggerAction('next');
        } else if (hitPoint.x < -0.08) {
          triggerAction('prev');
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    const triggerAction = (dir: 'prev' | 'next') => {
      const { activeSheetIndex } = stateRef.current;
      // We have 6 spreads representing 12 pages total
      if (dir === 'next' && activeSheetIndex < 6) {
        setActiveSheetIndex(activeSheetIndex + 1);
      } else if (dir === 'prev' && activeSheetIndex > 1) {
        setActiveSheetIndex(activeSheetIndex - 1);
      }
    };

    // --- 7. Smooth state variables interpolators ---
    let openProgression = startOpenForClosing ? 1.0 : isOpen ? 1.0 : 0.0;
    
    // Transitions management (We only force camera gliding for ~45 frames when state shifts)
    // If starting directly in 3D Mode, bypass the initial 45 frames of diagonal swooping!
    let transitionTicks = stateRef.current.is3DMode ? 0 : 45; 
    let lastOpen = isOpen;
    let lastZoomMode = zoomMode;
    let last3DMode = stateRef.current.is3DMode; // Initialize to actual current state
    let lastViewFocus = viewFocus;

    const animate = () => {
      requestAnimationFrame(animate);

      // Track state modifications
      const targetOpen = stateRef.current.isOpen;
      const tZoomMode = stateRef.current.zoomMode;
      const t3DMode = stateRef.current.is3DMode;
      const tViewFocus = stateRef.current.viewFocus;

      // Trigger automatic glide whenever user changes state
      if (targetOpen !== lastOpen || tZoomMode !== lastZoomMode || t3DMode !== last3DMode || tViewFocus !== lastViewFocus) {
        // When turning OFF 3D Mode, instantly and automatically reset controls and camera position
        // back to the perfect, flat, straight 2D overhead view! This keeps it aligned elegantly.
        if (last3DMode && !t3DMode) {
          controls.reset();
        }

        transitionTicks = 45; // Reset transition length (0.75s)
        lastOpen = targetOpen;
        lastZoomMode = tZoomMode;
        last3DMode = t3DMode;
        lastViewFocus = tViewFocus;
      }

      // 1. Smooth cover Y rotations - making it lie 100% flat when open!
      // [EXPLICAÃ‡ÃƒO] O progresso de abertura do caderno (`openProgression`) varia de 0 (fechado) a 1 (totalmente aberto).
      // Usamos uma interpolaÃ§Ã£o linear suave (lerp amortecido com `* 0.085` a cada tick) para suavizar a transiÃ§Ã£o de abertura e fechamento.
      const targetOpenProg = targetOpen ? 1.0 : 0.0;
      openProgression += (targetOpenProg - openProgression) * 0.085;

      // Front cover opens flat to exactly 180 degrees (-Math.PI)
      // [EXPLICAÇÃO] A capa frontal rotaciona de 0 radianos (fechado) até -Math.PI radianos (-180 graus), abrindo-se para a esquerda.
      const coverAngle = -openProgression * Math.PI;
      frontCoverPivot.rotation.y = coverAngle;

      // Back cover lies completely flat (no slant)
      // [EXPLICAÇÃO] A capa traseira permanece estática e deitada na mesa para servir como base de suporte confiável.
      const backAngle = 0.0;
      backCoverPivot.rotation.y = backAngle;

      // Rotate the entire book group dynamically based on viewFocus and open status!
      // This allows the closed book to stand straight upright, rotated slightly to the left in 3D,
      // and when spine focus is selected, it lies flat horizontally with the spine turned to the viewer.
      let targetRotX = -Math.PI / 2;
      let targetRotY = 0;
      let targetRotZ = 0;

      if (!targetOpen) {
        if (t3DMode) {
          // In free 3D rotation mode, let the book lie flat for robust mouse orbiting
          targetRotX = -Math.PI / 2;
          targetRotY = 0;
          targetRotZ = 0;
        } else {
          if (tViewFocus === 'front') {
            targetRotX = 0;
            targetRotY = 0; // perfectly straight
            targetRotZ = 0;
          } else if (tViewFocus === 'spine') {
            targetRotX = 0; // standing upright
            targetRotY = Math.PI / 2; // turned so spine faces +Z camera
            targetRotZ = 0;
          } else if (tViewFocus === 'back') {
            targetRotX = 0;
            targetRotY = Math.PI; // standing upright showing the back cover
            targetRotZ = 0;
          } else {
            // Default standing front view
            targetRotX = 0;
            targetRotY = 0;
            targetRotZ = 0;
          }
        }
      }

      // Smoothly interpolate bookGroup rotation using lerp
      bookGroup.rotation.x += (targetRotX - bookGroup.rotation.x) * 0.12;
      bookGroup.rotation.y += (targetRotY - bookGroup.rotation.y) * 0.12;
      bookGroup.rotation.z += (targetRotZ - bookGroup.rotation.z) * 0.12;

      // Align left and right page blocks perfectly with ZERO gap at center (X = 0) when opened!
      const pageW = A5_W - 0.05;
      // When closed (openProgression = 0), we want a small margin of 0.025.
      // When open (openProgression = 1), both pages align exactly at pageW/2 to meet perfectly at X = 0.
      const hoverXOffset = (1.0 - openProgression) * 0.025;
      
      // Ajustamos a posiÃ§Ã£o do bloco de pÃ¡ginas da direita
      paperRightMesh.position.x = pageW / 2 + hoverXOffset;

      // Front and back covers have exactly A5_W width and are pivot-centered at X = 0,
      // meaning their positions are completely static at A5_W / 2 with zero overlapping/Z-fighting!
      frontCoverMesh.position.x = A5_W / 2;
      backCoverMesh.position.x = A5_W / 2;

      // Spine stays centered when closed, and is hidden when opened so pages join seamlessly "coladas"
      // [EXPLICAÃ‡ÃƒO] A lombada 3D Ã© ocultada conforme o caderno abre para permitir que as pÃ¡ginas esquerda e direita
      // se unam no centro de forma contÃ­nua e natural, como em um caderno costurado de verdade.
      spineMesh.position.x = -COVER_THK / 2;
      spineMesh.visible = openProgression < 0.08;

      // Update real curvature dynamically based on openProgression!
      // This is magic: perfectly FLAT when closed so it never juts out through the cover, and beautifully curved when open!
      // [EXPLICAÃ‡ÃƒO] Chamamos `updatePagesCurve` que deforma os vÃ©rtices das geometrias das pÃ¡ginas esfÃ©rica/senoidalmente.
      // Isso dÃ¡ o aspecto curvado ("efeito de abaulamento do papel") quando as folhas estÃ£o abertas na mesa.
      updatePagesCurve(leftPadGeo, leftFlatPositions, true, A5_W - 0.05, PAGES_THK / 2, openProgression);
      updatePagesCurve(rightPadGeo, rightFlatPositions, false, A5_W - 0.05, PAGES_THK / 2, openProgression);

      // 2. Adjust miolo stack thickness and position dynamically!
      // When CLOSED: Right block is visible, thickness is full PAGES_THK, Z-offset is centered
      // When OPENED: Right block is thickness PAGES_THK / 2, Z-offset sits touching back cover, Left block becomes visible
      paperLeftMesh.visible = openProgression > 0.15;
      
      const scaleFactor = 2.0 - openProgression;
      paperRightMesh.scale.z = scaleFactor;
      // Position Z center moves: CLOSED is 0; OPENED is touching back cover (local Z = -PAGES_THK / 4)
      paperRightMesh.position.z = -PAGES_THK / 2 + scaleFactor * PAGES_THK / 4;

      // [REUTILIZÃVEL - AJUSTE DINÃ‚MICO DE ESPESSURA DA PÃGINA ESQUERDA]
      // Escala o miolo esquerdo de 0 (fechado) atÃ© 1 (totalmente aberto) proporcionalmente Ã  abertura (`openProgression`).
      // Isso resolve o problema onde a espessura total do bloco de folhas atravessava fisicamente a capa de couro
      // durante o arco da animaÃ§Ã£o de abertura, eliminando o glitch momentÃ¢neo de tela/capa branca!
      paperLeftMesh.scale.z = openProgression;

      // --- CORREÃ‡ÃƒO DA FRESTA (FALHA DE ENCONTRO NO MIOLO) ---
      // [EXPLICAÃ‡ÃƒO] Para manter as extremidades internas das folhas da esquerda e da direita perfeitamente coladas
      // ao longo da dobra central durante TODO o processo de transiÃ§Ã£o (0% a 100% de abertura), calculamos
      // a coordenada de costura do topo do miolo direito e aplicamos uma rotaÃ§Ã£o reversa de matriz 3D ao miolo esquerdo.
      // Isso dita a posiÃ§Ã£o local correspondente de forma matemÃ¡tica para anular falhas causadas pelas rotaÃ§Ãµes distintas!
      const angle = coverAngle;
      const X_world_r = hoverXOffset; // PosiÃ§Ã£o de encontro do lado direito em relaÃ§Ã£o ao vinco central
      const Z_world_r = paperRightMesh.position.z + (paperRightMesh.scale.z * PAGES_THK / 4); // PosiÃ§Ã£o Z do topo ativo do miolo direito

      // RotaÃ§Ã£o reversa correta (com sinais e direÃ§Ãµes corrigidas) para transformar a coordenada do vinco no espaÃ§o global
      // de volta ao espaÃ§o local do pivÃ´ da capa frontal (frontCoverPivot), que estÃ¡ sofrendo rotaÃ§Ã£o de Ã¢ngulo 'angle'.
      // Os sinais corrigidos cancelam qualquer cruzamento do plano da folha com a capa externa.
      const X_local_crease = -X_world_r * Math.cos(angle) - Z_world_r * Math.sin(angle);
      const Z_local_crease = -X_world_r * Math.sin(angle) + Z_world_r * Math.cos(angle);

      // Aplicamos as posiÃ§Ãµes corrigidas no subgrupo rotativo esquerdo para fundir a emenda 3D sem qualquer fresta!
      paperLeftMesh.position.x = pageW / 2 + X_local_crease;
      // Ajustamos o centro de Z de acordo com a escala atual do bloco para que as superfÃ­cies escritas coincidam perfeitamente:
      paperLeftMesh.position.z = Z_local_crease + paperLeftMesh.scale.z * PAGES_THK / 4;

      // Enable/disable orbit controls based on 3D mode constraints:
      // - Rotation is never allowed when the book is open, and only allowed in closed 3D mode ("sÃ³ vai se tornar 3D quando eu escolher a opÃ§Ã£o de visualizar")
      // - Zoom and Panning are completely locked/disabled when not in 3D Mode so that the 2D view stays strictly static
      controls.enableRotate = !targetOpen && t3DMode;
      controls.enableZoom = t3DMode;
      controls.enablePan = t3DMode;

      // 3. Smooth Camera Gliding & 2D locked positioning.
      let targetCamPos: THREE.Vector3;
      let targetControlsTarget: THREE.Vector3;

      if (!targetOpen) {
        if (tViewFocus === 'front') {
          // Front cover standing upright, camera looks from perfectly straight +Z
          targetCamPos = new THREE.Vector3(1.1, 0, 6.6);
          targetControlsTarget = new THREE.Vector3(1.1, 0, 0);
        } else if (tViewFocus === 'spine') {
          // Spine standing upright, facing +Z
          targetCamPos = new THREE.Vector3(0, 0, 6.6);
          targetControlsTarget = new THREE.Vector3(0, 0, 0);
        } else if (tViewFocus === 'back') {
          // Back cover standing upright facing +Z (since book is rotated Math.PI)
          // The book extends from X=0 to X=-2.2. Center is -1.1.
          targetCamPos = new THREE.Vector3(-1.1, 0, 6.6);
          targetControlsTarget = new THREE.Vector3(-1.1, 0, 0);
        } else {
          // Default standing front view (Bookshelf Overlay)
          // Zoomed out to 8.8 so it fits perfectly inside the modal container without clipping the Title and Button!
          targetCamPos = new THREE.Vector3(1.1, 0, 8.8);
          targetControlsTarget = new THREE.Vector3(1.1, 0, 0);
        }
      } else {
        if (tZoomMode === 'page') {
          // Focused 2D look for comfortable reading/writing (Zoomed out slightly to 3.0 to fit all screen sizes)
          targetCamPos = new THREE.Vector3(0, 8.8, 0.001);
          targetControlsTarget = new THREE.Vector3(0, 0, 0);
        } else {
          // Elegant 2D spread of both pages from straight above (Zoomed out to 4.4 to fit all margins)
          targetCamPos = new THREE.Vector3(0, 8.8, 0.001);
          targetControlsTarget = new THREE.Vector3(0, 0, 0);
        }
      }

      // If we are in 2D mode, we ALWAYS force the perfect overhead view every frame
      // to completely prevent any residual slant, roll, or rotation drift when disabling 3D.
      if (transitionTicks > 0 || !t3DMode) {
        const lerpFactor = !t3DMode ? 0.18 : 0.08;
        camera.position.lerp(targetCamPos, lerpFactor);
        controls.target.lerp(targetControlsTarget, lerpFactor);

        if (!t3DMode) {
          // Forcefully reset the camera's up vector to maintain a strictly vertical portrait orientation
          camera.up.set(0, 1, 0);
          
          // If very close to target, snap exactly to eliminate fractional offsets
          if (camera.position.distanceTo(targetCamPos) < 0.002) {
            camera.position.copy(targetCamPos);
            controls.target.copy(targetControlsTarget);
          }
        }

        if (transitionTicks > 0) transitionTicks--;
      }

      controls.update();

      // Texture updates are now purely event-driven! Removing the heavy continuous VRAM upload here guarantees buttery smooth 60FPS!
      
      if (coverEdgeMatRef.current && stateRef.current.currentBook?.cover) {
        coverEdgeMatRef.current.color.set(stateRef.current.currentBook.cover.color);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Procedural paper edge stacking drawing lines
    function createPaperEdgesTexture(): THREE.CanvasTexture {
      const eCanvas = document.createElement('canvas');
      eCanvas.width = 128;
      eCanvas.height = 128;
      const eCtx = eCanvas.getContext('2d')!;
      eCtx.fillStyle = '#fff9eb';
      eCtx.fillRect(0, 0, 128, 128);
      
      eCtx.strokeStyle = 'rgba(139, 110, 80, 0.16)';
      eCtx.lineWidth = 1.2;
      for (let y = 0; y < 128; y += 3) {
        eCtx.beginPath();
        eCtx.moveTo(0, y);
        eCtx.lineTo(128, y);
        eCtx.stroke();
      }
      const tex = new THREE.CanvasTexture(eCanvas);
      if ('colorSpace' in tex) {
        tex.colorSpace = THREE.SRGBColorSpace;
      } else if ('encoding' in tex) {
        (tex as any).encoding = 3001;
      }
      return tex;
    }

    // --- 8. Handle Resize ---
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);
    
    // Listen to custom apply event to trigger a gentle visual confirmation camera nudge
    const handleCoverApplied = () => {
      transitionTicks = 40;
    };
    window.addEventListener('cover-applied', handleCoverApplied);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (container) {
      resizeObserver.observe(container);
    }

    // Register active reset trigger helper in global mount (triggered dynamically by state)
    const handleResetCameraTrigger = () => {
      transitionTicks = 45;
    };
    mount.addEventListener('reset-cam', handleResetCameraTrigger);

    // --- Cleanups on Unmount ---
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('cover-applied', handleCoverApplied);
      if (container) {
        resizeObserver.unobserve(container);
      }
      mount.removeEventListener('reset-cam', handleResetCameraTrigger);
      renderer.domElement.removeEventListener('click', onMouseClick);
      controls.dispose();
      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [coverCanvas, currentBook.id, resetTrigger]);

  // Dispatch custom manual reset click to Three.js internal event
  const triggerManualViewReset = () => {
    const mount = mountRef.current;
    if (mount) {
      mount.dispatchEvent(new Event('reset-cam'));
      setResetTrigger(prev => prev + 1);
    }
  };

  return (
    <div ref={containerRef} className={`componente-book-3d ${className}`}>
      
      {/* 3D WebGL Element */}
      <div id="three-stage" ref={mountRef} className="componente-book-3d__stage" />

      {/* Floating Canvas UI Controls with premium craft light appearance */}
      {showControls && <div className="componente-book-3d__controls">
        
        {/* Helper Interactive Guide Overlay Button */}
        {showGuide && showTooltip && (
          <div className="bg-[#fffdf6] border border-stone-200 text-stone-700 p-3 rounded-lg max-w-[245px] shadow-lg animate-fadeIn text-[11px] flex items-start gap-2">
            <HelpCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-stone-900">Maquete de EncadernaÃ§Ã£o</p>
              <p className="text-stone-500 mt-1">Gire o diÃ¡rio para ver a lombada e a profundidade da capa dura. Clique nas folhas para folhear os escritos.</p>
              <button onClick={() => setShowTooltip(false)} className="text-emerald-700 font-bold tracking-wide mt-1.5 focus:outline-none">Fechar Guia</button>
            </div>
          </div>
        )}

        <div className="flex gap-1.5 bg-[#fffdf6]/90 backdrop-blur-md border border-stone-200 p-1.5 rounded-lg shadow-md">
          <button
            onClick={() => setIsOpen(!isOpen)}
            disabled={is3DMode}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              is3DMode
                ? 'bg-stone-100 opacity-40 cursor-not-allowed text-stone-400 font-medium'
                : isOpen 
                  ? 'bg-amber-600/10 border border-amber-600/30 text-amber-800 font-bold' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium'
            }`}
            title={is3DMode ? "Desative a VisualizaÃ§Ã£o 3D para conseguir abrir o caderno" : ""}
          >
            <Book className="h-3.5 w-3.5" />
            {isOpen ? 'Caderno Aberto' : 'Abrir Caderno'}
          </button>

          {isOpen && (
            <button
              onClick={() => setZoomMode(zoomMode === 'book' ? 'page' : 'book')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                zoomMode === 'page'
                  ? 'bg-amber-600/10 border border-amber-600/30 text-amber-800 font-bold animate-pulse'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {zoomMode === 'page' ? (
                <>
                  <ZoomOut className="h-3.5 w-3.5" />
                  VisualizaÃ§Ã£o Livre
                </>
              ) : (
                <>
                  <ZoomIn className="h-3.5 w-3.5" />
                  Focar Leituras
                </>
              )}
            </button>
          )}

          {!isOpen && (
            <button
              onClick={() => setIs3DMode(!is3DMode)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
                is3DMode 
                  ? 'bg-amber-600/10 border border-amber-600/30 text-amber-800 font-bold' 
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium'
              }`}
            >
              <RotateCw className="h-3.5 w-3.5" />
              {is3DMode ? 'Ver de Cima (2D)' : 'Visualizar em 3D'}
            </button>
          )}

          {/* RESET POSITION BUTTON (SOLVES CAPA STANDING DEFAULT VIEW COMPLAINT) */}
          <button
            onClick={triggerManualViewReset}
            title="Redefinir maquete para posiÃ§Ã£o padrÃ£o"
            className="p-1.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 transition flex items-center justify-center border border-stone-200"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>}

      {/* Center visual indicator of current active notebook spread */}
      {showSpreadIndicator && isOpen && (
        <div className="componente-book-3d__spread">
          <ArrowLeftRight size={14} />
          <span>
            Paginas {activeSheetIndex * 2 - 1} e {activeSheetIndex * 2} de 12
          </span>
        </div>
      )}
    </div>
  );
}
