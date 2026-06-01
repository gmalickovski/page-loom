import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// Ícones Customizados em Estilo Sketch de Caneta (Papelaria Rústica)
// Desenhados à mão com caminhos de SVG levemente imperfeitos e orgânicos

export const PaperIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Contorno externo da folha desenhado à mão */}
    <path d="M4.5 3.2C6.2 2.8 14.5 3 15.8 3.1C16.8 3.2 18.5 4.8 19.5 5.8C20 6.5 19.8 18.5 19.7 19.8C19.6 20.8 18.5 21.5 17.5 21.6C14.5 21.8 6.5 21.5 4.8 21.4C3.8 21.3 3.1 20.3 3.2 19.2C3.5 14.5 3.3 6.5 3.4 4.8C3.5 3.8 4 3.3 4.5 3.2Z" />
    {/* Dobra da folha no canto superior */}
    <path d="M15.5 3.2V6.2C15.5 6.8 16 7.2 16.6 7.2H19.5" />
    {/* Linhas de pauta escritas */}
    <path d="M6.8 10.5C9.2 10.2 13.8 10.4 15.8 10.3" />
    <path d="M6.5 14.2C8.5 14 14.8 14.1 16.8 13.8" />
    <path d="M6.7 17.8C8.8 17.5 11.5 17.6 13.5 17.5" />
  </svg>
);

export const CalendarIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Corpo do calendário desenhado à mão */}
    <path d="M3.5 6.8C5.2 6.2 18.8 6.3 20.5 6.8C21.2 7 21.3 19.5 20.8 20.5C20.4 21.2 19.2 21.5 18.2 21.5C14.5 21.5 6.5 21.5 4.8 21.3C3.8 21.2 3.1 20.2 3.2 19.2C3.5 15.5 3.3 9.5 3.5 6.8Z" />
    {/* Linha horizontal divisória */}
    <path d="M3.3 10.5C6.5 10.2 17.5 10.2 20.7 10.5" />
    {/* Ganchos/Anéis do espiral do calendário */}
    <path d="M7.5 3.5V7.5" />
    <path d="M16.5 3.5V7.5" />
    {/* Grade de dias interna (esboço pontilhado/torta) */}
    <circle cx="7.5" cy="14.5" r="1" fill="currentColor" />
    <circle cx="12" cy="14.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
    <circle cx="7.5" cy="18" r="1" fill="currentColor" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
    <circle cx="16.5" cy="18" r="1" fill="currentColor" />
  </svg>
);

export const TasksIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Caixa circular do checkbox desenhada à mão */}
    <path d="M12 21.5C6.8 21.5 2.5 17.2 2.5 12C2.5 6.8 6.8 2.5 12 2.5C17.2 2.5 21.5 6.8 21.5 12C21.5 14.5 20.5 17 18.8 18.8" />
    {/* Marcação de 'Check' rápida de caneta */}
    <path d="M8.2 12.5L11.5 15.5L19.5 7.5" strokeWidth="2.2" />
  </svg>
);

export const PencilIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Corpo do Lápis inclinado */}
    <path d="M5.5 18.5L16.2 7.8L18.8 10.4L8.1 21.1L5 21.5L5.5 18.5Z" />
    {/* Divisória da ponta de grafite */}
    <path d="M8.1 21.1L5.5 18.5" />
    {/* A borracha traseira */}
    <path d="M16.2 7.8L17.5 6.5C18.2 5.8 19.3 5.8 20 6.5C20.7 7.2 20.7 8.3 20 9L18.8 10.4" />
    {/* Micro traços de ranhura de caneta */}
    <path d="M10.8 13.2L13.3 15.7" />
  </svg>
);

