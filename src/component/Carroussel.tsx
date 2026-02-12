import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ALL_ITEMS } from "../data/carouselItems";
import type { GridItem } from "../data/carouselItems";
import type { Variants } from "framer-motion";

const slideVariants: Variants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 30 : -30,
  }),
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -30 : 30,
    transition: { duration: 0.25 },
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
  { title: "Branding", itemsPerSlide: 6 },
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

export default function Carousel({ active }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [isMobile, setIsMobile] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [modalLoaded, setModalLoaded] = useState(false);

  const ImageSkeleton = () => (
    <div className="absolute inset-0 bg-gray-300 animate-pulse overflow-hidden" />
  );

  // détection mobile
  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth <= 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getItemsPerSlide = (title: string) => {
    const config = TITLES.find((t) => t.title === title);
    if (!config) return 6;
    return isMobile ? 1 : config.itemsPerSlide;
  };

  const filteredItems = ALL_ITEMS.filter((item) => item.filter === active);
  const itemsPerSlide = getItemsPerSlide(active);
  const CAROUSEL_SLIDES = chunkSlides(filteredItems, itemsPerSlide);

  // reset index quand le filtre change
  useEffect(() => {
    setCurrentSlide(0);
  }, [active, itemsPerSlide]);

  // autoplay
  useEffect(() => {
    if (!isAutoPlay || CAROUSEL_SLIDES.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, CAROUSEL_SLIDES.length]);

  if (!CAROUSEL_SLIDES.length) return null;

  const safeIndex = Math.min(currentSlide, CAROUSEL_SLIDES.length - 1);
  const currentSlideData = CAROUSEL_SLIDES[safeIndex];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1">
      <div className="w-full max-w-7xl flex items-center gap-4">
        {/* PREV */}
        <span
          onClick={() => {
            setDirection(-1);
            setCurrentSlide(
              (safeIndex - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length
            );
          }}
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </span>

        {/* CAROUSEL */}
        <div
          className="flex-1 overflow-hidden rounded-lg bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90"
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
              className="w-full h-125 p-2 transform-gpu will-change-transform"
            >
              <div
                className={
                  isMobile
                    ? "flex h-full gap-2"
                    : "grid gap-2 h-full grid-cols-4 grid-rows-4"
                }
              >
                {currentSlideData?.items?.map((item) => (
                  <motion.div
                    key={item.id}
                    layout={!isMobile}
                    drag={isMobile ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={isMobile ? 0.1 : 0.3}
                    dragMomentum={false}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -50) {
                        setDirection(1);
                        setCurrentSlide(
                          (safeIndex + 1) % CAROUSEL_SLIDES.length
                        );
                      } else if (info.offset.x > 50) {
                        setDirection(-1);
                        setCurrentSlide(
                          (safeIndex - 1 + CAROUSEL_SLIDES.length) %
                            CAROUSEL_SLIDES.length
                        );
                      }
                    }}
                    onClick={() => setActiveImage(item.image)}
                    whileHover={
                      !isMobile
                        ? {
                            borderWidth: 2,
                            borderColor: "white",
                            boxShadow: "0 25px 30px rgba(255,255,255,0.8)",
                          }
                        : {}
                    }
                    className="rounded-lg overflow-hidden group cursor-pointer w-full h-full"
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
                        decoding="async"
                        onLoad={() =>
                          setLoadedImages((prev) => ({
                            ...prev,
                            [item.image]: true,
                          }))
                        }
                        className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500
                      ${loadedImages[item.image] ? "opacity-100" : "opacity-0"}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* NEXT */}
        <span
          onClick={() => {
            setDirection(1);
            setCurrentSlide((safeIndex + 1) % CAROUSEL_SLIDES.length);
          }}
          className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-5 h-5" />
        </span>
      </div>

      {/* DOTS MOBILE */}
      <div className="sm:hidden flex justify-center gap-2 mt-4 overflow-hidden max-w-full">
        {CAROUSEL_SLIDES.slice(
          Math.max(0, safeIndex - 2),
          Math.min(CAROUSEL_SLIDES.length, safeIndex + 3)
        ).map((_, index) => {
          const realIndex = Math.max(0, safeIndex - 2) + index;
          return (
            <motion.span
              key={realIndex}
              onClick={() => setCurrentSlide(realIndex)}
              className="cursor-pointer rounded-full shrink-0"
              animate={{
                width: realIndex === safeIndex ? 24 : 8,
                height: 8,
                backgroundColor:
                  realIndex === safeIndex
                    ? "rgba(255,255,255,1)"
                    : "rgba(255,255,255,0.4)",
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>

      {/* MODAL IMAGE */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
          >
            <div className="relative">
              {!modalLoaded && (
                <div className="absolute inset-0 rounded-lg bg-gray-300 animate-pulse" />
              )}
              <motion.img
                src={activeImage}
                alt="Preview"
                onLoad={() => setModalLoaded(true)}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className={`max-w-[90vw] max-h-[90vh] object-contain rounded-lg transition-opacity duration-500
                 ${modalLoaded ? "opacity-100" : "opacity-0"}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
