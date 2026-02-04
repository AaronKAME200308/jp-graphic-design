'use client'
import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function BackToTop() {
  const [show, setShow] = useState(false)

  // Affiche le bouton après avoir scrollé 200px
  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!show) return null

  return (
    
    <motion.span
      onClick={scrollToTop}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center text-2xl w-12 h-12 rounded-full bg-linear-to-br from-[#f2cc6a] to-[#f2a500] shadow-lg text-white cursor-pointer"
    >
      <ArrowUp size={24} strokeWidth={3}  />
    </motion.span>
  )
}
