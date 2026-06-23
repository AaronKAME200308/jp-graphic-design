import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useLang } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Accueil");
  const navigate = useNavigate();

  const links = [
    { label: t("Accueil", "Home"), id: t("Accueil", "Home") },
    { label: t("A propos", "About"), id: t("A propos", "About") },
    { label: t("Projets", "Projects"), id: t("Projets", "Projects") },
    { label: t("Compétences", "Skills"), id: t("Compétences", "Skills") },
    { label: "Contact", id: "Contact" },
  ];

  useEffect(() => {
    const onScroll = () => {
      const sections = document.querySelectorAll("section");
      let current = links[0].id;
      sections.forEach((section) => {
        if (section.getBoundingClientRect().top <= 120) {
          current = section.id;
        }
      });
      setActive(current);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [lang]);

  const scrollToSection = (id: string) => {
    setActive(id);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth" });
    if (window.innerWidth < 768) {
      setTimeout(() => setOpen(false), 400);
    }
  };

  const isContact = (label: string) => label === "Contact";

  return (
    <header className="w-full backdrop-blur-md sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto flex items-center px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-2 relative">

        {/* LOGO */}
        <motion.div
          initial={{ scale: 0.98, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <img src="/logoblanc.png" alt="Logo JP Graphic Design" className="w-10 h-10" />
          <span className="font-coco font-extralight text-sm text-white/70">
            Graphic Design
          </span>
        </motion.div>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2">
          <ul className="flex gap-1 items-center text-sm">
            {links.filter((l) => !isContact(l.label)).map((l) => (
              <li key={l.label}>
                <button
                  onClick={() => scrollToSection(l.id)}
                  className="font-coco font-extrabold px-4 py-2 rounded-xl transition-all duration-200 text-sm"
                  style={{
                    color: active === l.id ? "#fff" : "#f2cc6a",
                    background: active === l.id ? "rgba(255,255,255,0.12)" : "transparent",
                    boxShadow: active === l.id ? "0 2px 12px rgba(0,0,0,0.12)" : "none",
                  }}
                  onMouseEnter={e => { if (active !== l.id) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { if (active !== l.id) (e.currentTarget as HTMLElement).style.color = "#f2cc6a"; }}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* RIGHT SIDE: Contact + Lang toggle */}
        <div className="hidden md:flex ml-auto items-center gap-3">
          {/* LANG TOGGLE */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="font-coco font-extrabold text-xs px-3 py-2 rounded-xl border border-white/30 text-white/80 hover:border-[#f2cc6a] hover:text-[#f2cc6a] transition-all duration-200"
            title={lang === "fr" ? "Switch to English" : "Passer en français"}
          >
            {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </motion.button>

          {/* CONTACT */}
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToSection("Contact")}
            className="font-coco font-extrabold text-sm px-5 py-2.5 rounded-xl"
            style={{
              background: "linear-gradient(to right, #f2cc6a, rgba(255,255,255,0.8))",
              color: "#fff",
              border: "none",
              backdropFilter: "blur(8px)",
              boxShadow: "0 4px 18px rgba(242,204,106,0.35)",
              transition: "all 0.2s ease",
            }}
          >
            Contact
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/commande")}
            className="font-coco font-extrabold text-sm px-5 py-2.5 rounded-xl border border-[#f2cc6a]/50 text-[#f2cc6a] hover:bg-[#f2cc6a]/10 transition-all duration-200"
          >
            {t("Commander", "Order")}
          </motion.button>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden ml-auto text-white bg-gradient-to-r from-[#f2cc6a] to-white/80 p-2 rounded-md flex w-12 h-12 items-center justify-center"
        >
          <span className="text-2xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden backdrop-blur-md"
          >
            <ul className="flex flex-col gap-2 px-6 py-4">
              {links.map((l) => (
                <li key={l.label}>
                  <button
                    onClick={() => scrollToSection(l.id)}
                    className="w-full text-left font-coco font-extrabold px-3 py-2.5 rounded-xl transition-all duration-200 text-sm"
                    style={
                      isContact(l.label)
                        ? {
                          background: "linear-gradient(to right, #f2cc6a, rgba(255,255,255,0.8))",
                          color: "#fff",
                          boxShadow: "0 4px 14px rgba(242,204,106,0.35)",
                          border: "none",
                        }
                        : {
                          color: active === l.id ? "#fff" : "#f2cc6a",
                          background: active === l.id ? "rgba(255,255,255,0.12)" : "transparent",
                        }
                    }
                  >
                    {l.label}
                  </button>
                </li>
              ))}
              {/* Lang toggle mobile */}
              <li>
                <button
                  onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                  className="w-full text-left font-coco font-extrabold px-3 py-2.5 rounded-xl text-sm border border-white/20 text-white/70"
                >
                  {lang === "fr" ? "🇬🇧 Switch to English" : "🇫🇷 Passer en français"}
                </button>
              </li>
              <li>
                <button
                  onClick={() => { navigate("/commande"); setOpen(false); }}
                  className="w-full text-left font-coco font-extrabold px-3 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "linear-gradient(to right, #f2cc6a, rgba(255,255,255,0.8))",
                    color: "#fff",
                  }}
                >
                  {t("Commander", "Order")}
                </button>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;