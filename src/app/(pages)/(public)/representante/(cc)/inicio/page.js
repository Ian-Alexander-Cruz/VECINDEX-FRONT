"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/InicioComunidad.module.css";
import homeStyles from "@/app/styles/Home.module.css";
import detalleStyles from "@/app/styles/ComunidadDetalle.module.css";

export default function Inicio() {

    const [items, setItems] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [sinComunidad, setSinComunidad] = useState(false);
    const [error, setError] = useState("");
    const [solicitudes, setSolicitudes] = useState([]);
    const [nombreComunidad, setNombreComunidad] = useState("");
    const [mensajeSolicitudes, setMensajeSolicitudes] = useState("");
    const [mensajeSolicitud, setMensajeSolicitud] = useState("");
    const [accionFallida, setAccionFallida] = useState(false);
    const [procesandoSolicitud, setProcesandoSolicitud] = useState(null);

    const tipos = {
        publicacion: "Publicación",
        encuesta: "Encuesta",
        peticion: "Petición"
    };

    const claseChip = {
        publicacion: styles.chipPublicacion,
        encuesta: styles.chipEncuesta,
        peticion: styles.chipPeticion
    };

    const filtros = [
        { valor: "todos", etiqueta: "Todos" },
        { valor: "publicacion", etiqueta: "Publicaciones" },
        { valor: "encuesta", etiqueta: "Encuestas" },
        { valor: "peticion", etiqueta: "Peticiones" }
    ];

    const mensajeVacio = {
        todos: "Todavía no hay publicaciones, encuestas ni peticiones en tu comunidad.",
        publicacion: "Todavía no hay publicaciones en tu comunidad.",
        encuesta: "Todavía no hay encuestas en tu comunidad.",
        peticion: "Todavía no hay peticiones en tu comunidad."
    };

    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    const sinComunidadApi = "Comunidad no encontrada";

    function formatearFecha(fecha) {
        const valor = new Date(fecha ?? 0);

        if (Number.isNaN(valor.getTime())) return "Sin fecha";

        return `${String(valor.getDate()).padStart(2, "0")} ${meses[valor.getMonth()]} ${valor.getFullYear()}`;
    }

    function aTiempo(fecha) {
        const valor = new Date(fecha ?? 0).getTime();
        return Number.isNaN(valor) ? 0 : valor;
    }


    function construirItems([publicaciones, encuestas, peticiones]) {
        const lista = [];

        if (publicaciones.status === "fulfilled" && Array.isArray(publicaciones.value)) {
            publicaciones.value.forEach((publicacion) => {
                lista.push({
                    clave: `publicacion-${publicacion.id_publicacion}`,
                    id: publicacion.id_publicacion,
                    tipo: "publicacion",
                    titulo: publicacion.titulo,
                    descripcion: publicacion.descripcion,
                    imagen: publicacion.imagen,
                    fecha: publicacion.fecha_publicacion,
                    tiempo: aTiempo(publicacion.fecha_publicacion),
                    meta: [publicacion.estatus].filter(Boolean)
                });
            });
        }

        if (encuestas.status === "fulfilled" && Array.isArray(encuestas.value)) {
            encuestas.value.forEach((encuesta) => {
                const opciones = encuesta.opciones?.length ?? 0;

                lista.push({
                    clave: `encuesta-${encuesta.id_encuesta}`,
                    id: encuesta.id_encuesta,
                    tipo: "encuesta",
                    titulo: encuesta.titulo,
                    descripcion: `Encuesta con ${opciones} ${opciones === 1 ? "opción" : "opciones"} para votar.`,
                    imagen: null,
                    fecha: encuesta.fecha_creacion,
                    tiempo: aTiempo(encuesta.fecha_creacion),
                    meta: [
                        encuesta.abierta ? "Abierta" : "Cerrada",
                        `${encuesta.total_votos ?? 0} ${encuesta.total_votos === 1 ? "voto" : "votos"}`
                    ]
                });
            });
        }

        if (peticiones.status === "fulfilled" && Array.isArray(peticiones.value)) {
            peticiones.value.forEach((peticion) => {
                const apoyos = peticion.total_apoyos ?? 0;

                lista.push({
                    clave: `peticion-${peticion.id_peticion}`,
                    id: peticion.id_peticion,
                    tipo: "peticion",
                    titulo: peticion.titulo,
                    descripcion: peticion.descripcion,
                    imagen: peticion.evidencias?.[0]?.foto ?? null,
                    fecha: peticion.fecha_creacion,
                    tiempo: aTiempo(peticion.fecha_creacion),
                    apoyos,
                    detalle: [
                        peticion.tipo_problema,
                        peticion.autor ? `Por ${peticion.autor}` : null,
                        peticion.estatus
                    ].filter(Boolean).join(" · "),
                    meta: [
                        peticion.tipo_problema,
                        peticion.autor ? `Por ${peticion.autor}` : null,
                        `${apoyos} ${apoyos === 1 ? "apoyo" : "apoyos"}`,
                        peticion.estatus
                    ].filter(Boolean)
                });
            });
        }

        return lista;
    }

    useEffect(() => {
        let activo = true;

        async function cargarActividad() {
            const resultados = await Promise.allSettled([
                solicitarAPI("/api/publicacion/mias"),
                solicitarAPI("/api/encuesta/mias"),
                solicitarAPI("/api/peticion/mias"),
                solicitarAPI("/api/integrante/solicitudes"),
                solicitarAPI("/api/comunidad/perfil")
            ]);

            if (!activo) return;

            const actividad = resultados.slice(0, 3);
            const solicitudesResultado = resultados[3];
            const perfilResultado = resultados[4];

            const rechazados = actividad.filter((resultado) => resultado.status === "rejected");
            const mensajes = rechazados.map((resultado) => resultado.reason?.message).filter(Boolean);

            if (rechazados.length === 3 && mensajes.every((mensaje) => mensaje === sinComunidadApi)) {
                setSinComunidad(true);
            } else if (rechazados.length === 3) {
                setError(mensajes[0] || "No fue posible cargar la actividad de tu comunidad.");
            }

            if (solicitudesResultado.status === "fulfilled" && Array.isArray(solicitudesResultado.value)) {
                setSolicitudes(solicitudesResultado.value);
            } else if (solicitudesResultado.status === "rejected") {
                setMensajeSolicitudes(solicitudesResultado.reason?.message || "No se pudieron cargar las solicitudes de ingreso.");
            }

            if (perfilResultado.status === "fulfilled") {
                setNombreComunidad(perfilResultado.value?.nombre || "");
            }

            setItems(construirItems(actividad));
            setCargando(false);
        }

        cargarActividad();

        return () => {
            activo = false;
        };
    }, []);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        const filtrados = items.filter((item) => {
            const coincideTipo = filtro === "todos" || item.tipo === filtro;

            const coincideTexto =
                !texto ||
                item.titulo?.toLowerCase().includes(texto) ||
                item.descripcion?.toLowerCase().includes(texto);

            return coincideTipo && coincideTexto;
        });

        if (filtro === "peticion") {
            return [...filtrados].sort((a, b) => b.apoyos - a.apoyos || b.tiempo - a.tiempo);
        }

        return [...filtrados].sort((a, b) => b.tiempo - a.tiempo);
    }, [items, filtro, busqueda]);

    const peticionesApoyadas = useMemo(
        () => items
            .filter((item) => item.tipo === "peticion")
            .sort((a, b) => b.apoyos - a.apoyos || b.tiempo - a.tiempo),
        [items]
    );


    function tarjeta(item) {
        return (
            <Link key={item.clave} href={`/representante/detalles/${item.tipo}/${item.id}`} className={styles.tarjetaEnlace}>
                <article className={styles.tarjeta}>
                    {item.imagen && (
                        <img
                            src={item.imagen}
                            alt=""
                            className={styles.tarjetaImagen}
                            loading="lazy"
                        />
                    )}

                    <div className={styles.tarjetaCuerpo}>
                        <span className={`${styles.chip} ${claseChip[item.tipo]}`}>
                            {tipos[item.tipo]}
                        </span>

                        <h3 className={styles.tarjetaTitulo}>{item.titulo}</h3>

                        {item.descripcion && (
                            <p className={styles.tarjetaDescripcion}>{item.descripcion}</p>
                        )}

                        <div className={styles.tarjetaMeta}>
                            {item.meta.map((dato, indice) => (
                                <span key={`${dato}-${indice}`} className={styles.metaItem}>
                                    {dato}
                                </span>
                            ))}

                            <span className={styles.tarjetaFecha}>
                                {formatearFecha(item.fecha)}
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        );
    }


    async function resolverSolicitud(idIntegrante, aceptar) {
        setProcesandoSolicitud(idIntegrante);
        setMensajeSolicitud("");

        try {
            await solicitarAPI(`/api/integrante/${idIntegrante}/${aceptar ? "aceptar" : "rechazar"}`, { method: "PUT" });

            setSolicitudes((actuales) => actuales.filter((solicitud) => solicitud.id_integrante !== idIntegrante));
            setMensajeSolicitud(aceptar ? "El habitante ya forma parte de tu comunidad." : "La solicitud fue rechazada.");
            setAccionFallida(false);
        } catch (error) {
            setMensajeSolicitud(error.message);
            setAccionFallida(true);
        } finally {
            setProcesandoSolicitud(null);
        }
    }


    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panel} aria-labelledby="titulo-inicio">
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX REPRESENTANTE
                    </span>

                    <h1 id="titulo-inicio">Inicio</h1>

                    {nombreComunidad && (
                        <span className={styles.chipComunidad}>
                            Comunidad: {nombreComunidad}
                        </span>
                    )}

                    <p>
                        Consulta la actividad de tu comunidad.
                    </p>
                </header>

                {!sinComunidad && (
                    <div className={styles.controles}>
                        <div className={styles.busqueda}>
                            <span>⌕</span>
                            <input
                                type="search"
                                placeholder="Buscar en la actividad de tu comunidad..."
                                value={busqueda}
                                onChange={(evento) => setBusqueda(evento.target.value)}
                            />
                        </div>

                        <div className={styles.filtros}>
                            {filtros.map((opcion) => (
                                <button
                                    key={opcion.valor}
                                    type="button"
                                    className={filtro === opcion.valor ? styles.filtroActivo : ""}
                                    onClick={() => setFiltro(opcion.valor)}
                                >
                                    {opcion.etiqueta}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {!cargando && !sinComunidad && !error && (
                    <section className={homeStyles.seccionSolicitudes} style={{ marginBottom: "34px" }} aria-labelledby="titulo-solicitudes">
                        <div className={homeStyles.tituloSeccion}>
                            <div>
                                <h2 id="titulo-solicitudes">Solicitudes de ingreso</h2>
                                <p>
                                    Acepta o rechaza a los habitantes que quieren unirse a tu comunidad.
                                </p>
                            </div>
                        </div>

                        <div className={homeStyles.gridSolicitudes}>
                            {mensajeSolicitudes && (
                                <article className={homeStyles.tarjetaSolicitud}>
                                    <h3>No se pudieron cargar las solicitudes</h3>
                                    <p>{mensajeSolicitudes}</p>
                                </article>
                            )}

                            {!mensajeSolicitudes && solicitudes.length === 0 && (
                                <article className={homeStyles.tarjetaSolicitud}>
                                    <h3>Sin solicitudes pendientes</h3>
                                    <p>Cuando un habitante pida unirse a tu comunidad, aparecerá aquí.</p>
                                </article>
                            )}

                            {!mensajeSolicitudes && solicitudes.map((solicitud) => (
                                <article className={homeStyles.tarjetaSolicitud} key={solicitud.id_integrante}>
                                    <div className={homeStyles.cabeceraTarjeta}>
                                        <span className={homeStyles.etiquetaSolicitud}>Habitante</span>
                                        <span className={homeStyles.estadoPendiente}>Pendiente</span>
                                    </div>

                                    <h3>{solicitud.nombre || "Habitante sin nombre"}</h3>

                                    <p>Solicita unirse a tu comunidad.</p>

                                    <div className={homeStyles.datosSolicitud}>
                                        <span>Correo: {solicitud.correo || "No disponible"}</span>
                                        <span>Solicitó el {formatearFecha(solicitud.fecha_solicitud)}</span>
                                    </div>

                                    <div className={detalleStyles.acciones} style={{ width: "100%", marginTop: 0 }}>
                                        <button
                                            type="button"
                                            className={detalleStyles.botonRechazar}
                                            onClick={() => resolverSolicitud(solicitud.id_integrante, false)}
                                            disabled={procesandoSolicitud === solicitud.id_integrante}>
                                            {procesandoSolicitud === solicitud.id_integrante ? "Procesando..." : "Rechazar"}
                                        </button>

                                        <button
                                            type="button"
                                            className={detalleStyles.botonAprobar}
                                            onClick={() => resolverSolicitud(solicitud.id_integrante, true)}
                                            disabled={procesandoSolicitud === solicitud.id_integrante}>
                                            {procesandoSolicitud === solicitud.id_integrante ? "Procesando..." : "Aceptar"}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {mensajeSolicitud && (
                            <p role="status" style={{ margin: 0, color: accionFallida ? "#FF8585" : "#33CEBF", fontSize: "14px" }}>
                                {mensajeSolicitud}
                            </p>
                        )}
                    </section>
                )}

                {!cargando && !sinComunidad && !error && peticionesApoyadas.length > 0 && (
                    <section className={styles.seccionPeticiones} aria-labelledby="titulo-peticiones">
                        <div className={styles.encabezadoListado}>
                            <h2 id="titulo-peticiones">Peticiones más apoyadas</h2>
                            <span>De mayor a menor número de apoyos</span>
                        </div>

                        <ol className={styles.listaPeticiones}>
                            {peticionesApoyadas.slice(0, 5).map((item, indice) => (
                                <li key={item.clave}>
                                    <Link href={`/representante/detalles/peticion/${item.id}`} className={styles.peticionFila}>
                                        <span className={styles.peticionPosicion}>{indice + 1}</span>

                                        <span className={styles.peticionInfo}>
                                            <strong>{item.titulo}</strong>
                                            {item.detalle && <span>{item.detalle}</span>}
                                        </span>

                                        <span className={styles.peticionApoyos}>
                                            {item.apoyos} {item.apoyos === 1 ? "apoyo" : "apoyos"}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ol>

                        {peticionesApoyadas.length > 5 && (
                            <button
                                type="button"
                                className={styles.botonTodas}
                                onClick={() => setFiltro("peticion")}
                            >
                                Ver todas las peticiones ({peticionesApoyadas.length})
                            </button>
                        )}
                    </section>
                )}

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando actividad...
                    </p>
                )}

                {!cargando && sinComunidad && (
                    <div className={styles.estadoVacio}>
                        <h3>Aún no tienes una comunidad aprobada</h3>
                        <p>
                            Crea tu comunidad para empezar a ver publicaciones,
                            encuestas y peticiones.
                        </p>
                        <Link href="/representante/crear-comunidad" className={styles.botonCrear}>
                            Crear comunidad
                        </Link>
                    </div>
                )}

                {!cargando && !sinComunidad && error && (
                    <p className={styles.mensajeError}>
                        {error}
                    </p>
                )}

                {!cargando && !sinComunidad && !error && (
                    <section className={styles.seccionListado}>
                        <div className={styles.encabezadoListado}>
                            <h2>Actividad de la comunidad</h2>
                            <span>{visibles.length} resultados</span>
                        </div>

                        {visibles.length === 0 ? (
                            <div className={styles.estadoVacio}>
                                <h3>Sin actividad por mostrar</h3>
                                <p>{mensajeVacio[filtro]}</p>
                            </div>
                        ) : (
                            <div className={styles.grid}>
                                {visibles.map((item) => tarjeta(item))}
                            </div>
                        )}
                    </section>
                )}
            </section>
        </main>
    );
}
