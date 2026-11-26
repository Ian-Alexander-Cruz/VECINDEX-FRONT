"use client"

import { useEffect, useRef, useState } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/SolicitudMapa.module.css";
import mapaStyles from "@/app/styles/MapaCC.module.css";
import { solicitarAPI } from "@/app/services/api";

const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/fiord";
const PENDIENTE = 1;
const EN_REVISION = 2;
const EN_PROCESO = 3;
const ATENDIDA = 4;
const ESTATUS = [
    { id: PENDIENTE, nombre: "Pendiente", color: "#F5C542" },
    { id: EN_REVISION, nombre: "En revisión", color: "#6EA8FE" },
    { id: EN_PROCESO, nombre: "En proceso", color: "#33CEBF" },
    { id: ATENDIDA, nombre: "Atendida", color: "#A0A8BD" }
];

const colorDe = (idEstatus) => ESTATUS.find((estatus) => estatus.id === idEstatus)?.color ?? "#FFFFFF";
const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

function coordenadas(peticion) {
    if (peticion.latitud === null || peticion.latitud === undefined || peticion.longitud === null || peticion.longitud === undefined) return null;
    const latitud = Number(peticion.latitud);
    const longitud = Number(peticion.longitud);
    return Number.isFinite(latitud) && Number.isFinite(longitud) ? [longitud, latitud] : null;
}

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
    const [peticiones, setPeticiones] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [errorMapa, setErrorMapa] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [procesando, setProcesando] = useState(false);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [mapaListo, setMapaListo] = useState(false);
    const [visibles, setVisibles] = useState(ESTATUS.map((estatus) => estatus.id));
    const [idSeleccionada, setIdSeleccionada] = useState(null);
    const contenedor = useRef(null);
    const mapa = useRef(null);
    const marcadores = useRef(new Map());

    useEffect(() => {
        async function cargarSolicitudes() {
            try {
                const lista = await solicitarAPI("/api/mapa/mias");
                const actual = Array.isArray(lista) && lista.length ? lista[0] : null;
                setSolicitud(actual);

                if (actual && (actual.id_estatus === EN_REVISION || actual.id_estatus === ATENDIDA)) {
                    const listaPeticiones = await solicitarAPI("/api/peticion/mias");
                    setPeticiones(Array.isArray(listaPeticiones) ? listaPeticiones : []);
                }
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
    const puedePedir = !cargando && !error && solicitud === null;
    const seleccionada = peticiones.find((peticion) => peticion.id_peticion === idSeleccionada);
    const sinUbicacion = peticiones.filter((peticion) => !coordenadas(peticion)).length;

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
            instancia.on("click", () => setIdSeleccionada(null));
            mapa.current = { instancia, maplibregl };

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
                    setErrorMapa("No se pudo dibujar el contenido del mapa");
                }

                setMapaListo(true);
            });
        }

        crearMapa();

        return () => {
            cancelado = true;
            setMapaListo(false);
            instancia?.remove();
            mapa.current = null;
        };
    }, [urlMapa]);

    useEffect(() => {
        const actual = mapa.current;
        if (!mapaListo || !actual) return;

        const creados = new Map();

        peticiones.forEach((peticion) => {
            const posicion = coordenadas(peticion);
            if (!posicion) return;

            const pin = document.createElement("button");
            pin.type = "button";
            pin.className = mapaStyles.pin;
            pin.style.setProperty("--color-pin", colorDe(peticion.id_estatus));
            pin.setAttribute("aria-label", `Petición: ${peticion.titulo}`);
            pin.addEventListener("click", (evento) => {
                evento.stopPropagation();
                setIdSeleccionada(peticion.id_peticion);
            });

            const marcador = new actual.maplibregl.Marker({ element: pin }).setLngLat(posicion).addTo(actual.instancia);
            creados.set(peticion.id_peticion, { marcador, idEstatus: peticion.id_estatus });
        });

        marcadores.current = creados;

        return () => creados.forEach(({ marcador }) => marcador.remove());
    }, [mapaListo, peticiones]);

    useEffect(() => {
        marcadores.current.forEach(({ marcador, idEstatus }, idPeticion) => {
            const elemento = marcador.getElement();
            elemento.style.display = visibles.includes(idEstatus) ? "" : "none";
            elemento.classList.toggle(mapaStyles.pinSeleccionado, idPeticion === idSeleccionada);
        });
    }, [visibles, idSeleccionada, peticiones, mapaListo]);

    function alternarFiltro(idEstatus) {
        setVisibles((actuales) => actuales.includes(idEstatus)
            ? actuales.filter((id) => id !== idEstatus)
            : [...actuales, idEstatus]);
        setIdSeleccionada(null);
    }

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
                    <p>Solicita el mapa de tu unidad habitacional. Cuando lo tengas, aquí verás las peticiones de los habitantes.</p>
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

                {!cargando && !error && (estatus === EN_REVISION || estatus === ATENDIDA) && (
                    <section className={styles.tarjeta}>
                        <h2>{estatus === EN_REVISION ? "Revisa el mapa" : "Mapa de tu unidad"}</h2>
                        <p className={styles.descripcion}>
                            {estatus === EN_REVISION
                                ? "El administrador entregó el mapa de tu unidad. Revisa que el área esté bien delimitada; abajo están las peticiones de los habitantes."
                                : "Este es el mapa registrado para tu comunidad. Toca un punto para ver la petición del habitante."}
                        </p>

                        <fieldset className={`${mapaStyles.filtros} ${styles.filtrosMapa}`}>
                            <legend>Mostrar peticiones</legend>
                            {ESTATUS.map((estado) => (
                                <button
                                    key={estado.id}
                                    type="button"
                                    className={mapaStyles.filtro}
                                    style={{ "--color-pin": estado.color }}
                                    aria-pressed={visibles.includes(estado.id)}
                                    onClick={() => alternarFiltro(estado.id)}
                                >
                                    <span className={mapaStyles.puntoFiltro} aria-hidden="true" />
                                    {estado.nombre} ({peticiones.filter((peticion) => peticion.id_estatus === estado.id && coordenadas(peticion)).length})
                                </button>
                            ))}
                        </fieldset>

                        {errorMapa && <p className={styles.mensaje} data-tipo="error" role="alert">{errorMapa}</p>}

                        <div className={styles.zona}>
                            <div ref={contenedor} className={styles.mapa} role="region" aria-label="Mapa de la unidad habitacional con las peticiones" />

                            {seleccionada && (
                                <aside className={mapaStyles.detalle} aria-labelledby="detalle-peticion" style={{ "--color-pin": colorDe(seleccionada.id_estatus) }}>
                                    <div className={mapaStyles.cabeceraDetalle}>
                                        <h2 id="detalle-peticion">{seleccionada.titulo}</h2>
                                        <button type="button" className={mapaStyles.cerrar} aria-label="Cerrar detalle" onClick={() => setIdSeleccionada(null)}>×</button>
                                    </div>

                                    <div className={mapaStyles.etiquetas}>
                                        {seleccionada.estatus && <span className={mapaStyles.etiqueta}>{String(seleccionada.estatus).toLowerCase()}</span>}
                                        {seleccionada.tipo_problema && <span className={mapaStyles.etiquetaTipo}>{seleccionada.tipo_problema}</span>}
                                    </div>

                                    {seleccionada.evidencias?.[0]?.foto && (
                                        <img src={seleccionada.evidencias[0].foto} alt={seleccionada.evidencias[0].descripcion || "Evidencia de la petición"} className={mapaStyles.foto} />
                                    )}

                                    {seleccionada.descripcion && <p className={mapaStyles.texto}>{seleccionada.descripcion}</p>}

                                    <dl className={mapaStyles.datos}>
                                        {seleccionada.autor && (
                                            <div><dt>Reporta</dt><dd>{seleccionada.autor}</dd></div>
                                        )}
                                        {seleccionada.ubicacion && (
                                            <div><dt>Ubicación</dt><dd>{seleccionada.ubicacion}</dd></div>
                                        )}
                                        {seleccionada.detalle_ubicacion && (
                                            <div><dt>Referencia</dt><dd>{seleccionada.detalle_ubicacion}</dd></div>
                                        )}
                                        <div><dt>Creada</dt><dd>{formatearFecha(seleccionada.fecha_creacion)}</dd></div>
                                    </dl>

                                    <div className={mapaStyles.apoyos}>
                                        <p className={mapaStyles.conteo}>
                                            <strong>{seleccionada.total_apoyos ?? 0}</strong>
                                            <span>{seleccionada.total_apoyos === 1 ? "vecino la apoya" : "vecinos la apoyan"}</span>
                                        </p>
                                    </div>
                                </aside>
                            )}
                        </div>

                        {sinUbicacion > 0 && (
                            <p className={mapaStyles.nota}>
                                {sinUbicacion === 1 ? "1 petición no tiene ubicación en el mapa." : `${sinUbicacion} peticiones no tienen ubicación en el mapa.`}
                            </p>
                        )}

                        {estatus === EN_REVISION && (
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
                        )}
                    </section>
                )}

                {puedePedir && (
                    <section className={styles.tarjeta}>
                        <h2>Todavía no tienes mapa</h2>
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
