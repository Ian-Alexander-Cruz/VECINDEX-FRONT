"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import comunidadStyles from "@/app/styles/UnirseComunidad.module.css";
import { solicitarAPI } from "@/app/services/api";

export default function UnirseComunidadRepresentante() {
    const router = useRouter();
    const [comunidades, setComunidades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [uniendo, setUniendo] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarDisponibles() {
            try {
                const datos = await solicitarAPI("/api/comunidad/disponibles");

                if (activo) {
                    setComunidades(Array.isArray(datos) ? datos : []);
                }
            } catch (error) {
                if (activo) {
                    setError(error.message || "No fue posible cargar las comunidades disponibles.");
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        cargarDisponibles();

        return () => {
            activo = false;
        };
    }, []);

    async function unirme(comunidad) {
        const confirmado = window.confirm(`¿Unirte a "${comunidad.nombre}" como representante?`);

        if (!confirmado) return;

        setUniendo(comunidad.id_comunidad);
        setError("");

        try {
            await solicitarAPI(`/api/comunidad/${comunidad.id_comunidad}/unirme`, {
                method: "PUT"
            });

            router.replace("/representante/inicio");
        } catch (error) {
            setError(error.message || "No fue posible unirte a la comunidad.");
            setUniendo("");
        }
    }

    return (
        <main className={`${styles.container} ${comunidadStyles.paginaUnirse}`}>
            <FondoCuenta />

            <header className={comunidadStyles.encabezado}>
                <h1>Unirse a una comunidad</h1>
                <p>
                    Elige una comunidad que no tenga representante para administrarla.
                </p>
            </header>

            <section className={comunidadStyles.tarjeta} aria-labelledby="comunidades-disponibles">
                <div className={comunidadStyles.encabezadoTarjeta}>
                    <div className={comunidadStyles.icono}>
                        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M10 17l5-5-5-5M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>

                    <div>
                        <h2 id="comunidades-disponibles">Comunidades disponibles</h2>
                        <p>Comunidades activas sin representante.</p>
                    </div>
                </div>

                {cargando && (
                    <p className={comunidadStyles.estadoBusqueda} role="status">
                        Cargando comunidades...
                    </p>
                )}

                {!cargando && error && (
                    <p className={comunidadStyles.errorBusqueda} role="alert">
                        {error}
                    </p>
                )}

                {!cargando && !error && comunidades.length === 0 && (
                    <p className={comunidadStyles.estadoBusqueda}>
                        No hay comunidades disponibles sin representante.
                    </p>
                )}

                {!cargando && comunidades.length > 0 && (
                    <div className={comunidadStyles.resultados}>
                        {comunidades.map((comunidad) => (
                            <article key={comunidad.id_comunidad} className={comunidadStyles.resultado}>
                                {comunidad.foto && (
                                    <img
                                        src={comunidad.foto}
                                        alt={`Fotografía de ${comunidad.nombre}`}
                                        className={comunidadStyles.fotoResultado}
                                    />
                                )}

                                <div className={comunidadStyles.datosResultado}>
                                    <h4>{comunidad.nombre}</h4>

                                    <p>{comunidad.ubicacion}</p>

                                    <button
                                        type="button"
                                        className={comunidadStyles.botonVisualizar}
                                        onClick={() => unirme(comunidad)}
                                        disabled={Boolean(uniendo)}
                                    >
                                        {uniendo === comunidad.id_comunidad ? "Uniéndome..." : "Unirme"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
