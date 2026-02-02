import { useState } from "react";
import HexagonCard from "../component/ProjectCard";
import type { ProjectProps } from "../component/ProjectCard";
import { motion } from "framer-motion";
import Carousel from "../component/Carroussel"
import { PanelsTopLeft } from "lucide-react";

const filters = [
  "All",
  "Branding",
  "Concert",
  "Affiche",
  "Identité visuel",
  "Miniature",
  "Retouche Photo",  
  "Campagne Académique",
  "Dépliant Professionnel",
  "Présentation"
];

const projects = {
  first: [
    {
      title: "Conception Flyers",
      category: "Branding",
      image: "/face.jpeg",
      description: "",
      tags: ["Visuals", "Social media"],
    },
    {
      title: "Affiche",
      category: "Affiche",
      image: "/face.jpeg",
      description: "",
      tags: ["Logo", "Product visuals", "E-commerce"],
    },
    {
      title: "Concert",
      category: "Concert",
      image: "/face1.jpeg",
      description: "",
      tags: ["Show", "After", "Social media"],
    },
    {
      title: "Identité visuel",
      category: "Identité visuel",
      image: "/face6.jpeg",
      description: "",
      tags: ["Logo", "Product visuals", "E-commerce"],
    },
    {
      title: "Miniature",
      category: "Miniature",
      image: "/face4.jpeg",
      description: "",
      tags: ["Youtube", "Visuals", "Social media"],
    }
  ],
  second: [
    {
      title: "Retouche Photo",
      category: "Retouche Photo",
      image: "/face3.jpeg",
      description: "",
      tags: ["Visuals", "Social media"],
    },
    {
      title: "Campagne Académique",
      category: "Campagne Académique",
      image: "/face2.jpeg",
      description: "",
      tags: ["Sortie Scolaire", "Evènement", "Communiqué"],
    },
    {
      title: "Dépliant Professionnel",
      category: "Dépliant Professionnel",
      image: "/face5.jpeg",
      description: "",
      tags: ["Entreprise", "Particulier", "E-commerce"],
    }, {
      title: "Présentation",
      category: "Présentation",
      image: "",
      description: "",
      tags: ["Projet", "Soutenance", "Exposé"],
    },
  ],
};


const Projects = () => {
  const [active, setActive] = useState("All");


  const filterProjects = (list: ProjectProps[]): ProjectProps[] => {
    if (active === "All") return list;
    return list.filter((p: { category: string; }) => p.category === active);
  };
  return (
    <main className="max-w-7xl mx-auto px-6 py-20">
      {/* TITRE */}
      <div className="flex items-center-safe bg-linear-to-t from-black to-transparent">

      </div>
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-12 w-fit px-3 py-2 border-2 border-[#f2cc6a]  rounded-full text-2xl font-bold text-center bg-linear-to-r from-black via-black/80 to-black/60"
      >
        <div className="flex items-center gap-2">
          <PanelsTopLeft className="w-5 h-5 text-[#f2cc6a]" />
          <span className="font-coco font-extrabold">Projets</span>
        </div>
      </motion.div>
      {/* FILTERS */}

      {active !== "All" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-1 justify-center mb-12"
        >
          {filters.map((f) => (
            <button key={f} onClick={() => setActive(f)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`px-4 py-1 rounded-full text-sm font-medium
            transition-all duration-300
            ${active === f
                    ? "bg-linear-to-r from-[#f2cc6a] to-white/90 text-black shadow-[0_0_15px_rgba(242,204,106,0.4)]"
                    : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
              >
                {f}
              </motion.div>
            </button>
          ))}
        </motion.div>
      )}


      {/* GRID */}
      <div className="flex flex-wrap justify-center gap-x-3 ">
        {active === "All" && (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-wrap justify-center gap-x-3"
          >
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6">
              {filterProjects(projects.first).map((project, i: number) => (
                <HexagonCard key={`first-${i}`} {...project} onSelect={(value) => setActive(value)} />
              ))}
            </div>

            {/* ROW 2 */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-6 -mt-10">
              {filterProjects(projects.second).map((project, i: number) => (
                <HexagonCard key={`second-${i}`} {...project} onSelect={(value) => setActive(value)} />
              ))}
            </div>
          </motion.div>)}
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
          </motion.div>)}
      </div>
    </main>
  );
};

export default Projects;
