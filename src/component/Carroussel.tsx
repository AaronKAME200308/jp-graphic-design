import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Variants } from "framer-motion";
import { ALL_ITEMS } from "../data/carouselItems";
import type { GridItem } from "../data/carouselItems";

const slideVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 60 : -60,
    scale: 0.98,
  }),
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -60 : 60,
    scale: 0.98,
  }),
};

interface GridSlide {
  id: string;
  items: GridItem[];
}

interface CarouselProps {
  active: string;
}

const TITLES = [
  { title: "Event Posters", itemsPerSlide: 6 },
  { title: "Affiche", itemsPerSlide: 6 },
  { title: "Concert", itemsPerSlide: 3 },
  { title: "Identité visuel", itemsPerSlide: 4 },
  { title: "Retouche Photo", itemsPerSlide: 2 },
  { title: "Miniature", itemsPerSlide: 4 },
  { title: "Campagne Académique", itemsPerSlide: 5 },
  { title: "Dépliant Professionnel", itemsPerSlide: 8 },
  { title: "Présentation", itemsPerSlide: 4 },
];

// Découpe en slides
const chunkSlides = (items: GridItem[], size: number): GridSlide[] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => ({
    id: `slide-${i}`,
    items: items.slice(i * size, i * size + size),
  }));

// Composant Skeleton réutilisable
const ImageSkeleton = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 animate-pulse overflow-hidden">
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent shimmer"
    />
  </div>
);

