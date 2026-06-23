import { Routes, Route } from 'react-router-dom'
import Navbar from './component/Navbar'
import Main from './component/Main'
import Footer from './component/Footer'
import Commande from './pages/Commande'
import { LangProvider } from './context/LanguageContext'

function App() {
  return (
    <LangProvider>
      <div className="min-h-screen w-full flex flex-col bg-portfolio-bg text-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/commande" element={<Commande />} />
        </Routes>
        <Footer />
      </div>
    </LangProvider>
  )
}

export default App