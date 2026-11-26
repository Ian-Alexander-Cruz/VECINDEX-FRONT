"use client"

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/SolicitudMapa.module.css";
import { solicitarAPI } from "@/app/services/api";

const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/fiord";
const PENDIENTE = 1;
const EN_REVISION = 2;
const EN_PROCESO = 3;
const ATENDIDA = 4;

function limites(geojson) {
    let oeste = Infinity, sur = Infinity, este = -Infinity, norte = -Infinity;

    function recorrer(valor) {
        if (!Array.isArray(valor)) return;
        if (typeof valor[0] === "number") {
            oeste = Math.min(oeste, valor[0]);
            este = Math.max(este, valor[0]);
            sur = Math.min(sur, valor[1]);
            norte = Math.max(norte, valor[1]);
            return;
        }
        valor.forEach(recorrer);
    }

    function geometria(objeto) {
        if (!objeto) return;
        if (objeto.type === "FeatureCollection") return objeto.features?.forEach((feature) => geometria(feature.geometry));
        if (objeto.type === "Feature") return geometria(objeto.geometry);
        if (objeto.type === "GeometryCollection") return objeto.geometries?.forEach(geometria);
        recorrer(objeto.coordinates);
    }

    geometria(geojson);
    return Number.isFinite(oeste) ? [[oeste, sur], [este, norte]] : null;
}

function anillos(geojson) {
    const lista = [];

    function geometria(objeto) {
        if (!objeto) return;
        if (objeto.type === "FeatureCollection") return objeto.features?.forEach((feature) => geometria(feature.geometry));
        if (objeto.type === "Feature") return geometria(objeto.geometry);
        if (objeto.type === "GeometryCollection") return objeto.geometries?.forEach(geometria);
        if (objeto.type === "Polygon") lista.push(objeto.coordinates[0]);
        if (objeto.type === "MultiPolygon") objeto.coordinates.forEach((poligono) => lista.push(poligono[0]));
    }

    geometria(geojson);
    return lista;
}

