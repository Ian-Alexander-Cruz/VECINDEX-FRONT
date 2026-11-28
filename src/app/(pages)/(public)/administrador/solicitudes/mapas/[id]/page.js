"use client";

import { use, useEffect, useRef, useState } from "react";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../../../services/api";
import styles from "@/app/styles/MapaDetalle.module.css";

export default function MapaDetalle({ params }) {
    const { id } = use(params);
    const [solicitud, setSolicitud] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);
    const [archivoMapa, setArchivoMapa] = useState(null);
    const inputMapa = useRef(null);

    useEffect(() => {
        let activo = true;

        async function cargarSolicitud() {
            try {
                const datos = await solicitarAPI(`/api/mapa/${id}`);

                if (activo) {
                    setSolicitud(datos);
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

        cargarSolicitud();

        return () => {
            activo = false;
        };
    }, [id]);


    async function aceptarSolicitud() {
        const confirmado = window.confirm("¿Estás seguro de que deseas aceptar esta solicitud de mapa?");

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            const actualizado = await solicitarAPI(`/api/mapa/${id}/aceptar`, {method: "PUT"}
            );

            setSolicitud(actualizado);

            setMensajeAccion("La solicitud de mapa fue aceptada correctamente.");
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    async function subirMapa() {
        if (!archivoMapa) {
            setMensajeAccion("Selecciona un archivo antes de continuar.");
            setErrorAccion(true);
            return;
        }

        const confirmado = window.confirm("¿Estás seguro de que deseas cargar este mapa?");

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            const formulario = new FormData();
            formulario.append("mapa", archivoMapa);

            const actualizado = await solicitarAPI(`/api/mapa/${id}/mapa`, {method: "PUT", body: formulario});

            setSolicitud(actualizado);
            setArchivoMapa(null);

            if (inputMapa.current) {
                inputMapa.current.value = "";
            }

            setMensajeAccion("El mapa se cargó correctamente.");
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

                    <h1>Solicitud de mapa</h1>

                    <p>
                        Revisa la información de la solicitud de actualización del mapa.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información de la solicitud...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la solicitud</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && solicitud && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información de la solicitud</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Identificador</span>
                                    <p>{solicitud.id_solicitud_mapa}</p>
                                </div>

                                <div>
                                    <span>Comunidad</span>
                                    <p>{solicitud.comunidad || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Estado de la solicitud</span>
                                    <p>{solicitud.estatus || "No disponible"}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Detalles de la solicitud</h2>

                            <p className={styles.descripcion}>
                                {solicitud.detalles || "No hay detalles adicionales."}
                            </p>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Fotografía de la zona</h2>

                            {solicitud.imagen_zona ? (
                                <div className={styles.contenedorImagen}>
                                    <img src={solicitud.imagen_zona} alt={`Zona de la comunidad ${solicitud.comunidad}`}/>
                                </div>
                            ) : (
                                <p className={styles.mensaje}>
                                    No hay una fotografía disponible.
                                </p>
                            )}
                        </section>


                        {solicitud.id_estatus === 3 && (
                            <section className={styles.tarjeta}>
                                <h2>Cargar nuevo mapa</h2>

                                <p className={styles.descripcion}>
                                    Selecciona el archivo GeoJSON correspondiente al mapa actualizado.
                                </p>

                                <input className={styles.selectorArchivo} ref={inputMapa} type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={(evento) => {
                                        setArchivoMapa(evento.target.files?.[0] || null);
                                }}/>

                                {archivoMapa && (
                                    <div className={styles.archivoSeleccionado}>
                                        <p className={styles.descripcion}>
                                            Archivo seleccionado: {archivoMapa.name}
                                        </p>

                                        <button className={styles.botonQuitar} type="button" onClick={() => {
                                            setArchivoMapa(null);
                                            if (inputMapa.current) {
                                                    inputMapa.current.value = "";
                                            }
                                            }}>
                                            Quitar archivo
                                        </button>
                                    </div>
                                )}

                                <section className={styles.acciones}>
                                    <button type="button" className={styles.botonAprobar} onClick={() => window.open("https://geojson.io/", "_blank", "noopener,noreferrer")}>
                                        Ver mapa
                                    </button>

                                    <button type="button" className={styles.botonAprobar} onClick={subirMapa} disabled={procesando}>
                                        {procesando ? "Procesando..." : "Cargar mapa"}
                                    </button>
                                </section>
                            </section>
                        )}

                        {solicitud.id_estatus === 1 && (
                            <section className={styles.acciones}>
                                <button className={styles.botonAprobar} onClick={aceptarSolicitud} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Aceptar solicitud"}
                                </button>
                            </section>
                        )}

                        {mensajeAccion && (
                            <p className={styles.mensajeAccion} style={{ color: errorAccion ? "#ff8080" : "#33CEBF" }}>
                                {mensajeAccion}
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
