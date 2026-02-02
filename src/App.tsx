import Navbar from './component/Navbar'
import Main from './component/Main'
import Footer from './component/Footer'

function App() {

  return (
   <div className="min-h-screen w-screen flex flex-col bg-portfolio-bg text-white">
      <Navbar />
      <Main/>
      <Footer/>
    </div>  )
}

export default App
