import { ChevronDown, ChevronRight } from "lucide-react";
import { CalendarIcon as SketchCalendarIcon, PlusIcon as SketchPlusIcon } from "../ui";
import { useState } from "react";
import type { Shelf } from "../../types/library";

interface SidebarNavProps {
  shelves: Shelf[];
  activeShelfId?: string;
  onShelf: (shelf: Shelf) => void;
}

export function SidebarNav({ shelves, activeShelfId, onShelf }: SidebarNavProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ trabalho: true });

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <h1>Meu Planner</h1>
        <p>qua., 13 de mai.</p>
      </div>

      <div className="sidebar__quick">
        <button type="button">
          <SketchCalendarIcon size={20} />
          Hoje
        </button>
      </div>

      <div className="sidebar__shelves">
        <strong>Estantes</strong>
        {shelves.map((shelf) => {
          const isExpanded = expanded[shelf.id];
          const isActive = activeShelfId === shelf.id;

          return (
            <section key={shelf.id}>
              <button
                type="button"
                className={isActive ? "is-active" : ""}
                onClick={() => {
                  onShelf(shelf);
                  setExpanded((current) => ({ ...current, [shelf.id]: !current[shelf.id] }));
                }}
              >
                <span className="sidebar__dot" />
                {shelf.name}
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {isExpanded && (
                <div className="sidebar__books">
                  {shelf.books.map((book) => (
                    <span key={book.id}>
                      <i style={{ background: book.color }} />
                      {book.title}
                    </span>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="sidebar__footer">
        <button type="button">
          <SketchPlusIcon size={20} />
          Nova estante
        </button>
      </div>
    </aside>
  );
}
