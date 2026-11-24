"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import FondoCuenta from "../../../../../components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import comunidadStyles from "@/app/styles/Comunidad.module.css";
import { solicitarAPI } from "../../../../../services/api";

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

            {cargando ? (
                <p className={comunidadStyles.mensaje}>
                    Cargando información de la comunidad...
                </p>
            ) : error ? (
                <p className={comunidadStyles.mensajeError}>
                    {error}
                </p>
            ) : comunidad ? (
                <section className={comunidadStyles.contenidoComunidad}>
                    <h1>{comunidad.nombre}</h1>

                    <p>{comunidad.ubicacion}</p>

                    {comunidad.foto && (
                        <img src={comunidad.foto} alt={`Fotografía de ${comunidad.nombre}`} className={comunidadStyles.fotoComunidad}/>
                    )}

                    <p>
                        {comunidad.descripcion || "Esta comunidad no cuenta con una descripción."}
                    </p>

                    <p>
                        <strong>Máximo de habitantes:</strong>{" "}
                        {comunidad.maximo_habitantes}
                    </p>

                    <div className={comunidadStyles.seccionSolicitud}>
                        {solicitudEnviada ? (
                            <p className={comunidadStyles.mensajeSolicitud}>
                                ¡Tu solicitud se ha enviado correctamente!
                            </p>
                        ) : (
                            <button type="button" className={comunidadStyles.botonSolicitud} onClick={enviarSolicitud} disabled={solicitando}>
                                {solicitando ? "Enviando solicitud..." : "Solicitud para unirse"}
                            </button>
                        )}

                        {errorSolicitud && (
                            <p className={comunidadStyles.mensajeError}>
                                {errorSolicitud}
                            </p>
                        )}
                    </div>
                </section>
            ) : null}
        </main>
    );
}
