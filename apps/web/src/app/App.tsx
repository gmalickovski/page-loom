import { useEffect, useMemo, useReducer, useState } from "react";
import { Plus, FolderPlus, BookOpen, X } from "lucide-react";
import { pages, shelves as initialShelves } from "../data/demoLibrary";
import { BookFocusOverlay } from "../components/bookshelf/BookFocusOverlay";
import { BookReturnOverlay } from "../components/bookshelf/BookReturnOverlay";
import { BottomSheetModal } from "../components/layout/BottomSheetModal";
import { BottomTabBar } from "../components/layout/BottomTabBar";
import { SidebarNav } from "../components/layout/SidebarNav";
import { TopBar, type TopBarPart } from "../components/layout/TopBar";
import { TemplateEditorScreen, TemplateGalleryScreen } from "../components/planner/TemplateStudio";
import { createDefaultInteriorPlan } from "../components/planner/PageInteriorDesigner";
import type { BookClickOrigin, DeviceMode, PlannerBook, PlannerInteriorTemplate, PlannerPage, ScreenName, Shelf } from "../types/library";
import { BookContentsScreen, CreateBookScreen, LibraryScreen, PlannerScreen, ShelfDetailScreen } from "./screens";
import "../components/bookshelf/bookshelf.css";
import "../components/layout/layout.css";
import "../components/planner/planner.css";
import "./app.css";

interface AppState {
  screen: ScreenName;
  shelf: Shelf | null;
  book: PlannerBook | null;
  selectedBook: PlannerBook | null;
  selectedShelf: Shelf | null;
  selectedOrigin: BookClickOrigin | null;
  bookOrigin: BookClickOrigin | null;
  selectionClosing: boolean;
  selectionSettled: boolean;
  page: PlannerPage | null;
  pageClosing: boolean;
  editingCoverBook: PlannerBook | null;
  editingTemplate: PlannerInteriorTemplate | null;
}

