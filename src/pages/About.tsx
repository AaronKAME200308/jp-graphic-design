import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

const About = () => {
    const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      {/* TITRE */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-16 w-fit px-4 py-2 border border-[#f2cc6a]/60 rounded-full text-2xl font-bold bg-linear-to-r from-black via-black/80 to-black/60"
      >
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-[#f2cc6a]/90" />
          <span className="font-coco font-extrabold">À propos</span>
        </div>
      </motion.div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">


        {/* BLOC TEXTE */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <p className=" text-white leading-relaxed">
            <span className="float-left mr-1 text-6xl font-coco font-extrabold bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 leading-none">
              Hello
            </span>
            Je suis Jean Pascal, créateur d'identité visuelle et designer freelance.
            J'ai plus de <span className="bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90">2 ans d'expériences</span>, avec plus de <span className="bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90">200 projets</span> réalisés pour des clients et des entreprises.
            Je travaille avec des clients de hauts niveau dans plus de deux pays à travers le monde.
            J'accompagne également plusieurs personnes à générer leurs premiers revenu grâce aux compétences acquises dans mes formations.
            Ajourd'hui, je cumule plus de <span className="bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90">100 abonnés</span> sur mes réseaux sociaux, notament TikTok et Instagram.
          </p>
          <button onClick={() => scrollToSection("Projets")} className="inline-flex items-center gap-2 rounded-full px-7 py-3border-[#f2cc6a] text-black/60 bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 font-medium shadow hover:scale-105 transition">
            Découvrir mes projets
          </button>
        </motion.div>

        {/* VISUEL */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="relative flex justify-center"
        >
          
          <div className="relative w-[320px] md:w-90 aspect-square">
            {/*Arc */}
            <div className="absolute -left-10 bottom-[-10%] w-[80%] h-[80%] bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 rounded-[58%_42%_45%_55%/55%_45%_55%_45%] z-0"/>
              
            <motion.div
              animate={{y:[0,-10,0]}}
              transition={{duration:6, repeat:Infinity,ease:"easeInOut"}}
              className="relative z-10 w-full h-full overflow-hidden rounded-[58%_42%_45%_55%/55%_45%_55%_45%]"              
            >
              <img
                src="jpstand.png"
                alt="About"
                className="w-110 h-110 object-contain"
              />

            </motion.div>
            {/* */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
