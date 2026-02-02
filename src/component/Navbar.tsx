import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const links = [
  { label: "Accueil", to: "/" },
  { label: "Compétences", to: "/skills" },
  { label: "Projets", to: "/projects" },  
  { label: "Contact", to: "/contact" },
];


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Accueil");

 useEffect(() => {
  const onScroll = () => {
    const sections = document.querySelectorAll("section");
    let current = "Home";

    sections.forEach((section) => {
      if (section.getBoundingClientRect().top <= 120) {
        current = section.id;
      }
    });

    setActive(current);
  };

  window.addEventListener("scroll", onScroll);
  return () => window.removeEventListener("scroll", onScroll);
}, []);



  const scrollToSection = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const linkClass = (id: string) =>
    `font-coco font-extrabold px-3 py-2 rounded-md transition-all ${active === id
      ? "bg-white/10 text-white shadow-sm hover:text-white"
      : "text-[#f2cc6a] hover:text-white "
    }`;

  return (
    <header className="backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-2">

        {/* LOGO */}
        <motion.p
          initial={{ scale: 0.98, opacity: 0.9 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="text-2xl font-coco font-extrabold tracking-wide bg-clip-text text-transparent bg-[#f2cc6a]"
        >
          JP
          <span className="font-coco font-extralight text-sm ml-2 text-white/70">
            Graphic Design
          </span>
        </motion.p>

        {/* DESKTOP NAV */}
        <nav className="hidden md:block">
          <ul className="flex gap-6 items-center text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <button
                  className={linkClass(l.label)}
                  onClick={() => scrollToSection(l.label)}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white bg-linear-to-r from-[#f2cc6a] to-white/80 p-2 rounded-md"
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
                    onClick={() => scrollToSection(l.label)}
                    className={`w-full text-left ${linkClass(l.label)}`}
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.nav>          
        )}
      </AnimatePresence>
    </header>
  );
};
export default Navbar;
