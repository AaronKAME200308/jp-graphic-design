import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

export interface ProjectProps {
  title: string;
  category: string;
  image: string;
  description: string;
  tags: string[];
}
export interface ProjectCardProps extends ProjectProps {
  onSelect: (value: string) => void;
}


const HexagonCard = ({ image, title, category, tags, onSelect }: ProjectCardProps) => {
    const [isHover, setIsHover] = useState(false);

 return (
    <div
      onClick={() => onSelect(category)}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      className="hex group cursor-pointer"
    >
      <div
        className="hex-inner"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="hex-overlay flex flex-col items-center justify-center text-center h-full w-full">

          {/* TITRE */}
          <h3 className="text-lg font-coco font-extrabold transition-all duration-300">
            {title}
          </h3>

          {/* TAGS avec animation */}
          <AnimatePresence>
            {isHover && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="mt-3 flex flex-wrap justify-center gap-2 text-xs"
              >
                {tags.map((t, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-full bg-white/20 text-white font-coco font-extralight italic group-hover:bg-linear-to-r from-[#f2cc6a] to-[#f2a500] transition"
                  >
                    {t}
                  </span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* BOUTON */}
          <span
            onClick={() => onSelect(category)}
            className="mt-4 w-10 h-10 text-white rounded-full flex items-center justify-center bg-linear-to-r from-[#f2cc6a] to-[#f2a500] transition-transform duration-300 hover:scale-110"
          >
            <ArrowRight size={24} strokeWidth={3} />
          </span>

        </div>
      </div>
    </div>
  );
};

export default HexagonCard;
