import { ArrowRight } from 'lucide-react'

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


const HexagonCard = ({ image, title, category, description, tags, onSelect }: ProjectCardProps) => {
  return (
    <div
      onClick={() => onSelect(category)}
      className="hex group cursor-pointer"
    >
      <div
        className="hex-inner"
        style={{ backgroundImage: `url(${image})` }}
      >
        <div className="hex-overlay flex flex-col items-center justify-center text-center h-full w-full transition-all duration-300">

          {/* TITRE */}
          <h3 className="text-lg font-coco font-extrabold transition-colors duration-300 ">
            {title}
          </h3>

          {/* DESCRIPTION */}
          <p className="text-sm opacity-80 transition-colors duration-300 /90">
            {description}
          </p>

          {/* TAGS */}
          <div className="flex flex-wrap justify-center gap-2  text-xs">
            {tags.map((t, i) => (
              <span
                key={i}
                className="
                  px-2 py-0.5 rounded-full
                  bg-white/20 text-white
                  font-coco font-extralight italic
                  transition-all duration-300
                  group-hover:bg-linear-to-r from-[#f2cc6a] to-[#f2a500]                  
                "
              >
                {t}
              </span>
            ))}
          </div>

          {/* BOUTON ROND */}
          <span
            onClick={() => onSelect(category)}
            className="
              cursor-pointer
              mt-4
              w-10 h-10
              text-white
              rounded-full
              flex items-center justify-center
              bg-linear-to-r from-[#f2cc6a] to-[#f2a500]
              opacity-0 scale-75
              transition-all duration-300
              group-hover:opacity-100
              group-hover:scale-100
              hover:scale-110
            "
          >
            <ArrowRight size={24} strokeWidth={3} />
          </span>

        </div>
      </div>
    </div>
  );
};

export default HexagonCard;
