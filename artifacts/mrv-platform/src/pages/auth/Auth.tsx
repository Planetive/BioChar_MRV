import { useMemo, useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Leaf, ArrowRight, Loader2 } from "lucide-react";
import { logIn, signUp, type PublicUser } from "@/lib/auth-db";
import ThemeToggle from "@/components/ThemeToggle";

type Mode = "login" | "signup";

type AuthProps = {
  onAuthenticated?: (user: PublicUser) => void;
};

function BrandPanel() {
  return (
    <div className="auth-brand relative isolate flex h-full min-h-[280px] flex-col overflow-hidden p-8 md:p-12 lg:p-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(110,158,92,0.28),transparent_50%),radial-gradient(ellipse_at_80%_80%,rgba(196,120,58,0.18),transparent_45%),linear-gradient(165deg,#0c1210_0%,#152019_45%,#1a1510_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]" />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(126,168,108,0.35),transparent_70%)] blur-2xl"
        animate={{ scale: [1, 1.15, 1], opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-10 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(200,118,52,0.28),transparent_70%)] blur-2xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex items-center gap-3"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7ea86c]/20 ring-1 ring-[#7ea86c]/40">
            <Leaf className="h-5 w-5 text-[#b7d4a4]" strokeWidth={1.75} />
          </span>
          <span className="text-xl font-bold tracking-tight text-[#eef3e8]">
            Terra
          </span>
        </motion.div>

        <div className="mt-auto max-w-md pb-6 pt-16 md:pb-8 md:pt-24">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mb-4 text-sm font-medium uppercase tracking-[0.28em] text-[#9bb892]"
          >
            Carbon MRV
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.25 }}
            className="text-4xl font-bold leading-[1.05] text-[#f4f7f0] md:text-5xl lg:text-[3.4rem]"
          >
            Turn biomass into
            <span className="block text-[#b7d4a4]">verified impact.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-5 max-w-sm text-base leading-relaxed text-[#a8b5a6]"
          >
            Monitor feedstock, pyrolysis, and sequestration in one place —
            built for transparent carbon accounting.
          </motion.p>
        </div>
      </div>
    </div>
  );
}

function AuthForm({ onAuthenticated }: AuthProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const title = mode === "login" ? "Welcome back" : "Create your account";
  const subtitle =
    mode === "login"
      ? "Sign in to continue to Terra."
      : "Start tracking biochar projects in minutes.";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const result =
        mode === "signup"
          ? await signUp({ name, email, password })
          : await logIn({ email, password });

      if ("error" in result) {
        if ("needsEmailConfirm" in result && result.needsEmailConfirm) {
          setInfo(result.error);
          setMode("login");
          return;
        }
        setError(result.error);
        return;
      }

      onAuthenticated?.(result.user);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const fieldsKey = useMemo(() => mode, [mode]);

  return (
    <div className="auth-form relative flex h-full items-center justify-center bg-[#f3f5f1] px-6 py-10 md:px-12 lg:px-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(ellipse_at_top_right,rgba(183,212,164,0.35),transparent_50%)]"
      />

      <div className="relative w-full max-w-[400px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <p className="mb-2 text-sm font-medium text-[#5f735c]">
            {mode === "login" ? "Sign in" : "Sign up"}
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-[#152019]">
            {title}
          </h2>
          <p className="mt-2 text-[15px] text-[#667566]">{subtitle}</p>
        </motion.div>

        <div
          className="mt-8 grid grid-cols-2 gap-1 rounded-full bg-[#e4e9df] p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          {(["login", "signup"] as const).map((tab) => {
            const active = mode === tab;
            return (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => switchMode(tab)}
                className="relative rounded-full px-4 py-2.5 text-sm font-medium transition-colors"
              >
                {active && (
                  <motion.span
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-full bg-[#152019] shadow-sm"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span
                  className={`relative z-10 ${active ? "text-[#f3f5f1]" : "text-[#5f735c]"}`}
                >
                  {tab === "login" ? "Log in" : "Sign up"}
                </span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={fieldsKey}
              initial={{ opacity: 0, x: mode === "signup" ? 16 : -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === "signup" ? -16 : 16 }}
              transition={{ duration: 0.28 }}
              className="space-y-4"
            >
              {mode === "signup" && (
                <Field
                  id="name"
                  label="Full name"
                  type="text"
                  placeholder="Alex Rivera"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={setName}
                />
              )}
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="you@organization.com"
                autoComplete="email"
                required
                value={email}
                onChange={setEmail}
              />
              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[#2c3a2f]"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      mode === "signup" ? "At least 8 characters" : "••••••••"
                    }
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 w-full rounded-xl border border-[#c9d2c4] bg-white/80 px-4 pr-12 text-[15px] text-[#152019] outline-none transition focus:border-[#6e9e5c] focus:ring-2 focus:ring-[#6e9e5c]/25"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[#6a7a68] transition hover:bg-[#e4e9df] hover:text-[#152019]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {mode === "login" && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm font-medium text-[#4d6b45] underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-[#fde8e8] px-3 py-2 text-sm text-[#8b2e2e]"
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {info && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-lg bg-[#e7f0e3] px-3 py-2 text-sm text-[#2f4a2c]"
                role="status"
              >
                {info}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.985 }}
            className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#1a2a1f] text-[15px] font-semibold text-[#f3f5f1] transition hover:bg-[#24362a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Please wait…
              </>
            ) : (
              <>
                {mode === "login" ? "Log in" : "Create account"}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </>
            )}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-[#6a7a68]">
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => switchMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-[#2f4a2c] underline-offset-4 hover:underline"
          >
            {mode === "login" ? "Create an account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  autoComplete,
  required,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-[#2c3a2f]"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-xl border border-[#c9d2c4] bg-white/80 px-4 text-[15px] text-[#152019] outline-none transition focus:border-[#6e9e5c] focus:ring-2 focus:ring-[#6e9e5c]/25"
      />
    </div>
  );
}

export default function Auth({ onAuthenticated }: AuthProps) {
  return (
    <div className="relative min-h-screen w-full font-sans md:grid md:grid-cols-2">
      <div className="absolute right-4 top-4 z-20 md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      <BrandPanel />
      <AuthForm onAuthenticated={onAuthenticated} />
    </div>
  );
}