export const BookIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Lombada/Lado esquerdo do livro aberto */}
    <path d="M12 21.2C10.5 19.8 5.5 19.5 3.2 19.6C2.8 19.7 2.5 19.3 2.5 18.8V4.8C2.5 4.3 2.8 3.8 3.4 3.9C5.8 4 10.8 4.3 12 5.8" />
    {/* Lado direito do livro aberto */}
    <path d="M12 21.2C13.5 19.8 18.5 19.5 20.8 19.6C21.2 19.7 21.5 19.3 21.5 18.8V4.8C21.5 4.3 21.2 3.8 20.6 3.9C18.2 4 13.2 4.3 12 5.8" />
    {/* Costura central */}
    <path d="M12 5.8V21.2" />
    {/* Micro linhas esboçando texto interno */}
    <path d="M4.5 8C6 7.8 9.5 7.8 10.5 8" />
    <path d="M4.5 11.5C6 11.3 9.5 11.3 10.5 11.5" />
    <path d="M13.5 8C14.5 7.8 18 7.8 19.5 8" />
    <path d="M13.5 11.5C14.5 11.3 18 11.3 19.5 11.5" />
  </svg>
);

export const PrinterIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Corpo central da impressora desenhado à mão */}
    <path d="M5.5 9.5C6.8 9.2 17.2 9.2 18.5 9.5C19.5 9.7 20.5 10.5 20.5 11.8C20.5 13.2 20.5 15.2 20.4 16.2C20.3 17.2 19.2 17.5 18.2 17.5H5.8C4.8 17.5 3.7 17.2 3.6 16.2C3.5 15.2 3.5 13.2 3.5 11.8C3.5 10.5 4.5 9.7 5.5 9.5Z" />
    {/* Bandeja de papel superior (alimentador) */}
    <path d="M6.5 9.5V5.2C6.5 4.5 7.1 3.8 7.8 3.8H16.2C16.9 3.8 17.5 4.5 17.5 5.2V9.5" />
    {/* Papel saindo por baixo */}
    <path d="M6.5 17.5V20.2C6.5 20.9 7.1 21.5 7.8 21.5H16.2C16.9 21.5 17.5 20.9 17.5 20.2V17.5" />
    {/* Botão de ligar esboçado */}
    <circle cx="6.5" cy="13.5" r="0.8" fill="currentColor" />
  </svg>
);

export const PlusIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Traço horizontal esboçado à mão */}
    <path d="M5 12.2C8.5 11.9 15.5 12.1 19 12" />
    {/* Traço vertical esboçado à mão */}
    <path d="M12.2 5C11.9 8.5 12.1 15.5 12 19" />
  </svg>
);

export const TemplatesIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Esboço de grade de cartões de template */}
    <path d="M3.5 3.8C5.5 3.5 18.5 3.5 20.5 3.8C20.8 5.5 20.8 7.5 20.5 9.2C18.5 9.5 5.5 9.5 3.5 9.2C3.2 7.5 3.2 5.5 3.5 3.8Z" />
    <path d="M3.5 11.8C5.2 11.5 10.8 11.5 11.5 11.8C11.8 14.5 11.8 19.5 11.5 20.5C9.8 20.8 4.8 20.8 3.5 20.5C3.2 19.5 3.2 14.5 3.5 11.8Z" />
    <path d="M13.5 11.8C14.8 11.5 19.2 11.5 20.5 11.8C20.8 14.5 20.8 19.5 20.5 20.5C19.2 20.8 14.8 20.8 13.5 20.5C13.2 19.5 13.2 14.5 13.5 11.8Z" />
  </svg>
);

export const QrCodeIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 4.5h6v6h-6z" />
    <path d="M13.5 4.5h6v6h-6z" />
    <path d="M4.5 13.5h6v6h-6z" />
    <path d="M14 14.5v1.5h1.5" />
    <path d="M18 14.5v3.5" />
    <path d="M14 18.5h4" />
    <path d="M6.5 6.5h2v2h-2z" />
    <path d="M15.5 6.5h2v2h-2z" />
    <path d="M6.5 15.5h2v2h-2z" />
  </svg>
);

export const CameraIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 5.5H9.5L7.5 8.5H4C3.2 8.5 2.5 9.2 2.5 10V18.5C2.5 19.3 3.2 20 4 20H20C20.8 20 21.5 19.3 21.5 18.5V10C21.5 9.2 20.8 8.5 20 8.5H16.5L14.5 5.5Z" />
    <circle cx="12" cy="14" r="3.5" />
    <path d="M17.5 11.5v.01" />
  </svg>
);

