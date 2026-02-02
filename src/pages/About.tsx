import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";

const About = () => {
  return (
    <div className="max-w-8xl mx-auto px-6 py-20">
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
        <div
          style={{ backgroundImage: "url('/aigle2.svg')" }}
          className="relative h-full min-h-80 rounded-2xl bg-cover bg-center overflow-hidden"
        >About
          {/* overlay flou */}
          <div className="absolute inset-0 backdrop-blur-md bg-black/50" />

          {/* contenu */}
          <div className="relative z-10 p-8 text-white">
            <p className="text-lg leading-relaxed font-extrabold italic">
              <span className="float-left mr-1 text-6xl font-coco font-extrabold text-[#f2cc6a] leading-none">
                Hello
              </span>
              Je suis Jean Pascal, créateur d'identité visuelle et designer freelance.
              J'ai plus de 2 ans d'expériences, avec plus de 200 projets réalisé pour des clients et des entreprises.
              Je travaille avec des clients de hauts niveau dans plus de deux pays dans à travers le monde.
            </p>
          </div>
        </div>

        {/* BLOC IMAGE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full h-80 rounded-2xl overflow-hidden border border-white/10"
        >
          <img
            src="/profile.jpg"
            alt="About illustration"
            className="w-full h-full object-cover"
          />
        </motion.div>

      </div>
    </div>
  );
};

export default About;
