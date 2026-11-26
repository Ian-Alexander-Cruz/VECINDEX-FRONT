"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { solicitarAPI } from "../services/api";
import BackgroundMap from "./BackgroundMap";
import styles from "../styles/RedireccionSesion.module.css";

export default function ProteccionRuta({ rolPermitido, requiereComunidad = false, children }) {
    const { usuario, cargandoSesion, errorSesion } = useAuth();
    const router = useRouter();
    const [verificandoComunidad, setVerificandoComunidad] = useState(requiereComunidad);

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
            return;
        }

        if (!requiereComunidad) return;

        let activo = true;

        async function verificarComunidad() {
            try {
                await solicitarAPI("/api/comunidad/perfil");
                if (activo) setVerificandoComunidad(false);
            } catch (error) {
                if (activo && error.message === "Comunidad no encontrada") {
                    router.replace("/representante/inicio_SC");
                    return;
                }
                if (activo) setVerificandoComunidad(false);
            }
        }

        verificarComunidad();

        return () => {
            activo = false;
        };
    }, [usuario, cargandoSesion, errorSesion, rolPermitido, requiereComunidad, router]);

    if (cargandoSesion || errorSesion || verificandoComunidad) {
        const texto = errorSesion
            ? "No fue posible comprobar tu sesión. Intenta nuevamente."
            : verificandoComunidad
                ? "Verificando tu comunidad"
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