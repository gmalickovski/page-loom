import { useEffect, useRef, useState } from "react";
import {
  Zap,
  Columns,
  Instagram,
} from "lucide-react";
import {
  ArrowRightIcon as ArrowRight,
  CameraIcon as Camera,
  QrCodeIcon as QrCode,
  PencilIcon as PenTool,
  PrinterIcon as Printer,
  SearchIcon as Search,
  BookIcon as BookOpen,
  ShoppingBagIcon as ShoppingBag,
  CheckIcon as Check,
  StarIcon as Star,
  MenuIcon as Menu,
  XIcon as X,
} from "@/components/ui/icons";
import { useNavigate } from "react-router-dom";
import "./landing.css";

const SECTIONS = [
  {
    id: "crossover",
    title: "O Crossover Físico-Digital",
    eyebrow: "Sincronização Mágica",
    description:
      "Escreva no papel, encontre na nuvem. Aponte a câmera para o QR Code da sua página física e veja a réplica digital idêntica se materializar no app instantaneamente.",
    color: "#D2DCD0",
    bookTitle: "O Crossover",
  },
  {
    id: "studio",
    title: "O Studio de Templates",
    eyebrow: "Criação Ilimitada",
    description:
      "Arraste e solte blocos de prioridade, calendários e trackers de hábitos em pautas de 7mm perfeitas. Construa a folha de produtividade que funciona para a sua mente.",
    color: "#EADBC8",
    bookTitle: "Estúdio Web",
  },
  {
    id: "marketplace",
    title: "O Marketplace",
    eyebrow: "Designers e Criadores",
    description:
      "Descubra frameworks de organização criados por especialistas ou venda o seu próprio layout. Navegue por orelhas e separadores coloridos que saltam da tela.",
    color: "#DACBD5",
    bookTitle: "Marketplace",
  },
  {
    id: "manufacture",
    title: "Manufatura Ativa",
    eyebrow: "Do PDF ao Papel",
    description:
      "Integração direta com o parque gráfico. Seu planner digital é processado e impresso em alta resolução com furações exatas para cadernos inteligentes e argolados.",
    color: "#CBD5D0",
    bookTitle: "Manufatura",
  },
];

const FEATURES = [
  {
    icon: QrCode,
    title: "Sincronização por QR Code",
    description:
      "Cada folha impressa contém um QR Code único. Escaneie com o app e sua réplica digital aparece instantaneamente — sem digitação manual.",
    color: "#D2DCD0",
  },
  {
    icon: Camera,
    title: "Leitura de Caligrafia (HTR)",
    description:
      "Fotografe sua escrita à mão e a nossa IA multimodal transcreve o texto com alta fidelidade, mesmo para caligrafias cursivas complexas.",
    color: "#EADBC8",
  },
  {
    icon: Search,
    title: "Busca Indexada Total",
    description:
      "Pesquise qualquer palavra que você escreveu em qualquer página física. O app encontra e destaca o trecho exato na foto da folha.",
    color: "#DACBD5",
  },
  {
    icon: PenTool,
    title: "Studio Drag & Drop",
    description:
      "Editor web intuitivo com blocos de time-blocking, hábitos, metas e muito mais. Construa layouts únicos em pautas de 7mm com precisão milimétrica.",
    color: "#F3ECE0",
  },
  {
    icon: ShoppingBag,
    title: "Marketplace de Layouts",
    description:
      "Explore e adquira templates criados por designers especializados em produtividade. Ou publique o seu e transforme sua criatividade em renda.",
    color: "#CBD5D0",
  },
  {
    icon: Printer,
    title: "Impressão Premium Assistida",
    description:
      "Fluxo duplex step-by-step para impressão perfeita. Do PDF gerado pelo Studio até a folha física furada e encadernada com precisão artesanal.",
    color: "#E2DBD5",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Crie no Studio",
    description:
      "Acesse o Studio Web e construa seu planner personalizado com blocos drag & drop. Escolha o formato, furação e tipo de pauta.",
    icon: PenTool,
    color: "#D2DCD0",
  },
  {
    step: "02",
    title: "Imprima & Encaderne",
    description:
      "Receba seu planner físico impresso em alta resolução com QR Codes únicos em cada página. Perfeito para cadernos inteligentes.",
    icon: Printer,
    color: "#EADBC8",
  },
  {
    step: "03",
    title: "Escaneie e Sincronize",
    description:
      "Aponte a câmera do app para o QR Code e sua réplica digital aparece. Use HTR para digitalizar sua caligrafia automaticamente.",
    icon: Camera,
    color: "#DACBD5",
  },
  {
    step: "04",
    title: "Organize & Pesquise",
    description:
      "Busque qualquer anotação escrita à mão, sincronize com o Google Calendar e gerencie sua vida em um único ecossistema integrado.",
    icon: Search,
    color: "#CBD5D0",
  },
];

