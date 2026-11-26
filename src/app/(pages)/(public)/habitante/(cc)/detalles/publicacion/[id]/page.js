"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

export default function PublicacionDetalle({ params }) {
    const { id } = use(params);
    const comunidad = useSearchParams().get("comunidad");
    const volver = `/habitante/inicio_CC${/^\d+$/.test(comunidad ?? "") ? `?comunidad=${comunidad}` : ""}`;
    const [publicacion, setPublicacion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarPublicacion() {
            try {
                const datos = await solicitarAPI(`/api/publicacion/${id}`);

                if (activo) {
                    setPublicacion(datos);
                }
            } catch (error) {
                if (activo) {
                    setError(error.message);
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        cargarPublicacion();

        return () => {
            activo = false;
        };
    }, [id]);

    function formatearFecha(fecha) {
        if (!fecha) return "No disponible";

        const valor = new Date(fecha);

        if (Number.isNaN(valor.getTime())) return String(fecha);

        return `${String(valor.getDate()).padStart(2, "0")}/${String(valor.getMonth() + 1).padStart(2, "0")}/${valor.getFullYear()}`;
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX REPRESENTANTE
                    </span>

                    <h1>Publicación</h1>

                    <p>
                        Detalle de la publicación en tu comunidad.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información de la publicación...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la publicación</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && publicacion && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Título</span>
                                    <p>{publicacion.titulo || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Estatus</span>
                                    <p>{publicacion.estatus || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Fecha de publicación</span>
                                    <p>{formatearFecha(publicacion.fecha_publicacion)}</p>
                                </div>

                                <div>
                                    <span>Identificador</span>
                                    <p>{publicacion.id_publicacion}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Descripción</h2>

                            <p className={styles.descripcion}>
                                {publicacion.descripcion || "No hay una descripción disponible."}
                            </p>
                        </section>

                        {publicacion.imagen && (
                            <section className={styles.tarjeta}>
                                <h2>Imagen</h2>

                                <div className={styles.contenedorImagen}>
                                    <img src={publicacion.imagen} alt={publicacion.titulo || "Imagen de la publicación"}/>
                                </div>
                            </section>
                        )}
                    </>
                )}
                <div className={styles.acciones}>
                    <Link href={volver} className={styles.botonAprobar}>Volver</Link>
                </div>
            </section>
        </main>
    );
}
