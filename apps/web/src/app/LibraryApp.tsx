import { useEffect, useMemo, useReducer, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { pages, shelves as initialShelves } from "../data/demoLibrary";
import { BookFocusOverlay } from "../components/bookshelf/BookFocusOverlay";
import { BookReturnOverlay } from "../components/bookshelf/BookReturnOverlay";
import { BottomTabBar } from "../components/layout/BottomTabBar";
import { SidebarNav } from "../components/layout/SidebarNav";
import { TopBar, type TopBarPart } from "../components/layout/TopBar";
import type { BookClickOrigin, DeviceMode, PlannerBook, PlannerPage, ScreenName, Shelf } from "../types/library";
import { BookContentsScreen, CreateBookScreen, LibraryScreen, PlannerScreen, ShelfDetailScreen } from "./screens";
import { CreateChoiceModal, NewShelfModal } from "../components/modals";
import { AdminPrintScreen } from "./AdminPrintScreen";
import { LandingPage } from "./LandingPage";
import { AuthScreen } from "./AuthScreen";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
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
  | { type: "CREATED_BOOK"; book: PlannerBook; shelf?: Shelf }
  | { type: "PAGE_CLOSED" }
  | { type: "HOME" }
  | { type: "ADMIN" }
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
        page: (() => {
          const bookPages = action.book.customPages || [];
          if (bookPages.length > 1 && bookPages[0].id === "cover") {
            return bookPages[1];
          }
          return bookPages[0] || null;
        })(),
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
      return { ...state, screen: "create", selectedBook: null, selectedShelf: state.shelf, selectedOrigin: null, selectionClosing: false, selectionSettled: false, editingCoverBook: null };
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
      };
    case "ADMIN":
      return { ...state, screen: "admin-print", selectedBook: null, selectedOrigin: null, selectionClosing: false, selectionSettled: false, editingCoverBook: null };
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
      };
    case "BACK":
      if (state.screen === "admin-print") return { ...state, screen: "home" };
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
      if (state.screen === "contents" || state.screen === "create") return { ...state, screen: state.shelf ? "shelf" : "home", editingCoverBook: null };
      if (state.screen === "shelf") return { ...state, screen: "home" };
      return state;
    default:
      return state;
  }
}

export function LibraryApp() {
  const device = useDeviceMode();
  const navigate = useNavigate();
  const isCompact = device === "mobile";
  const usesBottomNav = isCompact;
  const [shelves, setShelves] = useState(initialShelves);
  const defaultShelf = shelves?.[0];
  const defaultBook = defaultShelf?.books?.[0];
  const [isExitingScreen, setIsExitingScreen] = useState(false);
  const [state, dispatch] = useReducer(reducer, {
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
  });

  // Novos estados locais para modais de estante/livro
  const [showCreateChoiceModal, setShowCreateChoiceModal] = useState(false);
  const [showNewShelfModal, setShowNewShelfModal] = useState(false);
  
  // Checar sessão Supabase
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate(`/login?redirect=/app`);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Forçar a tela correta na inicialização
  useEffect(() => {
    if (state.screen !== "home" && state.screen !== "shelf" && state.screen !== "planner" && state.screen !== "contents" && state.screen !== "create") {
      dispatch({ type: "HOME" });
    }
  }, []);


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



  const breadcrumb = useMemo<TopBarPart[]>(() => {
    const parts: TopBarPart[] = [];

    // 1. Sempre temos o link "Biblioteca" como ponto de partida (ou atual se na home)
    const isHome = state.screen === "home";
    const isCreateFromHome = state.screen === "create" && !state.shelf;
    
    parts.push({
      label: "Biblioteca",
      onClick: (!isHome && !isCreateFromHome) ? () => dispatch({ type: "HOME" }) : undefined,
    });

    // 3. Se a tela for painel de impressão admin
    if (state.screen === "admin-print") {
      parts.push({
        label: "Painel Admin de Impressão",
        onClick: undefined,
      });
      return parts;
    }

    // 4. Se houver estante e NÃO for uma tela global
    if (state.shelf) {
      const isShelfCurrent = state.screen === "shelf" || (state.screen === "create" && !state.editingCoverBook);
      parts.push({
        label: state.shelf.name,
        onClick: !isShelfCurrent ? () => dispatch({ type: "SHELF", shelf: state.shelf! }) : undefined,
      });
    }

    // 5. Se houver livro ativo (para planner, contents, ou ao editar capa)
    // Nota: "create" para criar livro novo é temporário e não mostra o livro em si
    if (state.book && (state.screen === "planner" || state.screen === "contents" || (state.screen === "create" && state.editingCoverBook))) {
      const isBookCurrent = (state.screen === "planner" && !state.page) || state.screen === "contents" || state.screen === "create";
      
      parts.push({
        label: state.book.title,
        onClick: !isBookCurrent 
          ? () => dispatch({ type: "BOOK", shelf: state.shelf ?? undefined, book: state.book! }) 
          : undefined,
      });

      // Se estiver visualizando o sumário
      if (state.screen === "contents") {
        parts.push({
          label: "Sumário",
          onClick: undefined,
        });
      }

      // Se estiver em uma página do planner
      if (state.screen === "planner" && state.page) {
        parts.push({
          label: state.page.title,
          onClick: undefined,
        });
      }
    }

    return parts;
  }, [state.book, state.page, state.screen, state.shelf, state.editingCoverBook]);

  const selectedShelfBooks = useMemo(() => {
    if (!state.selectedShelf) return [];
    const found = shelves.find((s) => s.id === state.selectedShelf?.id);
    return found ? found.books : [];
  }, [state.selectedShelf, shelves]);

  const content = (() => {
    if (state.screen === "admin-print") {
      return <AdminPrintScreen onBack={() => dispatch({ type: "HOME" })} />;
    }

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

    if (state.screen === "create") {
      return (
        <CreateBookScreen
          compact={isCompact}
          shelves={shelves}
          templates={[]}
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
        <div className="app-frame__screen">
          {!usesBottomNav && (
            <SidebarNav
              shelves={shelves}
              activeShelfId={state.shelf?.id}
              onShelf={(shelf) => dispatch({ type: "SHELF", shelf })}
            />
          )}
          <div className="app-main">
            <TopBar 
              parts={breadcrumb} 
              showBack={state.screen !== "home"} 
              onBack={handleBack} 
              compact={usesBottomNav} 
              onAdminClick={state.screen === "home" ? () => dispatch({ type: "ADMIN" }) : undefined}
            />
            <div className={`app-main__content ${isExitingScreen ? "is-exiting" : ""}`} key={state.screen}>
              {content}
            </div>
            {usesBottomNav && (
              <BottomTabBar
                active="library"
                onLibrary={() => dispatch({ type: "HOME" })}
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
      <CreateChoiceModal
        isOpen={showCreateChoiceModal}
        onClose={() => setShowCreateChoiceModal(false)}
        onCreateShelf={() => setShowNewShelfModal(true)}
        onCreateBook={() => dispatch({ type: "CREATE" })}
      />

      {/* OVERLAY: DIALOG PARA CRIAR ESTANTE */}
      <NewShelfModal
        isOpen={showNewShelfModal}
        onClose={() => setShowNewShelfModal(false)}
        onCreateShelf={(name) => {
          const newShelfId = `shelf-${Date.now()}`;
          const newShelfObj: Shelf = {
            id: newShelfId,
            name: name,
            books: [],
          };
          setShelves((prev) => [...prev, newShelfObj]);
        }}
      />
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