export const SearchIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5L20.5 20.5" />
    <path d="M8.5 8.5c1.5-1.5 3.5-1.5 5 0" />
  </svg>
);

export const ShoppingBagIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 7.5l-1 12.5C3.3 21 4.5 21.5 5.5 21.5h13c1 0 2.2-.5 2-1.5l-1-12.5" />
    <path d="M8.5 7.5V4.5C8.5 3 9.5 2.5 12 2.5s3.5.5 3.5 2v3" />
    <path d="M8.5 11.5v.01" />
    <path d="M15.5 11.5v.01" />
  </svg>
);

export const ArrowRightIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 12h15" />
    <path d="M13.5 6.5c2 2 4.5 3.5 6 5.5-1.5 2-4 3.5-6 5.5" />
  </svg>
);

export const CheckIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5.5 12.5L10 17l8.5-9.5" />
  </svg>
);

export const StarIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3.5l2.5 6 6 .5-4.5 4.5 1.5 6-5.5-3.5-5.5 3.5 1.5-6-4.5-4.5 6-.5z" />
  </svg>
);

export const MenuIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4.5 6.5h15" />
    <path d="M3.5 12.5h17" />
    <path d="M5.5 18.5h13" />
  </svg>
);

export const XIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5.5 5.5l13 13" />
    <path d="M18.5 5.5l-13 13" />
  </svg>
);

export const MailIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Corpo do envelope desenhado à mão */}
    <path d="M3.5 6.5C5.2 6.2 18.8 6.2 20.5 6.5C21.2 6.7 21.5 7.5 21.5 8.2V17.5C21.5 18.5 20.8 19.5 19.8 19.5C15.5 19.5 8.5 19.5 4.2 19.5C3.2 19.5 2.5 18.5 2.5 17.5V8.2C2.5 7.5 2.8 6.7 3.5 6.5Z" />
    {/* Linhas do envelope aberto (aba) */}
    <path d="M3 7l8.5 6.5c.3.2.7.2 1 0L21 7" />
  </svg>
);

export const LockIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Corpo do cadeado */}
    <path d="M5.5 11.5C6.2 11.2 17.8 11.2 18.5 11.5C19.2 11.8 19.5 12.5 19.5 13.5V19C19.5 20 18.8 20.8 17.8 20.8C14.5 21 9.5 21 6.2 20.8C5.2 20.8 4.5 20 4.5 19V13.5C4.5 12.5 4.8 11.8 5.5 11.5Z" />
    {/* Arco do cadeado */}
    <path d="M7.5 11.5V8C7.5 5.5 9 3.5 12 3.5C15 3.5 16.5 5.5 16.5 8V11.5" />
    {/* Buraco da chave */}
    <circle cx="12" cy="15.5" r="1.2" fill="currentColor" />
    <path d="M12 16.7v1.8" />
  </svg>
);

export const UserIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Cabeça/rosto */}
    <circle cx="12" cy="8.5" r="4" />
    {/* Corpo/ombros */}
    <path d="M4.5 21c0-4 3.5-7 7.5-7s7.5 3 7.5 7" />
  </svg>
);

export const GoogleIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const SectionIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Folha frontal */}
    <path d="M4.5 3.5C6 3.2 14.5 3.2 15.5 3.5C16.2 3.8 16.5 4.5 16.5 5.5V18.5C16.5 19.5 16.2 20.2 15.5 20.5C14.5 20.8 6 20.8 4.5 20.5C3.8 20.2 3.5 19.5 3.5 18.5V5.5C3.5 4.5 3.8 3.8 4.5 3.5Z" />
    {/* Folha traseira empilhada */}
    <path d="M8.5 22.5C11 22.8 17.5 22.8 18.5 22.5C19.5 22.2 20.5 21.2 20.5 20.2V8.5" />
  </svg>
);