export default function Carousel({ active }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [modalLoaded, setModalLoaded] = useState(false);

  // Détection mobile sécurisée
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getItemsPerSlide = (title: string) => {
    const config = TITLES.find((t) => t.title === title);
    if (!config) {
      console.warn(`Configuration non trouvée pour "${title}", utilisation du fallback`);
      return 6;
    }
    return isMobile ? 1 : config.itemsPerSlide;
  };

  const filteredItems = ALL_ITEMS.filter((item) => item.filter === active);
  const itemsPerSlide = getItemsPerSlide(active);
  
  // Mémoïsation des slides pour optimisation
  const CAROUSEL_SLIDES = useMemo(
    () => chunkSlides(filteredItems, itemsPerSlide),
    [filteredItems, itemsPerSlide]
  );

  // Reset index au changement de catégorie OU de mode mobile/desktop
  useEffect(() => {
    setCurrentSlide(0);
  }, [active, isMobile]);

  // Sécurité supplémentaire : si l'index dépasse après recalcul
  useEffect(() => {
    if (currentSlide >= CAROUSEL_SLIDES.length && CAROUSEL_SLIDES.length > 0) {
      setCurrentSlide(CAROUSEL_SLIDES.length - 1);
    }
  }, [CAROUSEL_SLIDES.length, currentSlide]);

  // Autoplay sécurisé
  useEffect(() => {
    if (!isAutoPlay || CAROUSEL_SLIDES.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, CAROUSEL_SLIDES.length]);

  // Navigation clavier
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (activeImage && e.key === "Escape") {
        closeModal();
        return;
      }
      
      if (CAROUSEL_SLIDES.length <= 1) return;
      
      if (e.key === "ArrowLeft") {
        handlePrevSlide();
      } else if (e.key === "ArrowRight") {
        handleNextSlide();
      }
    };
    
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeImage, CAROUSEL_SLIDES.length, currentSlide]);

  if (!CAROUSEL_SLIDES.length) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-500">
        Aucune image disponible pour cette catégorie
      </div>
    );
  }

  // Index sécurisé
  const safeIndex = Math.min(currentSlide, CAROUSEL_SLIDES.length - 1);
  const currentSlideData = CAROUSEL_SLIDES[safeIndex];

  // Handlers
  const handlePrevSlide = () => {
    setDirection(-1);
    setCurrentSlide((safeIndex - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length);
  };

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentSlide((safeIndex + 1) % CAROUSEL_SLIDES.length);
  };

  const closeModal = () => {
    setActiveImage(null);
    setModalLoaded(false);
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -50) {
      handleNextSlide();
    } else if (info.offset.x > 50) {
      handlePrevSlide();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1">
      <div className="w-full max-w-7xl flex items-center gap-4">
        {/* BOUTON PRÉCÉDENT */}
        <button
          onClick={handlePrevSlide}
          disabled={CAROUSEL_SLIDES.length <= 1}
          aria-label="Slide précédente"
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* CAROUSEL */}
        <div
          className="flex-1 overflow-hidden rounded-lg bg-gradient-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(false)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={safeIndex}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-[500px] p-2"
            >
              <div
                className={
                  isMobile
                    ? "flex h-full overflow-hidden"
                    : "grid gap-2 h-full grid-cols-4 grid-rows-4"
                }
              >
                {currentSlideData?.items?.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      setActiveImage(item.image);
                      setModalLoaded(false);
                    }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 25px 30px rgba(255,255,255,0.8)",
                    }}
                    className={`
                      rounded-lg overflow-hidden group cursor-pointer h-full
                      border-2 border-transparent hover:border-white
                      transition-all duration-300
                      ${isMobile ? "min-w-full" : "w-full"}
                    `}
                    style={
                      isMobile
                        ? {}
                        : {
                            gridColumn: `span ${item.colSpan}`,
                            gridRow: `span ${item.rowSpan}`,
                          }
                    }
                  >
                    <div className="relative w-full h-full">
                      {!loadedImages[item.image] && <ImageSkeleton />}

                      <img
                        src={item.image}
                        alt={item.id}
                        loading="lazy"
                        onLoad={() =>
                          setLoadedImages((prev) => ({
                            ...prev,
                            [item.image]: true,
                          }))
                        }
                        className={`
                          w-full h-full object-cover 
                          group-hover:scale-105 
                          transition-all duration-500
                          ${loadedImages[item.image] ? "opacity-100" : "opacity-0"}
                        `}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* BOUTON SUIVANT */}
        <button
          onClick={handleNextSlide}
          disabled={CAROUSEL_SLIDES.length <= 1}
          aria-label="Slide suivante"
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* INDICATEUR DE SWIPE MOBILE */}
      {isMobile && CAROUSEL_SLIDES.length > 1 && (
        <div className="sm:hidden text-center text-gray-600 text-xs mt-2">
          ← Glissez pour naviguer →
        </div>
      )}

      {/* DOTS MOBILE */}
      {CAROUSEL_SLIDES.length > 1 && (
        <div className="sm:hidden flex justify-center gap-2 mt-4 overflow-hidden max-w-full">
          {CAROUSEL_SLIDES.slice(
            Math.max(0, safeIndex - 2),
            Math.min(CAROUSEL_SLIDES.length, safeIndex + 3)
          ).map((_, index) => {
            const realIndex = Math.max(0, safeIndex - 2) + index;

            return (
              <motion.button
                key={realIndex}
                onClick={() => setCurrentSlide(realIndex)}
                aria-label={`Aller à la slide ${realIndex + 1}`}
                className="cursor-pointer rounded-full shrink-0"
                animate={{
                  width: realIndex === safeIndex ? 24 : 8,
                  height: 8,
                  backgroundColor:
                    realIndex === safeIndex
                      ? "rgba(242, 204, 106, 1)"
                      : "rgba(242, 204, 106, 0.4)",
                }}
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
      )}

      {/* COMPTEUR DESKTOP */}
      {!isMobile && CAROUSEL_SLIDES.length > 1 && (
        <div className="hidden sm:block text-center text-gray-600 text-sm mt-4">
          {safeIndex + 1} / {CAROUSEL_SLIDES.length}
        </div>
      )}

      {/* MODAL IMAGE */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <button
              onClick={closeModal}
              aria-label="Fermer l'aperçu"
              className="absolute top-4 right-4 text-white text-4xl hover:scale-110 transition-transform z-10"
            >
              ×
            </button>

            <div className="relative max-w-[90vw] max-h-[90vh]">
              {!modalLoaded && (
                <div className="absolute inset-0 rounded-lg bg-gray-700 animate-pulse" />
              )}

              <motion.img
                src={activeImage}
                alt="Aperçu agrandi"
                onLoad={() => setModalLoaded(true)}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`
                  max-w-full max-h-[90vh] 
                  object-contain rounded-lg 
                  transition-opacity duration-500
                  ${modalLoaded ? "opacity-100" : "opacity-0"}
                `}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}