type Action =
  | { type: "SHELF"; shelf: Shelf }
  | { type: "SELECT_BOOK"; shelf?: Shelf; book: PlannerBook; origin?: BookClickOrigin }
  | { type: "START_CLEAR_SELECTION" }
  | { type: "CLEAR_SELECTION" }
  | { type: "BOOK"; shelf?: Shelf; book: PlannerBook }
  | { type: "PAGE"; page: PlannerPage }
  | { type: "CREATE" }
  | { type: "EDIT_COVER"; shelf?: Shelf; book: PlannerBook }
  | { type: "TEMPLATES" }
  | { type: "EDIT_TEMPLATE"; template?: PlannerInteriorTemplate | null }
  | { type: "CREATED_BOOK"; book: PlannerBook; shelf?: Shelf }
  | { type: "PAGE_CLOSED" }
  | { type: "HOME" }
  | { type: "BACK" };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SHELF":
      return { ...state, screen: "shelf", shelf: action.shelf, selectedBook: null, selectedShelf: null, selectedOrigin: null, selectionClosing: false, selectionSettled: false };
    case "SELECT_BOOK":
      return {
        ...state,
        shelf: action.shelf ?? state.shelf,
        selectedShelf: action.shelf ?? state.shelf,
        selectedBook: action.book,
        selectedOrigin: action.origin ?? null,
        bookOrigin: action.origin ?? null,
        selectionClosing: false,
        selectionSettled: false,
      };
    case "START_CLEAR_SELECTION":
      return state.selectedBook ? { ...state, selectionClosing: true } : state;
    case "CLEAR_SELECTION":
      return { ...state, selectedBook: null, selectedShelf: null, selectedOrigin: null, bookOrigin: null, selectionClosing: false, selectionSettled: false };
    case "BOOK":
      return {
        ...state,
        screen: "planner",
        shelf: action.shelf ?? state.shelf,
        book: action.book,
        page: action.book.customPages ? action.book.customPages[0] : pages[0],
        selectedBook: action.book,
        selectedShelf: action.shelf ?? state.selectedShelf ?? state.shelf,
        selectedOrigin: state.selectedOrigin ?? state.bookOrigin,
        bookOrigin: state.selectedOrigin ?? state.bookOrigin,
        selectionClosing: false,
        selectionSettled: true,
        pageClosing: false,
      };
    case "PAGE":
      return { ...state, screen: "planner", page: action.page, pageClosing: false };
    case "CREATE":
      return { ...state, screen: "create", selectedBook: null, selectedShelf: state.shelf, selectedOrigin: null, selectionClosing: false, selectionSettled: false, editingCoverBook: null, editingTemplate: null };
    case "EDIT_COVER":
      return {
        ...state,
        screen: "create",
        shelf: action.shelf ?? state.selectedShelf ?? state.shelf,
        selectedShelf: action.shelf ?? state.selectedShelf ?? state.shelf,
        selectedBook: null,
        selectedOrigin: null,
        selectionClosing: false,
        selectionSettled: false,
        editingCoverBook: action.book,
      };
    case "CREATED_BOOK":
      return {
        ...state,
        screen: action.shelf ? "shelf" : "home",
        shelf: action.shelf ?? state.shelf,
        book: null,
        selectedBook: action.book,
        selectedShelf: action.shelf ?? state.selectedShelf ?? state.shelf,
        selectedOrigin: null,
        bookOrigin: null,
        selectionSettled: false,
        selectionClosing: false,
        page: null,
        pageClosing: false,
        editingCoverBook: null,
        editingTemplate: null,
      };
    case "TEMPLATES":
      return {
        ...state,
        screen: "templates",
        selectedBook: null,
        selectedOrigin: null,
        selectionClosing: false,
        selectionSettled: false,
        editingCoverBook: null,
        editingTemplate: null,
      };
    case "EDIT_TEMPLATE":
      return {
        ...state,
        screen: "template-editor",
        selectedBook: null,
        selectedOrigin: null,
        selectionClosing: false,
        selectionSettled: false,
        editingCoverBook: null,
        editingTemplate: action.template ?? null,
      };
    case "PAGE_CLOSED":
      return {
        ...state,
        screen: state.shelf ? "shelf" : "home",
        selectedBook: state.book,
        selectedShelf: state.shelf,
        selectedOrigin: null,
        bookOrigin: state.bookOrigin,
        selectionClosing: false,
        selectionSettled: true,
        page: null,
        pageClosing: false,
        editingCoverBook: null,
        editingTemplate: null,
      };
    case "HOME":
      return {
        ...state,
        screen: "home",
        shelf: null,
        book: null,
        selectedBook: null,
        selectedShelf: null,
        selectedOrigin: null,
        bookOrigin: null,
        selectionClosing: false,
        selectionSettled: false,
        page: null,
        pageClosing: false,
        editingCoverBook: null,
        editingTemplate: null,
      };
    case "BACK":
      if (state.screen === "planner" && state.book) {
        return {
          ...state,
          screen: state.shelf ? "shelf" : "home",
          selectedBook: state.book,
          selectedShelf: state.shelf,
          selectedOrigin: null,
          selectionSettled: true,
          page: null,
          pageClosing: true,
          editingCoverBook: null,
        };
      }
      if (state.screen === "template-editor") return { ...state, screen: "templates", editingTemplate: null };
      if (state.screen === "templates") return { ...state, screen: state.shelf ? "shelf" : "home", editingTemplate: null };
      if (state.screen === "contents" || state.screen === "create") return { ...state, screen: state.shelf ? "shelf" : "home", editingCoverBook: null, editingTemplate: null };
      if (state.screen === "shelf") return { ...state, screen: "home" };
      return state;
    default:
      return state;
  }
}

