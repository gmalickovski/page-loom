import type { Meta } from "@storybook/react";
import {
  PaperIcon,
  CalendarIcon,
  TasksIcon,
  PencilIcon,
  BookIcon,
  PrinterIcon,
  PlusIcon,
  TemplatesIcon,
  QrCodeIcon,
  CameraIcon,
  SearchIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  CheckIcon,
  StarIcon,
  MenuIcon,
  XIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  GoogleIcon,
  SectionIcon,
  DividerIcon,
  PlannerStudioIcon,
  HourglassIcon,
  LeafIcon,
  ClipboardListIcon,
} from "../../components/ui/icons";

const meta: Meta = {
  title: "UI/RusticIcons",
  tags: ["autodocs"],
};

export default meta;

export const Gallery = {
  render: () => (
    <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 space-y-6">
      <div>
        <h3 className="text-lg font-serif text-stone-800">Biblioteca de Ícones Rústicos</h3>
        <p className="text-xs text-stone-500">Ícones customizados em SVG simulando traços manuais de caneta tinteiro/grafite.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        {[
          { icon: <PaperIcon size={32} />, name: "Paper / Document" },
          { icon: <CalendarIcon size={32} />, name: "Calendar" },
          { icon: <TasksIcon size={32} />, name: "Tasks / Checklist" },
          { icon: <PencilIcon size={32} />, name: "Pencil / Pen" },
          { icon: <BookIcon size={32} />, name: "Book / Open" },
          { icon: <PrinterIcon size={32} />, name: "Printer" },
          { icon: <PlusIcon size={32} />, name: "Plus / Add" },
          { icon: <TemplatesIcon size={32} />, name: "Templates" },
          { icon: <QrCodeIcon size={32} />, name: "QR Code" },
          { icon: <CameraIcon size={32} />, name: "Camera / Scan" },
          { icon: <SearchIcon size={32} />, name: "Search / Magnifier" },
          { icon: <ShoppingBagIcon size={32} />, name: "Shopping Bag" },
          { icon: <ArrowRightIcon size={32} />, name: "Arrow Right" },
          { icon: <CheckIcon size={32} />, name: "Check / Success" },
          { icon: <StarIcon size={32} />, name: "Star / Rating" },
          { icon: <MenuIcon size={32} />, name: "Menu / Hamburger" },
          { icon: <XIcon size={32} />, name: "X / Close" },
          { icon: <MailIcon size={32} />, name: "Mail / Email" },
          { icon: <LockIcon size={32} />, name: "Lock / Password" },
          { icon: <UserIcon size={32} />, name: "User / Profile" },
          { icon: <GoogleIcon size={32} />, name: "Google" },
          { icon: <SectionIcon size={32} />, name: "Section / Pages" },
          { icon: <DividerIcon size={32} />, name: "Divider / Marker" },
          { icon: <PlannerStudioIcon size={32} />, name: "Planner Studio" },
          { icon: <HourglassIcon size={32} />, name: "Hourglass / Tempo" },
          { icon: <LeafIcon size={32} />, name: "Leaf / Bem-estar" },
          { icon: <ClipboardListIcon size={32} />, name: "Clipboard / Org." },
        ].map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-stone-100 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="text-stone-700">{item.icon}</div>
            <span className="text-xs font-mono font-medium text-stone-400 mt-2 text-center">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};
