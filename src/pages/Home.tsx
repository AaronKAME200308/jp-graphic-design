import { motion } from "framer-motion";

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const buttonHover = { scale: 1.03 };

const Home = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div
  className="
    w-full
    max-w-7xl
    mx-auto
    px-4
    sm:px-6
    md:px-8
    lg:px-12
    xl:px-16
    py-12
    sm:py-14
    md:py-16
    overflow-hidden
  "
>

      {/* HERO */}
      <div className="flex justify-center items-center text-center">
        <motion.div
          initial="hidden"
          animate="show"
          variants={heroVariants}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          {/* TITRE */}
          <h2 className="text-5xl leading-tight mb-4">
            <span className="block font-coco font-extralight bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] to-white/90">
              Bienvenue Chez
            </span>
            <span
              style={{
                transform: "skewY(-2deg)",
              }}
              className="block p-1 bg-linear-to-r from-[#f2cc6a] to-white/90"
            >
              <p className="font-coco font-extrabold text-black/90">
                {" "}
                JP GRAPHIC DESIGN
              </p>
            </span>
          </h2>

          {/* TEXTE */}
          <p className="font-coco font-extralight italic mt-5 text-lg text-white/85 mb-1">
            Créateur d'identité visuel - Designer
          </p>

          {/* IMAGE */}
          <div className="relative mb-8 w-100 h-100 flex items-center justify-center">
            {/* Glow effect derrière l'image */}
            <motion.div
              initial={{
                boxShadow: "0 0 30px rgba(242, 204, 106, 0.35)",
              }}
              animate={{
                boxShadow: "0 0 70px rgba(236, 255, 29, 0.6)",
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatDelay: 0.6,
                ease: "easeInOut",
              }}
              className="absolute inset-0 rounded-full pointer-events-none blur-2xl"
            />

            {/* Image */}
            <motion.img
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src="/jp-full.png"
              alt="Portrait"
              className="relative w-100 h-100 object-contain rounded-full"
            />
          </div>

          {/* BOUTONS */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button onClick={() => scrollToSection("Projets")}>
              <motion.div
                whileHover={buttonHover}
                className="font-coco font-extrabold px-6 py-3 rounded-full bg-linear-to-r from-[#f2cc6a] to-white/90 text-black/60 shadow-lg"
              >
                Voir mes projets
              </motion.div>
            </button>

            <button onClick={() => scrollToSection("Contact")}>
              <motion.div
                whileHover={buttonHover}
                className="font-coco font-extrabold px-6 py-3 rounded-full border border-white/30 text-white/85"
              >
                Me contacter
              </motion.div>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
