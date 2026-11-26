"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

export default function PeticionDetalle({ params }) {
    const { id } = use(params);
    const comunidad = useSearchParams().get("comunidad");
    const volver = `/habitante/inicio_CC${/^\d+$/.test(comunidad ?? "") ? `?comunidad=${comunidad}` : ""}`;
    const [peticion, setPeticion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarPeticion() {
            try {
                const datos = await solicitarAPI(`/api/peticion/${id}`);

                if (activo) {
                    setPeticion(datos);
                }
            } catch (error) {
                if (activo) {
                    setError(error.message);
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        }

        cargarPeticion();

        return () => {
            activo = false;
        };
    }, [id]);

    function formatearFecha(fecha) {
        if (!fecha) return "No disponible";

        const valor = new Date(fecha);

        if (Number.isNaN(valor.getTime())) return String(fecha);

        return `${String(valor.getDate()).padStart(2, "0")}/${String(valor.getMonth() + 1).padStart(2, "0")}/${valor.getFullYear()}`;
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX HABITANTE
                    </span>

                    <h1>Petición</h1>

                    <p>
                        Detalle de la petición de un habitante de tu comunidad.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información de la petición...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la petición</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && peticion && (
                    <>
                        <section className={styles.tarjeta}>
                            <h2>Información</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Título</span>
                                    <p>{peticion.titulo || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Tipo de problema</span>
                                    <p>{peticion.tipo_problema || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Autor</span>
                                    <p>{peticion.autor || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Estatus</span>
                                    <p>{peticion.estatus || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Apoyos</span>
                                    <p>{peticion.total_apoyos ?? 0}</p>
                                </div>

                                <div>
                                    <span>Fecha de creación</span>
                                    <p>{formatearFecha(peticion.fecha_creacion)}</p>
                                </div>

                                <div>
                                    <span>Ubicación</span>
                                    <p>{peticion.ubicacion || "No disponible"}</p>
                                </div>

                                <div>
                                    <span>Detalles de la ubicación</span>
                                    <p>{peticion.detalle_ubicacion || "No disponible"}</p>
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Descripción</h2>

                            <p className={styles.descripcion}>
                                {peticion.descripcion || "No hay una descripción disponible."}
                            </p>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Evidencias</h2>

                            {peticion.evidencias?.length ? (
                                peticion.evidencias.map((evidencia, indice) => (
                                    <div key={`${evidencia.foto}-${indice}`} style={{ marginBottom: "15px" }}>
                                        <div className={styles.contenedorImagen}>
                                            <img src={evidencia.foto} alt={evidencia.descripcion || "Evidencia de la petición"}/>
                                        </div>

                                        {evidencia.descripcion && (
                                            <p className={styles.descripcion}>
                                                {evidencia.descripcion}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className={styles.mensaje}>
                                    No hay evidencias disponibles.
                                </p>
                            )}
                        </section>
                    </>
                )}
                <div className={styles.acciones}>
                    <Link href={volver} className={styles.botonAprobar}>Volver</Link>
                </div>
            </section>
        </main>
    );
}
