"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/MiComunidad.module.css";
import cuentaStyles from "@/app/styles/Cuenta.module.css";
import { solicitarAPI } from "@/app/services/api";

const formatearFecha = (fecha) => fecha
    ? new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })
    : "Sin registro";

export default function MiComunidad() {
    const router = useRouter();
    const [integrantes, setIntegrantes] = useState([]);
    const [codigoComunidad, setCodigoComunidad] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [saliendo, setSaliendo] = useState(false);

    useEffect(() => {
        let activo = true;

        async function cargarComunidad() {
            try {
                const [lista, perfil] = await Promise.all([
                    solicitarAPI("/api/integrante"),
                    solicitarAPI("/api/comunidad/perfil")
                ]);

                if (activo) {
                    setIntegrantes(Array.isArray(lista) ? lista : []);
                    setCodigoComunidad(perfil?.codigo || "");
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

                {codigoComunidad && (
                    <section className={cuentaStyles.seccionCuenta} aria-labelledby="codigo-invitacion">
                        <h2 id="codigo-invitacion" className={cuentaStyles.subtituloEdicion}>
                            Código de invitación
                        </h2>

                        <p className={cuentaStyles.descripcion}>
                            Comparte este código o el QR con las personas que quieran unirse a tu comunidad.
                        </p>

                        <div className={cuentaStyles.qrContenedor}>
                            <img
                                className={cuentaStyles.qrImagen}
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(codigoComunidad)}`}
                                alt="Código QR de invitación a la comunidad"
                                width={220}
                                height={220}
                            />

                            <code className={cuentaStyles.codigoInvitacion}>
                                {codigoComunidad}
                            </code>

                            <p className={cuentaStyles.ayudaInvitacion}>
                                También pueden escribirlo en “Unirse con código” dentro de la aplicación.
                            </p>
                        </div>
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