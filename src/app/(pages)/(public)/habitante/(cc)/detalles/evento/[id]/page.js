"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

export default function EventoDetalle({ params }) {
    const { id } = use(params);
    const comunidad = useSearchParams().get("comunidad");
    const volver = `/habitante/eventos${/^\d+$/.test(comunidad ?? "") ? `?comunidad=${comunidad}` : ""}`;
    const [evento, setEvento] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarEvento() {
            try {
                const datos = await solicitarAPI(`/api/evento/${id}`);

                if (activo) {
                    setEvento(datos);
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

        cargarEvento();

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
                        VECINDEX HABITANTE
                    </span>

                    <h1>Evento</h1>

                    <p>
                        Detalle del evento de tu comunidad.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información del evento...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar el evento</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && evento && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Título</span>
                                    <p>{evento.titulo || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Tipo de evento</span>
                                    <p>{evento.tipo_evento || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Fecha del evento</span>
                                    <p>{formatearFecha(evento.fecha_evento)}</p>
                                </div>

                                <div>
                                    <span>Fecha de creación</span>
                                    <p>{formatearFecha(evento.fecha_creacion)}</p>
                                </div>

                                <div>
                                    <span>Chat del evento</span>
                                    <p>{evento.tiene_chat ? "Sí" : "No"}</p>
                                </div>

                                <div>
                                    <span>Identificador</span>
                                    <p>{evento.id_evento}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Descripción</h2>

                            <p className={styles.descripcion}>
                                {evento.descripcion || "No hay una descripción disponible."}
                            </p>
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
