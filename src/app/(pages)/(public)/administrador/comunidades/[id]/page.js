"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../../services/api";
import styles from "@/app/styles/HabitantesDetalle.module.css";

export default function ComunidadDetalle({ params }) {
    const { id } = use(params);
    const [comunidad, setComunidad] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);
    const [editando, setEditando] = useState(false);
    const [nombreEditado, setNombreEditado] = useState("");
    const [descripcionEditada, setDescripcionEditada] = useState("");
    const [ubicacionEditada, setUbicacionEditada] = useState("");
    const [maximoHabitantesEditado, setMaximoHabitantesEditado] = useState("");
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState("");
    const [fotoEditada, setFotoEditada] = useState(null);

    useEffect(() => {
        let activo = true;

        async function cargarComunidad() {
            try {
                const datos = await solicitarAPI(`/api/comunidad/${id}`);

                if (activo) {
                    setComunidad(datos);
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

        cargarComunidad();

        return () => {
            activo = false;
        };
    }, [id]);

    async function cambiarEstadoComunidad(nuevoEstado) {
        const accion = nuevoEstado === "Suspendido" ? "suspender" : "reactivar";

        const confirmado = window.confirm(`¿Estás seguro de que deseas ${accion} esta comunidad?`);

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            await solicitarAPI(`/api/comunidad/${id}/estado`, {method: "PUT", body: JSON.stringify({
                    estado: nuevoEstado
                })
            });

            setComunidad(actual => ({
                ...actual,
                id_estado: nuevoEstado === "Normal" ? 1 : 4,
                estado: nuevoEstado
            }));

            setMensajeAccion(
                nuevoEstado === "Normal" ? "La comunidad fue reactivada correctamente." : "La comunidad fue suspendida correctamente."
            );
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    async function eliminarComunidad() {
        const confirmado = window.confirm("¿Estás seguro de que deseas eliminar esta comunidad?");

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            await solicitarAPI(`/api/comunidad/${id}`, {method: "DELETE"});

            router.push("/administrador/comunidades");
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    function iniciarEdicion() {
        setNombreEditado(comunidad.nombre || "");
        setDescripcionEditada(comunidad.descripcion || "");
        setUbicacionEditada(comunidad.ubicacion || "");
        setMaximoHabitantesEditado(comunidad.maximo_habitantes ?? "");
        setFotoEditada(null);
        setErrorEdicion("");
        setEditando(true);
    }

    function cancelarEdicion() {
        setEditando(false);
        setNombreEditado("");
        setDescripcionEditada("");
        setUbicacionEditada("");
        setMaximoHabitantesEditado("");
        setFotoEditada(null);
        setErrorEdicion("");
    }

    async function guardarEdicion(evento) {
        evento.preventDefault();

        const nombre = nombreEditado.trim();
        const descripcion = descripcionEditada.trim();
        const ubicacion = ubicacionEditada.trim();
        const maximoHabitantes = Number(maximoHabitantesEditado);

        if (!nombre || !ubicacion) {
            setErrorEdicion("Completa los campos obligatorios.");
            return;
        }

        if (!Number.isInteger(maximoHabitantes) || maximoHabitantes <= 0) {
            setErrorEdicion("El máximo de habitantes debe ser un número entero mayor que cero.");
            return;
        }

        setGuardandoEdicion(true);
        setErrorEdicion("");

        try {
            const formulario = new FormData();

            formulario.append("nombre", nombre);
            formulario.append("descripcion", descripcion);
            formulario.append("ubicacion", ubicacion);
            formulario.append("maximoHabitantes", String(maximoHabitantes));

            if (fotoEditada) {
                formulario.append("foto", fotoEditada);
            }

            await solicitarAPI(`/api/comunidad/${id}`, {method: "PUT", body: formulario});

            const datosActualizados = await solicitarAPI(`/api/comunidad/${id}`);

            setComunidad(datosActualizados);
            setEditando(false);
            setFotoEditada(null);
        } catch (error) {
            setErrorEdicion(error.message);
        } finally {
            setGuardandoEdicion(false);
        }
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX ADMINISTRACIÓN
                    </span>

                    <h1>Detalle de la comunidad</h1>

                    <p>
                        Consulta y administra la información de esta comunidad.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información de la comunidad...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar la comunidad</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && comunidad && (
                    <section className={styles.tarjeta}>
                        <div className={styles.encabezadoTarjeta}>
                            <h2>Información general</h2>

                            {!editando && comunidad.id_estado === 1 && (
                                <button type="button" className={styles.botonEditar} onClick={iniciarEdicion}>
                                    Editar
                                </button>
                            )}
                        </div>

                        {editando ? (
                            <form className={styles.formularioEdicion} onSubmit={guardarEdicion}>
                                <div className={styles.campo}>
                                    <label htmlFor="nombreComunidad">
                                        Nombre
                                    </label>
                                    <input id="nombreComunidad" type="text" value={nombreEditado} onChange={(evento) => setNombreEditado(evento.target.value)} maxLength={50} required/>
                                </div>

                                <div className={styles.campo}>
                                    <label htmlFor="descripcionComunidad">
                                        Descripción
                                    </label>
                                    <textarea id="descripcionComunidad" value={descripcionEditada} onChange={(evento) => setDescripcionEditada(evento.target.value)} maxLength={200} rows={4}/>
                                </div>

                                <div className={styles.campo}>
                                    <label htmlFor="ubicacionComunidad">
                                        Ubicación
                                    </label>
                                    <input id="ubicacionComunidad" type="text" value={ubicacionEditada} onChange={(evento) => setUbicacionEditada(evento.target.value)} maxLength={255} required/>
                                </div>

                                <div className={styles.campo}>
                                    <label htmlFor="maximoHabitantes">
                                        Máximo de habitantes
                                    </label>
                                    <input id="maximoHabitantes" type="number" min="1" step="1" value={maximoHabitantesEditado} onChange={(evento) => setMaximoHabitantesEditado(evento.target.value)} required/>
                                </div>

                                <div className={styles.campo}>
                                    <label htmlFor="fotoComunidad">
                                        Fotografía de la comunidad
                                    </label>
                                    <input id="fotoComunidad" type="file" accept=".jpg,.jpeg,.png" onChange={(evento) => setFotoEditada(evento.target.files[0] || null)}/>
                                    <small>
                                        Formatos JPG, JPEG o PNG. Máximo 5 MB.
                                    </small>
                                </div>

                                {errorEdicion && (
                                    <p className={styles.errorFormulario} role="alert">
                                        {errorEdicion}
                                    </p>
                                )}

                                <div className={styles.botonesFormulario}>
                                    <button type="button" className={styles.botonCancelar} onClick={cancelarEdicion} disabled={guardandoEdicion}>
                                        Cancelar
                                    </button>

                                    <button type="submit" className={styles.botonGuardar} disabled={guardandoEdicion}>
                                        {guardandoEdicion
                                            ? "Guardando..."
                                            : "Guardar cambios"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <>
                                <div className={styles.visor}>
                                    <div className={styles.contenedorImagen}>
                                        {comunidad.foto ? (
                                            <img src={comunidad.foto} alt={`Fotografía de ${comunidad.nombre}`}/>
                                        ) : (
                                            <p>Sin fotografía disponible</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.datos}>
                                    <div>
                                        <span>Nombre</span>
                                        <p>{comunidad.nombre}</p>
                                    </div>

                                    <div>
                                        <span>Ubicación</span>
                                        <p>{comunidad.ubicacion || "No disponible"}</p>
                                    </div>

                                    <div>
                                        <span>Descripción</span>
                                        <p>{comunidad.descripcion || "Sin descripción"}</p>
                                    </div>

                                    <div>
                                        <span>Máximo de habitantes</span>
                                        <p>{comunidad.maximo_habitantes}</p>
                                    </div>

                                    <div>
                                        <span>Estado</span>
                                        <p>{comunidad.estado || "No disponible"}</p>
                                    </div>
                                </div>

                                <div className={styles.acciones}>
                                    {comunidad.id_estado === 1 && (
                                        <button type="button" className={styles.botonCancelar} onClick={() => cambiarEstadoComunidad("Suspendido")} disabled={procesando}>
                                            Suspender
                                        </button>
                                    )}

                                    {(comunidad.id_estado === 4 || comunidad.id_estado === 5) && (
                                        <button type="button" className={styles.botonGuardar} onClick={() => cambiarEstadoComunidad("Normal")} disabled={procesando}>
                                            Reactivar
                                        </button>
                                    )}

                                    {comunidad.id_estado !== 5 && (
                                        <button type="button" className={styles.botonEliminar} onClick={eliminarComunidad} disabled={procesando}>
                                            {procesando ? "Procesando..." : "Eliminar comunidad"}
                                        </button>
                                    )}
                                </div>

                                {mensajeAccion && (
                                    <p className={styles.mensajeAccion} role="alert" style={{color: errorAccion ? "#FF8585" : "#33CEBF"}}>
                                        {mensajeAccion}
                                    </p>
                                )}
                            </>
                        )}
                    </section>
                )}
            </section>
        </main>
    );
}
