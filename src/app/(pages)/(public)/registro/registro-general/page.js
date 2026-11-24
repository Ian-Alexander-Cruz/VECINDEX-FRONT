import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import BackgroundMap from "../../../../components/BackgroundMap";
import styles from "../../../../styles/RegistroGeneral.module.css";

export default function RegistroGeneral() {
    return (
        <main className={styles.container}>
            <BackgroundMap />

            <Navbar />

            <section className={styles.content}>
                <div className={styles.heading}>
                    <h1>Únete a Vecindex</h1>
                    <p>
                        Selecciona el tipo de cuenta que deseas crear
                        para comenzar a formar parte de tu comunidad.
                    </p>
                </div>

                <div className={styles.cards}>
                    <article className={styles.card}>
                        <h2>Habitante</h2>
                        <p>
                            Registrate como habitante de la unidad
                            habitacional, crea peticiones, apóyalas,
                            vota en encuestas y chatea con tus vecinos.
                        </p>
                        <Link href="/registro/registro-habitante" className={styles.button}>
                            Registrarme como habitante
                        </Link>
                    </article>

                    <article className={styles.card}>
                        <h2>Representante</h2>
                        <p>
                            Registrate como representante de la unidad
                            habitacional, gestiona la comunidad, atiende
                            las peticiones, organiza eventos y encuestas.
                        </p>
                        <Link href="/registro/registro-representante" className={styles.button}>
                            Registrarme como representante
                        </Link>
                    </article>
                </div>
            </section>

            <Footer />
        </main>
    );
}
