
"use client";

import { use, useEffect, useState } from "react";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/HabitantesDetalle.module.css";
import { solicitarAPI } from "../../../../../services/api";
import { useRouter } from "next/navigation";

export default function RepresentantesDetalle({ params }) {
    const { id } = use(params);
    const router = useRouter();

    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [representante, setRepresentante] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [editando, setEditando] = useState(false);
    const [nombreEditado, setNombreEditado] = useState("");
    const [correoEditado, setCorreoEditado] = useState("");
    const [contrasenaEditada, setContrasenaEditada] = useState("");
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState("");

    useEffect(() => {
        let activo = true;

        const obtenerRepresentante = async () => {
            try {
                setCargando(true);
                setError("");

                const respuesta = await solicitarAPI(`/api/representante/${id}`);

                if (activo) {
                    setRepresentante(respuesta);
                }
            } catch (err) {
                console.error("Error al obtener representante:", err);

                if (activo) {
                    setError(err.message || "No se encontró al representante.");
                }
            } finally {
                if (activo) {
                    setCargando(false);
                }
            }
        };

        if (id) {
            obtenerRepresentante();
        }

        return () => {
            activo = false;
        };
    }, [id]);

    const iniciarEdicion = () => {
        setNombreEditado(representante.nombre || "");
        setCorreoEditado(representante.correo || "");
        setContrasenaEditada("");
        setErrorEdicion("");
        setEditando(true);
    };

    const cancelarEdicion = () => {
        setEditando(false);
        setNombreEditado("");
        setCorreoEditado("");
        setContrasenaEditada("");
        setErrorEdicion("");
    };

    const guardarEdicion = async (e) => {
        e.preventDefault();

        try {
            setGuardandoEdicion(true);
            setErrorEdicion("");

            const datos = {
                nombre: nombreEditado.trim(),
                correo: correoEditado.trim(),
                contrasena: contrasenaEditada
            };

            await solicitarAPI(`/api/usuario/${representante.id_usuario}`, {
                method: "PUT",
                body: JSON.stringify(datos)
            });

            setRepresentante((anterior) => ({
                ...anterior,
                nombre: datos.nombre,
                correo: datos.correo
            }));

            setEditando(false);
            setContrasenaEditada("");
        } catch (err) {
            console.error("Error al editar representante:", err);
            setErrorEdicion(err.message || "No fue posible guardar los cambios.");
        } finally {
            setGuardandoEdicion(false);
        }
    };

    const eliminarRepresentante = async () => {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este representante? Esta acción no se puede deshacer.");

        if (!confirmar) return;

        try {
            setProcesando(true);
            setMensajeAccion("");

            await solicitarAPI(`/api/representante/${representante.id_representante}`, {
                method: "DELETE"
            });

            router.push("/administrador/representantes");
        } catch (err) {
            console.error("Error al eliminar representante:", err);
            setMensajeAccion(err.message || "No fue posible eliminar al representante.");
        } finally {
            setProcesando(false);
        }
    };

    function obtenerFormato(url) {
        try {
            const ruta = new URL(url).pathname;
            return ruta.split(".").pop().toLowerCase();
        } catch {
            return "";
        }
    }

    const formato = representante?.constancia ? obtenerFormato(representante.constancia) : "";

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>ADMINISTRACIÓN</span>
                    <h1>Detalle del representante</h1>
                    <p>Consulta y administra la información del representante.</p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información del representante...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar el perfil</h2>
                        <p className={styles.mensaje}>
                            {error}
                        </p>
                    </section>
                )}

                {!cargando && !error && representante && (
                    <>
                        <section className={styles.tarjeta}>
                            <div className={styles.encabezadoTarjeta}>
                                <h2>Información personal</h2>

                                {!editando && (
                                    <button type="button" className={styles.botonEditar} onClick={iniciarEdicion}>
                                        Editar
                                    </button>
                                )}
                            </div>

                            {editando ? (
                                <form className={styles.formularioEdicion} onSubmit={guardarEdicion}>
                                    <div className={styles.campo}>
                                        <label htmlFor="nombre">Nombre completo</label>
                                        <input id="nombre" type="text" value={nombreEditado} onChange={(e) => setNombreEditado(e.target.value)} maxLength={50} required/>
                                    </div>

                                    <div className={styles.campo}>
                                        <label htmlFor="correo">Correo electrónico</label>
                                        <input id="correo" type="email" value={correoEditado} onChange={(e) => setCorreoEditado(e.target.value)} required/>
                                    </div>

                                    <div className={styles.campo}>
                                        <label htmlFor="contrasena">Nueva contraseña</label>
                                        <input id="contrasena" type="password" value={contrasenaEditada} onChange={(e) => setContrasenaEditada(e.target.value)} placeholder="Dejar vacío para no modificar"/>
                                        <small>
                                            Solo completa este campo si deseas cambiar la contraseña.
                                        </small>
                                    </div>

                                    {errorEdicion && (
                                        <p className={styles.errorFormulario}>
                                            {errorEdicion}
                                        </p>
                                    )}

                                    <div className={styles.botonesFormulario}>
                                        <button type="button" className={styles.botonCancelar} onClick={cancelarEdicion} disabled={guardandoEdicion}>
                                            Cancelar
                                        </button>

                                        <button type="submit" className={styles.botonGuardar} disabled={guardandoEdicion}>
                                            Guardar cambios
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles.datos}>
                                    <div>
                                        <span>Nombre completo</span>
                                        <p>{representante.nombre || "No disponible"}</p>
                                    </div>

                                    <div>
                                        <span>Correo electrónico</span>
                                        <p>{representante.correo || "No disponible"}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Información de acreditación</h2>

                            <div className={styles.datos}>
                                <div>
                                    <span>Vigencia</span>
                                    <p>
                                        {representante.vigencia ? new Date(representante.vigencia).toLocaleDateString("es-MX") : "No disponible"}
                                    </p>
                                </div>

                                <div>
                                    <span>Constancia</span>

                                    {!representante.constancia && (
                                        <p className={styles.mensaje}>
                                            No se pudo obtener el documento de la constancia.
                                        </p>
                                    )}

                                    {representante.constancia && formato === "pdf" && (
                                        <iframe src={representante.constancia} className={styles.visor} title="Constancia del representante"/>
                                    )}

                                    {representante.constancia &&
                                        ["png", "jpg", "jpeg"].includes(formato) && (
                                            <div className={styles.contenedorImagen}>
                                                <img src={representante.constancia} alt="Constancia del representante"/>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Información de la comunidad</h2>

                            {representante.comunidad ? (
                                <div className={styles.datos}>
                                    <div>
                                        <span>Nombre</span>
                                        <p>{representante.comunidad.nombre || "No disponible"}</p>
                                    </div>

                                    <div>
                                        <span>Estado</span>
                                        <p>{representante.comunidad.estado || "No disponible"}</p>
                                    </div>

                                    <div>
                                        <span>Ubicación</span>
                                        <p>{representante.comunidad.ubicacion || "No disponible"}</p>
                                    </div>

                                    <div>
                                        <span>Máximo de habitantes</span>
                                        <p>{representante.comunidad.maximo_habitantes ?? "No disponible"}</p>
                                    </div>

                                    <div>
                                        <span>Descripción</span>
                                        <p>{representante.comunidad.descripcion || "No disponible"}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className={styles.mensaje}>
                                    Este representante todavía no tiene una comunidad asignada.
                                </p>
                            )}
                        </section>

                        <div className={styles.acciones}>
                            <button type="button" className={styles.botonEliminar} onClick={eliminarRepresentante} disabled={procesando || editando}>
                                {procesando ? "Eliminando..." : "Eliminar representante"}
                            </button>
                        </div>

                        {mensajeAccion && (
                            <p className={styles.mensajeAccion}>
                                {mensajeAccion}
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