export const DividerIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Folha principal do separador */}
    <path d="M4.5 3.5C6 3.2 14.5 3.2 15.5 3.5C16.2 3.8 16.5 4.5 16.5 5.5V18.5C16.5 19.5 16.2 20.2 15.5 20.5C14.5 20.8 6 20.8 4.5 20.5C3.8 20.2 3.5 19.5 3.5 18.5V5.5C3.5 4.5 3.8 3.8 4.5 3.5Z" />
    {/* Aba do separador */}
    <path d="M16.5 6.5C17.5 6.2 18.8 6.5 19.5 7.5V12.5C18.8 13.5 17.5 13.8 16.5 13.5" />
  </svg>
);

export const PlannerStudioIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Capa super clean do Planner */}
    <path d="M7.5 3.5C9 3.2 17.5 3.2 18.5 3.5C19.2 3.8 19.5 4.5 19.5 5.5V19.5C19.5 20.5 19.2 21.2 18.5 21.5C17.5 21.8 9 21.8 7.5 21.5C6.8 21.2 6.5 20.5 6.5 19.5V5.5C6.5 4.5 6.8 3.8 7.5 3.5Z" />
    
    {/* Espirais minimalistas */}
    <path d="M4.5 6h2" />
    <path d="M4.5 10h2" />
    <path d="M4.5 14h2" />
    <path d="M4.5 18h2" />

    {/* Etiqueta sutil na capa */}
    <path d="M10.5 8h4" />
  </svg>
);

export const HourglassIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Ampulheta com traços rústicos */}
    <path d="M6 3.5h12" />
    <path d="M6 20.5h12" />
    <path d="M7 3.5l3.5 6c.5 1 1 1.5 1.5 2.5.5-1 1-1.5 1.5-2.5l3.5-6" />
    <path d="M7 20.5l3.5-6c.5-1 1-1.5 1.5-2.5.5 1 1 1.5 1.5 2.5l3.5 6" />
    <path d="M11.5 12.5v2" />
    <path d="M10 18.5h4" />
  </svg>
);

export const LeafIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Folha minimalista e rústica para Bem-estar */}
    <path d="M3.5 20.5L6.5 17.5" />
    <path d="M6.5 17.5C4 12 5.5 5.5 11.5 3.5C18.5 1.5 21.5 3.5 20.5 10.5C18.5 18.5 12 20 6.5 17.5Z" />
    <path d="M6.5 17.5C9 15 15 9 18 6" />
    <path d="M12 12L15 15" />
    <path d="M9 9L10 6" />
  </svg>
);

export const ClipboardListIcon = ({ size = 24, ...props }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    {/* Prancheta rústica para Organização */}
    <path d="M8 4H6C4.5 4 3.5 5 3.5 6.5V20.5C3.5 22 4.5 23 6 23H18C19.5 23 20.5 22 20.5 20.5V6.5C20.5 5 19.5 4 18 4H16" />
    <path d="M9.5 2.5C9.5 1.5 10.5 1 12 1C13.5 1 14.5 1.5 14.5 2.5V4.5C14.5 5.5 13.5 6 12 6C10.5 6 9.5 5.5 9.5 4.5V2.5Z" />
    <path d="M7.5 10.5H8" />
    <path d="M11 10.5H16.5" />
    <path d="M7.5 15H8" />
    <path d="M11 15H16.5" />
    <path d="M7.5 19.5H8" />
    <path d="M11 19.5H16.5" />
  </svg>
);

export const RUSTIC_ICONS = {
  paper: PaperIcon,
  calendar: CalendarIcon,
  tasks: TasksIcon,
  pencil: PencilIcon,
  book: BookIcon,
  printer: PrinterIcon,
  plus: PlusIcon,
  templates: TemplatesIcon,
  qrCode: QrCodeIcon,
  camera: CameraIcon,
  search: SearchIcon,
  shoppingBag: ShoppingBagIcon,
  arrowRight: ArrowRightIcon,
  check: CheckIcon,
  star: StarIcon,
  menu: MenuIcon,
  x: XIcon,
  mail: MailIcon,
  lock: LockIcon,
  user: UserIcon,
  google: GoogleIcon,
  section: SectionIcon,
  divider: DividerIcon,
  plannerStudio: PlannerStudioIcon,
  hourglass: HourglassIcon,
  leaf: LeafIcon,
  clipboardList: ClipboardListIcon,
};
