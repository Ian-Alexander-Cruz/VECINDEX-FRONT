"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { solicitarAPI } from "../../../../../services/api";
import styles from "@/app/styles/HabitantesDetalle.module.css";

export default function HabitanteDetalle({ params }) {
    const { id } = use(params);
    const [habitante, setHabitante] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const [procesando, setProcesando] = useState(false);
    const [mensajeAccion, setMensajeAccion] = useState("");
    const [errorAccion, setErrorAccion] = useState(false);
    const [editando, setEditando] = useState(false);
    const [nombreEditado, setNombreEditado] = useState("");
    const [correoEditado, setCorreoEditado] = useState("");
    const [contrasenaEditada, setContrasenaEditada] = useState("");
    const [guardandoEdicion, setGuardandoEdicion] = useState(false);
    const [errorEdicion, setErrorEdicion] = useState("");

    useEffect(() => {
        let activo = true;

        async function cargarHabitante() {
            try {
                const datos = await solicitarAPI(`/api/habitante/${id}`);

                if (activo) setHabitante(datos);
            } catch (error) {
                if (activo) setError(error.message);
            } finally {
                if (activo) setCargando(false);
            }
        }

        cargarHabitante();

        return () => {
            activo = false;
        };
    }, [id]);

    async function eliminarHabitante() {
        const confirmado = window.confirm("¿Estás seguro de que deseas eliminar esta cuentacc?");

        if (!confirmado) return;

        setProcesando(true);
        setMensajeAccion("");
        setErrorAccion(false);

        try {
            await solicitarAPI(`/api/habitante/${id}`, {method: "DELETE"});

            router.push("/administrador/habitantes");
        } catch (error) {
            setMensajeAccion(error.message);
            setErrorAccion(true);
        } finally {
            setProcesando(false);
        }
    }

    function iniciarEdicion() {
        setNombreEditado(habitante.nombre || "");
        setCorreoEditado(habitante.correo || "");
        setContrasenaEditada("");
        setErrorEdicion("");
        setEditando(true);
    }

    function cancelarEdicion() {
        setEditando(false);
        setNombreEditado("");
        setCorreoEditado("");
        setContrasenaEditada("");
        setErrorEdicion("");
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.panelDetalle}>
                <header className={styles.encabezado}>
                    <span className={styles.etiqueta}>
                        VECINDEX ADMINISTRACIÓN
                    </span>

                    <h1>Perfil del habitante</h1>

                    <p>
                        Consulta la información personal y las comunidades
                        asociadas a este habitante.
                    </p>
                </header>

                {cargando && (
                    <p className={styles.mensaje}>
                        Cargando información del habitante...
                    </p>
                )}

                {!cargando && error && (
                    <section className={styles.tarjeta}>
                        <h2>No se pudo cargar el perfil</h2>
                        <p>{error}</p>
                    </section>
                )}

                {!cargando && !error && habitante && (
                    <>
                        <section className={styles.tarjeta}>
                            <div className={styles.encabezadoTarjeta}>
                                <h2>Información personal</h2>

                                {!editando && (
                                    <button type="button" className={styles.botonEditar} onClick={iniciarEdicion}>
                                        Editar perfil
                                    </button>
                                )}
                            </div>

                            {editando ? (
                                <form className={styles.formularioEdicion} onSubmit={(evento) => evento.preventDefault()}>
                                    <div className={styles.campo}>
                                        <label htmlFor="nombreEditado">
                                            Nombre completo
                                        </label>
                                        <input id="nombreEditado" type="text" value={nombreEditado} onChange={(evento) => setNombreEditado(evento.target.value)} maxLength={50} required/>
                                    </div>

                                    <div className={styles.campo}>
                                        <label htmlFor="correoEditado">
                                            Correo electrónico
                                        </label>
                                        <input id="correoEditado" type="email" value={correoEditado} onChange={(evento) => setCorreoEditado(evento.target.value)} required/>
                                    </div>

                                    <div className={styles.campo}>
                                        <label htmlFor="contrasenaEditada">
                                            Nueva contraseña
                                        </label>
                                        <input id="contrasenaEditada" type="password" value={contrasenaEditada} onChange={(evento) => setContrasenaEditada(evento.target.value)} placeholder="Dejar vacío para no cambiarla"/>

                                        <small>
                                            Este campo es opcional.
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
                                            Guardar cambios
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className={styles.datos}>
                                    <div>
                                        <span>Nombre completo</span>
                                        <p>{habitante.nombre}</p>
                                    </div>

                                    <div>
                                        <span>Correo electrónico</span>
                                        <p>{habitante.correo}</p>
                                    </div>

                                    <div>
                                        <span>Identificador</span>
                                        <p>{habitante.id_habitante}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className={styles.tarjeta}>
                            <h2>Comunidades</h2>

                            {habitante.membresias?.length > 0 ? (
                                <div className={styles.listaComunidades}>
                                    {habitante.membresias.map((membresia) => (
                                        <article className={styles.comunidad} key={membresia.id_integrante}>
                                            <h3>{membresia.comunidad}</h3>

                                            <p>
                                                Estado de membresía:{" "}
                                                {membresia.estado}
                                            </p>

                                            <p>
                                                Silenciado:{" "}
                                                {membresia.silenciado ? "Sí" : "No"}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.mensaje}>
                                    Este habitante no tiene comunidades asociadas.
                                </p>
                            )}
                        </section>

                        <section className={styles.acciones}>
                            <button type="button" className={styles.botonEliminar} onClick={eliminarHabitante} disabled={procesando || editando}>
                                {procesando ? "Eliminando..." : "Eliminar cuentacc"}
                            </button>
                        </section>

                        {mensajeAccion && (
                            <p className={styles.mensajeAccion} role="alert" style={{
                                    color: errorAccion ? "#FF8585" : "#33CEBF"
                                }}>
                                {mensajeAccion}
                            </p>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
