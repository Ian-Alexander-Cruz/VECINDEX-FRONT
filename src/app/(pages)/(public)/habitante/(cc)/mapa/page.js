"use client"

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import "maplibre-gl/dist/maplibre-gl.css";
import FondoCuenta from "@/app/components/FondoCuenta";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css";
import mapaStyles from "@/app/styles/MapaCC.module.css";
import { solicitarAPI } from "@/app/services/api";

const ERRORES_SESION = ["Token requerido", "Token inválido o expirado"];
const SIN_MAPA = "La comunidad todavía no tiene mapa";
const ESTILO_MAPA = "https://tiles.openfreemap.org/styles/liberty"
const SATELITE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
const DENUE = "https://www.inegi.org.mx/app/api/denue/v1/consulta/Buscar/todos";
const ID_ESTATUS_ATENDIDA = 4;
const ESTATUS = [
    { id: 1, nombre: "Pendiente", color: "#F5C542" },
    { id: 2, nombre: "En revisión", color: "#6EA8FE" },
    { id: 3, nombre: "En proceso", color: "#33CEBF" },
    { id: 4, nombre: "Atendida", color: "#A0A8BD" }
];

const colorDe = (idEstatus) => ESTATUS.find((estatus) => estatus.id === idEstatus)?.color ?? "#FFFFFF";
const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", {day: "numeric", month: "short", year: "numeric"});

function coordenadas(peticion){
    if(peticion.latitud === null || peticion.latitud === undefined || peticion.longitud === null || peticion.longitud === undefined) return null
    const latitud = Number(peticion.latitud);
    const longitud = Number(peticion.longitud);
    return Number.isFinite(latitud) && Number.isFinite(longitud) ? [longitud, latitud] : null
}

function limites(geojson){
    let oeste = Infinity, sur = Infinity, este = -Infinity, norte = -Infinity;

    function recorrer(valor){
        if(!Array.isArray(valor)) return;
        if(typeof valor [0] === "number"){
            oeste = Math.min(oeste, valor[0]);
            este = Math.max(este, valor[0])
            sur = Math.min(sur, valor[1]);
            norte = Math.max(norte, valor[1]);
            return
        }
        valor.forEach(recorrer)
    }

    function geometria(objeto) {
        if (!objeto) return;
        if (objeto.type === "FeatureCollection") return objeto.features?.forEach((feature) => geometria(feature.geometry));
        if (objeto.type === "Feature") return geometria(objeto.geometry);
        if (objeto.type === "GeometryCollection") return objeto.geometries?.forEach(geometria);
        recorrer(objeto.coordinates);
    }

    geometria(geojson)
    return Number.isFinite(oeste) ? [[oeste, sur], [este, norte]] : null
}

function radioMetros([[oeste, sur], [este, norte]]){
    const ancho = (este - oeste) * 111320 * Math.cos(((sur + norte) / 2) * Math.PI / 180)
    const alto = (norte - sur) * 111320
    return Math.min(5000, Math.ceil(Math.hypot(ancho, alto) / 2))
}

function anillos(geojson){
    const lista = []

    function geometria(objeto){
        if(!objeto) return
        if(objeto.type === "FeatureCollection") return objeto.features?.forEach((feature) => geometria(feature.geometry))
        if(objeto.type === "Feature") return geometria(objeto.geometry)
        if(objeto.type === "GeometryCollection") return objeto.geometries?.forEach(geometria)
        if(objeto.type === "Polygon") lista.push(objeto.coordinates[0])
        if(objeto.type === "MultiPolygon") objeto.coordinates.forEach((poligono) => lista.push(poligono[0]))
    }

    geometria(geojson)
    return lista
}

