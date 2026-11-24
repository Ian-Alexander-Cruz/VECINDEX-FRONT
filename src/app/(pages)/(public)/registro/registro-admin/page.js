"use client";

import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import BackgroundMap from "../../../../components/BackgroundMap";
import styles from "../../../../styles/RegistroAdmin.module.css";
import { useState } from "react";
import { solicitarAPI } from "../../../../services/api";

export default function RegistroAdmin() {
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    async function registrarAdmin(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");
        setCargando(true);

        const formulario = evento.currentTarget;
        const datosFormulario = new FormData(formulario);

        const datos = {
            nombre: datosFormulario.get("nombre"),
            correo: datosFormulario.get("correo"),
            contrasena: datosFormulario.get("contrasena"),
            clave: datosFormulario.get("clave")
        };

        try {
            await solicitarAPI("/api/administrador", {
                method: "POST",
                body: JSON.stringify(datos)
            });

            setMensaje("Registro realizado correctamente. Ahora puedes iniciar sesión");
            setTipoMensaje("exito");
            formulario.reset();

        } catch (error) {
            setMensaje(error.message);
            setTipoMensaje("error");

        } finally {
            setCargando(false);
        }
    }
    return (
        <main className={styles.container}>
            <BackgroundMap />

            <Navbar />

            <section className={styles.content}>
                <div className={styles.heading}>
                    <h1>Registro de administrador</h1>
                </div>

                {mensaje && (
                    <p className={`${styles.mensaje} ${tipoMensaje === "exito" ? styles.exito : styles.error}`} role="alert">
                        {mensaje}
                    </p>
                )}

                <form className={styles.form} onSubmit={registrarAdmin}>
                    <div className={styles.field}>
                        <label htmlFor="nombre"> Nombre </label>
                        <input type="text" id="nombre" name="nombre" placeholder="Nombre" autoComplete="name" required/>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="correo"> Correo electrónico </label>
                        <input type="email" id="correo" name="correo" placeholder="Correo" autoComplete="email" required/>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="contrasena"> Contraseña </label>
                        <input type="password" id="contrasena" name="contrasena" placeholder="Contraseña" autoComplete="new-password" required/>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="clave"> Clave de administrador </label>
                        <input type="password" id="clave" name="clave" placeholder="Clave de administrador" autoComplete="new-password" required/>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={cargando}>
                        {cargando ? "Registrando..." : "Registrarme"}
                    </button>
                </form>
            </section>

            <Footer/>
        </main>
    )
}