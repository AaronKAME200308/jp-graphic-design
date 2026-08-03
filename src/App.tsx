import { Routes, Route } from 'react-router-dom'
import Navbar from './component/Navbar'
import Main from './component/Main'
import Footer from './component/Footer'
import Commande from './pages/Commande'
import { LangProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './component/ProtectedRoute'
import AdminLogin from './pages/AdminLogin'
import Admin from './pages/Admin'
import Factures from './pages/Factures'

function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <div className="min-h-screen w-full flex flex-col bg-portfolio-bg text-white">
          <Routes>
            {/* Pages admin : pas de Navbar/Footer du site public */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/factures"
              element={
                <ProtectedRoute>
                  <Factures />
                </ProtectedRoute>
              }
            />

            {/* Site public */}
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Main />} />
                    <Route path="/commande" element={<Commande />} />
                  </Routes>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </LangProvider>
  )
}

export default App