export default function SolicitudMapa() {
    const [solicitud, setSolicitud] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const contenedor = useRef(null);

    useEffect(() => {
        async function cargarSolicitudes() {
            try {
                const lista = await solicitarAPI("/api/mapa/mias");
                setSolicitud(Array.isArray(lista) && lista.length ? lista[0] : null);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        }

        cargarSolicitudes();
    }, []);

    const estatus = solicitud?.id_estatus ?? null;
    const urlMapa = (estatus === EN_REVISION || estatus === ATENDIDA) ? solicitud.archivos_mapa : null;
    const puedePedir = !cargando && !error && (solicitud === null || estatus === ATENDIDA);

    useEffect(() => {
        if (!urlMapa || !contenedor.current) return;

        let cancelado = false;
        let instancia = null;

        async function crearMapa() {
            const maplibregl = await import("maplibre-gl");
            if (cancelado) return;

            maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs");

            instancia = new maplibregl.Map({
                container: contenedor.current,
                style: ESTILO_MAPA,
                center: [-99.1332, 19.4326],
                zoom: 15
            });

            instancia.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

            instancia.on("load", async () => {
                instancia.addSource("unidad", { type: "geojson", data: urlMapa });
                instancia.addLayer({ id: "unidad-relleno", type: "fill", source: "unidad", paint: { "fill-color": "#33CEBF", "fill-opacity": 0.12 } });
                instancia.addLayer({ id: "unidad-borde", type: "line", source: "unidad", paint: { "line-color": "#33CEBF", "line-width": 2.5 } });

                try {
                    const datos = await instancia.getSource("unidad").getData();
                    const caja = limites(datos);

                    if (caja) {
                        instancia.fitBounds(caja, { padding: 50, duration: 0, maxZoom: 18 });
                        instancia.setMinZoom(instancia.getZoom());
                        instancia.setMaxBounds(instancia.getBounds());
                    }

                    const huecos = anillos(datos);

                    if (huecos.length) {
                        instancia.addSource("fuera", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ...huecos] } } });
                        instancia.addLayer({ id: "fuera", type: "fill", source: "fuera", paint: { "fill-color": "#171943", "fill-opacity": 1 } }, "unidad-borde");
                    }
                } catch {
                    setMensaje("No se pudo dibujar el contenido del mapa");
                    setTipoMensaje("error");
                }
            });
        }

        crearMapa();

        return () => {
            cancelado = true;
            instancia?.remove();
        };
    }, [urlMapa]);

    async function pedirMapa(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");

        const formulario = evento.currentTarget;
        const datosFormulario = new FormData(formulario);

        setProcesando(true);

        try {
            const creada = await solicitarAPI("/api/mapa", {
                method: "POST",
                body: datosFormulario
            });

            setSolicitud(creada);
            setMostrarFormulario(false);
            formulario.reset();

            setMensaje("Solicitud enviada. Un administrador la revisará.");
            setTipoMensaje("exito");

        } catch (error) {
            setMensaje(error.message);
            setTipoMensaje("error");

        } finally {
            setProcesando(false);
        }
    }

    async function cambiarEstado(accion, pregunta, exito) {
        if (!window.confirm(pregunta)) return;

        setMensaje("");
        setTipoMensaje("");
        setProcesando(true);

        try {
            const actualizada = await solicitarAPI(`/api/mapa/${solicitud.id_solicitud_mapa}/${accion}`, {
                method: "PUT"
            });

            setSolicitud(actualizada);
            setMensaje(exito);
            setTipoMensaje("exito");

        } catch (error) {
            setMensaje(error.message);
            setTipoMensaje("error");

        } finally {
            setProcesando(false);
        }
    }

    return (
        <main className={styles.pagina}>
            <FondoCuenta />

            <div className={styles.contenido}>
                <header className={styles.encabezado}>
                    <h1>Mapa de la unidad</h1>
                    <p>Solicita el mapa de tu unidad habitacional y revísalo cuando el administrador lo entregue.</p>
                </header>

                {mensaje && (
                    <p className={styles.mensaje} data-tipo={tipoMensaje} role="alert">
                        {mensaje}
                    </p>
                )}

                {cargando && <p className={styles.aviso} role="status">Cargando la información del mapa...</p>}

                {!cargando && error && (
                    <p className={styles.mensaje} data-tipo="error" role="alert">{error}</p>
                )}

                {!cargando && !error && estatus === PENDIENTE && (
                    <section className={styles.tarjeta}>
                        <h2>Tu solicitud está pendiente</h2>
                        <p className={styles.descripcion}>
                            Ya enviaste la solicitud. Estás esperando a que un administrador la acepte.
                        </p>

                        {solicitud.detalles && (
                            <>
                                <p className={styles.subtitulo}>Descripción que enviaste</p>
                                <p className={styles.descripcion}>{solicitud.detalles}</p>
                            </>
                        )}

                        {solicitud.imagen_zona && (
                            <>
                                <p className={styles.subtitulo}>Imagen de la zona</p>
                                <div className={styles.contenedorImagen}>
                                    <img src={solicitud.imagen_zona} alt="Zona de la unidad habitacional" />
                                </div>
                            </>
                        )}
                    </section>
                )}

                {!cargando && !error && estatus === EN_PROCESO && (
                    <section className={styles.tarjeta}>
                        <h2>Un administrador está trabajando en tu mapa</h2>
                        <p className={styles.descripcion}>
                            Tu solicitud ya fue aceptada. Cuando el mapa esté listo podrás revisarlo aquí.
                        </p>

                        {solicitud.imagen_zona && (
                            <>
                                <p className={styles.subtitulo}>Imagen de la zona</p>
                                <div className={styles.contenedorImagen}>
                                    <img src={solicitud.imagen_zona} alt="Zona de la unidad habitacional" />
                                </div>
                            </>
                        )}
                    </section>
                )}

                {!cargando && !error && estatus === EN_REVISION && (
                    <section className={styles.tarjeta}>
                        <h2>Revisa el mapa</h2>
                        <p className={styles.descripcion}>
                            El administrador entregó el mapa de tu unidad. Revisa que el área esté bien delimitada.
                        </p>

                        <p className={styles.subtitulo}>Mapa entregado</p>
                        <div className={styles.zona}>
                            <div ref={contenedor} className={styles.mapa} role="region" aria-label="Mapa de la unidad habitacional" />
                        </div>

                        <div className={styles.acciones}>
                            <button
                                type="button"
                                className={styles.botonSecundario}
                                disabled={procesando}
                                onClick={() => cambiarEstado(
                                    "modificacion",
                                    "¿Deseas pedirle al administrador que modifique el mapa?",
                                    "Se envió tu solicitud de modificación."
                                )}
                            >
                                {procesando ? "Enviando..." : "Solicitar modificación"}
                            </button>

                            <button
                                type="button"
                                className={styles.botonPrincipal}
                                disabled={procesando}
                                onClick={() => cambiarEstado(
                                    "terminar",
                                    "¿El mapa es correcto? Al terminar, el proceso se cierra.",
                                    "El proceso del mapa quedó terminado."
                                )}
                            >
                                {procesando ? "Enviando..." : "Terminar proceso"}
                            </button>
                        </div>
                    </section>
                )}

                {!cargando && !error && estatus === ATENDIDA && (
                    <section className={styles.tarjeta}>
                        <h2>Mapa de tu unidad</h2>
                        <p className={styles.descripcion}>
                            Este es el mapa que quedó registrado para tu comunidad.
                        </p>

                        <div className={styles.zona}>
                            <div ref={contenedor} className={styles.mapa} role="region" aria-label="Mapa de la unidad habitacional" />
                        </div>
                    </section>
                )}

                {puedePedir && (
                    <section className={styles.tarjeta}>
                        <h2>{solicitud === null ? "Todavía no tienes mapa" : "¿Necesitas otro mapa?"}</h2>
                        <p className={styles.descripcion}>
                            Envía una imagen con las calles que delimitan tu unidad habitacional. Un administrador la usará para generar el mapa.
                        </p>

                        <div className={styles.acciones}>
                            <button
                                type="button"
                                className={styles.botonPrincipal}
                                onClick={() => {
                                    setMostrarFormulario(!mostrarFormulario);
                                    setMensaje("");
                                    setTipoMensaje("");
                                }}
                            >
                                {mostrarFormulario ? "Cancelar" : "Pedir mapa de la zona"}
                            </button>
                        </div>

                        {mostrarFormulario && (
                            <form className={styles.formulario} onSubmit={pedirMapa}>
                                <div className={styles.campo}>
                                    <label htmlFor="imagen"> Imagen de la zona </label>
                                    <input
                                        className={styles.selectorArchivo}
                                        type="file"
                                        id="imagen"
                                        name="imagen"
                                        accept=".jpg,.jpeg,.png"
                                        required
                                    />
                                </div>

                                <div className={styles.campo}>
                                    <label htmlFor="descripcion"> Descripción de la zona (opcional) </label>
                                    <textarea
                                        id="descripcion"
                                        name="descripcion"
                                        rows={4}
                                        maxLength={1000}
                                        placeholder="Entre qué calles está la unidad, referencias, etcétera"
                                    />
                                </div>

                                <div className={styles.acciones}>
                                    <button type="submit" className={styles.botonPrincipal} disabled={procesando}>
                                        {procesando ? "Enviando..." : "Enviar solicitud"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}