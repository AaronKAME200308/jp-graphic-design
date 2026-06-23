import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Lang = "fr" | "en";

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (fr: string, en: string) => string;
}

const LangContext = createContext<LangContextType>({
  lang: "fr",
  setLang: () => {},
  t: (fr) => fr,
});

export const LangProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("fr");
  const t = (fr: string, en: string) => (lang === "fr" ? fr : en);
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
