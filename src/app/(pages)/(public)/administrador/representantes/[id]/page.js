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
        const obtenerRepresentante = async () => {
            try {
                setCargando(true);
                setError("");

                const respuesta = await solicitarAPI(`/api/representante/${id}`);

                setRepresentante(respuesta);
            } catch (err) {
                console.error("Error al obtener representante:", err);
                setError("No fue posible cargar la información del representante.");
            } finally {
                setCargando(false);
            }
        };

        if (id) {
            obtenerRepresentante();
        }
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
        const confirmar = window.confirm(
            "¿Estás seguro de que deseas eliminar este representante? Esta acción no se puede deshacer."
        );

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
            setMensajeAccion(
                err.message || "No fue posible eliminar al representante."
            );
        } finally {
            setProcesando(false);
        }
    };

    return (
        <main className={styles.main}>
            <FondoCuenta />

            {cargando ? (
                <p>Cargando información del representante...</p>
            ) : error ? (
                <p>{error}</p>
            ) : representante ? (
                <section className={styles.panelDetalle}>
                    <header className={styles.encabezado}>
                        <span className={styles.etiqueta}>ADMINISTRACIÓN</span>
                        <h1>Detalle del representante</h1>
                        <p>Consulta y administra la información del representante.</p>
                    </header>


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
                                    <p className={styles.errorFormulario}>{errorEdicion}</p>
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

                                {representante.constancia ? (
                                    <div className={styles.visorConstancia}>
                                        <iframe src={representante.constancia} title="Constancia del representante" width="100%" height="500"/>
                                    </div>
                                ) : (
                                    <p>No hay una constancia disponible.</p>
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
                </section>
            ) : (
                <p>No se encontró al representante.</p>
            )}
        </main>
    );
}
