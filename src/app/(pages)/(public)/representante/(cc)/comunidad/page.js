"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/MiComunidad.module.css";
import { solicitarAPI } from "@/app/services/api";

const formatearFecha = (fecha) => fecha
    ? new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
    : "Sin registro";

export default function MiComunidad() {
    const router = useRouter();
    const [integrantes, setIntegrantes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [saliendo, setSaliendo] = useState(false);

    useEffect(() => {
        async function cargarIntegrantes() {
            try {
                const lista = await solicitarAPI("/api/integrante");
                setIntegrantes(Array.isArray(lista) ? lista : []);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        }

        cargarIntegrantes();
    }, []);

    async function eliminarComunidad() {
        const confirmado = window.confirm(
            "¿Estás seguro de que deseas eliminar tu comunidad? Esta acción no se puede deshacer y todos los integrantes serán dados de baja."
        );

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");

        try {
            await solicitarAPI("/api/comunidad/perfil", { method: "DELETE" });
            router.replace("/representante/inicio_SC");
        } catch (error) {
            setMensajeAccion(error.message);
            setProcesando(false);
        }
    }

    async function salirDeComunidad() {
        const confirmado = window.confirm(
            "¿Estás seguro de que deseas salir de tu comunidad? La comunidad quedará sin representante y pasará a estado Suspendido."
        );

        if (!confirmado) return;

        setSaliendo(true);
        setMensajeAccion("");

        try {
            await solicitarAPI("/api/comunidad/perfil/salir", { method: "PUT" });
            router.replace("/representante/inicio_SC");
        } catch (error) {
            setMensajeAccion(error.message);
            setSaliendo(false);
        }
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <div className={styles.panel}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>VECINDEX COMUNIDAD</span>
                    <h1>Mi comunidad</h1>
                    <p>Consulta a los habitantes que forman parte de tu comunidad.</p>
                </header>

                {mensajeAccion && <p className={styles.mensajeError}>{mensajeAccion}</p>}

                {cargando ? (
                    <p className={styles.mensaje}>Cargando los habitantes...</p>
                ) : error ? (
                    <p className={styles.mensajeError}>{error}</p>
                ) : (
                    <section>
                        <div className={styles.encabezadoListado}>
                            <h2>Habitantes</h2>
                            <span>
                                {integrantes.length === 1
                                    ? "1 habitante"
                                    : `${integrantes.length} habitantes`}
                            </span>
                        </div>

                        {integrantes.length === 0 ? (
                            <p className={styles.mensaje}>Todavía no hay habitantes en tu comunidad.</p>
                        ) : (
                            <div className={styles.gridHabitantes}>
                                {integrantes.map((integrante) => (
                                    <article key={integrante.id_integrante} className={styles.tarjetaHabitante}>
                                        <div className={styles.datosHabitante}>
                                            <h3>{integrante.nombre || "Sin nombre"}</h3>
                                            <p>{integrante.correo || "Sin correo"}</p>
                                            <p>Ingresó el {formatearFecha(integrante.fecha_ingreso)}</p>
                                        </div>

                                        <Link
                                            href={`/representante/comunidad/detalle-habitantes/${integrante.id_integrante}`}
                                            className={styles.botonDetalle}
                                        >
                                            Ver detalle
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <div className={styles.acciones}>
                    <button
                        type="button"
                        className={styles.botonSalir}
                        onClick={salirDeComunidad}
                        disabled={saliendo || procesando || cargando}
                    >
                        {saliendo ? "Saliendo..." : "Salir de la comunidad"}
                    </button>

                    <button
                        type="button"
                        className={styles.botonEliminar}
                        onClick={eliminarComunidad}
                        disabled={procesando || saliendo || cargando}
                    >
                        {procesando ? "Eliminando..." : "Eliminar comunidad"}
                    </button>
                </div>

                <p className={styles.nota}>
                    Si sales, la comunidad quedará sin representante y pasará a estado Suspendido. Después
                    puedes volver a unirte desde “Unirse a comunidad”.
                </p>
            </div>
        </main>
    );
}