export default function Mapa(){
    const idComunidad = useSearchParams().get("comunidad");
    const idValido = /^\d+$/.test(idComunidad ?? "");
    const { setUsuario } = useAuth();
    const contenedor = useRef(null);
    const mapa = useRef(null);
    const marcadores = useRef(new Map());
    const [urlMapa, setUrlMapa] = useState(null);
    const [peticiones, setPeticiones] = useState([]);
    const [cargando, setCargando] = useState(idValido);
    const [error, setError] = useState("");
    const [sinMapa, setSinMapa] = useState(false);
    const [mapaListo, setMapaListo] = useState(false);
    const [errorMapa, setErrorMapa] = useState("");
    const [visibles, setVisibles] = useState(ESTATUS.map((estatus) => estatus.id));
    const [idSeleccionada, setIdSeleccionada] = useState(null);
    const [apoyando, setApoyando] = useState(false);
    const [errorApoyo, setErrorApoyo] = useState("");
    const [vistaSatelite, setVistaSatelite] = useState(false);

    useEffect(() => {
        if (!mapaListo || !mapa.current) return;
        mapa.current.instancia.setLayoutProperty("satelite", "visibility", vistaSatelite ? "visible" : "none");
    }, [vistaSatelite, mapaListo]);

    useEffect(() => {
        if(!idValido) return

        async function cargar(){
            try {
                const [respuestaMapa, listaMapa] = await Promise.all([
                    solicitarAPI(`/api/mapa/comunidad/${idComunidad}`).catch((error) => {
                        if(error.message === SIN_MAPA) return null
                        throw error
                    }),
                    solicitarAPI(`/api/peticion/comunidad/${idComunidad}`)
                ])

                if(!respuestaMapa?.geojson){
                    setSinMapa(true)
                    return
                }
                setUrlMapa(respuestaMapa.geojson)
                setPeticiones(Array.isArray(listaMapa) ? listaMapa : [])
            }catch(error){
                if(ERRORES_SESION.includes(error.message)){
                    setUsuario(null)
                    return
                }
                setError(error.message || "No fue posible cargar el mapa")
            }finally {
                setCargando(false)
            }

        }
        cargar();
    }, [idComunidad, idValido, setUsuario])

    useEffect(() => {
        if(!urlMapa || !contenedor.current) return
        let cancelado = false;
        let instancia = null

        async function crearMapa(){
            const maplibregl = await import("maplibre-gl")
            if(cancelado)return
            maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs")
            instancia = new maplibregl.Map({
                container: contenedor.current,
                style: ESTILO_MAPA,
                center: [-99.1332, 19.4326],
                zoom: 70
            })
            instancia.addControl(new maplibregl.NavigationControl({showCompass: false}), "top-right")
            instancia.on("click", () => setIdSeleccionada(null))
            mapa.current = {instancia, maplibregl}

            instancia.on("load", async () => {
                const primeraEtiqueta = instancia.getStyle().layers.find((capa) => capa.type === "symbol")?.id
                instancia.addSource("satelite", {type: "raster", tiles: [SATELITE], tileSize: 256, maxzoom: 19, attribution: "Imágenes © Esri, Maxar, Earthstar Geographics"})
                instancia.addLayer({id: "satelite", type: "raster", source: "satelite", layout: {visibility: "none"}}, primeraEtiqueta)
                instancia.addSource("unidad", { type: "geojson", data: urlMapa });
                instancia.addLayer({ id: "unidad-relleno", type: "fill", source: "unidad", paint: { "fill-color": "#33CEBF", "fill-opacity": 0.12 } });
                instancia.addLayer({ id: "unidad-borde", type: "line", source: "unidad", paint: { "line-color": "#33CEBF", "line-width": 2.5 } });

                try {
                    const datos = await instancia.getSource("unidad").getData()
                    const caja = limites(datos)
                    if(caja){
                        instancia.fitBounds(caja, {padding: 50, duration: 0, maxZoom: 18})
                        instancia.setMinZoom(instancia.getZoom())
                        instancia.setMaxBounds(instancia.getBounds())
                    }
                    const huecos = anillos(datos)
                    if(huecos.length){
                        instancia.addSource("fuera", {type: "geojson", data: {type: "Feature", properties: {}, geometry: {type: "Polygon", coordinates: [[[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]], ...huecos]}}})
                        instancia.addLayer({id: "fuera", type: "fill", source: "fuera", paint: {"fill-color": "#171943", "fill-opacity": 1}}, "unidad-borde")
                    }
                    if(caja && process.env.NEXT_PUBLIC_DENUE_TOKEN){
                        try {
                            const [[oeste, sur], [este, norte]] = caja
                            const respuesta = await fetch(`${DENUE}/${(sur + norte) / 2},${(oeste + este) / 2}/${radioMetros(caja)}/${process.env.NEXT_PUBLIC_DENUE_TOKEN}`)
                            if(!respuesta.ok) throw new Error()
                            const locales = await respuesta.json()
                            const puntos = (Array.isArray(locales) ? locales : [])
                                .map((local) => ({type: "Feature", properties: {nombre: local.Nombre, giro: local.Clase_actividad}, geometry: {type: "Point", coordinates: [Number(local.Longitud), Number(local.Latitud)]}}))
                                .filter((punto) => punto.geometry.coordinates.every(Number.isFinite))
                            const debajoDe = instancia.getLayer("fuera") ? "fuera" : undefined

                            instancia.addSource("locales", {type: "geojson", data: {type: "FeatureCollection", features: puntos}})
                            instancia.addLayer({id: "locales-punto", type: "circle", source: "locales", paint: {"circle-radius": 3.5, "circle-color": "#8A8FA3", "circle-opacity": 0.7, "circle-stroke-width": 1, "circle-stroke-color": "#FFFFFF"}}, debajoDe)
                            instancia.addLayer({id: "locales-nombre", type: "symbol", source: "locales", minzoom: 17, layout: {"text-field": ["get", "nombre"], "text-font": ["Noto Sans Regular"], "text-size": 10, "text-offset": [0, 0.9], "text-anchor": "top", "text-max-width": 7, "text-optional": true}, paint: {"text-color": "#7A7F92", "text-halo-color": "#FFFFFF", "text-halo-width": 1}}, debajoDe)

                            instancia.on("click", "locales-punto", (evento) => {
                                const {nombre, giro} = evento.features[0].properties
                                new maplibregl.Popup({closeButton: false}).setLngLat(evento.features[0].geometry.coordinates).setText(`${nombre} · ${giro}`).addTo(instancia)
                            })
                            instancia.on("mouseenter", "locales-punto", () => { instancia.getCanvas().style.cursor = "pointer" })
                            instancia.on("mouseleave", "locales-punto", () => { instancia.getCanvas().style.cursor = "" })
                        }catch {
                            setErrorMapa("No se pudieron cargar los locales de la zona")
                        }
                    }
                }catch {
                    setErrorMapa("No se pudo cargar el contenido de la unidad")
                }

                setMapaListo(true)
            })
        }
        crearMapa();

        return () => {
            cancelado = true;
            setMapaListo(false)
            instancia?.remove()
            mapa.current = null;
        }
    }, [urlMapa])

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
                setErrorApoyo("");
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

    async function cambiarApoyo(peticion) {
        try {
            setApoyando(true);
            setErrorApoyo("");

            const actualizada = await solicitarAPI(`/api/peticion/${peticion.id_peticion}/apoyo`, {
                method: peticion.mi_apoyo ? "DELETE" : "POST"
            });

            setPeticiones((actuales) => actuales.map((actual) => (
                actual.id_peticion === peticion.id_peticion ? { ...actual, ...actualizada } : actual
            )));
        } catch (error) {
            if (ERRORES_SESION.includes(error.message)) {
                setUsuario(null);
                return;
            }
            setErrorApoyo(error.message || "No fue posible registrar tu apoyo.");
        } finally {
            setApoyando(false);
        }
    }

    const seleccionada = peticiones.find((peticion) => peticion.id_peticion === idSeleccionada);
    const sinUbicacion = peticiones.filter((peticion) => !coordenadas(peticion)).length;
    const volver = <Link href="/habitante/inicio_SC" className={mapaStyles.enlace}>Elegir una de mis comunidades</Link>;

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <div className={mapaStyles.pagina}>
                <div className={mapaStyles.contenido}>
                    <header className={mapaStyles.encabezado}>
                        <h1>Mapa de la comunidad</h1>
                        <p>Toca un punto para ver la petición y apoyarla. Cada color indica en qué estatus va.</p>
                    </header>

                    {!idValido ? (
                        <p className={mapaStyles.mensajeError} role="alert">No sabemos qué comunidad abrir.<br />{volver}</p>
                    ) : cargando ? (
                        <p className={mapaStyles.mensaje} role="status">Cargando el mapa...</p>
                    ) : error ? (
                        <p className={mapaStyles.mensajeError} role="alert">{error}<br />{volver}</p>
                    ) : sinMapa ? (
                        <p className={mapaStyles.mensaje} role="status">
                            Tu comunidad todavía no tiene mapa. Cuando el representante lo solicite y el administrador lo entregue, aquí verás las peticiones sobre la unidad.
                        </p>
                    ) : (
                        <>
                            <fieldset className={mapaStyles.filtros}>
                                <legend>Mostrar peticiones</legend>
                                {ESTATUS.map((estatus) => (
                                    <button key={estatus.id} type="button" className={mapaStyles.filtro} style={{ "--color-pin": estatus.color }} aria-pressed={visibles.includes(estatus.id)} onClick={() => alternarFiltro(estatus.id)}>
                                        <span className={mapaStyles.puntoFiltro} aria-hidden="true" />
                                        {estatus.nombre} ({peticiones.filter((peticion) => peticion.id_estatus === estatus.id && coordenadas(peticion)).length})
                                    </button>
                                ))}
                                <button type="button" className={mapaStyles.filtro} aria-pressed={vistaSatelite} onClick={() => setVistaSatelite((actual) => !actual)}>
                                    {vistaSatelite ? "Ver mapa" : "Ver satélite"}
                                </button>
                            </fieldset>

                            {errorMapa && <p className={mapaStyles.mensajeError} role="alert">{errorMapa}</p>}

                            <div className={mapaStyles.zona}>
                                <div ref={contenedor} className={mapaStyles.mapa} aria-label="Mapa de la unidad habitacional con las peticiones" role="region" />

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

                                            {seleccionada.es_mia ? (
                                                <span className={mapaStyles.notaApoyo}>Es tu petición</span>
                                            ) : seleccionada.id_estatus === ID_ESTATUS_ATENDIDA ? (
                                                <span className={mapaStyles.notaApoyo}>Ya fue atendida</span>
                                            ) : (
                                                <button type="button" className={`${mapaStyles.botonApoyo} ${seleccionada.mi_apoyo ? mapaStyles.botonQuitar : ""}`} disabled={apoyando} onClick={() => cambiarApoyo(seleccionada)}>
                                                    {apoyando ? "Guardando..." : seleccionada.mi_apoyo ? "Quitar apoyo" : "Apoyar"}
                                                </button>
                                            )}
                                        </div>

                                        {errorApoyo && <p className={mapaStyles.errorApoyo} role="alert">{errorApoyo}</p>}
                                    </aside>
                                )}
                            </div>

                            {sinUbicacion > 0 && (
                                <p className={mapaStyles.nota}>
                                    {sinUbicacion === 1 ? "1 petición no tiene ubicación en el mapa." : `${sinUbicacion} peticiones no tienen ubicación en el mapa.`}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    );

}