export function App() {
  const device = useDeviceMode();
  const isCompact = device === "mobile";
  const usesBottomNav = isCompact;
  const [shelves, setShelves] = useState(initialShelves);
  const [templates, setTemplates] = useState<PlannerInteriorTemplate[]>(() => createInitialTemplates());
  const defaultShelf = shelves[0];
  const defaultBook = defaultShelf.books[0];
  const [isExitingScreen, setIsExitingScreen] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
    screen: device === "desktop" ? "planner" : device === "tablet" ? "shelf" : "home",
    shelf: device === "mobile" ? null : defaultShelf,
    book: device === "desktop" ? defaultBook : null,
    selectedBook: null,
    selectedShelf: null,
    selectedOrigin: null,
    bookOrigin: null,
    selectionClosing: false,
    selectionSettled: false,
    page: null,
    pageClosing: false,
    editingCoverBook: null,
    editingTemplate: null,
  });

  // Novos estados locais para modais de estante/livro
  const [showCreateChoiceModal, setShowCreateChoiceModal] = useState(false);
  const [showNewShelfModal, setShowNewShelfModal] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [templateEditorPanel, setTemplateEditorPanel] = useState<"pages" | "blocks" | null>(null);

  const handleBack = () => {
    if (state.screen === "planner" && state.book) {
      setIsExitingScreen(true);
      window.setTimeout(() => {
        dispatch({ type: "BACK" });
        setIsExitingScreen(false);
      }, 400);
    } else {
      dispatch({ type: "BACK" });
    }
  };

  const handleBookClick = (shelf: Shelf | undefined, book: PlannerBook, origin?: BookClickOrigin) => {
    dispatch({ type: "SELECT_BOOK", shelf, book, origin });
  };

  const dismissSelection = () => dispatch({ type: "START_CLEAR_SELECTION" });

  useEffect(() => {
    if (!state.selectionClosing) return;

    const timeout = window.setTimeout(() => dispatch({ type: "CLEAR_SELECTION" }), 1140);
    return () => window.clearTimeout(timeout);
  }, [state.selectionClosing]);

  useEffect(() => {
    if (state.screen !== "template-editor") setTemplateEditorPanel(null);
  }, [state.screen]);

  const breadcrumb = useMemo<TopBarPart[]>(() => {
    const parts: TopBarPart[] = [
      {
        label: "Biblioteca",
        onClick: state.screen !== "home" ? () => dispatch({ type: "HOME" }) : undefined,
      },
    ];

    if (state.shelf) {
      parts.push({
        label: state.shelf.name,
        onClick: state.screen !== "shelf" ? () => dispatch({ type: "SHELF", shelf: state.shelf! }) : undefined,
      });
    }

    if (state.screen === "create") {
      parts.push({ label: "Novo planner" });
    }

    if (state.screen === "templates" || state.screen === "template-editor") {
      parts.push({
        label: "Templates",
        onClick: state.screen === "template-editor" ? () => dispatch({ type: "TEMPLATES" }) : undefined,
      });
    }

    if (state.screen === "template-editor") {
      parts.push({ label: state.editingTemplate?.name ?? "Novo template" });
    }

    if (state.book && state.screen !== "shelf") {
      parts.push({
        label: state.book.title,
        onClick:
          state.screen === "planner" && state.page
            ? () => dispatch({ type: "BOOK", shelf: state.shelf ?? undefined, book: state.book! })
            : undefined,
      });
    }

    if (state.screen === "planner" && state.page) parts.push({ label: state.page.title });
    return parts;
  }, [state.book, state.editingTemplate, state.page, state.screen, state.shelf]);

  const selectedShelfBooks = useMemo(() => {
    if (!state.selectedShelf) return [];
    const found = shelves.find((s) => s.id === state.selectedShelf?.id);
    return found ? found.books : [];
  }, [state.selectedShelf, shelves]);

  const content = (() => {
    if (state.screen === "shelf" && state.shelf) {
      return (
        <ShelfDetailScreen
          shelf={state.shelf}
          compact={isCompact}
          onBookClick={(book, origin) => handleBookClick(undefined, book, origin)}
          selectedBookId={state.selectedShelf?.id === state.shelf.id ? state.selectedBook?.id : undefined}
          selectionClosing={state.selectionClosing}
          onOpenSelected={(book) => dispatch({ type: "BOOK", book })}
          onDismissSelected={dismissSelection}
          onCreateBook={() => dispatch({ type: "CREATE" })}
        />
      );
    }

    if (state.screen === "contents" && state.book) {
      return <BookContentsScreen book={state.book} compact={isCompact} onPageClick={(page) => dispatch({ type: "PAGE", page })} />;
    }

    if (state.screen === "planner" && state.book) {
      return (
        <PlannerScreen
          book={state.book}
          activePage={state.page}
          compact={isCompact}
          onNavigatePage={(targetPage) => dispatch({ type: "PAGE", page: targetPage })}
          onUpdateBookPages={(updatedPages) => {
            // Salvar nos dados reativos de estantes
            setShelves((currentShelves) =>
              currentShelves.map((sh) => ({
                ...sh,
                books: sh.books.map((b) =>
                  b.id === state.book!.id ? { ...b, customPages: updatedPages } : b
                ),
              }))
            );
            // Atualizar no reducer para manter sincronia reativa instantânea
            dispatch({
              type: "BOOK",
              shelf: state.shelf || undefined,
              book: { ...state.book!, customPages: updatedPages },
            });
          }}
        />
      );
    }

    if (state.screen === "templates") {
      return (
        <TemplateGalleryScreen
          compact={isCompact}
          templates={templates}
          onCreateTemplate={() => dispatch({ type: "EDIT_TEMPLATE" })}
          onEditTemplate={(template) => dispatch({ type: "EDIT_TEMPLATE", template })}
        />
      );
    }

    if (state.screen === "template-editor") {
      return (
        <TemplateEditorScreen
          compact={usesBottomNav}
          template={state.editingTemplate}
          activePanel={templateEditorPanel}
          onClosePanel={() => setTemplateEditorPanel(null)}
          onCancel={() => dispatch({ type: "TEMPLATES" })}
          onSave={(template) => {
            setTemplates((current) => {
              const exists = current.some((item) => item.id === template.id);
              return exists
                ? current.map((item) => (item.id === template.id ? template : item))
                : [template, ...current];
            });
            dispatch({ type: "TEMPLATES" });
          }}
        />
      );
    }

    if (state.screen === "create") {
      return (
        <CreateBookScreen
          compact={isCompact}
          shelves={shelves}
          templates={templates}
          preselectedShelfId={state.selectedShelf?.id || undefined}
          editingBook={state.editingCoverBook}
          onDone={(book) => {
            const targetShelfId = book.shelfId || (shelves.length > 0 ? shelves[0].id : "");
            const targetShelf = shelves.find(s => s.id === targetShelfId) || null;

            setShelves((current) =>
              current.map((shelf) =>
                shelf.id === targetShelfId
                  ? {
                      ...shelf,
                      books: state.editingCoverBook
                        ? shelf.books.map((existingBook) => existingBook.id === book.id ? book : existingBook)
                        : [book, ...shelf.books],
                    }
                  : shelf
              )
            );
            dispatch({ type: "CREATED_BOOK", book, shelf: targetShelf || undefined });
          }}
        />
      );
    }

    return (
      <LibraryScreen
        compact={isCompact}
        onShelfClick={(shelf) => dispatch({ type: "SHELF", shelf })}
        onBookClick={(shelf, book, origin) => handleBookClick(shelf, book, origin)}
        selectedBookId={state.selectedBook?.id}
        selectedShelfId={state.selectedShelf?.id}
        selectionClosing={state.selectionClosing}
        onOpenSelected={(shelf, book) => dispatch({ type: "BOOK", shelf, book })}
        onDismissSelected={dismissSelection}
        onCreateBook={() => setShowCreateChoiceModal(true)} // No mobile/tablet abre modal
      />
    );
  })();

  return (
    <div className={`device-stage device-stage--${device}`}>
      <div className="app-frame">
        {device === "desktop" && <BrowserChrome />}
        <div className="app-frame__screen">
          {!usesBottomNav && (
            <SidebarNav
              shelves={shelves}
              activeShelfId={state.shelf?.id}
              templatesActive={state.screen === "templates" || state.screen === "template-editor"}
              onShelf={(shelf) => dispatch({ type: "SHELF", shelf })}
              onTemplates={() => dispatch({ type: "TEMPLATES" })}
            />
          )}
          <div className="app-main">
            <TopBar parts={breadcrumb} showBack={state.screen !== "home"} onBack={handleBack} compact={usesBottomNav} />
            <div className={`app-main__content ${isExitingScreen ? "is-exiting" : ""}`} key={state.screen}>
              {content}
            </div>
            {usesBottomNav && (
              <BottomTabBar
                mode={state.screen === "template-editor" ? "template-editor" : "main"}
                active={state.screen === "templates" || state.screen === "template-editor" ? "templates" : "library"}
                activeTemplateTool={templateEditorPanel}
                onLibrary={() => dispatch({ type: "HOME" })}
                onTemplates={() => dispatch({ type: "TEMPLATES" })}
                onTemplatePages={() => setTemplateEditorPanel("pages")}
                onTemplateBlocks={() => setTemplateEditorPanel("blocks")}
                onAdd={() => {
                  if (state.screen === "home") {
                    setShowCreateChoiceModal(true);
                  } else if (state.screen === "shelf") {
                    dispatch({ type: "CREATE" });
                  } else {
                    setShowCreateChoiceModal(true);
                  }
                }}
              />
            )}
            {state.selectedBook && (
              <BookFocusOverlay
                book={state.selectedBook}
                books={selectedShelfBooks}
                origin={state.selectedOrigin}
                closing={state.selectionClosing}
                settled={state.selectionSettled}
                pageClosing={state.pageClosing}
                screen={state.screen}
                onDismiss={dismissSelection}
                onOpen={() => dispatch({ type: "BOOK", shelf: state.selectedShelf ?? undefined, book: state.selectedBook! })}
                onEditCover={() => dispatch({ type: "EDIT_COVER", shelf: state.selectedShelf ?? undefined, book: state.selectedBook! })}
                onPageClosed={() => dispatch({ type: "PAGE_CLOSED" })}
                onSelectBook={(newBook) => dispatch({ type: "SELECT_BOOK", shelf: state.selectedShelf ?? undefined, book: newBook, origin: undefined })}
              />
            )}
          </div>
        </div>
      </div>

      {/* OVERLAY: MODAL DE ESCOLHA DE CRIAÇÃO MOBILE */}
      <BottomSheetModal
        isOpen={showCreateChoiceModal}
        onClose={() => setShowCreateChoiceModal(false)}
        title="O que você deseja criar?"
      >
        <div className="choice-modal__options">
              <button
                type="button"
                className="choice-option"
                onClick={() => {
                  setShowCreateChoiceModal(false);
                  setShowNewShelfModal(true);
                }}
              >
                <div className="choice-option__icon choice-option__icon--shelf">
                  <FolderPlus size={22} />
                </div>
                <div className="choice-option__content">
                  <h4>Estante Organizadora</h4>
                  <p>Crie um novo espaço físico para arquivar seus planners e cadernos.</p>
                </div>
              </button>

              <button
                type="button"
                className="choice-option"
                onClick={() => {
                  setShowCreateChoiceModal(false);
                  dispatch({ type: "CREATE" });
                }}
              >
                <div className="choice-option__icon choice-option__icon--book">
                  <BookOpen size={22} />
                </div>
                <div className="choice-option__content">
                  <h4>Novo Livro, Planner ou Agenda</h4>
                  <p>Crie uma agenda diária 2026 com divisórias em abas físicas e metas inteligentes.</p>
                </div>
              </button>
        </div>
      </BottomSheetModal>

      {/* OVERLAY: DIALOG PARA CRIAR ESTANTE */}
      {showNewShelfModal && (
        <div className="shelf-modal-backdrop" onClick={() => setShowNewShelfModal(false)}>
          <div className="shelf-modal animate-pop" onClick={(e) => e.stopPropagation()}>
            <div className="shelf-modal__header">
              <h3>Criar Nova Estante</h3>
              <button className="shelf-modal__close" type="button" onClick={() => setShowNewShelfModal(false)}>
                <X size={16} />
              </button>
            </div>
            <p className="shelf-modal__subtitle">Dê um nome organizador para separar seus planners da biblioteca.</p>
            
            <div className="shelf-modal__field">
              <input
                type="text"
                placeholder="Ex: Projetos Pessoais, Estudos, Finanças 2026..."
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="shelf-modal__actions">
              <button type="button" className="btn-modal-cancel" onClick={() => setShowNewShelfModal(false)}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-modal-submit"
                disabled={!newShelfName.trim()}
                onClick={() => {
                  if (!newShelfName.trim()) return;
                  const newShelfId = `shelf-${Date.now()}`;
                  const newShelfObj: Shelf = {
                    id: newShelfId,
                    name: newShelfName.trim(),
                    books: [],
                  };
                  setShelves((prev) => [...prev, newShelfObj]);
                  setShowNewShelfModal(false);
                  setNewShelfName("");
                }}
              >
                Criar Estante
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function useDeviceMode(): DeviceMode {
  const [device, setDevice] = useState<DeviceMode>(() => getDeviceMode());

  useEffect(() => {
    const onResize = () => setDevice(getDeviceMode());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return device;
}

function getDeviceMode(): DeviceMode {
  const width = typeof window === "undefined" ? 1200 : window.innerWidth;
  if (width < 700) return "mobile";
  if (width < 1100) return "tablet";
  return "desktop";
}

function BrowserChrome() {
  return (
    <div className="browser-chrome">
      <div className="browser-chrome__lights">
        <span />
        <span />
        <span />
      </div>
      <div className="browser-chrome__tab">
        <i />
        Meu Planner
      </div>
      <div className="browser-chrome__url">meu-planner.app</div>
    </div>
  );
}

function createInitialTemplates(): PlannerInteriorTemplate[] {
  const today = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

  return [
    {
      id: "tpl-agenda-performance",
      name: "Agenda performance A5",
      description: "Time blocking, prioridades, hidratacao e humor em grupos prontos para refil.",
      category: "agenda",
      createdAt: today,
      updatedAt: today,
      plan: createDefaultInteriorPlan(240, "agenda_2026"),
      printPolicy: "admin_only",
      isSystem: true,
    },
    {
      id: "tpl-notas-classico",
      name: "Notas classico",
      description: "Miolo pautado e pontilhado para cadernos de escrita, estudo e ideias.",
      category: "notebook",
      createdAt: today,
      updatedAt: today,
      plan: createDefaultInteriorPlan(160, "notes_notebook"),
      printPolicy: "admin_only",
      isSystem: true,
    },
  ];
}
