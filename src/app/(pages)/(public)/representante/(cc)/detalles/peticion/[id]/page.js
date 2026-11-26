"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "@/app/services/api";
import styles from "@/app/styles/ComunidadDetalle.module.css";

const ESTATUS_PETICION = [
    { id: 1, nombre: "Pendiente" },
    { id: 2, nombre: "En revisión" },
    { id: 3, nombre: "En proceso" },
    { id: 4, nombre: "Atendida" }
];

export default function PeticionDetalle({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [peticion, setPeticion] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [idEstatus, setIdEstatus] = useState(1);
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);

    useEffect(() => {
        let activo = true;

        async function cargarPeticion() {
            try {
                const datos = await solicitarAPI(`/api/peticion/${id}`);

                if (activo) {
                    setPeticion(datos);
                    setIdEstatus(datos.id_estatus ?? 1);
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

    async function guardarEstatus() {
        setProcesando(true);
        setMensajeAccion("");

        try {
            const actualizada = await solicitarAPI(`/api/peticion/${id}/estatus`, {
                method: "PUT",
                body: JSON.stringify({ idEstatus })
            });

            setPeticion(actualizada);
            setMensajeAccion("El estatus de la petición se actualizó correctamente.");
            setErrorAccion(false);
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    async function eliminarPeticion() {
        if (!window.confirm("¿Seguro que quieres eliminar esta petición? Esta acción no se puede deshacer.")) return;

        setProcesando(true);
        setMensajeAccion("");

        try {
            await solicitarAPI(`/api/peticion/${id}`, { method: "DELETE" });
            router.push("/representante/inicio");
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
            setProcesando(false);
        }
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX REPRESENTANTE
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

                        <section className={styles.tarjeta}>
                            <h2>Acciones</h2>

                            <div style={{ marginBottom: "20px" }}>
                                <label htmlFor="estatus-peticion" style={{ color: "#AEB5D8", fontSize: "14px" }}>Estatus</label>

                                <select
                                    id="estatus-peticion"
                                    value={idEstatus}
                                    onChange={(evento) => setIdEstatus(Number(evento.target.value))}
                                    disabled={procesando}
                                    style={{
                                        display: "block",
                                        width: "100%",
                                        marginTop: "8px",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: "1px solid rgba(51, 206, 191, 0.4)",
                                        background: "#171943",
                                        color: "#FFFFFF",
                                        fontSize: "15px"
                                    }}>
                                    {ESTATUS_PETICION.map((estatus) => (
                                        <option key={estatus.id} value={estatus.id}>
                                            {estatus.nombre}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.acciones}>
                                <button className={styles.botonRechazar} onClick={eliminarPeticion} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Eliminar petición"}
                                </button>

                                <button className={styles.botonAprobar} onClick={guardarEstatus} disabled={procesando}>
                                    {procesando ? "Procesando..." : "Guardar estatus"}
                                </button>
                            </div>
                        </section>

                        {mensajeAccion && (
                            <p
                                className={styles.mensajeAccion}
                                role="status"
                                style={{color: errorAccion ? "#FF8585" : "#33CEBF"}}>
                                {mensajeAccion}
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
