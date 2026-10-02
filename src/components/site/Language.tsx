import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useRouterState } from "@tanstack/react-router";
import { translate } from "@/lib/translations";

type Language = "mn" | "en";
type LocaleContext = {
  language: Language;
  setLanguage: (value: Language) => void;
  t: (text: string) => string;
};
const LanguageContext = createContext<LocaleContext | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("mn");
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ub-circus-language");
      if (saved === "mn" || saved === "en") setLanguageState(saved);
    } catch {
      /* A blocked browser store still allows switching languages. */
    }
  }, []);
  useEffect(() => {
    document.documentElement.lang = pathname.startsWith("/admin") ? "mn" : language;
    const titles: Record<string, [string, string]> = {
      "/": [
        "UB Circus — Тоглолт, эвент, бүтээлүүд",
        "UB Circus — Live Shows, Events & Productions in Ulaanbaatar",
      ],
      "/shows": ["Тоглолтууд — UB Circus", "Our shows — UB Circus"],
      "/events": ["Эвент, хуваарь — UB Circus", "Events & dates — UB Circus"],
      "/projects": ["Онцлох төслүүд — UB Circus", "Selected work — UB Circus"],
      "/contact": ["Хамтдаа бүтээе — UB Circus", "Let’s create — UB Circus"],
    };
    if (titles[pathname]) document.title = titles[pathname][language === "mn" ? 0 : 1];
  }, [language, pathname]);
  const setLanguage = useCallback((value: Language) => {
    setLanguageState(value);
    try {
      localStorage.setItem("ub-circus-language", value);
    } catch {
      /* Storage is optional. */
    }
  }, []);
  const t = useCallback((text: string) => translate(text, language), [language]);
  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is missing");
  return context;
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  return (
    <div
      className="language-switcher"
      role="group"
      aria-label={language === "mn" ? "Сайтын хэл" : "Site language"}
    >
      <button
        type="button"
        lang="mn"
        title="Монгол хэл"
        aria-label="Монгол хэл"
        aria-pressed={language === "mn"}
        onClick={() => setLanguage("mn")}
      >
        MN
      </button>
      <span aria-hidden="true" />
      <button
        type="button"
        lang="en"
        title="English"
        aria-label="English"
        aria-pressed={language === "en"}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
    </div>
  );
}
