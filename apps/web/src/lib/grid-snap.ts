import { PaperPattern } from "@/types/library";

/**
 * Retorna os passos de encaixe magnético (snap) em milímetros para os blocos,
 * baseando-se no padrão de papel escolhido.
 * 
 * [stepX, stepY]
 */
export function getGridSnapSteps(pattern: PaperPattern): [number, number] {
  switch (pattern) {
    case "lined":
      // Pauta de 7.1mm de altura. Horizontalmente, usamos 5mm.
      return [5, 7.1];
    case "dot_grid":
    case "grid":
    case "blank":
    default:
      // A pedido do usuário, mesmo páginas em branco devem ter um grid invisível de 5x5mm para alinhar perfeitamente
      return [5, 5];
  }
}

/**
 * Converte um valor em mm para o múltiplo mais próximo do passo (step).
 * Útil para forçar um valor a se alinhar ao grid programaticamente, 
 * caso o react-rnd não faça isso ao inicializar.
 */
export function snapToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}
