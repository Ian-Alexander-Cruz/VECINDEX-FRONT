import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
    return (
        <header className={styles.navbar}>
            <Link href="/" className={styles.logo}>
                <Image
                    src="/images/logo-vecindex.jpg"
                    alt="Vecindex - Inicio"
                    width={180}
                    height={55}
                    priority
                />
            </Link>

            <nav className={styles.navigation}>
                <Link href="/" className={styles.navLink}>
                    Inicio
                </Link>

                <Link href="/registro/registro-general" className={styles.register}>
                    Registrarse
                </Link>

                <Link href="/login" className={styles.login}>
                    Iniciar sesión
                </Link>
            </nav>
        </header>
    );
}