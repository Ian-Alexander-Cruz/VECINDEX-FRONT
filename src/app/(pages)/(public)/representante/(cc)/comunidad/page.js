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
                    {/*
                        BOTÓN DESHABILITADO A PROPÓSITO

                        No existe forma de que un representante se salga de su comunidad.
                        La única ruta de salida es DELETE /api/integrante/comunidad/:id, y está
                        declarada con soloRol("habitante"), así que al representante lo rechaza.
                        Además, en el modelo la función salir() busca en dintegrante por
                        id_habitante, y un representante no tiene uno: su relación con la
                        comunidad es mcomunidad.id_representante.

                        Para habilitarlo haría falta una ruta nueva en el backend.
                    */}
                    <button type="button" className={styles.botonDeshabilitado} disabled>
                        Salir de la comunidad
                    </button>

                    <button
                        type="button"
                        className={styles.botonEliminar}
                        onClick={eliminarComunidad}
                        disabled={procesando || cargando}
                    >
                        {procesando ? "Eliminando..." : "Eliminar comunidad"}
                    </button>
                </div>

                <p className={styles.nota}>
                    Salir de la comunidad no está disponible para un representante. El backend no tiene esa
                    operación: solo los habitantes pueden salirse. Si el representante ya no quiere la
                    comunidad.
                </p>
            </div>
        </main>
    );
}