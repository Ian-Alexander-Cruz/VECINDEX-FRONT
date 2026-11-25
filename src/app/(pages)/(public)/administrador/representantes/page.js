"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../services/api";
import styles from "@/app/styles/Habitantes.module.css";

export default function Representantes() {
    const [representantes, setRepresentantes] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [filtroComunidad, setFiltroComunidad] = useState("todos");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function cargarRepresentantes() {
            try {
                const datos = await solicitarAPI("/api/representante");
                setRepresentantes(datos);
            } catch (error) {
                setError(error.message);
            } finally {
                setCargando(false);
            }
        }

        cargarRepresentantes();
    }, []);

    const representantesFiltrados = representantes.filter((representante) => {
        const coincideNombre = representante.nombre ?.toLowerCase().includes(busqueda.toLowerCase());

        const tieneComunidad = representante.comunidad?.id_comunidad != null;

        const coincideComunidad =
            filtroComunidad === "todos" ||
            (filtroComunidad === "con" && tieneComunidad) ||
            (filtroComunidad === "sin" && !tieneComunidad);

        return coincideNombre && coincideComunidad;
    });

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelHabitantes}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX ADMINISTRACIÓN
                    </span>

                    <h1>Representantes</h1>

                    <p>
                        Consulta y administra los perfiles de los representantes registrados.
                    </p>
                </header>

                <div className={styles.controles}>
                    <div className={styles.busqueda}>
                        <span>⌕</span>
                        <input type="text" placeholder="Buscar representante por nombre..." value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)}/>
                    </div>

                    <div className={styles.filtros}>
                        <button className={filtroComunidad === "todos" ? styles.filtroActivo : ""} onClick={() => setFiltroComunidad("todos")}>
                            Todos
                        </button>

                        <button className={filtroComunidad === "con" ? styles.filtroActivo : ""} onClick={() => setFiltroComunidad("con")}>
                            Con comunidad
                        </button>

                        <button className={filtroComunidad === "sin" ? styles.filtroActivo : ""} onClick={() => setFiltroComunidad("sin")}>
                            Sin comunidad
                        </button>
                    </div>
                </div>

                <section className={styles.seccionListado}>
                    <div className={styles.encabezadoListado}>
                        <h2>Representantes registrados</h2>
                        <span>{representantesFiltrados.length} resultados</span>
                    </div>

                    {cargando && (
                        <p className={styles.mensaje}>
                            Cargando representantes...
                        </p>
                    )}

                    {!cargando && error && (
                        <p className={styles.mensajeError}>
                            {error}
                        </p>
                    )}

                    {!cargando && !error && representantesFiltrados.length === 0 && (
                        <p className={styles.mensaje}>
                            No se encontraron representantes con esos criterios.
                        </p>
                    )}

                    {!cargando && !error && representantesFiltrados.length > 0 && (
                        <div className={styles.gridHabitantes}>
                            {representantesFiltrados.map((representante) => {
                                const tieneComunidad = representante.comunidad != null;

                                return (
                                    <article className={styles.tarjetaHabitante} key={representante.id_representante}>
                                        <div className={styles.datosHabitante}>
                                            <h3>{representante.nombre}</h3>

                                            <p>{representante.correo}</p>

                                            {tieneComunidad ? (
                                                <div className={styles.comunidades}>
                                                    <span className={styles.etiquetaComunidad}>
                                                        Con comunidad
                                                    </span>
                                                    <p>{representante.comunidad.nombre}</p>
                                                </div>
                                            ) : (
                                                <span className={styles.etiquetaSinComunidad}>
                                                    Sin comunidad
                                                </span>
                                            )}
                                        </div>

                                        <Link href={`/administrador/representantes/${representante.id_representante}`} className={styles.botonDetalle}>
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
