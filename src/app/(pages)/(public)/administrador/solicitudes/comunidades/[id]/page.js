"use client";

import { use, useEffect, useState } from "react";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../../../services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

export default function ComunidadDetalle({ params }) {
    const { id } = use(params);
    const [comunidad, setComunidad] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);

    useEffect(() => {
        let activo = true;

        async function cargarComunidad() {
            try {
                const datos = await solicitarAPI(`/api/comunidad/${id}`);

                if (activo) {
                    setComunidad(datos);
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

        cargarComunidad();

        return () => {
            activo = false;
        };
    }, [id]);

    async function cambiarEstado(accion) {
        const aprobar = accion === "aprobar";

        const confirmado = window.confirm(`¿Estás seguro de que deseas ${accion} esta solicitud?`);

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            const actualizado = await solicitarAPI(
                aprobar ? `/api/comunidad/${id}/estado` : `/api/comunidad/${id}/rechazar`, {
                    method: "PUT",
                    ...(aprobar && {body: JSON.stringify({ estado: "Normal" })})
                }
            );

            setComunidad(actualizado);

            setMensajeAccion(aprobar ? "La solicitud de comunidad fue aprobada correctamente." : "La solicitud de comunidad fue rechazada correctamente.");

        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);

        } finally {
            setProcesando(false);
        }
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX ADMINISTRACIÓN
                    </span>

                    <h1>Solicitud de registro de comunidad</h1>

                    <p>
                        Revisa la información presentada antes de tomar una decisión.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información de la comunidad...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la solicitud</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && comunidad && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información de la comunidad</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Nombre</span>
                                    <p>{comunidad.nombre || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Identificador</span>
                                    <p>{comunidad.id_comunidad}</p>
                                </div>

                                <div>
                                    <span>Ubicación</span>
                                    <p>{comunidad.ubicacion || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Máximo de habitantes</span>
                                    <p>
                                        {comunidad.maximo_habitantes ?? "No disponible"}
                                    </p>
                                </div>

                                <div>
                                    <span>Estado de la solicitud</span>
                                    <p>
                                        {comunidad.id_estado === 3 ? "Pendiente" : `Estado ${comunidad.id_estado}`}
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Descripción</h2>

                            <p className={styles.descripcion}>
                                {comunidad.descripcion || "No hay una descripción disponible."}
                            </p>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Fotografía de la comunidad</h2>

                            {comunidad.foto ? (
                                <div className={styles.contenedorImagen}>
                                    <img src={comunidad.foto} alt={`Fotografía de ${comunidad.nombre}`}/>
                                </div>
                            ) : (
                                <p className={styles.mensaje}>
                                    No hay una fotografía disponible.
                                </p>
                            )}
                        </section>


                        {comunidad.id_estado === 3 && (
                            <section className={styles.acciones}>
                                <button className={styles.botonRechazar} onClick={() => cambiarEstado("rechazar")} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Rechazar solicitud"}
                                </button>

                                <button className={styles.botonAprobar} onClick={() => cambiarEstado("aprobar")} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Aprobar solicitud"}
                                </button>
                            </section>
                        )}

                        {mensajeAccion && (
                            <p
                                className={styles.mensajeAccion}
                                role="status"
                                style={{color: errorAccion ? "#FF8585" : "#33CEBF"}}>
                                {mensajeAccion}
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
