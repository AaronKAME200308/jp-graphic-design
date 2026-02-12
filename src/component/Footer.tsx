import {FaWhatsapp, FaInstagram, FaLinkedin } from "react-icons/fa"

import { motion } from "framer-motion";

const logos = [
  "/logo1.jpeg",
  "/logo2.png",
  "/logo3.png",
  "/logo4.jpeg",
  "/logo5.jpeg",
  "/logo6.jpeg",
  "/logo7.jpeg",
  "/logo8.png",
  "/logo9.png",
  "/logo10.png",
  "/logo11.png",
  "/logo12.jpeg",
  "/logo13.jpeg",
  "/logo14.jpeg",
  "/logo15.jpeg",
  "/logo16.jpeg",
];

const Footer = () => {
  return (
    <footer className="mt-auto w-full">
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
      py-6
      text-center
      bg-linear-to-r from-black/80 via-black to-black/80
    "
  >

       

        {/* Réseaux sociaux */}
        <div className="flex justify-center gap-6 mb-3">
          <a
            href="https://wa.me/237673846813"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-all duration-300 hover:scale-125 hover:opacity-90"
          >
            <FaWhatsapp size={28} strokeWidth={1.8} color="white"/>
          </a>

          <a
            href="https://www.instagram.com/jp_graphic_design/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-all duration-300 hover:scale-125 hover:opacity-90"
          >
            <FaInstagram size={28} strokeWidth={1.8} color="white" />
          </a>

          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white transition-all duration-300 hover:scale-125 hover:opacity-90"
          >
            <FaLinkedin size={28} strokeWidth={1.8} color="white" />
          </a>
        </div>

        {/* Copyright */}
        <p className="text-xm opacity-95 text-white">
          © {new Date().getFullYear()} Olinga Njoya Jean Pascal — Tous droits réservés.
        </p>

    <div className="mt-6 font-coco font-extrabold">
          <span> Nos Collaborations</span>
        </div>
         {/* LOGOS DÉROULANTS */}
      <div className="mt-2 overflow-hidden py-2 bg-white">
        
        <motion.div
          className="flex gap-11 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            repeat: Infinity,
            duration: 25,
            ease: "linear",
          }}
          whileHover={{ animationPlayState: "paused" }} // UX bonus
        >
          {[...logos, ...logos].map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt="logo"
              className="h-10 w-auto transition"
            />
          ))}
        </motion.div>
      </div>
      </div>
    </footer>
    
  );
};

export default Footer;

