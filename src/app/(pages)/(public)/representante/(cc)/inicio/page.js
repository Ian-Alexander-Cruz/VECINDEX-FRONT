"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/InicioComunidad.module.css";

export default function Inicio() {

    const [items, setItems] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [sinComunidad, setSinComunidad] = useState(false);
    const [error, setError] = useState("");

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
                    tipo: "peticion",
                    titulo: peticion.titulo,
                    descripcion: peticion.descripcion,
                    imagen: peticion.evidencias?.[0]?.foto ?? null,
                    fecha: peticion.fecha_creacion,
                    tiempo: aTiempo(peticion.fecha_creacion),
                    apoyos,
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
                solicitarAPI("/api/peticion/mias")
            ]);

            if (!activo) return;

            const rechazados = resultados.filter((resultado) => resultado.status === "rejected");
            const mensajes = rechazados.map((resultado) => resultado.reason?.message).filter(Boolean);

            if (rechazados.length === 3 && mensajes.every((mensaje) => mensaje === sinComunidadApi)) {
                setSinComunidad(true);
            } else if (rechazados.length === 3) {
                setError(mensajes[0] || "No fue posible cargar la actividad de tu comunidad.");
            }

            setItems(construirItems(resultados));
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


    function tarjeta(item) {
        return (
            <article key={item.clave} className={styles.tarjeta}>
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
        );
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
