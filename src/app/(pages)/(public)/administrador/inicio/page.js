"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import { solicitarAPI } from "../../../../services/api";

export default function Inicio() {
    const [representantes, setRepresentantes] = useState([]);
    const [comunidades, setComunidades] = useState([]);
    const [mapas, setMapas] = useState([]);
    const [errores, setErrores] = useState({});
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        let activo = true;

        async function cargarSolicitudes() {
            const resultados = await Promise.allSettled([solicitarAPI("/api/representante/estado/3"), solicitarAPI("/api/comunidad/pendientes"), solicitarAPI("/api/mapa?estatus=1")]);

            if (!activo) return;

            const [resultadoRepresentantes, resultadoComunidades, resultadoMapas] = resultados;

            const nuevosErrores = {};

            if (resultadoRepresentantes.status === "fulfilled") {
                setRepresentantes(
                    Array.isArray(resultadoRepresentantes.value)
                        ? resultadoRepresentantes.value
                        : []
                );
            } else {
                nuevosErrores.representantes =
                    resultadoRepresentantes.reason.message;
            }

            if (resultadoComunidades.status === "fulfilled") {
                setComunidades(
                    Array.isArray(resultadoComunidades.value)
                        ? resultadoComunidades.value
                        : []
                );
            } else {
                nuevosErrores.comunidades =
                    resultadoComunidades.reason.message;
            }

            if (resultadoMapas.status === "fulfilled") {
                setMapas(
                    Array.isArray(resultadoMapas.value)
                        ? resultadoMapas.value
                        : []
                );
            } else {
                nuevosErrores.mapas = resultadoMapas.reason.message;
            }

            setErrores(nuevosErrores);
            setCargando(false);
        }

        cargarSolicitudes();

        return () => {
            activo = false;
        };
    }, []);

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelAdministrador}>
                <header className={styles.encabezadoAdmin}>
                    <div>
                        <span className={styles.etiquetaAdmin}>
                            VECINDEX ADMINISTRACIÓN
                        </span>
                        <h1>Panel de administración</h1>
                        <p>
                            Gestiona las solicitudes y actividades de la
                            comunidad desde un solo lugar.
                        </p>
                    </div>
                </header>

                <section className={styles.resumenSolicitudes}>
                    <article className={styles.indicador}>
                        <span className={styles.iconoIndicador}>♙</span>
                        <div>
                            <p>Representantes</p>
                            <strong>
                                {cargando ? "..." : String(representantes.length).padStart(2, "0")}
                            </strong>
                            <span>Pendientes de aprobación</span>
                        </div>
                    </article>

                    <article className={styles.indicador}>
                        <span className={styles.iconoIndicador}>⌂</span>
                        <div>
                            <p>Creación de comunidades</p>
                            <strong>
                                {cargando ? "..." : String(comunidades.length).padStart(2, "0")}
                            </strong>
                            <span>Solicitudes pendientes</span>
                        </div>
                    </article>

                    <article className={styles.indicador}>
                        <span className={styles.iconoIndicador}>⌖</span>
                        <div>
                            <p>Solicitudes de mapa</p>
                            <strong>
                                {cargando ? "..." : String(mapas.length).padStart(2, "0")}
                            </strong>
                            <span>Pendientes de revisión</span>
                        </div>
                    </article>
                </section>



                <section className={styles.seccionSolicitudes}>
                    <div className={styles.tituloSeccion}>
                        <div>
                            <h2>Solicitudes de representantes</h2>
                            <p>
                                Revisa las solicitudes de registro de nuevos representantes.
                            </p>
                        </div>
                    </div>

                    <div className={styles.gridSolicitudes}>
                        {cargando && (
                            <p>Cargando solicitudes...</p>
                        )}

                        {!cargando && errores.representantes && (
                            <article className={styles.tarjetaSolicitud}>
                                <h3>No se pudieron cargar los representantes</h3>
                                <p>{errores.representantes}</p>
                            </article>
                        )}

                        {!cargando && !errores.representantes &&
                            representantes.length === 0 && (
                                <article className={styles.tarjetaSolicitud}>
                                    <h3>Sin solicitudes de representantes</h3>
                                    <p>
                                        No hay representantes pendientes de aprobación.
                                    </p>
                                </article>
                            )}

                        {!cargando && representantes.map((representante) => (
                            <article
                                className={styles.tarjetaSolicitud}
                                key={representante.id_representante}
                            >
                                <div className={styles.cabeceraTarjeta}>
                    <span className={styles.etiquetaSolicitud}>
                        Representante
                    </span>

                                    <span className={styles.estadoPendiente}>
                        Pendiente
                    </span>
                                </div>

                                <h3>{representante.nombre}</h3>

                                <p>
                                    Solicitud de registro de representante.
                                </p>

                                <div className={styles.datosSolicitud}>
                    <span>
                        Correo: {representante.correo}
                    </span>
                                </div>

                                <Link href={`/administrador/solicitudes/representantes/${representante.id_representante}`} className={styles.botonRevision}>
                                    Revisar solicitud
                                </Link>
                            </article>
                        ))}
                    </div>

                    <div className={styles.tituloSeccion}>
                        <div>
                            <h2>Solicitudes de comunidades</h2>
                            <p>
                                Revisa las solicitudes de registro de nuevas comunidades.
                            </p>
                        </div>
                    </div>

                    <div className={styles.gridSolicitudes}>
                        {cargando && (
                            <p>Cargando solicitudes...</p>
                        )}

                        {!cargando && errores.comunidades && (
                            <article className={styles.tarjetaSolicitud}>
                                <h3>No se pudieron cargar las comunidades</h3>
                                <p>{errores.comunidades}</p>
                            </article>
                        )}

                        {!cargando && !errores.comunidades &&
                            comunidades.length === 0 && (
                                <article className={styles.tarjetaSolicitud}>
                                    <h3>Sin solicitudes de comunidades</h3>
                                    <p>
                                        No hay comunidades pendientes de aprobación.
                                    </p>
                                </article>
                            )}

                        {!cargando && comunidades.map((comunidad) => (
                            <article className={styles.tarjetaSolicitud} key={comunidad.id_comunidad}>
                                <div className={styles.cabeceraTarjeta}>
                    <span className={styles.etiquetaSolicitud}>
                        Comunidad
                    </span>

                                    <span className={styles.estadoPendiente}>
                        Pendiente
                    </span>
                                </div>

                                <h3>{comunidad.nombre}</h3>

                                <p>
                                    Solicitud para registrar una nueva comunidad.
                                </p>

                                <div className={styles.datosSolicitud}>
                    <span>
                        Ubicación: {comunidad.ubicacion}
                    </span>
                                </div>

                                <Link href={`/administrador/solicitudes/comunidades/${comunidad.id_comunidad}`} className={styles.botonRevision}>
                                    Revisar solicitud
                                </Link>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.seccionMapas}>
                    <div className={styles.tituloSeccion}>
                        <div>
                            <h2>Solicitudes de mapa</h2>
                            <p>
                                Peticiones que necesitan revisión administrativa.
                            </p>
                        </div>
                    </div>

                    {cargando && <p>Cargando solicitudes de mapa...</p>}

                    {!cargando && errores.mapas && (
                        <article className={styles.tarjetaMapa}>
                            <p>No se pudieron cargar las solicitudes: {errores.mapas}</p>
                        </article>
                    )}

                    {!cargando && !errores.mapas && mapas.length === 0 && (
                        <article className={styles.tarjetaMapa}>
                            <div>
                                <h3>Sin solicitudes de mapa</h3>
                                <p>No hay solicitudes pendientes de revisión.</p>
                            </div>
                        </article>
                    )}

                    {!cargando && mapas.map((mapa) => (
                        <article className={styles.tarjetaMapa} key={mapa.id_solicitud_mapa}>
                            <div>
                                <span className={styles.etiquetaSolicitud}>
                                    Actualización de mapa
                                </span>

                                <h3>{mapa.comunidad}</h3>

                                <p>
                                    {mapa.detalles || "Sin detalles adicionales."}
                                </p>
                            </div>

                            <button href={`/administrador/solicitudes/mapas/${mapa.id_solicitud_mapa}`} className={styles.botonRevision}>
                                Revisar solicitud
                            </button>
                        </article>
                    ))}
                </section>
            </section>
        </main>
    );
}
