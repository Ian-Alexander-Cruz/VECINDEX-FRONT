"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../services/api";
import styles from "@/app/styles/Habitantes.module.css";

export default function Comunidades() {
    const [comunidades, setComunidades] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtro, setFiltro] = useState("todas");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const cargarComunidades = async () => {
            try {
                setCargando(true);
                setError("");

                const [normales, suspendidas,eliminadas] = await Promise.all([
                    solicitarAPI("/api/comunidad"),
                    solicitarAPI("/api/comunidad/estado/4"),
                    solicitarAPI("/api/comunidad/estado/5")
                ]);

                setComunidades([
                    ...normales,
                    ...suspendidas,
                    ...eliminadas
                ]);
            } catch (error) {
                console.error(error);
                setError("No fue posible cargar las comunidades.");
            } finally {
                setCargando(false);
            }
        };

        cargarComunidades();
    }, []);

    const comunidadesFiltradas = comunidades.filter((comunidad) => {
        const coincideNombre = comunidad.nombre?.toLowerCase().includes(busqueda.toLowerCase());

        const coincideEstado =
            filtro === "todas" ||
            (filtro === "normal" && comunidad.id_estado === 1) ||
            (filtro === "suspendida" && comunidad.id_estado === 4) ||
            (filtro === "eliminada" && comunidad.id_estado === 5);

        return coincideNombre && coincideEstado;
    });

    return (
        <main>
            <FondoCuenta />

            <section className={styles.container}>
                <div className={styles.panelHabitantes}>

                    <header className={styles.encabezado}>
                        <div>
                            <span className={styles.etiqueta}>
                                ADMINISTRACIÓN
                            </span>
                            <h1>Comunidades</h1>
                            <p>
                                Consulta y administra las comunidades
                                registradas en VECINDEX.
                            </p>
                        </div>
                    </header>

                    <div className={styles.controles}>
                        <div className={styles.busqueda}>
                            <span>⌕</span>
                            <input type="text" placeholder="Buscar comunidad por nombre..." value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)}/>
                        </div>

                        <div className={styles.filtros}>
                            <button className={filtro === "todas" ? styles.filtroActivo : ""} onClick={() => setFiltro("todas")}>
                                Todas
                            </button>

                            <button className={filtro === "normal" ? styles.filtroActivo : ""} onClick={() => setFiltro("normal")}>
                                Normales
                            </button>

                            <button className={filtro === "suspendida" ? styles.filtroActivo : ""} onClick={() => setFiltro("suspendida")}>
                                Suspendidas
                            </button>

                            <button className={filtro === "eliminada" ? styles.filtroActivo : ""} onClick={() => setFiltro("eliminada")}>
                                Eliminadas
                            </button>
                        </div>
                    </div>

                    <section className={styles.seccionListado}>
                        <div className={styles.encabezadoListado}>
                            <h2>Listado de comunidades</h2>
                            <span>
                                {comunidadesFiltradas.length} comunidades
                            </span>
                        </div>

                        {cargando ? (
                            <p className={styles.mensaje}>
                                Cargando comunidades...
                            </p>
                        ) : error ? (
                            <p className={styles.mensajeError}>
                                {error}
                            </p>
                        ) : comunidadesFiltradas.length === 0 ? (
                            <p className={styles.mensaje}>
                                No se encontraron comunidades.
                            </p>
                        ) : (
                            <div className={styles.gridHabitantes}>
                                {comunidadesFiltradas.map((comunidad) => (
                                    <article key={comunidad.id_comunidad} className={styles.tarjetaHabitante}>
                                        <div className={styles.imagenComunidad}>
                                            {comunidad.foto ? (
                                                <img src={comunidad.foto} alt={`Fotografía de ${comunidad.nombre}`}/>
                                            ) : (
                                                <span>Sin fotografía</span>
                                            )}
                                        </div>

                                        <div className={styles.datosHabitante}>
                                            <h3>{comunidad.nombre}</h3>

                                            <p>
                                                {comunidad.ubicacion || "Ubicación no disponible"}
                                            </p>

                                            <span className={comunidad.id_estado === 1 ? styles.estadoNormal : comunidad.id_estado === 4 ? styles.estadoSuspendida : styles.estadoEliminada}>
                                                {comunidad.id_estado === 1 ? "Normal" : comunidad.id_estado === 4 ? "Suspendida" : "Eliminada"}
                                            </span>
                                        </div>

                                        <Link href={`/administrador/comunidades/${comunidad.id_comunidad}`} className={styles.botonDetalle}>
                                            Ver detalle
                                        </Link>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                </div>
            </section>
        </main>
    );
}
