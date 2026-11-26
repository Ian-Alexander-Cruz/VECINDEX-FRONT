"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../services/api";
import styles from "@/app/styles/Habitantes.module.css";

export default function Habitantes() {
    const [habitantes, setHabitantes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtroComunidad, setFiltroComunidad] = useState("todos");
    const [filtroEstado, setFiltroEstado] = useState("activos");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function cargarHabitantes() {
            try {
                const [normales, eliminados] = await Promise.all([
                    solicitarAPI("/api/habitante"),
                    solicitarAPI("/api/habitante/estado/5")
                ]);

                setHabitantes([...normales, ...eliminados]);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        }

        cargarHabitantes();
    }, []);

    const habitantesFiltrados = habitantes.filter((habitante) => {
        const coincideNombre = habitante.nombre?.toLowerCase().includes(busqueda.toLowerCase());

        const esEliminado = habitante.id_estado === 5;
        const coincideEstado =
            filtroEstado === "eliminados" ? esEliminado : !esEliminado;

        const tieneComunidad = habitante.membresias?.length > 0;
        const coincideComunidad =
            filtroComunidad === "todos" ||
            (filtroComunidad === "con" && tieneComunidad) ||
            (filtroComunidad === "sin" && !tieneComunidad);

        return coincideNombre && coincideEstado && coincideComunidad;
    });

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelHabitantes}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX ADMINISTRACIÓN
                    </span>

                    <h1>Habitantes</h1>

                    <p>
                        Consulta y administra los perfiles de los habitantes registrados.
                    </p>
                </header>

                <div className={styles.controles}>
                    <div className={styles.busqueda}>
                        <span>⌕</span>
                        <input type="text" placeholder="Buscar habitante por nombre..." value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)}/>
                    </div>

                    <div className={styles.filtros}>
                        <button className={filtroComunidad === "todos" ? styles.filtroActivo : ""} onClick={() => {setFiltroComunidad("todos");setFiltroEstado("activos");}}>
                            Todos
                        </button>

                        <button className={filtroComunidad === "con" && filtroEstado === "activos" ? styles.filtroActivo : ""} onClick={() => {setFiltroComunidad("con");setFiltroEstado("activos");}}>
                            Con comunidad
                        </button>

                        <button className={filtroComunidad === "sin" && filtroEstado === "activos" ? styles.filtroActivo : ""} onClick={() => {setFiltroComunidad("sin");setFiltroEstado("activos");}}>
                            Sin comunidad
                        </button>

                        <button type="button" className={filtroEstado === "eliminados" ? styles.filtroActivo : ""} onClick={() => setFiltroEstado("eliminados")}>
                            Eliminadas
                        </button>
                    </div>
                </div>

                <section className={styles.seccionListado}>
                    <div className={styles.encabezadoListado}>
                        <h2>Habitantes registrados</h2>
                        <span>{habitantesFiltrados.length} resultados</span>
                    </div>

                    {cargando && (
                        <p className={styles.mensaje}>
                            Cargando habitantes...
                        </p>
                    )}

                    {!cargando && error && (
                        <p className={styles.mensajeError}>
                            {error}
                        </p>
                    )}

                    {!cargando && !error && habitantesFiltrados.length === 0 && (
                        <p className={styles.mensaje}>
                            No se encontraron habitantes con esos criterios.
                        </p>
                    )}

                    {!cargando && !error && habitantesFiltrados.length > 0 && (
                        <div className={styles.gridHabitantes}>
                            {habitantesFiltrados.map((habitante) => {
                                const tieneComunidad = habitante.membresias?.length > 0;
                                return (
                                    <article className={styles.tarjetaHabitante} key={habitante.id_habitante}>
                                        <div className={styles.datosHabitante}>
                                            <h3>{habitante.nombre}</h3>

                                            <p>{habitante.correo}</p>

                                            {habitante.id_estado === 5 ? (
                                                <span className={styles.etiquetaSinComunidad}>
                                                    Eliminado
                                                </span>
                                            ) : tieneComunidad ? (
                                                <div className={styles.comunidades}>

                                    <span className={styles.etiquetaComunidad}>
                                        Con comunidad
                                    </span>
                                                    <p>
                                                        {habitante.membresias
                                                            .map((membresia) => membresia.comunidad)
                                                            .join(", ")}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className={styles.etiquetaSinComunidad}>
                                    Sin comunidad
                                </span>
                                            )}
                                        </div>

                                        <Link href={`/administrador/habitantes/${habitante.id_habitante}`} className={styles.botonDetalle}>
                                            Ver perfil
                                        </Link>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            </section>
        </main>
    );
}