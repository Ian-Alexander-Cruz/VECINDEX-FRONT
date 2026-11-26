"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import { solicitarAPI } from "@/app/services/api";

export default function InicioSC() {
    const router = useRouter();

    useEffect(() => {
        let activo = true;

        async function revisarComunidad() {
            try {
                const perfil = await solicitarAPI("/api/representante/perfil");
                const comunidad = perfil.comunidad;
                const tieneComunidad = Array.isArray(comunidad) ? comunidad.length > 0 : Boolean(comunidad);

                if (activo && tieneComunidad) router.replace("/representante/inicio");
            } catch (error) {
                console.error(error);
            }
        }

        revisarComunidad();

        return () => {
            activo = false;
        };
    }, [router]);

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.Principal}>
                <h1>Hola, vecino</h1>
                <p>Aún no tienes una comunidad. Crea tu comunidad para poder usar todas las funciones de tu cuenta de representante.</p>
            </section>

        </main>
    );
}
