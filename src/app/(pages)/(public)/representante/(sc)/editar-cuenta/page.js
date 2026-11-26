"use client";

import { useState } from "react";
import Link from "next/link";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import cuentaStyles from "@/app/styles/Cuenta.module.css";
import { solicitarAPI } from "@/app/services/api";
import { useAuth } from "@/app/components/AuthProvider";

export default function EditarCuenta() {
    const { usuario, setUsuario } = useAuth();
    const [nombre, setNombre] = useState(usuario?.nombre || "");
    const [correo, setCorreo] = useState(usuario?.correo || "");
    const [contrasena, setContrasena] = useState("");
    const [confirmarContrasena, setConfirmarContrasena] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    async function guardarCambios(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");

        if (contrasena !== confirmarContrasena) {
            setMensaje("Las contraseñas no coinciden.");
            setTipoMensaje("error");
            return;
        }

        setCargando(true);

        const datos = {
            nombre: nombre.trim(),
            correo: correo.trim(),
            contrasena: contrasena
        };

        try {
            const respuesta = await solicitarAPI("/api/usuario/perfil", {
                method: "PUT",
                body: JSON.stringify(datos)
            });

            setUsuario(respuesta);

            setContrasena("");
            setConfirmarContrasena("");

            setMensaje("¡Tus datos se actualizaron correctamente!");
            setTipoMensaje("exito");

        } catch (error) {
            setMensaje(error.message || "No fue posible actualizar tus datos.");
            setTipoMensaje("error");

        } finally {
            setCargando(false);
        }
    }

    return (
        <main className={`${styles.container} ${cuentaStyles.paginaCuenta}`}>
            <FondoCuenta />

            <section className={cuentaStyles.seccionCuenta} aria-labelledby="editar-informacion">

                <div className={cuentaStyles.encabezadoEdicion}>
                    <div className={cuentaStyles.iconoEdicion}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="25"
                            height="25"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M12 20h9" />
                            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L10 16l-4 1 1-4Z" />
                            <circle cx="9" cy="8" r="4" />
                            <path d="M3 20a6 6 0 0 1 8-5.65" />
                        </svg>
                    </div>

                    <div>
                        <h1 id="editar-informacion">
                            Editar información
                        </h1>

                        <p>
                            Mantén tus datos personales actualizados.
                        </p>
                    </div>
                </div>

                <form className={cuentaStyles.formularioEdicion} onSubmit={guardarCambios}>
                    <h2 className={cuentaStyles.subtituloEdicion}>
                        Datos personales
                    </h2>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="nombre">
                            Nombre
                        </label>
                        <input type="text" id="nombre" name="nombre" placeholder="Nombre" autoComplete="name" value={nombre} onChange={(evento) => setNombre(evento.target.value)} required/>
                    </div>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="correo">
                            Correo electrónico
                        </label>
                        <input type="email" id="correo" name="correo" placeholder="Correo electrónico" autoComplete="email" value={correo} onChange={(evento) => setCorreo(evento.target.value)} required/>
                    </div>

                    <hr className={cuentaStyles.separadorEdicion} />

                    <h2 className={cuentaStyles.subtituloEdicion}>
                        Cambiar contraseña
                    </h2>

                    <p className={cuentaStyles.descripcionEdicion}>
                        Completa estos campos únicamente si deseas establecer
                        una contraseña nueva. Si los dejas vacíos, conservarás
                        tu contraseña actual.
                    </p>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="contrasena">
                            Nueva contraseña
                        </label>
                        <input type="password" id="contrasena" name="contrasena" placeholder="Nueva contraseña" autoComplete="new-password" value={contrasena} onChange={(evento) => setContrasena(evento.target.value)}/>
                    </div>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="confirmarContrasena">
                            Confirmar nueva contraseña
                        </label>
                        <input type="password" id="confirmarContrasena" name="confirmarContrasena" placeholder="Confirma tu nueva contraseña" autoComplete="new-password" value={confirmarContrasena} onChange={(evento) => setConfirmarContrasena(evento.target.value)}/>
                    </div>

                    {mensaje && (
                        <p className={cuentaStyles.mensaje} data-tipo={tipoMensaje} role="status">
                            {mensaje}
                        </p>
                    )}

                    <button type="submit" className={cuentaStyles.botonGuardar} disabled={cargando}>
                        {cargando ? "Guardando cambios..." : "Guardar cambios"}
                    </button>
                </form>

                <Link href="/representante/cuenta" className={cuentaStyles.volverCuenta}>
                    Volver a mi cuenta
                </Link>
            </section>
        </main>
    );
}
