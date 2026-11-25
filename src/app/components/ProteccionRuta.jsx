"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import BackgroundMap from "./BackgroundMap";
import styles from "../styles/RedireccionSesion.module.css";

export default function ProteccionRuta({ rolPermitido, children }) {
    const { usuario, cargandoSesion, errorSesion } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (cargandoSesion || errorSesion) return;
        if (!usuario) {
            router.replace("/login");
            return;
        }

        if (usuario.rol !== rolPermitido) {
            if (usuario.rol === "habitante") {
                router.replace("/habitante/inicio_SC");
            } else if (usuario.rol === "representante") {
                router.replace("/representante/inicio_SC");
            } else if (usuario.rol === "administrador") {
                router.replace("/administrador/inicio");
            } else {
                router.replace("/login");
            }
        }
    }, [usuario, cargandoSesion, errorSesion, rolPermitido, router]);

    if (cargandoSesion || errorSesion) {
        const texto = errorSesion
            ? "No fue posible comprobar tu sesión. Intenta nuevamente."
            : "Verificando sesión";

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

                <p className={styles.texto}>{texto}</p>
            </div>
        );
    }

    if (!usuario || usuario.rol !== rolPermitido) return null;

    return children;
}