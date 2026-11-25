"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import comunidadStyles from "@/app/styles/Comunidad.module.css";
import { solicitarAPI } from "@/app/services/api";

export default function Comunidad() {
    const { id } = useParams();
    const [comunidad, setComunidad] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [solicitando, setSolicitando] = useState(false);
    const [solicitudEnviada, setSolicitudEnviada] = useState(false);
    const [errorSolicitud, setErrorSolicitud] = useState("");

    useEffect(() => {
        async function cargarComunidad() {
            try {
                setCargando(true);
                setError("");

                const respuesta = await solicitarAPI(`/api/comunidad/${id}`);

                setComunidad(respuesta);
            } catch (error) {
                setError(error.message || "No fue posible cargar la comunidad.");
            } finally {
                setCargando(false);
            }
        }

        if (id) {
            cargarComunidad();
        }
    }, [id]);

    async function enviarSolicitud() {
        try {
            setSolicitando(true);
            setErrorSolicitud("");

            await solicitarAPI(`/api/integrante/comunidad/${id}`, {method: "POST"});

            setSolicitudEnviada(true);
        } catch (error) {
            setErrorSolicitud(error.message || "No fue posible enviar la solicitud.");
        } finally {
            setSolicitando(false);
        }
    }

    return (
        <main className={`${styles.container} ${comunidadStyles.paginaComunidad}`}>
            <FondoCuenta />

            <Link href="/habitante/unirse-comunidad" className={comunidadStyles.volver}>
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Volver a comunidades
            </Link>

            {cargando ? (
                <p className={comunidadStyles.mensaje} role="status">
                    Cargando información de la comunidad...
                </p>
            ) : error ? (
                <p className={comunidadStyles.mensajeError} role="alert">
                    {error}
                </p>
            ) : comunidad ? (
                <article className={comunidadStyles.contenidoComunidad}>
                    <div className={comunidadStyles.portada}>
                        {comunidad.foto ? (
                            <img src={comunidad.foto} alt={`Fotografía de ${comunidad.nombre}`} className={comunidadStyles.fotoComunidad}/>
                        ) : (
                            <div className={comunidadStyles.sinFoto}>
                                <svg viewBox="0 0 40 46" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z" />
                                </svg>
                            </div>
                        )}
                    </div>

                    <div className={comunidadStyles.cuerpo}>
                        <h1>{comunidad.nombre}</h1>

                        <p className={comunidadStyles.ubicacion}>
                            <svg viewBox="0 0 40 46" aria-hidden="true">
                                <path fillRule="evenodd" d="M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z" />
                            </svg>
                            <span>{comunidad.ubicacion}</span>
                        </p>

                        <div className={comunidadStyles.detalles}>
                            <p className={`${comunidadStyles.descripcion} ${comunidad.descripcion ? "" : comunidadStyles.descripcionVacia}`}>
                                {comunidad.descripcion || "Esta comunidad todavía no tiene descripción."}
                            </p>

                            <dl className={comunidadStyles.cupo}>
                                <dt>Cupo de la comunidad</dt>
                                <dd>
                                    <strong>{comunidad.maximo_habitantes}</strong>
                                    habitantes como máximo
                                </dd>
                            </dl>
                        </div>

                        <div className={comunidadStyles.seccionSolicitud}>
                            {solicitudEnviada ? (
                                <p className={comunidadStyles.mensajeSolicitud} role="status">
                                    Solicitud enviada. El representante de la comunidad la revisará.
                                    <Link href="/habitante/inicio_SC" className={comunidadStyles.enlaceSolicitudes}>
                                        Ver mis solicitudes
                                    </Link>
                                </p>
                            ) : (
                                <>
                                    <div className={comunidadStyles.textoSolicitud}>
                                        <h2>¿Vives en esta comunidad?</h2>
                                        <p>Envía tu solicitud y el representante decidirá si te acepta. Puedes seguir su estado desde tu inicio.</p>
                                    </div>

                                    <button type="button" className={comunidadStyles.botonSolicitud} onClick={enviarSolicitud} disabled={solicitando}>
                                        {solicitando ? "Enviando solicitud..." : "Enviar solicitud"}
                                    </button>
                                </>
                            )}

                            {errorSolicitud && (
                                <p className={comunidadStyles.errorSolicitud} role="alert">
                                    {errorSolicitud}
                                </p>
                            )}
                        </div>
                    </div>
                </article>
            ) : null}
        </main>
    );
}
