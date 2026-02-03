import Skill from "../pages/Skill";
import Contact from "../pages/Contact";
import Home from "../pages/Home";
import Projects from "../pages/Projets";
import BackToTop from "./BackToTop";
import About from "../pages/About";

const Main = () => {
    return (
        <main>
            <section id="Accueil">
                <Home />
            </section>

            <section id="A propos">
                <About/>
            </section>

            <section id="Compétences">
                <Skill />
            </section>

            <section id="Projets">
                <Projects />
            </section>

            <section id="Contact">
                <Contact />
            </section>
            <BackToTop />
        </main>
    );
};

export default Main;
