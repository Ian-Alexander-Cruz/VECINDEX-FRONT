"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

export default function EncuestaDetalle({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [encuesta, setEncuesta] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);

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

    async function cerrarEncuesta() {
        if (!window.confirm("¿Seguro que quieres cerrar esta encuesta? Ya no se podrá votar en ella.")) return;

        setProcesando(true);
        setMensajeAccion("");

        try {
            const actualizada = await solicitarAPI(`/api/encuesta/${id}/cerrar`, { method: "PUT" });
            setEncuesta(actualizada);
            setMensajeAccion("La encuesta se cerró correctamente.");
            setErrorAccion(false);
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    async function eliminarEncuesta() {
        if (!window.confirm("¿Seguro que quieres eliminar esta encuesta? Esta acción no se puede deshacer.")) return;

        setProcesando(true);
        setMensajeAccion("");

        try {
            await solicitarAPI(`/api/encuesta/${id}`, { method: "DELETE" });
            router.push("/representante/inicio");
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
            setProcesando(false);
        }
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

                        <section className={styles.tarjeta}>
                            <h2>Acciones</h2>

                            <div className={styles.acciones}>
                                <button className={styles.botonRechazar} onClick={eliminarEncuesta} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Eliminar encuesta"}
                                </button>

                                {encuesta.abierta && (
                                    <button className={styles.botonAprobar} onClick={cerrarEncuesta} disabled={procesando}>
                                        {procesando ? "Procesando..." : "Cerrar encuesta"}
                                    </button>
                                )}
                            </div>
                        </section>

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
