"use client"

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/MiComunidad.module.css";
import { solicitarAPI } from "@/app/services/api";

const formatearFecha = (fecha) => fecha
    ? new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
    : "Sin registro";

export default function DetalleHabitante({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [integrante, setIntegrante] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [procesando, setProcesando] = useState(false);

    useEffect(() => {
        async function cargarIntegrante() {
            try {
                // El backend no tiene GET /api/integrante/:id, solo la lista completa.
                // Por eso se pide la lista y se busca aqui al habitante por su id
                const lista = await solicitarAPI("/api/integrante");
                const encontrado = Array.isArray(lista)
                    ? lista.find((fila) => String(fila.id_integrante) === String(id))
                    : null;

                if (!encontrado) {
                    setError("Habitante no encontrado en tu comunidad.");
                    return;
                }

                setIntegrante(encontrado);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        }

        cargarIntegrante();
    }, [id]);

    async function eliminarIntegrante() {
        const confirmado = window.confirm(
            `¿Estás seguro de que deseas eliminar a ${integrante.nombre || "este habitante"} de tu comunidad?`
        );

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");

        try {
            await solicitarAPI(`/api/integrante/${id}`, { method: "DELETE" });
            router.replace("/representante/comunidad");
        } catch (error) {
            setMensajeAccion(error.message);
            setProcesando(false);
        }
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <div className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>VECINDEX COMUNIDAD</span>
                    <h1>Detalle del habitante</h1>
                    <p>Consulta la información del habitante dentro de tu comunidad.</p>
                </header>

                {cargando && <p className={styles.mensaje}>Cargando la información...</p>}

                {!cargando && error && <p className={styles.mensajeError}>{error}</p>}

                {!cargando && !error && integrante && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Datos del habitante</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Nombre</span>
                                    <p>{integrante.nombre || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Correo electrónico</span>
                                    <p>{integrante.correo || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Estado</span>
                                    <p>{integrante.estado || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Fecha de ingreso</span>
                                    <p>{formatearFecha(integrante.fecha_ingreso)}</p>
                                </div>
                            </div>
                        </section>

                        {mensajeAccion && <p className={styles.mensajeError}>{mensajeAccion}</p>}

                        <div className={styles.acciones}>
                            <Link href="/representante/comunidad" className={styles.botonVolver}>
                                Volver
                            </Link>

                            <button
                                type="button"
                                className={styles.botonEliminar}
                                onClick={eliminarIntegrante}
                                disabled={procesando}
                            >
                                {procesando ? "Eliminando..." : "Eliminar de la comunidad"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}