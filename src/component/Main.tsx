import Skill from "../pages/Skill";
import Contact from "../pages/Contact";
import Home from "../pages/Home";
import Projects from "../pages/Projets";
import BackToTop from "./BackToTop";
import About from "../pages/About";

const Main = () => {
    return (
        <main>
            
                <Home />

            
                <About/>

                <Projects />

                <Skill />

                <Contact />
            <BackToTop />
        </main>
    );
};

export default Main;
