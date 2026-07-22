import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
};

export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border p-1 transition-colors",
        isDark
          ? "border-border bg-secondary"
          : "border-[#d5ddd0] bg-[#eef2ea]",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-2 z-0 transition-opacity duration-300",
          isDark ? "opacity-40" : "opacity-100",
        )}
      >
        <Sun className="h-3.5 w-3.5 text-amber-500" />
      </span>
      <span
        className={cn(
          "absolute right-2 z-0 transition-opacity duration-300",
          isDark ? "opacity-100" : "opacity-40",
        )}
      >
        <Moon className="h-3.5 w-3.5 text-sky-400" />
      </span>

      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "relative z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-sm",
          isDark ? "ml-auto bg-[#1a2a1f] text-[#b7d4a4]" : "bg-white text-amber-500",
        )}
      >
        <motion.span
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
        >
          {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
        </motion.span>
      </motion.span>
    </button>
  );
}
