"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/InicioComunidad.module.css";
import inicioStyles from "@/app/styles/InicioCC.module.css";
import homeStyles from "@/app/styles/Home.module.css";
import detalleStyles from "@/app/styles/ComunidadDetalle.module.css";

const PIN = "M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z";
const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
const MAXIMO_PUBLICACIONES = 5;
const ID_ESTATUS_ATENDIDA = 4;
const sinComunidadApi = "Comunidad no encontrada";

const lista = (valor) => (Array.isArray(valor) ? valor : []);

const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

const aTiempo = (fecha) => {
    const valor = new Date(fecha ?? 0).getTime();
    return Number.isNaN(valor) ? 0 : valor;
};

function construirItems([publicaciones, encuestas, peticiones]) {
    const resultado = [];

    if (publicaciones.status === "fulfilled" && Array.isArray(publicaciones.value)) {
        publicaciones.value.forEach((publicacion) => {
            resultado.push({
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

            resultado.push({
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

            resultado.push({
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

    return resultado;
}

export default function Inicio() {
    const [comunidad, setComunidad] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const [encuestas, setEncuestas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [peticiones, setPeticiones] = useState([]);
    const [items, setItems] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [ahora, setAhora] = useState(0);
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

    useEffect(() => {
        let activo = true;

        async function cargarActividad() {
            const resultados = await Promise.allSettled([
                solicitarAPI("/api/comunidad/perfil"),
                solicitarAPI("/api/publicacion/mias"),
                solicitarAPI("/api/encuesta/mias"),
                solicitarAPI("/api/evento/mios"),
                solicitarAPI("/api/peticion/mias"),
                solicitarAPI("/api/integrante/solicitudes")
            ]);

            if (!activo) return;

            const [perfil, publicacionesR, encuestasR, eventosR, peticionesR, solicitudesR] = resultados;
            const actividad = [publicacionesR, encuestasR, peticionesR];

            const rechazados = actividad.filter((resultado) => resultado.status === "rejected");
            const mensajes = rechazados.map((resultado) => resultado.reason?.message).filter(Boolean);

            if (rechazados.length === 3 && mensajes.every((mensaje) => mensaje === sinComunidadApi)) {
                setSinComunidad(true);
            } else if (rechazados.length === 3) {
                setError(mensajes[0] || "No fue posible cargar la actividad de tu comunidad.");
            }

            if (perfil.status === "fulfilled") {
                setComunidad(perfil.value);
                setNombreComunidad(perfil.value?.nombre || "");
            }

            if (publicacionesR.status === "fulfilled") setPublicaciones(lista(publicacionesR.value));
            if (encuestasR.status === "fulfilled") setEncuestas(lista(encuestasR.value));
            if (eventosR.status === "fulfilled") setEventos(lista(eventosR.value));
            if (peticionesR.status === "fulfilled") setPeticiones(lista(peticionesR.value));

            if (solicitudesR.status === "fulfilled" && Array.isArray(solicitudesR.value)) {
                setSolicitudes(solicitudesR.value);
            } else if (solicitudesR.status === "rejected") {
                setMensajeSolicitudes(solicitudesR.reason?.message || "No se pudieron cargar las solicitudes de ingreso.");
            }

            setItems(construirItems(actividad));
            setAhora(Date.now());
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
                        <img src={item.imagen} alt="" className={styles.tarjetaImagen} loading="lazy" />
                    )}

                    <div className={styles.tarjetaCuerpo}>
                        <span className={`${styles.chip} ${claseChip[item.tipo]}`}>{tipos[item.tipo]}</span>
                        <h3 className={styles.tarjetaTitulo}>{item.titulo}</h3>

                        {item.descripcion && (
                            <p className={styles.tarjetaDescripcion}>{item.descripcion}</p>
                        )}

                        <div className={styles.tarjetaMeta}>
                            {item.meta.map((dato, indice) => (
                                <span key={`${dato}-${indice}`} className={styles.metaItem}>{dato}</span>
                            ))}

                            <span className={styles.tarjetaFecha}>{formatearFecha(item.fecha)}</span>
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

    const encuestasAbiertas = encuestas.filter((encuesta) => encuesta.abierta);
    const peticionesActivas = peticiones.filter((peticion) => peticion.id_estatus !== ID_ESTATUS_ATENDIDA).length;
    const publicacionesDelMes = publicaciones.filter((publicacion) => ahora - aTiempo(publicacion.fecha_publicacion) <= TREINTA_DIAS).length;
    const proximoEvento = eventos
        .filter((evento) => aTiempo(evento.fecha_evento) >= ahora)
        .sort((a, b) => aTiempo(a.fecha_evento) - aTiempo(b.fecha_evento))[0];

    const listo = !cargando && !sinComunidad && !error;

    return (
        <main className={inicioStyles.pagina}>
            <FondoCuenta />

            <div className={inicioStyles.contenido}>
                {cargando && (
                    <p className={inicioStyles.mensaje} role="status">Cargando tu comunidad...</p>
                )}

                {!cargando && error && (
                    <p className={inicioStyles.mensajeError} role="alert">{error}</p>
                )}

                {!cargando && sinComunidad && (
                    <div className={styles.estadoVacio}>
                        <h3>Aún no tienes una comunidad aprobada</h3>
                        <p>Crea tu comunidad para empezar a ver publicaciones, encuestas y peticiones.</p>
                        <Link href="/representante/crear-comunidad" className={styles.botonCrear}>
                            Crear comunidad
                        </Link>
                    </div>
                )}

                {listo && comunidad && (
                    <>
                        <header className={inicioStyles.cabecera}>
                            <div className={inicioStyles.portada}>
                                {comunidad.foto ? (
                                    <img src={comunidad.foto} alt={`Fotografía de ${comunidad.nombre}`} />
                                ) : (
                                    <div className={inicioStyles.sinFoto} aria-hidden="true">
                                        <svg viewBox="0 0 40 46"><path fillRule="evenodd" d={PIN} /></svg>
                                    </div>
                                )}
                            </div>

                            <div className={inicioStyles.resumen}>
                                <div className={inicioStyles.identidad}>
                                    <h1>{comunidad.nombre || nombreComunidad}</h1>
                                    <p className={inicioStyles.ubicacion}>
                                        <svg viewBox="0 0 40 46" aria-hidden="true"><path fillRule="evenodd" d={PIN} /></svg>
                                        <span>{comunidad.ubicacion}</span>
                                    </p>
                                    {comunidad.descripcion && (
                                        <p className={inicioStyles.descripcion}>{comunidad.descripcion}</p>
                                    )}
                                </div>

                                <dl className={inicioStyles.ficha} aria-label="Resumen de la comunidad">
                                    <div className={inicioStyles.dato}>
                                        <dt>Encuestas abiertas</dt>
                                        <dd>{encuestasAbiertas.length}</dd>
                                    </div>
                                    <div className={inicioStyles.dato}>
                                        <dt>Peticiones sin atender</dt>
                                        <dd>{peticionesActivas}</dd>
                                    </div>
                                    <div className={inicioStyles.dato}>
                                        <dt>{proximoEvento ? proximoEvento.titulo : "Próximo evento"}</dt>
                                        <dd className={inicioStyles.datoTexto}>
                                            {proximoEvento ? formatearFecha(proximoEvento.fecha_evento) : "Sin eventos"}
                                        </dd>
                                    </div>
                                    <div className={inicioStyles.dato}>
                                        <dt>Publicaciones en los últimos 30 días</dt>
                                        <dd>{publicacionesDelMes}</dd>
                                    </div>
                                </dl>
                            </div>
                        </header>

                        <div className={inicioStyles.columnas}>
                            <section className={inicioStyles.panel} aria-labelledby="publicaciones">
                                <h2 id="publicaciones">Publicaciones</h2>

                                {publicaciones.length === 0 ? (
                                    <p className={inicioStyles.vacio}>Todavía no hay publicaciones en tu comunidad.</p>
                                ) : (
                                    <ul className={inicioStyles.lista}>
                                        {publicaciones.slice(0, MAXIMO_PUBLICACIONES).map((publicacion) => (
                                            <li key={publicacion.id_publicacion} className={inicioStyles.publicacion}>
                                                <Link href={`/representante/detalles/publicacion/${publicacion.id_publicacion}`} className={inicioStyles.tarjetaEnlace}>
                                                    {publicacion.imagen && (
                                                        <img src={publicacion.imagen} alt="" className={inicioStyles.imagenPublicacion} />
                                                    )}

                                                    <div className={inicioStyles.textoPublicacion}>
                                                        <div className={inicioStyles.encabezadoPublicacion}>
                                                            <h3>{publicacion.titulo}</h3>
                                                            {publicacion.estatus && (
                                                                <span className={inicioStyles.etiqueta}>{String(publicacion.estatus).toLowerCase()}</span>
                                                            )}
                                                        </div>
                                                        <p className={inicioStyles.fecha}>{formatearFecha(publicacion.fecha_publicacion)}</p>
                                                        {publicacion.descripcion && (
                                                            <p className={inicioStyles.cuerpoPublicacion}>{publicacion.descripcion}</p>
                                                        )}
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>

                            <section className={inicioStyles.panel} aria-labelledby="encuestas">
                                <h2 id="encuestas">Encuestas abiertas</h2>

                                {encuestasAbiertas.length === 0 ? (
                                    <p className={inicioStyles.vacio}>No hay encuestas abiertas en tu comunidad.</p>
                                ) : (
                                    <ul className={inicioStyles.lista}>
                                        {encuestasAbiertas.map((encuesta) => (
                                            <li key={encuesta.id_encuesta} className={inicioStyles.encuesta}>
                                                <h3>
                                                    <Link href={`/representante/detalles/encuesta/${encuesta.id_encuesta}`} className={inicioStyles.enlaceTitulo}>
                                                        {encuesta.titulo}
                                                    </Link>
                                                </h3>

                                                <ul className={inicioStyles.opciones}>
                                                    {lista(encuesta.opciones).map((opcion) => {
                                                        const porcentaje = encuesta.total_votos
                                                            ? Math.round((opcion.total_votos / encuesta.total_votos) * 100)
                                                            : 0;

                                                        return (
                                                            <li key={opcion.id_opcion}>
                                                                <div className={inicioStyles.opcion}>
                                                                    <span className={inicioStyles.barra} style={{ width: `${porcentaje}%` }} aria-hidden="true" />
                                                                    <span className={inicioStyles.nombreOpcion}>{opcion.opcion}</span>
                                                                    <span className={inicioStyles.porcentaje}>{porcentaje}%</span>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>

                                                <div className={inicioStyles.pieEncuesta}>
                                                    <span>
                                                        {encuesta.total_votos} {encuesta.total_votos === 1 ? "voto" : "votos"}
                                                        {encuesta.fecha_cierre ? `, cierra el ${formatearFecha(encuesta.fecha_cierre)}` : ""}
                                                    </span>
                                                    <Link href={`/representante/detalles/encuesta/${encuesta.id_encuesta}`} className={inicioStyles.botonTexto}>
                                                        Ver detalle
                                                    </Link>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        </div>
                    </>
                )}

                {listo && (
                    <section className={homeStyles.seccionSolicitudes} aria-labelledby="titulo-solicitudes">
                        <div className={homeStyles.tituloSeccion}>
                            <div>
                                <h2 id="titulo-solicitudes">Solicitudes de ingreso</h2>
                                <p>Acepta o rechaza a los habitantes que quieren unirse a tu comunidad.</p>
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
                                            disabled={procesandoSolicitud === solicitud.id_integrante}
                                        >
                                            {procesandoSolicitud === solicitud.id_integrante ? "Procesando..." : "Rechazar"}
                                        </button>

                                        <button
                                            type="button"
                                            className={detalleStyles.botonAprobar}
                                            onClick={() => resolverSolicitud(solicitud.id_integrante, true)}
                                            disabled={procesandoSolicitud === solicitud.id_integrante}
                                        >
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

                {listo && peticionesApoyadas.length > 0 && (
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
                            <button type="button" className={styles.botonTodas} onClick={() => setFiltro("peticion")}>
                                Ver todas las peticiones ({peticionesApoyadas.length})
                            </button>
                        )}
                    </section>
                )}

                {listo && (
                    <section className={styles.seccionListado} aria-labelledby="titulo-actividad">
                        <div className={styles.encabezadoListado}>
                            <h2 id="titulo-actividad">Actividad de la comunidad</h2>
                            <span>{visibles.length} resultados</span>
                        </div>

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
            </div>
        </main>
    );
}
