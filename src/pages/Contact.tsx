import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { PhoneIcon, Globe } from "lucide-react";
import {FaWhatsapp, FaInstagram } from "react-icons/fa"
import emailjs from '@emailjs/browser'
export default function Contact() {
  const formRef = useRef<HTMLFormElement>(null)
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setLoading(true);
    emailjs.sendForm(
      "service_ip3go6i",
      "template_cn0y05l",
      formRef.current,
      "1OjTIqeyHVDAwjRlz")
      .then(
        () => {
          setStatus('Message envoyé ✅');          
          formRef.current?.reset()
        },
        () => {
          setStatus('Erreur lors de l’envoi ❌');
        }
      )
      .finally(() => setLoading(false));
  };


  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* TITRE */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mx-auto mb-12 w-fit px-3 py-2 border-2 border-[#f2cc6a] rounded-full text-2xl font-bold text-center bg-linear-to-r from-black via-black/80 to-black/60"
      >
        <div className="flex items-center gap-2 ">
          <Globe className="w-5 h-5 text-[#f2cc6a]" />
          <span className='font-coco font-extrabold '>Contact</span>
        </div>
      </motion.div>
      <motion.p
        animate={{ rotate: [0, -1, 1, -1, 1, 0] }}
        whileHover={{ x: 0 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 2, ease: "easeInOut" }}
        className="text-white/80 mb-8 text-base sm:text-lg"
      >
        Arrête de chercher, tu as trouvé le meilleur. Envoie ton message et regarde la magie opérer.
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Formulaire */}
        <motion.form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white/5 p-6 rounded-2xl border-2 border-[#f2cc6a] shadow-md space-y-2"
        >
          <input
            required
            name="name"
            placeholder="Ton nom"
            className="w-full p-3 rounded-md bg-transparent border border-[#f2cc6a] outline-none"
          />
          <input
            required
            type="email"
            name="email"
            placeholder="Ton email"
            className="w-full p-3 rounded-md bg-transparent border border-[#f2cc6a] outline-none"
          />
          <textarea
            required
            name="message"
            rows={6}
            placeholder="Ton message"
            className="w-full p-3 rounded-md bg-transparent border border-[#f2cc6a] outline-none"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-3 rounded-md border border-[#f2cc6a] text-black/60 bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90 font-medium shadow hover:scale-105 transition"
          >
            {loading ? "Envoi..." : "Envoyer"}

          </button>
          {status && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-2 text-sm ${status.includes('✅') ? 'text-green-400' : 'text-red-400'}`}
            >
              {status}
            </motion.p>
          )}


        </motion.form>

        {/* Section SVG + contact */}
        <div
          className="w-full  border-2 border-[#f2cc6a] bg-no-repeat bg-center bg-cover rounded-2xl relative h-80 sm:h-auto"
          style={{ backgroundImage: `url('/aigle2.svg')` }}
        >
          <div className="absolute bottom-4 right-4 flex flex-col space-y-4 text-white/70">
          <motion.div
              whileHover={{ scale: 1.03, translateY: -6 }}
              className="w-70 relative flex items-center gap-3 rounded-xl overflow-hidden group cursor-pointer"
            >
              <span
                className="
                  absolute left-0 top-0 h-full w-12 
                  bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90
                  rounded-xl
                  transition-all duration-300 ease-out
                  group-hover:w-full
              "
              />
              <a
                href="https://wa.me/237673846813"
                className="relative flex items-center gap-3 z-10 text-white transition-colors group-hover:text-white/90"
              >
                <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl">
                  <FaWhatsapp size={30} color="white" />
                </div>
                <span>+237 673 846 813 </span>
              </a>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03, translateY: -6 }}
              className="w-70 relative flex items-center gap-3 rounded-xl overflow-hidden group cursor-pointer"
            >
              <span
                className="
                  absolute left-0 top-0 h-full w-12 
                  bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90
                  rounded-xl
                  transition-all duration-300 ease-out
                  group-hover:w-full
              "
              />
              <a
                href="https://www.instagram.com/jp_graphic_design/"
                className="relative flex items-center gap-3 z-10 text-white transition-colors group-hover:text-white/90"
              >
                <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl">
                  <FaInstagram size={30} color="white" />
                </div>
                <span>jp_graphic_design</span>
              </a>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, translateY: -6 }}
              className="w-70 relative flex items-center gap-3 rounded-xl overflow-hidden group cursor-pointer"
            >
              <span
                className="
                    absolute left-0 top-0 h-full w-12 
                    bg-linear-to-r from-[#f2cc6a] via-[#f2cc6a] to-white/90
                    rounded-xl
                    transition-all duration-300 ease-out
                    group-hover:w-full
                "
              />
              <a
                href="tel:contact@monportfolio.fr"
                className="relative flex items-center gap-3 z-10 text-white transition-colors group-hover:text-white/90"
              >
                <div className="relative z-10 w-12 h-12 flex items-center justify-center rounded-xl">
                  <PhoneIcon size={30} color="white" />
                </div>
                <span>+237 659 980 127</span>
              </a>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}
