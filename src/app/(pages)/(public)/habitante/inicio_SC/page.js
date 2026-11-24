import FondoCuenta from "../../../../components/FondoCuenta";
import styles from "../../../../styles/Home.module.css";

export default function InicioSC() {
    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.Principal}>
                <h1>Hola, vecino</h1>
                <p>Unete a una comunidad para poder usar todas las funciones de tu cuenta de habitante.</p>
            </section>

        </main>
    );
}