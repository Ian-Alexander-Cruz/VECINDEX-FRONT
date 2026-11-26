"use client";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import BackgroundMap from "../../../components/BackgroundMap";
import styles from "../../../styles/Login.module.css";
import {useState} from "react";
import {solicitarAPI} from "../../../services/api";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../components/AuthProvider";

export default function Login() {
    const [mensaje, setMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const router = useRouter();
    const { setUsuario } = useAuth();

    async function iniciarSesion(evento) {
        evento.preventDefault();

        setMensaje("");
        setCargando(true);

        const formulario = evento.currentTarget;
        const datosFormulario = new FormData(formulario);

        const datos = {
            correo: datosFormulario.get("correo"),
            contrasena: datosFormulario.get("contrasena")
        };

        try {
            const respuesta = await solicitarAPI("/api/usuario/login/web", {
                method: "POST",
                body: JSON.stringify(datos)
            });

            setUsuario(respuesta.usuario);

            if (respuesta.usuario.rol === "habitante") {
                router.replace("/habitante/inicio_SC");
            } else if (respuesta.usuario.rol === "representante") {
                let destino = "/representante/inicio_SC";

                try {
                    const perfil = await solicitarAPI("/api/representante/perfil");
                    const comunidad = perfil.comunidad;
                    const tieneComunidad = Array.isArray(comunidad) ? comunidad.length > 0 : Boolean(comunidad);

                    if (tieneComunidad) destino = "/representante/inicio";
                } catch (error) {
                    console.error(error);
                }

                router.replace(destino);
            } else if (respuesta.usuario.rol === "administrador") {
                router.replace("/administrador/inicio");
            } else {
                setMensaje("El rol de usuario no es válido");
            }
        } catch (error) {
            setMensaje(error.message);
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
                    <h1>Inicio de sesión</h1>
                </div>

                <form className={styles.form} onSubmit={iniciarSesion}>
                    <div className={styles.field}>
                        <label htmlFor="correo"> Correo electrónico </label>
                        <input type="email" id="correo" name="correo" placeholder="Correo" autoComplete="email" required/>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="contrasena"> Contraseña </label>
                        <input type="password" id="contrasena" name="contrasena" placeholder="Contraseña" autoComplete="current-password" required/>
                    </div>

                    <button type="submit" className={styles.submitButton} disabled={cargando}>
                        {cargando ? "Iniciando sesión..." : "Iniciar sesión"}
                    </button>

                    {mensaje && <p role="status">{mensaje}</p>}
                </form>
            </section>

            <Footer/>
        </main>
    )
}