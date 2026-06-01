import { useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  BookIcon,
  MailIcon,
  LockIcon,
  UserIcon,
  GoogleIcon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import "./auth.css";

export function AuthScreen() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const redirectUrl = searchParams.get("redirect") || "/app";
  const initialTab = location.pathname === "/cadastro" ? "signup" : "login";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setSuccess("Modo desenvolvimento — entrando sem autenticação real.");
      setTimeout(() => navigate(redirectUrl), 800);
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(
          authError.message.includes("Invalid login")
            ? "Email ou senha incorretos. Tente novamente."
            : authError.message
        );
      } else {
        navigate(redirectUrl);
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setSuccess("Modo desenvolvimento — conta simulada criada com sucesso!");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name || undefined },
        },
      });

      if (authError) {
        setError(
          authError.message.includes("already registered")
            ? "Este email já está cadastrado. Faça login."
            : authError.message
        );
      } else {
        setSuccess("Conta criada! Verifique seu email para confirmar o cadastro.");
      }
    } catch {
      setError("Erro de conexão. Verifique sua internet.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetMessages();

    if (!isSupabaseConfigured()) {
      setSuccess("Modo desenvolvimento — login Google simulado.");
      setTimeout(() => navigate(redirectUrl), 800);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      });

      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError("Erro ao conectar com o Google.");
    }
  };

  return (
    <div className="auth-screen">
      {/* Decoração lateral — espiral de caderno */}
      <div className="auth-screen__deco-left" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className="auth-screen__deco-right" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <i key={i} />
        ))}
      </div>

      <Card className="auth-card">
        <CardHeader className="auth-card__header">
          {/* Logo */}
          <div className="auth-logo">
            <div className="auth-logo__mark">
              <BookIcon size={26} />
            </div>
            <CardTitle className="auth-logo__title">PageLoom</CardTitle>
            <CardDescription className="auth-logo__desc">
              Monte, personalize e imprima seu planner perfeito
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="auth-card__body">
          {/* Messages */}
          {error && (
            <div className="auth-message auth-message--error" role="alert">
              {error}
            </div>
          )}
          {success && (
            <div className="auth-message auth-message--success" role="status">
              {success}
            </div>
          )}

          <Tabs defaultValue={initialTab} onValueChange={() => resetMessages()}>
            <TabsList className="auth-tabs-list">
              <TabsTrigger value="login" className="auth-tabs-trigger">
                Entrar
              </TabsTrigger>
              <TabsTrigger value="signup" className="auth-tabs-trigger">
                Criar Conta
              </TabsTrigger>
            </TabsList>

            {/* ── LOGIN ── */}
            <TabsContent value="login">
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-field">
                  <label htmlFor="login-email">
                    <MailIcon size={14} />
                    Email
                  </label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="auth-input"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="login-password">
                    <LockIcon size={14} />
                    Senha
                  </label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="auth-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                >
                  {loading && <span className="auth-spinner" />}
                  Entrar no PageLoom
                  <ArrowRightIcon size={16} />
                </Button>
              </form>
            </TabsContent>

            {/* ── SIGNUP ── */}
            <TabsContent value="signup">
              <form className="auth-form" onSubmit={handleSignup}>
                <div className="auth-field">
                  <label htmlFor="signup-name">
                    <UserIcon size={14} />
                    Nome completo
                  </label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    className="auth-input"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-email">
                    <MailIcon size={14} />
                    Email
                  </label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="auth-input"
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="signup-password">
                    <LockIcon size={14} />
                    Senha
                  </label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="auth-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="auth-submit-btn"
                >
                  {loading && <span className="auth-spinner" />}
                  Criar minha conta
                </Button>

                <p className="auth-terms">
                  Ao criar sua conta, você concorda com os{" "}
                  <a href="#termos">Termos de Uso</a> e{" "}
                  <a href="#privacidade">Política de Privacidade</a>.
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {/* Divider + OAuth */}
          <div className="auth-divider">
            <Separator className="auth-divider__line" />
            <span>ou</span>
            <Separator className="auth-divider__line" />
          </div>

          <Button
            type="button"
            variant="outline"
            className="auth-social-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <GoogleIcon size={18} />
            Continuar com Google
          </Button>

          {/* Footer */}
          <div className="auth-footer">
            <Button variant="ghost" onClick={() => navigate("/")} className="auth-footer__btn">
              ← Voltar para a <span>página inicial</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
