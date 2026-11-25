"use client"
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "./AuthProvider";
import BackgroundMap from "./BackgroundMap";
import styles from "../styles/RedireccionSesion.module.css";

const INICIO_ROL = {
    habitante: "/habitante/inicio_SC",
    representante: "/representante/inicio_SC",
    administrador: "/administrador/inicio",
}

export default function RedireccionSesion({children}) {
    const {usuario, cargandoSesion} = useAuth();
    const router = useRouter();
    const destino = usuario ? INICIO_ROL[usuario.rol] : null;

    useEffect(() => {
        if (!cargandoSesion && destino) router.replace(destino);
    }, [cargandoSesion, destino, router]);

    if (cargandoSesion) {
        return (
            <div className={styles.pantalla} role="status" aria-live="polite">
                <BackgroundMap />

                <div className={styles.marcador} aria-hidden="true">
                    <span className={styles.onda} />
                    <span className={styles.sombra} />
                    <svg className={styles.pin} viewBox="0 0 40 46">
                        <path
                            fillRule="evenodd"
                            d="M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z"
                        />
                    </svg>
                </div>

                <p className={styles.texto}>Verificando sesión</p>
            </div>
        )
    }
    if (destino) return null;
    return children;
}