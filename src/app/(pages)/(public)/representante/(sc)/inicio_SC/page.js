"use client"

import { useEffect, useState } from "react";
import Link from "next/link";

import FondoCuenta from "@/app/components/FondoCuenta";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css";
import inicioStyles from "@/app/styles/InicioSC.module.css";
import { solicitarAPI } from "@/app/services/api";

const PIN = "M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z";

function claseEtiqueta(estado) {
    const texto = String(estado ?? "").toLowerCase();
    if (texto.includes("pendiente")) return inicioStyles.etiquetaPendiente;
    if (texto.includes("rechazado") || texto.includes("eliminado")) return inicioStyles.etiquetaRechazado;
    return inicioStyles.etiquetaOtro;
}

export default function InicioSC() {
    const { usuario } = useAuth();
    const [comunidad, setComunidad] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarComunidad() {
            try {
                const perfil = await solicitarAPI("/api/representante/perfil");

                if (activo) {
                    setComunidad(perfil?.comunidad ?? null);
                }
            } catch (error) {
                if (activo) {
                    setError(error.message || "No fue posible cargar tu comunidad");
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

    const nombre = usuario?.nombre?.trim() || "vecino";

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <div className={inicioStyles.paginaInicio}>
                <div className={inicioStyles.contenido}>
                    <header className={inicioStyles.saludo}>
                        <h1>Hola, {nombre}</h1>
                        <p>
                            {comunidad
                                ? "Tu comunidad está registrada. Puedes ingresar para administrarla."
                                : "Crea tu comunidad o únete a una para usar todas las funciones de tu cuenta de representante."}
                        </p>
                    </header>

                    {cargando ? (
                        <p className={inicioStyles.mensaje} role="status">Cargando tu comunidad...</p>
                    ) : error ? (
                        <p className={inicioStyles.mensajeError} role="alert">{error}</p>
                    ) : comunidad ? (
                        <section className={inicioStyles.seccion} aria-labelledby="tu-comunidad">
                            <h2 id="tu-comunidad">Tu comunidad</h2>

                            <ul className={inicioStyles.listaComunidades}>
                                <li>
                                    <article className={inicioStyles.tarjetaComunidad}>
                                        <div className={inicioStyles.marcador} aria-hidden="true">
                                            <svg viewBox="0 0 40 46">
                                                <path fillRule="evenodd" d={PIN} />
                                            </svg>
                                        </div>

                                        <div className={inicioStyles.datosComunidad}>
                                            <h3>{comunidad.nombre || "Sin nombre"}</h3>
                                            <p>
                                                {comunidad.fecha_solicitud
                                                    ? `Registrada el ${new Date(comunidad.fecha_solicitud).toLocaleDateString("es-MX")}`
                                                    : "Sin fecha de registro"}
                                            </p>

                                            {comunidad.estado && (
                                                <span className={`${inicioStyles.etiqueta} ${claseEtiqueta(comunidad.estado)}`}>
                                                    {String(comunidad.estado).toLowerCase()}
                                                </span>
                                            )}

                                            <Link href="/representante/inicio" className={inicioStyles.boton} style={{ marginTop: 16 }}>
                                                Ingresar
                                            </Link>
                                        </div>
                                    </article>
                                </li>
                            </ul>
                        </section>
                    ) : (
                        <section className={inicioStyles.vacio} aria-labelledby="sin-comunidad">
                            <div className={inicioStyles.pinVacio} aria-hidden="true">
                                <span className={inicioStyles.onda} />
                                <svg viewBox="0 0 40 46">
                                    <path fillRule="evenodd" d={PIN} />
                                </svg>
                            </div>

                            <div className={inicioStyles.textoVacio}>
                                <h2 id="sin-comunidad">Todavía no tienes una comunidad</h2>
                                <p>Crea una comunidad o únete a una que ya exista para administrarla.</p>
                                <Link href="/representante/crear-comunidad" className={inicioStyles.boton}>
                                    Crear comunidad
                                </Link>{" "}
                                <Link href="/representante/unirse-comunidad" className={inicioStyles.boton}>
                                    Unirse a comunidad
                                </Link>
                            </div>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}
