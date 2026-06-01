import type { PlannerBook } from "../../types/library";
import { PaperStyle, type BookData, type PageAnnotation } from "./ComponenteBook3D";

// Helper to generate a sequential weekday and date in Portuguese
function getSequentialDate(baseDateStr: string, index: number): string {
  try {
    // Standardize parsing (default to 2026-05-25 if undefined)
    const base = baseDateStr || "2026-05-25";
    const date = new Date(base + "T12:00:00"); // 12:00 avoids timezone shifts
    date.setDate(date.getDate() + index);
    
    const weekdays = [
      "Domingo",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
      "Sábado"
    ];
    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ];
    
    const day = date.getDate();
    const weekday = weekdays[date.getDay()];
    const month = months[date.getMonth()];
    
    return `${weekday}, ${day} de ${month}`;
  } catch (e) {
    return `Dia ${index + 1}`;
  }
}

export function toComponenteBook3DData(book: PlannerBook): BookData {
  const baseDate = book.createdAt ?? "2026-05-25";
  const annotations: Record<number, PageAnnotation> = {};

  // Pages 1 to 11 are styled as a traditional daily agenda
  for (let i = 0; i < 11; i++) {
    const pageNum = i + 1;
    annotations[pageNum] = {
      title: getSequentialDate(baseDate, i),
      content: i === 0 
        ? `Bem-vindo ao seu diário "${book.title}".\n\nComece a planejar o seu dia aqui! Use as setas nas laterais para folhear as próximas páginas ou escreva livremente.` 
        : "",
      date: baseDate,
      paperStyle: PaperStyle.RULED,
      tag: book.label,
    };
  }

  // Page 12 is the final inside cover (Colophon / Ficha Técnica)
  annotations[12] = {
    title: "Ficha Técnica",
    content: `COLOFÃO PREMIUM\n\nEste planejador foi encadernado digitalmente com tecnologia PageLoom.\n\nEspecificações de Fabricação:\n• Formato: Diário A5 Real\n• Dimensões: 148 x 210 mm\n• Capa: Personalizada\n• Páginas Internas: Pólen Natural 90g/m²\n• Quantidade: ${book.pages} págs. (Modelo 3D)\n\nDescrição do Livro:\n"${book.description || "Nenhuma descrição informada pelo criador do book."}"\n\nEncadernado eletronicamente em:\n${new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(baseDate + "T12:00:00"))}.`,
    date: baseDate,
    paperStyle: PaperStyle.BLANK, // Blank paper style for clean text presentation
  };

  return {
    id: book.id,
    name: book.title,
    createdAt: baseDate,
    cover: {
      color: book.color,
      textureType: "matte",
      stickers: [],
      texts: [],
      labels: [],
    },
    annotations,
    totalPages: 12,
  };
}
