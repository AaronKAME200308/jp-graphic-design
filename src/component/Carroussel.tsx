import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Variants } from "framer-motion"
import { ALL_ITEMS } from "../data/carouselItems"
import type { GridItem } from "../data/carouselItems"


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
}

interface GridSlide {
  id: string
  items: GridItem[]
}

interface CarouselProps {
  active: string
}

const TITLES = [
  { title: "Branding", itemsPerSlide: 6 },
  { title: "Affiche", itemsPerSlide: 6 },
  { title: "Concert", itemsPerSlide: 3 },
  { title: "Identité visuel", itemsPerSlide: 4 },
  { title: "Retouche Photo", itemsPerSlide: 2 },
  { title: "Miniature", itemsPerSlide: 4 },
  { title: "Campagne Académique", itemsPerSlide: 5 },
  { title: "Dépliant Professionnel", itemsPerSlide: 8 }
]

// 🔹 Découpe en slides de 6 max
const chunkSlides = (items: GridItem[], size = 6): GridSlide[] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, i) => ({
    id: `slide-${i}`,
    items: items.slice(i * size, i * size + size),
  }))

export default function Carousel({ active }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlay, setIsAutoPlay] = useState(true)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [direction, setDirection] = useState<1 | -1>(1)


  const getItemsPerSlide = (title: string) => {
    // Récupère la config du title
    const config = TITLES.find(t => t.title === title)
    if (!config) return 6 // valeur par défaut

    // Ajuste selon la taille de l’écran
    if (typeof window !== "undefined" && window.innerWidth <= 640) {
      return Math.min(1, config.itemsPerSlide) // mobile = 1 item par slide
    }

    return config.itemsPerSlide
  }


  useEffect(() => {
    const handleResize = () => {
      setCurrentSlide(0) // reset slide si le nombre change
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [active])


  const filteredItems = ALL_ITEMS.filter(item => item.filter === active)
  const itemsPerSlide = getItemsPerSlide(active)
  const CAROUSEL_SLIDES = chunkSlides(filteredItems, itemsPerSlide)


  useEffect(() => {
    setCurrentSlide(0)
  }, [active, itemsPerSlide])

  useEffect(() => {
    if (!isAutoPlay || CAROUSEL_SLIDES.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % CAROUSEL_SLIDES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isAutoPlay, CAROUSEL_SLIDES.length])

  if (!CAROUSEL_SLIDES.length) return null
  const currentSlideData = CAROUSEL_SLIDES[currentSlide]

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-1">
      <div className="w-full max-w-7xl flex items-center gap-4">

        {/* Bouton précédent */}
        <span
          onClick={() => {
            setDirection(-1)
            setCurrentSlide(
              (currentSlide - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length
            )
          }}

          className="sm:flex hidden items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" color='white' strokeWidth={2} />
        </span>

        {/* Carousel */}
        <div
          className="flex-1 overflow-hidden rounded-lg bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90"
          onMouseEnter={() => setIsAutoPlay(false)}
          onMouseLeave={() => setIsAutoPlay(true)}
        >
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full h-125 p-2"
            >

              <div
                className={`grid gap-2 h-full ${window.innerWidth <= 640
                  ? "grid-cols-1 grid-rows-1" // Mobile : 2 colonnes, 1 ligne
                  : "grid-cols-4 grid-rows-4" // Desktop : 4x4
                  }`}
              >
                {currentSlideData.items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    onClick={() => setActiveImage(item.image)}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    onDragEnd={(_event, info) => {
                      if (info.offset.x < -50) {
                        setDirection(1)
                        setCurrentSlide((currentSlide + 1) % CAROUSEL_SLIDES.length)
                      } else if (info.offset.x > 50) {
                        setDirection(-1)
                        setCurrentSlide(
                          (currentSlide - 1 + CAROUSEL_SLIDES.length) % CAROUSEL_SLIDES.length
                        )
                      }
                    }}

                    whileHover={{
                      borderWidth: 2,
                      borderColor: "white",
                      boxShadow: "0 25px 30px rgba(255, 255, 255, 0.8)",
                    }}
                    className="rounded-lg overflow-hidden group cursor-pointer w-full h-full"
                    style={{
                      gridColumn: `span ${window.innerWidth <= 640 ? 1 : item.colSpan
                        }`,
                      gridRow: `span ${window.innerWidth <= 640 ? 1 : item.rowSpan}`,
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.id}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </motion.div>
                ))}
              </div>


            </motion.div>
          </AnimatePresence>

        </div>

        {/* Bouton suivant */}
        <span
          onClick={() => {
            setDirection(1)
            setCurrentSlide((currentSlide + 1) % CAROUSEL_SLIDES.length)
          }}

          className="sm:flex hidden items-center justify-center w-10 h-10 rounded-full bg-linear-to-br from-[#f2cc6a] to-[#f2a500] text-white shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-5 h-5" />
        </span>
      </div>
      {/* INDICATEUR DE SLIDE – MOBILE */}
      <div className="sm:hidden flex justify-center gap-2 mt-4">
        {CAROUSEL_SLIDES.map((_, index) => (
          <motion.span
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="cursor-pointer rounded-full"
            animate={{
              width: index === currentSlide ? 24 : 8,
              height: 8,
              backgroundColor:
                index === currentSlide
                  ? "rgba(255,255,255,1)"
                  : "rgba(255,255,255,0.4)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        ))}
      </div>


      <AnimatePresence>
        {activeImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
          >
            <motion.img
              src={activeImage}
              alt="Preview"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>

  )
}
