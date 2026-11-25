import Navbar from "./components/Navbar";
import BackgroundMap from "./components/BackgroundMap";
import Footer from "./components/Footer";
import styles from "./styles/Home.module.css";
import info from "./styles/QueEsVecindex.module.css";
import RedireccionSesion from "./components/RedireccionSesion";

export default function Home() {
  return (
      <main className={styles.container}>



        <BackgroundMap />

        <Navbar />

        <section className={styles.Principal}>
          <h1>Tu comunidad, conectada.</h1>
          <p>Mantente comunicado con tu comunidad de tu Unidad Habitacional</p>
          <a href="#info" className={styles.verMas}>
            Ver más
            <span className={styles.flecha} aria-hidden="true">↓</span>
          </a>
        </section>

        <section id="info" className={info.content}>

          <div className={`${info.introduction} ${styles.reveal}`}>
            <h1>¿Qué es Vecindex?</h1>

            <p>
              Vecindex es una plataforma diseñada para
              conectar a los habitantes de una unidad
              habitacional con sus representantes,
              facilitando la comunicación, organización
              y atención de las necesidades comunitarias.
            </p>
          </div>

          <div className={info.cards}>

            <article className={`${info.card} ${styles.reveal}`}>
              <h2>Publicación</h2>
              <p>
                El representante comparte avisos
                y novedades con todos los vecinos.
              </p>
            </article>

            <article className={`${info.card} ${styles.reveal}`}>
              <h2>Peticiones y mapa</h2>
              <p>
                Reporta problemas de infraestructura,
                ubicalos en el mapa y apoya los de tus
                vecinos.
              </p>
            </article>

            <article className={`${info.card} ${styles.reveal}`}>
              <h2>Eventos y chat</h2>
              <p>
                Juntas, convivencias o eventos de la alcaldía
                con chat propio cuando el representante
                lo habilita para organizarse.
              </p>
            </article>

            <article className={`${info.card} ${styles.reveal}`}>
              <h2>Encuestas</h2>
              <p>
                Vota las decisiones de la comunidad y consulta
                los resultados.
              </p>
            </article>

          </div>

          <div className={`${info.closing} ${styles.reveal}`}>
            <h2>Tu comunidad, conectada.</h2>

            <p>
              Construyamos una comunidad más informada,
              participativa y organizada.
            </p>
            <br/><br/>
            <h2>Llévala en tu celular</h2>

            <p>
              La app de Vecindex para Android.
            </p>

            <a href="/downloads/vecindex.apk" download className={info.downloadButton}>
              Descargar Vecindex {/*en el href todavía no está la ruta, pero ahí irá la ruta cuando tengamos la aplicación*/}
            </a>

          </div>

        </section>

        <Footer />

      </main>

  );
}
