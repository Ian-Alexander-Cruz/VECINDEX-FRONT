"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

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

    if (cargandoSesion) {
        return <p>Comprobando sesión...</p>;
    }

    if (errorSesion) {
        return <p>No fue posible comprobar tu sesión. Intenta nuevamente.</p>;
    }

    if (!usuario || usuario.rol !== rolPermitido) {
        return null;
    }

    return children;
}
