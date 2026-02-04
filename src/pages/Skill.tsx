import { motion } from "framer-motion";
import { useState } from "react";
import CircularProgress from "../component/CircleProgress";
import { Sparkle } from "lucide-react";

const logos = [
  { Icon: "/photoshop-svgrepo-com.svg", percent: 100, name: "Photoshop" },
  { Icon: "/canva-svgrepo-com.svg", percent: 100, name: "Canva" },
  { Icon: "/illustrator-svgrepo-com.svg", percent: 99, name: "Illustrator" },
  { Icon: "/indesign-svgrepo-com.svg", percent: 98, name: "Indesign" },
  { Icon: "/capcut-svgrepo-com.svg", percent: 90, name: "Capcut" },
  { Icon: "/brand-microsoft-powerpoint-svgrepo-com.svg", percent: 96, name: "PowerPoint" },
];

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 10 },
  show: { opacity: 1, scale: 1, y: 0 },
};

const Skill = () => {
  const [startProgress, setStartProgress] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-6 py-20">

      {/* TITRE */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        className="mx-auto mb-12 w-fit px-3 py-2 border border-[#f2cc6a]/60 rounded-full text-2xl font-bold bg-linear-to-r from-black via-black/80 to-black/60"
      >
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-[#f2cc6a]/90" />
          <span className="font-coco font-extrabold">Compétences</span>
        </div>
      </motion.div>

      {/* LOGOS + PROGRESS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        onAnimationComplete={() => setStartProgress(true)}
        className="grid grid-cols-2 sm:grid-cols-3 gap-10 place-items-center"
      >
        {logos.map(({ Icon, percent, name }, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="flex flex-col items-center gap-4"
          >
            {/* LOGO */}
            <div
              className="
                flex flex-col items-center
                mb-5 w-16 h-16
                text-white/70
                hover:text-[#f2cc6a]
                transition
                hover:scale-110
                hover:drop-shadow-[0_0_12px_rgba(242,204,106,0.8)]
              "
            >
              <img src={Icon} alt={name} />
              <span className="text-sm mt-1">{name}</span>
            </div>

            {/* CERCLE */}
            <CircularProgress
              percentage={percent}
              size={90}
              start={startProgress}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Skill;
