import styles from "./Fondo2.module.css";

export default function FondoCuenta() {
    return (
        <div className={styles.fondo} aria-hidden="true">
            <ul className={styles.circulos}>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
}
