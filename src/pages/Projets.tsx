import { useState, useRef, useEffect } from "react";
import HexagonCard from "../component/ProjectCard";
import type { ProjectProps } from "../component/ProjectCard";
import { motion, AnimatePresence } from "framer-motion";
import Carousel from "../component/Carroussel";
import { PanelsTopLeft, ChevronLeft, ChevronRight } from "lucide-react";

const filters = [
  "All",
  "Event Posters",
  "Affiche",
  "Concert",
  "Identité visuel",
  "Miniature",
  "Retouche Photo",
  "Campagne Académique",
  "Dépliant Professionnel",
  "Présentation",
];

const projects = {
  first: [
    { title: "Event Posters", category: "Event Posters", image: "/face8.JPG", description: "", tags: ["Party", "Flyer", "Social media"] },
    { title: "Affiche", category: "Affiche", image: "/face.jpeg", description: "", tags: ["Menu", "Sport", "Social media"] },
    { title: "Concert", category: "Concert", image: "/face1.jpeg", description: "", tags: ["Show", "Billets", "Social media"] },
    { title: "Identité visuel", category: "Identité visuel", image: "/face6.jpeg", description: "", tags: ["Logo", "Product visuals", "E-commerce"] },
    { title: "Miniature", category: "Miniature", image: "/face4.jpeg", description: "", tags: ["Youtube", "Visuals", "Social media"] },
  ],
  second: [
    { title: "Retouche Photo", category: "Retouche Photo", image: "/face3.jpeg", description: "", tags: ["Visuals", "Social media"] },
    { title: "Campagne Académique", category: "Campagne Académique", image: "/face2.jpeg", description: "", tags: ["Sortie Scolaire", "Communiqué"] },
    { title: "Dépliant Professionnel", category: "Dépliant Professionnel", image: "/face5.jpeg", description: "", tags: ["Entreprise", "Particulier", "E-commerce"] },
    { title: "Présentation", category: "Présentation", image: "/face7.JPG", description: "", tags: ["Projet", "Soutenance", "Exposé"] },
  ],
};

const Projects = () => {
  const [active, setActive] = useState("All");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const activeRef = useRef<HTMLButtonElement | null>(null);

  // Centrage automatique du filtre actif
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const item = activeRef.current;
      const containerCenter = container.offsetWidth / 2;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const scrollTo = itemCenter - containerCenter;
      container.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  }, [active]);

// Remplacez le useEffect de scroll (lignes 47-60) par celui-ci :

useEffect(() => {
  if (active !== "All") {
    // Petit délai pour laisser l'animation se terminer
    const timer = setTimeout(() => {
      // Scroll vers le début de la section (#Projets) au lieu du contenu
      const section = document.getElementById("Projets");
      if (section) {
        section.scrollIntoView({ 
          behavior: "smooth", 
          block: "start",
          inline: "nearest"
        });
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }
}, [active]);

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  const filterProjects = (list: ProjectProps[]): ProjectProps[] => {
    if (active === "All") return list;
    return list.filter((p: { category: string }) => p.category === active);
  };

  const handleSelect = (value: string) => {
    setActive(value);
    // ✅ Plus de scroll ici - géré par useEffect
  };

  return (
    <section id="Projets" className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-14 md:py-16 overflow-hidden">

      {/* TITRE */}
      <motion.div
        initial={{ translateY: 10, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        className="mx-auto mb-12 w-fit px-3 py-2 border-2 border-[#f2cc6a] rounded-full text-2xl font-bold text-center bg-gradient-to-r from-black via-black/80 to-black/60"
      >
        <div className="flex items-center gap-2">
          <PanelsTopLeft className="w-5 h-5 text-[#f2cc6a]" />
          <span className="font-coco font-extrabold">Projets</span>
        </div>
      </motion.div>

      {/* FILTERS */}
      {active !== "All" && (
        <div className="w-full flex items-center justify-center gap-2 mb-12 overflow-hidden relative">

          {/* FLÈCHE GAUCHE */}
          <button
            onClick={scrollLeft}
            aria-label="Défiler vers la gauche"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>

          {/* CONTENEUR SCROLL */}
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 0.3 }}
            className="relative flex gap-2 overflow-x-auto whitespace-nowrap scroll-smooth scrollbar-hide"
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => handleSelect(f)}
                ref={active === f ? activeRef : null}
                aria-label={`Filtrer par ${f}`}
                aria-pressed={active === f}
                className="shrink-0 relative"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition-all duration-300
                    ${active === f
                      ? "bg-gradient-to-r from-[#f2cc6a] to-white/90 text-black shadow-[0_0_15px_rgba(242,204,106,0.4)]"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                >
                  {f}
                  {active === f && (
                    <motion.span
                      layoutId="active-filter-underline"
                      className="absolute left-0 right-0 bottom-0 h-1 bg-[#f2cc6a] rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    />
                  )}
                </motion.div>
              </button>
            ))}
          </motion.div>

          {/* FLÈCHE DROITE */}
          <button
            onClick={scrollRight}
            aria-label="Défiler vers la droite"
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* GRID / CAROUSEL - avec ref pour le scroll */}
        <AnimatePresence mode="wait">
          {active === "All" && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, translateY: 30 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="flex flex-wrap justify-center gap-x-3"
            >
              {/* ROW 1 */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
                {filterProjects(projects.first).map((project, i: number) => (
                  <HexagonCard
                    key={`first-${i}`}
                    {...project}
                    onSelect={handleSelect}
                  />
                ))}
              </div>

              {/* ROW 2 */}
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 mt-4 md:-mt-10">
                {filterProjects(projects.second).map((project, i: number) => (
                  <HexagonCard
                    key={`second-${i}`}
                    {...project}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* CARROUSEL APRÈS FILTRE */}
          {active !== "All" && (
            <motion.div
              key="carousel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="w-full"
            >
              <Carousel active={active} />
            </motion.div>
          )}
        </AnimatePresence>
    </section>
  );
};

export default Projects;