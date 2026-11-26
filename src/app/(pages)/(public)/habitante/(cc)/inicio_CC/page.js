"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css";
import inicioStyles from "@/app/styles/InicioCC.module.css";
import { solicitarAPI } from "@/app/services/api";

const ERRORES_SESION = ["Token requerido", "Token inválido o expirado"];
const ID_ESTATUS_ATENDIDA = 4;
const MAXIMO_PUBLICACIONES = 5;
const TREINTA_DIAS = 30 * 24 * 60 * 60 * 1000;
const PIN = "M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z";

const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
const lista = (valor) => (Array.isArray(valor) ? valor : []);

function Dashboard() {
    const idComunidad = useSearchParams().get("comunidad");
    const idValido = /^\d+$/.test(idComunidad ?? "");
    const { setUsuario } = useAuth();
    const [comunidad, setComunidad] = useState(null);
    const [publicaciones, setPublicaciones] = useState([]);
    const [encuestas, setEncuestas] = useState([]);
    const [eventos, setEventos] = useState([]);
    const [peticiones, setPeticiones] = useState([]);
    const [cargando, setCargando] = useState(idValido);
    const [error, setError] = useState("");
    const [votando, setVotando] = useState(null);
    const [erroresVoto, setErroresVoto] = useState({});

    useEffect(() => {
        if (!idValido) return;

        async function cargarDashboard() {
            try {
                const [datos, listaPublicaciones, listaEncuestas, listaEventos, listaPeticiones] = await Promise.all([
                    solicitarAPI(`/api/comunidad/${idComunidad}`),
                    solicitarAPI(`/api/publicacion/comunidad/${idComunidad}`),
                    solicitarAPI(`/api/encuesta/comunidad/${idComunidad}`),
                    solicitarAPI(`/api/evento/comunidad/${idComunidad}`),
                    solicitarAPI(`/api/peticion/comunidad/${idComunidad}`)
                ]);

                setComunidad(datos);
                setPublicaciones(lista(listaPublicaciones));
                setEncuestas(lista(listaEncuestas));
                setEventos(lista(listaEventos));
                setPeticiones(lista(listaPeticiones));
            } catch (error) {
                if (ERRORES_SESION.includes(error.message)) {
                    setUsuario(null);
                    return;
                }
                setError(error.message || "No fue posible cargar la comunidad.");
            } finally {
                setCargando(false);
            }
        }

        cargarDashboard();
    }, [idComunidad, idValido, setUsuario]);

    async function cambiarVoto(encuesta, idOpcion) {
        try {
            setVotando(encuesta.id_encuesta);
            setErroresVoto((actuales) => ({ ...actuales, [encuesta.id_encuesta]: "" }));

            const actualizada = idOpcion === null
                ? await solicitarAPI(`/api/encuesta/${encuesta.id_encuesta}/voto`, { method: "DELETE" })
                : await solicitarAPI(`/api/encuesta/${encuesta.id_encuesta}/voto`, {
                    method: "POST",
                    body: JSON.stringify({ idOpcion })
                });

            setEncuestas((actuales) => actuales.map((actual) => (
                actual.id_encuesta === encuesta.id_encuesta ? { ...actual, ...actualizada } : actual
            )));
        } catch (error) {
            if (ERRORES_SESION.includes(error.message)) {
                setUsuario(null);
                return;
            }
            setErroresVoto((actuales) => ({
                ...actuales,
                [encuesta.id_encuesta]: error.message || "No fue posible registrar tu voto."
            }));
        } finally {
            setVotando(null);
        }
    }

    if (!idValido) {
        return (
            <p className={inicioStyles.mensajeError} role="alert">
                No sabemos qué comunidad abrir.
                <br />
                <Link href="/habitante/inicio_SC" className={inicioStyles.enlace}>Elegir una de mis comunidades</Link>
            </p>
        );
    }

    if (cargando) {
        return <p className={inicioStyles.mensaje} role="status">Cargando tu comunidad...</p>;
    }

    if (error || !comunidad) {
        return (
            <p className={inicioStyles.mensajeError} role="alert">
                {error || "No fue posible cargar la comunidad."}
                <br />
                <Link href="/habitante/inicio_SC" className={inicioStyles.enlace}>Volver a mis comunidades</Link>
            </p>
        );
    }

    const ahora = Date.now();
    const encuestasAbiertas = encuestas.filter((encuesta) => encuesta.abierta);
    const peticionesActivas = peticiones.filter((peticion) => peticion.id_estatus !== ID_ESTATUS_ATENDIDA).length;
    const publicacionesDelMes = publicaciones.filter((publicacion) => ahora - new Date(publicacion.fecha_publicacion).getTime() <= TREINTA_DIAS).length;
    const proximoEvento = eventos
        .filter((evento) => new Date(evento.fecha_evento).getTime() >= ahora)
        .sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento))[0];

    return (
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
                        <h1>{comunidad.nombre}</h1>
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
                        <p className={inicioStyles.vacio}>Tu representante todavía no ha publicado nada en esta comunidad.</p>
                    ) : (
                        <ul className={inicioStyles.lista}>
                            {publicaciones.slice(0, MAXIMO_PUBLICACIONES).map((publicacion) => (
                                <li key={publicacion.id_publicacion} className={inicioStyles.publicacion}>
                                    <Link href={`/habitante/detalles/publicacion/${publicacion.id_publicacion}?comunidad=${idComunidad}`} className={inicioStyles.tarjetaEnlace}>
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
                        <p className={inicioStyles.vacio}>No hay encuestas abiertas. Cuando tu representante cree una, podrás votar aquí.</p>
                    ) : (
                        <ul className={inicioStyles.lista}>
                            {encuestasAbiertas.map((encuesta) => {
                                const yaVoto = encuesta.mi_voto !== null && encuesta.mi_voto !== undefined;
                                const ocupada = votando === encuesta.id_encuesta;

                                return (
                                    <li key={encuesta.id_encuesta} className={inicioStyles.encuesta}>
                                        <h3><Link href={`/habitante/detalles/encuesta/${encuesta.id_encuesta}?comunidad=${idComunidad}`} className={inicioStyles.enlaceTitulo}>{encuesta.titulo}</Link></h3>

                                        <ul className={inicioStyles.opciones}>
                                            {lista(encuesta.opciones).map((opcion) => {
                                                const porcentaje = encuesta.total_votos ? Math.round((opcion.total_votos / encuesta.total_votos) * 100) : 0;
                                                const elegida = encuesta.mi_voto === opcion.id_opcion;
                                                const contenido = (
                                                    <>
                                                        <span className={inicioStyles.barra} style={{ width: `${porcentaje}%` }} aria-hidden="true" />
                                                        <span className={inicioStyles.nombreOpcion}>{opcion.opcion}</span>
                                                        <span className={inicioStyles.porcentaje}>{porcentaje}%</span>
                                                    </>
                                                );

                                                return (
                                                    <li key={opcion.id_opcion}>
                                                        {yaVoto ? (
                                                            <div className={`${inicioStyles.opcion} ${elegida ? inicioStyles.opcionElegida : ""}`}>
                                                                {contenido}
                                                            </div>
                                                        ) : (
                                                            <button type="button" className={inicioStyles.opcion} disabled={ocupada} onClick={() => cambiarVoto(encuesta, opcion.id_opcion)}>
                                                                {contenido}
                                                            </button>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        <div className={inicioStyles.pieEncuesta}>
                                            <span>
                                                {encuesta.total_votos} {encuesta.total_votos === 1 ? "voto" : "votos"}
                                                {encuesta.fecha_cierre ? `, cierra el ${formatearFecha(encuesta.fecha_cierre)}` : ""}
                                            </span>

                                            {yaVoto && (
                                                <button type="button" className={inicioStyles.botonTexto} disabled={ocupada} onClick={() => cambiarVoto(encuesta, null)}>
                                                    {ocupada ? "Quitando voto..." : "Quitar mi voto"}
                                                </button>
                                            )}
                                            {!yaVoto && ocupada && <span role="status">Registrando voto...</span>}
                                            <Link href={`/habitante/detalles/encuesta/${encuesta.id_encuesta}?comunidad=${idComunidad}`} className={inicioStyles.botonTexto}>Ver detalle</Link>
                                        </div>

                                        {erroresVoto[encuesta.id_encuesta] && (
                                            <p className={inicioStyles.errorEncuesta} role="alert">{erroresVoto[encuesta.id_encuesta]}</p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}

export default function InicioCC() {
    return (
        <main className={styles.container}>
            <FondoCuenta />

            <div className={inicioStyles.pagina}>
                <div className={inicioStyles.contenido}>
                    <Suspense fallback={<p className={inicioStyles.mensaje} role="status">Cargando tu comunidad...</p>}>
                        <Dashboard />
                    </Suspense>
                </div>
            </div>
        </main>
    );
}
