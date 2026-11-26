"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

export default function EncuestaDetalle({ params }) {
    const { id } = use(params);
    const comunidad = useSearchParams().get("comunidad");
    const volver = `/habitante/inicio_CC${/^\d+$/.test(comunidad ?? "") ? `?comunidad=${comunidad}` : ""}`;
    const [encuesta, setEncuesta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarEncuesta() {
            try {
                const datos = await solicitarAPI(`/api/encuesta/${id}`);

                if (activo) {
                    setEncuesta(datos);
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

        cargarEncuesta();

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

    function porcentaje(votos, total) {
        return total ? Math.round((votos / total) * 100) : 0;
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX REPRESENTANTE
                    </span>

                    <h1>Encuesta</h1>

                    <p>
                        Detalle y resultados de la encuesta en tu comunidad.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información de la encuesta...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la encuesta</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && encuesta && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Título</span>
                                    <p>{encuesta.titulo || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Estado</span>
                                    <p>{encuesta.abierta ? "Abierta" : "Cerrada"}</p>
                                </div>

                                <div>
                                    <span>Fecha de creación</span>
                                    <p>{formatearFecha(encuesta.fecha_creacion)}</p>
                                </div>

                                <div>
                                    <span>Fecha de cierre</span>
                                    <p>{formatearFecha(encuesta.fecha_cierre)}</p>
                                </div>

                                <div>
                                    <span>Total de votos</span>
                                    <p>{encuesta.total_votos ?? 0}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Resultados</h2>

                            {encuesta.opciones?.length ? (
                                <div className={styles.datos}>
                                    {encuesta.opciones.map((opcion) => (
                                        <div key={opcion.id_opcion}>
                                            <span>{opcion.opcion}</span>
                                            <p>
                                                {opcion.total_votos} {opcion.total_votos === 1 ? "voto" : "votos"} ({porcentaje(opcion.total_votos, encuesta.total_votos)}%)
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.mensaje}>
                                    No hay opciones disponibles.
                                </p>
                            )}
                        </section>
                    </>
                )}
                <div className={styles.acciones}>
                    <Link href={volver} className={styles.botonAprobar}>Volver</Link>
                </div>
            </section>
        </main>
    );
}
