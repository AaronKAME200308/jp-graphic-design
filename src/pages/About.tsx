import { motion } from "framer-motion";
import { Sparkle } from "lucide-react";
import type { Variants } from "framer-motion";
import { useLang } from "../context/LanguageContext";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15, ease: "easeOut" } },
};

const childVariants: Variants = {
  hiddenLeft: { opacity: 0, translateX: -60 },
  hiddenRight: { opacity: 0, translateX: 60 },
  show: { opacity: 1, translateX: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const About = () => {
  const { t } = useLang();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id={t("A propos", "About")}
      className="w-full max-w-full mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-14 md:py-16 overflow-hidden"
    >
      {/* TITRE */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-16 w-fit px-4 py-2 border border-[#f2cc6a]/60 rounded-full text-2xl font-bold bg-linear-to-r from-black via-black/80 to-black/60"
      >
        <div className="flex items-center gap-2">
          <Sparkle className="w-5 h-5 text-[#f2cc6a]/90" />
          <span className="font-coco font-extrabold">{t("À propos", "About me")}</span>
        </div>
      </motion.div>

      {/* GRID */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
      >
        {/* BLOC TEXTE */}
        <motion.div
          variants={childVariants}
          initial="hiddenLeft"
          whileInView="show"
          viewport={{ once: true }}
          className="space-y-6"
        >
          <p className="text-white leading-relaxed">
            <span className="float-left mr-1 text-6xl font-coco font-extrabold bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 leading-none">
              {t("Hello", "Hello")}
            </span>
            {t(
              "Je suis Jean Pascal, créateur d'identité visuelle et designer freelance. Depuis plus de",
              "I am Jean Pascal, a visual identity creator and freelance designer. For more than"
            )}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90"> {t("2 ans", "2 years")}</span>
            {t(
              ", j'accompagne des entrepreneurs, marques et entreprises dans la construction d'une image forte, cohérente et mémorable. À ce jour, j'ai réalisé plus de",
              ", I have been helping entrepreneurs, brands and businesses build a strong, consistent and memorable image. To date, I have completed more than"
            )}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90"> {t("200 projets", "200 projects")}</span>
            {t(
              " en collaborant avec des structures et porteurs de projets venant de plusieurs pays à travers le monde. Mon approche va au-delà de l'esthétique, je conçois des identités visuelles pensées pour impacter, positionner et différencier. J'accompagne également plusieurs personnes à générer leurs premiers revenus grâce aux compétences acquises dans mes formations. Aujourd'hui, je cumule plus de",
              " working with organizations and project holders from multiple countries around the world. My approach goes beyond aesthetics — I design visual identities built to impact, position, and differentiate. I also coach people to earn their first income through the skills gained in my training programs. Today, I have accumulated more than"
            )}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90"> {t("100 abonnés", "100 followers")}</span>
            {t(
              " sur mes réseaux sociaux, notamment TikTok et Instagram.",
              " across my social media platforms, including TikTok and Instagram."
            )}
          </p>
          <button
            onClick={() => scrollToSection(t("Projets", "Projects"))}
            className="inline-flex items-center gap-2 rounded-full px-7 py-3 border border-[#f2cc6a] text-black/60 bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 font-medium shadow hover:scale-105 transition-transform duration-300"
          >
            {t("Découvrir mes projets", "Discover my projects")}
          </button>
        </motion.div>

        {/* VISUEL */}
        <motion.div
          variants={childVariants}
          initial="hiddenRight"
          whileInView="show"
          viewport={{ once: true }}
          className="relative flex justify-center"
        >
          <div className="relative w-[320px] md:w-90 aspect-square">
            <div className="absolute -left-10 bottom-[-10%] w-[80%] h-[80%] bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 rounded-[58%_42%_45%_55%/55%_45%_55%_45%] z-0"/>
            <motion.div
              animate={{ translateY: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full h-full overflow-hidden rounded-[58%_42%_45%_55%/55%_45%_55%_45%]"
            >
              <img
                src="jpstand.png"
                alt="About"
                className="w-110 h-110 object-contain"
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default About;