const PRICING = [
  {
    name: "Livre",
    price: "Grátis",
    period: "",
    description: "Para começar a explorar o universo PageLoom sem compromisso.",
    highlight: false,
    badge: null,
    features: [
      "App de biblioteca digital",
      "3 digitalizações HTR por dia",
      "Busca básica de anotações",
      "1 estante com até 5 livros",
      "Sincronização manual de datas",
      "Acesso ao Marketplace (leitura)",
    ],
    cta: "Começar Grátis",
    ctaStyle: "outline",
  },
  {
    name: "Pro",
    price: "R$29",
    period: "/mês",
    description: "Para quem leva produtividade a sério e quer o máximo do físico + digital.",
    highlight: true,
    badge: "Mais Popular",
    features: [
      "Tudo do plano Livre",
      "50 digitalizações HTR por dia",
      "Busca indexada completa (full-text)",
      "Estantes ilimitadas e livros",
      "Sincronização com Google Calendar",
      "Notificações push e lembretes",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    ctaStyle: "primary",
  },
  {
    name: "Studio",
    price: "R$79",
    period: "/mês",
    description: "Para criadores, designers e quem quer monetizar seus layouts no Marketplace.",
    highlight: false,
    badge: null,
    features: [
      "Tudo do plano Pro",
      "Acesso completo ao Studio Web",
      "Exportação PDF de alta resolução",
      "Publicar layouts no Marketplace",
      "Fluxo de impressão duplex assistido",
      "Painel admin de pedidos gráficos",
      "API de integração (beta)",
    ],
    cta: "Assinar Studio",
    ctaStyle: "outline",
  },
];

const TESTIMONIALS = [
  {
    name: "Ana Clara Rocha",
    role: "Designer & Bullet Journalist",
    rating: 5,
    text: "Finalmente um sistema que respeita minha relação com o papel sem me fazer abrir mão do digital. O QR Code é mágico — escanei e a réplica apareceu perfeita em 3 segundos.",
    avatar: "AC",
    color: "#D2DCD0",
  },
  {
    name: "Rodrigo Menezes",
    role: "Empreendedor & Coach de Produtividade",
    rating: 5,
    text: "Uso o Studio para criar planners semanais customizados para meus alunos. A fidelidade entre o que aparece na tela e o que sai impresso é impressionante — cor, pauta, tudo idêntico.",
    avatar: "RM",
    color: "#EADBC8",
  },
  {
    name: "Fernanda Torres",
    role: "Professora & Organizadora",
    rating: 5,
    text: "A busca indexada salvou minha vida. Escrevi o nome de uma reunião há 3 meses, pesquisei agora e o app me mostrou a foto exata da página. É como ter um assistente de memória.",
    avatar: "FT",
    color: "#DACBD5",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleEnterApp = () => navigate("/login?redirect=/app");
  const handleEnterStudio = () => navigate("/login?redirect=/studio");
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setActiveIndex(index);
          }
        });
      },
      {
        root: container,
        threshold: 0.3,
      }
    );

    const sections = container.querySelectorAll(".scrolly-section, .landing-hero");
    sections.forEach((section) => observer.observe(section));

    const handleScroll = () => {
      setScrolled(container.scrollTop > 60);
    };
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal-on-scroll").forEach((el) => revealObserver.observe(el));
    return () => revealObserver.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const el = containerRef.current?.querySelector(`#${id}`);
    el?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="scrolly-landing" ref={containerRef}>
      <header className={`landing-nav-global ${scrolled ? "is-scrolled" : ""}`}>
        <a href="#" className="landing-nav-global__logo" onClick={(e) => e.preventDefault()}>
          <BookOpen size={20} strokeWidth={1.5} />
          PageLoom
        </a>

        <nav className="landing-nav-global__links">
          <button type="button" onClick={() => scrollToSection("features-section")}>Recursos</button>
          <button type="button" onClick={() => scrollToSection("how-it-works-section")}>Como Funciona</button>
          <button type="button" onClick={() => scrollToSection("pricing-section")}>Preços</button>
          <button type="button" onClick={() => scrollToSection("testimonials-section")}>Depoimentos</button>
        </nav>

        <div className="landing-nav-global__actions">
          <button type="button" className="nav-btn-secondary" onClick={handleEnterApp}>
            Entrar no App
          </button>
          <button type="button" className="scrolly-cta nav-cta" onClick={handleEnterStudio}>
            Criar Planner
            <ArrowRight size={14} />
          </button>
        </div>

        <button
          type="button"
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      <div className={`nav-mobile-drawer ${menuOpen ? "is-open" : ""}`}>
        <nav>
          <button type="button" onClick={() => scrollToSection("features-section")}>Recursos</button>
          <button type="button" onClick={() => scrollToSection("how-it-works-section")}>Como Funciona</button>
          <button type="button" onClick={() => scrollToSection("pricing-section")}>Preços</button>
          <button type="button" onClick={() => scrollToSection("testimonials-section")}>Depoimentos</button>
        </nav>
        <div className="nav-mobile-drawer__actions">
          <button type="button" className="nav-btn-secondary" onClick={handleEnterApp}>Entrar no App</button>
          <button type="button" className="scrolly-cta footer-cta" onClick={handleEnterApp}>
            Acessar Biblioteca <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <section className="landing-hero" data-index="-1" id="hero-section">
        <div className="landing-hero__content">
          <span className="landing-hero__eyebrow">Estúdio Digital-Físico</span>
          <h1 className="landing-hero__title">
            Seus pensamentos tecidos em <em>papel</em>.<br />
            Sua organização no <em>digital</em>.
          </h1>
          <p className="landing-hero__description">
            Desenhe planners e cadernos sob medida no nosso estúdio web.
            Escreva com a liberdade do papel físico e sincronize tudo com o app instantaneamente via QR Code.
          </p>
          <div className="landing-hero__actions">
            <button type="button" className="scrolly-cta landing-hero__cta" onClick={handleEnterStudio}>
              Começar a Criar
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="landing-hero__secondary-btn"
              onClick={() => scrollToSection("features-section")}
            >
              Conhecer Recursos
            </button>
          </div>
        </div>
        <div
          className="landing-hero__scroll-indicator"
          onClick={() => {
            const el = containerRef.current?.querySelector(".scrolly-layout");
            el?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <span>Role para explorar o estúdio</span>
          <div className="landing-hero__scroll-arrow">
            <ArrowRight size={14} style={{ transform: "rotate(90deg)" }} />
          </div>
        </div>
      </section>

      <div className="scrolly-layout">
        <div className="scrolly-content-column">
          {SECTIONS.map((section, index) => (
            <div
              key={section.id}
              data-index={index}
              className={`scrolly-section ${activeIndex === index ? "is-active" : ""}`}
            />
          ))}
        </div>

        <div className="scrolly-card-stage">
          {SECTIONS.map((section, index) => (
            <div
              key={section.id}
              data-index={index}
              className={`scrolly-section__card-bg ${activeIndex === index ? "is-active" : ""}`}
              style={{ backgroundColor: section.color }}
            >
              <div className="scrolly-section__card-paper">
                <div className="card-paper__left">
                  <span className="scrolly-section__eyebrow">{section.eyebrow}</span>
                  <h1 className="scrolly-section__title">
                    {section.title.split(" ").map((word, i, arr) =>
                      i === arr.length - 1 ? <em key={i}>{word}</em> : <span key={i}>{word} </span>
                    )}
                  </h1>
                  <p className="scrolly-section__description">{section.description}</p>

                  {index === 0 && (
                    <button type="button" className="scrolly-cta" onClick={handleEnterStudio}>
                      Testar o Studio
                      <ArrowRight size={16} />
                    </button>
                  )}
                </div>
                <div className="card-paper__right">
                  <MockupContent index={index} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lado Direito: Estante de Livros */}
        <div className="scrolly-stage-column">
          <div className="shelf-2d__books-row">
            {SECTIONS.map((section, index) => (
              <div key={section.id} className="book-spine-landing__wrapper">
                <div
                  className={`book-spine-landing ${activeIndex === index ? "is-active" : ""}`}
                  style={{ backgroundColor: section.color }}
                  onClick={() => {
                    const el = document.querySelector(`[data-index="${index}"]`);
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <span className="book-spine-landing__shadow" />
                  <span className="book-spine-landing__joint book-spine-landing__joint--left" />
                  <span className="book-spine-landing__joint book-spine-landing__joint--right" />
                  <div className="book-spine-landing__label">
                    <span>{section.bookTitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Prancha de madeira — posicionada absolutamente dentro da coluna sticky */}
          <div className="shelf-2d__plank" />
        </div>
      </div>

      {/* ═══════════════════════════════════════
          FEATURES GRID
          ═══════════════════════════════════════ */}
      <section className="features-section" id="features-section">
        <div className="section-container">
          <div className="section-header reveal-on-scroll">
            <span className="section-eyebrow">Por que PageLoom</span>
            <h2 className="section-title">Cada recurso foi desenhado para o papel <em>e</em> para a tela</h2>
            <p className="section-subtitle">
              Seis pilares que tornam o PageLoom único — onde a elegância do analógico encontra a inteligência do digital.
            </p>
          </div>
          <div className="features-grid">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="feature-card reveal-on-scroll" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="feature-card__icon" style={{ backgroundColor: feature.color }}>
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="feature-card__title">{feature.title}</h3>
                  <p className="feature-card__desc">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMO FUNCIONA
          ═══════════════════════════════════════ */}
      <section className="how-it-works-section" id="how-it-works-section">
        <div className="section-container">
          <div className="section-header reveal-on-scroll">
            <span className="section-eyebrow">O Flywheel PageLoom</span>
            <h2 className="section-title">Do papel à nuvem em <em>4 passos</em></h2>
            <p className="section-subtitle">
              Um ecossistema fechado que resolve o atrito entre o prazer da escrita manual e a conveniência do digital.
            </p>
          </div>
          <div className="how-it-works-steps">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="how-step reveal-on-scroll" style={{ animationDelay: `${i * 0.12}s` }}>
                  <div className="how-step__icon-wrap" style={{ backgroundColor: step.color }}>
                    <Icon size={26} strokeWidth={1.5} />
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && <div className="how-step__connector" />}
                  <div className="how-step__number">{step.step}</div>
                  <h3 className="how-step__title">{step.title}</h3>
                  <p className="how-step__desc">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
          ═══════════════════════════════════════ */}
      <section className="pricing-section" id="pricing-section">
        <div className="section-container">
          <div className="section-header reveal-on-scroll">
            <span className="section-eyebrow">Planos & Preços</span>
            <h2 className="section-title">Comece grátis, cresça <em>sem limites</em></h2>
            <p className="section-subtitle">
              Escolha o plano que combina com o seu ritmo. Cancele a qualquer momento, sem burocracia.
            </p>
          </div>
          <div className="pricing-cards">
            {PRICING.map((plan, i) => (
              <div
                key={i}
                className={`pricing-card reveal-on-scroll ${plan.highlight ? "pricing-card--highlight" : ""}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {plan.badge && <div className="pricing-card__badge">{plan.badge}</div>}
                <div className="pricing-card__header">
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <div className="pricing-card__price">
                    <span className="pricing-card__amount">{plan.price}</span>
                    {plan.period && <span className="pricing-card__period">{plan.period}</span>}
                  </div>
                  <p className="pricing-card__desc">{plan.description}</p>
                </div>
                <ul className="pricing-card__features">
                  {plan.features.map((feat, fi) => (
                    <li key={fi}>
                      <Check size={15} strokeWidth={2.5} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className={`pricing-card__cta ${plan.ctaStyle === "primary" ? "scrolly-cta pricing-cta--primary" : "pricing-cta--outline"}`}
                  onClick={handleEnterStudio}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          TESTIMONIALS
          ═══════════════════════════════════════ */}
      <section className="testimonials-section" id="testimonials-section">
        <div className="section-container">
          <div className="section-header reveal-on-scroll">
            <span className="section-eyebrow">Depoimentos</span>
            <h2 className="section-title">Criadores que <em>transformaram</em> sua organização</h2>
          </div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="testimonial-card reveal-on-scroll"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="testimonial-card__stars">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} fill="currentColor" />
                  ))}
                </div>
                <p className="testimonial-card__text">"{t.text}"</p>
                <div className="testimonial-card__author">
                  <div
                    className="testimonial-card__avatar"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div className="testimonial-card__name">{t.name}</div>
                    <div className="testimonial-card__role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA FINAL BANNER
          ═══════════════════════════════════════ */}
      <section className="cta-banner reveal-on-scroll" id="cta-banner-section">
        <div className="cta-banner__inner">
          <div className="cta-banner__decoration" aria-hidden="true">
            {["#D2DCD0", "#EADBC8", "#DACBD5", "#CBD5D0"].map((c, i) => (
              <div key={i} className="cta-banner__book" style={{ backgroundColor: c }} />
            ))}
          </div>
          <span className="section-eyebrow">Comece agora</span>
          <h2 className="cta-banner__title">
            Seu próximo planner está esperando ser <em>criado</em>.
          </h2>
          <p className="cta-banner__desc">
            Junte-se a criadores que já unem o melhor do papel com o poder do digital.
            Grátis para começar. Sem cartão de crédito.
          </p>
          <div className="cta-banner__actions">
            <button type="button" className="scrolly-cta cta-banner__cta" onClick={handleEnterStudio}>
              Criar Meu Primeiro Planner
              <ArrowRight size={16} />
            </button>
            <button type="button" className="landing-hero__secondary-btn" onClick={() => scrollToSection("pricing-section")}>
              Ver Planos
            </button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FOOTER
          ═══════════════════════════════════════ */}
      <footer className="landing-footer">
        <div className="landing-footer__inner">
          {/* Brand */}
          <div className="landing-footer__brand">
            <div className="landing-footer__logo">
              <BookOpen size={20} strokeWidth={1.5} />
              PageLoom
            </div>
            <p className="landing-footer__tagline">
              O ecossistema que une o prazer do papel com a inteligência do digital.
            </p>
            <div className="landing-footer__social">
              <a href="#" aria-label="Instagram" className="footer-social-link" onClick={(e) => e.preventDefault()}>
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="TikTok" className="footer-social-link" onClick={(e) => e.preventDefault()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
              <a href="#" aria-label="Pinterest" className="footer-social-link" onClick={(e) => e.preventDefault()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.65 7.86 6.39 9.29-.09-.78-.17-1.98.04-2.83.18-.76 1.22-5.18 1.22-5.18s-.31-.62-.31-1.54c0-1.45.84-2.53 1.88-2.53.89 0 1.32.67 1.32 1.47 0 .9-.57 2.24-.87 3.48-.25 1.04.52 1.88 1.54 1.88 1.84 0 3.08-2.37 3.08-5.17 0-2.13-1.44-3.63-3.49-3.63-2.38 0-3.77 1.78-3.77 3.63 0 .72.28 1.49.62 1.91.07.08.08.15.06.23-.06.27-.2.85-.23.97-.04.16-.13.19-.3.11-1.12-.52-1.82-2.16-1.82-3.48 0-2.83 2.06-5.43 5.93-5.43 3.11 0 5.53 2.22 5.53 5.18 0 3.09-1.95 5.57-4.65 5.57-.91 0-1.76-.47-2.05-1.03l-.56 2.09c-.2.78-.75 1.75-1.12 2.34.85.26 1.75.4 2.68.4 5.52 0 10-4.48 10-10S17.52 2 12 2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Produto */}
          <div className="landing-footer__col">
            <h4>Produto</h4>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("features-section"); }}>Recursos</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("how-it-works-section"); }}>Como Funciona</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection("pricing-section"); }}>Preços</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Marketplace</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Studio Web</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>App Mobile</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div className="landing-footer__col">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Sobre Nós</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Blog</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Afiliados</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Imprensa</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Contato</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="landing-footer__col">
            <h4>Legal & Privacidade</h4>
            <ul>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Política de Privacidade</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Termos de Uso</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Política de Cookies</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>LGPD — Seus Dados</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>Política de Reembolso</a></li>
            </ul>
          </div>
        </div>

        <div className="landing-footer__bottom">
          <span>© {new Date().getFullYear()} PageLoom. Todos os direitos reservados.</span>
          <span>Feito com <span className="footer-heart">♥</span> no Brasil</span>
        </div>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════
   MOCKUP COMPONENTS
   ════════════════════════════════════════════════════════════════════ */

function MockupContent({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="mockup-container">
        <div className="mockup-header">
          <div className="mockup-header__dots"><span /><span /><span /></div>
        </div>
        <div className="mockup-body" style={{ background: "var(--color-bg-alt)" }}>
          <div className="mockup-paper-sheet mockup-element">
            <QrCode className="mockup-qr" strokeWidth={1} color="rgba(0,0,0,0.5)" />
            <div style={{ position: "absolute", top: 20, left: 20, right: 20, height: 1, background: "var(--color-border)" }} />
            <div style={{ position: "absolute", top: 40, left: 20, right: 20, height: 1, background: "var(--color-border)" }} />
            <div style={{ position: "absolute", top: 60, left: 20, right: 20, height: 1, background: "var(--color-border)" }} />
          </div>
          <div className="mockup-phone mockup-element">
            <Camera size={32} color="rgba(255,255,255,0.8)" />
          </div>
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="mockup-container">
        <div className="mockup-header">
          <div className="mockup-header__dots"><span /><span /><span /></div>
        </div>
        <div className="mockup-body" style={{ display: "flex", flexDirection: "row", gap: 8 }}>
          <div className="mockup-element" style={{ width: 40, background: "rgba(0,0,0,0.04)", borderRadius: 6, padding: 4 }}>
            <div style={{ width: "100%", height: 30, background: "white", borderRadius: 4, marginBottom: 4 }} />
            <div style={{ width: "100%", height: 30, background: "white", borderRadius: 4, marginBottom: 4 }} />
          </div>
          <div className="mockup-element" style={{ flex: 1, background: "white", border: "1px solid var(--color-border)", borderRadius: 6, position: "relative" }}>
            <div style={{ position: "absolute", top: 10, left: 10, width: 80, height: 20, border: "2px dashed var(--color-accent)", borderRadius: 4 }} />
            <div style={{ position: "absolute", top: 40, left: 10, width: 40, height: 80, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 4 }} />
            <PenTool size={20} color="var(--color-accent)" style={{ position: "absolute", top: 80, right: 20 }} />
          </div>
        </div>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className="mockup-container">
        <div className="mockup-header">
          <div className="mockup-header__dots"><span /><span /><span /></div>
        </div>
        <div className="mockup-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div className="mockup-element" style={{ background: "#EDF2EE", borderRadius: 8, height: 80, padding: 8 }}>
            <Columns size={16} color="#4A5D23" />
          </div>
          <div className="mockup-element" style={{ background: "#F5EDE4", borderRadius: 8, height: 80, padding: 8 }}>
            <Columns size={16} color="#8C5A2B" />
          </div>
          <div className="mockup-element" style={{ background: "#F0EAF0", borderRadius: 8, height: 80, padding: 8 }}>
            <Columns size={16} color="#5D4A66" />
          </div>
          <div className="mockup-element" style={{ background: "#E8EEF0", borderRadius: 8, height: 80, padding: 8 }}>
            <Columns size={16} color="#4A5B66" />
          </div>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className="mockup-container">
        <div className="mockup-header">
          <div className="mockup-header__dots"><span /><span /><span /></div>
        </div>
        <div className="mockup-body" style={{ alignItems: "center", justifyContent: "center" }}>
          <div className="mockup-element" style={{ position: "relative", width: "80%", height: "80%", background: "white", border: "1px solid var(--color-border)", borderRadius: 4 }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ position: "absolute", left: -6, top: 10 + i * 20, width: 12, height: 12, borderRadius: "50%", background: "var(--color-bg)", border: "1px solid var(--color-border)" }} />
            ))}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Printer size={32} color="var(--color-muted)" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
