"use client";

import { use, useEffect, useState } from "react";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../../../services/api";
import styles from "@/app/styles/RepresentanteDetalle.module.css";

export default function RepresentanteDetalle({ params }) {
    const { id } = use(params);
    const [representante, setRepresentante] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);

    useEffect(() => {
        let activo = true;

        async function cargarRepresentante() {
            try {
                const datos = await solicitarAPI(`/api/representante/${id}`);

                if (activo) {
                    setRepresentante(datos);
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

        cargarRepresentante();

        return () => {
            activo = false;
        };
    }, [id]);

    async function cambiarEstado(estado) {
        const accion = estado === "Normal" ? "aprobar" : "rechazar";

        const confirmado = window.confirm(
            `¿Estás seguro de que deseas ${accion} esta solicitud?`
        );

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            const actualizado = await solicitarAPI(`/api/representante/${id}/estado`, {
                    method: "PUT",
                    body: JSON.stringify({ estado })
                }
            );

            setRepresentante(actualizado);
            setMensajeAccion(estado === "Normal" ? "La solicitud fue aprobada correctamente." : "La solicitud fue rechazada correctamente.");
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    function obtenerFormato(url) {
        try {
            const ruta = new URL(url).pathname;
            return ruta.split(".").pop().toLowerCase();
        } catch {
            return "";
        }
    }

    const formato = representante?.constancia ? obtenerFormato(representante.constancia) : "";

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX ADMINISTRACIÓN
                    </span>

                    <h1>Solicitud de registro de representante</h1>

                    <p>
                        Revisa la información y la documentación presentada.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información del representante...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la solicitud</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && representante && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información personal</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Nombre completo</span>
                                    <p>{representante.nombre || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Correo electrónico</span>
                                    <p>{representante.correo || "No disponible"}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Información del representante</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Identificador</span>
                                    <p>{representante.id_representante}</p>
                                </div>

                                <div>
                                    <span>Estado de la solicitud</span>
                                    <p>
                                        {representante.id_estado === 3 ? "Pendiente" : `Estado ${representante.id_estado}`}
                                    </p>
                                </div>

                                <div>
                                    <span>Vigencia de la constancia</span>
                                    <p>{representante.vigencia || "No disponible"}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Constancia presentada</h2>

                            {!representante.constancia && (
                                <p className={styles.mensaje}>
                                    No se pudo obtener el documento de la constancia.
                                </p>
                            )}

                            {representante.constancia && formato === "pdf" && (
                                <iframe src={representante.constancia} className={styles.visor} title="Constancia del representante"/>
                            )}

                            {representante.constancia &&
                                ["png", "jpg", "jpeg"].includes(formato) && (
                                    <div className={styles.contenedorImagen}>
                                        <img
                                            src={representante.constancia}
                                            alt="Constancia del representante"
                                        />
                                    </div>
                                )}
                        </section>

                        {representante.id_estado === 3 && (
                            <section className={styles.acciones}>
                                <button className={styles.botonRechazar} onClick={() => cambiarEstado("Rechazado")} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Rechazar solicitud"}
                                </button>

                                <button className={styles.botonAprobar} onClick={() => cambiarEstado("Normal")} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Aprobar solicitud"}
                                </button>
                            </section>
                        )}

                        {mensajeAccion && (
                            <p className={styles.mensajeAccion} role="status" style={{ color: errorAccion ? "#FF8585" : "#33CEBF" }}>
                                {mensajeAccion}
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}