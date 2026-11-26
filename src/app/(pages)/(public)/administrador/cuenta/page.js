"use client";

import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import cuentaStyles from "@/app/styles/Cuenta.module.css";
import { useAuth } from "@/app/components/AuthProvider";
import { useRouter } from "next/navigation";
import { solicitarAPI } from "@/app/services/api";

export default function CuentaAdministrador() {
    const { usuario, setUsuario } = useAuth();
    const router = useRouter();

    async function cerrarSesion() {
        try {
            await solicitarAPI("/api/usuario/cerrarSesion", {
                method: "POST"
            });

            setUsuario(null);
            router.replace("/login");
        } catch (error) {
            alert(error.message || "No fue posible cerrar la sesión.");
        }
    }

    return (
        <main className={`${styles.container} ${cuentaStyles.paginaCuenta}`}>
            <FondoCuenta />

            <section className={cuentaStyles.seccionCuenta} aria-labelledby="datos-personales">
                <div className={cuentaStyles.encabezadoCuentaPerfil}>
                    <div className={cuentaStyles.iconoEdicion}>
                        <svg
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
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                        </svg>
                    </div>

                    <div>
                        <h1>Mi cuenta</h1>
                        <p>Consulta tu información personal.</p>
                    </div>
                </div>

                <h2 id="datos-personales" className={cuentaStyles.subtituloEdicion}>
                    Datos personales
                </h2>

                <div className={cuentaStyles.datosPersonales}>
                    <article className={cuentaStyles.dato}>
                        <h3>Nombre</h3>
                        <p>{usuario?.nombre || "No disponible"}</p>
                    </article>

                    <article className={cuentaStyles.dato}>
                        <h3>Correo electrónico</h3>
                        <p>{usuario?.correo || "No disponible"}</p>
                    </article>

                    <article className={cuentaStyles.dato}>
                        <h3>Contraseña</h3>
                        <p>••••••••••</p>
                    </article>
                </div>
            </section>

            <section className={cuentaStyles.seccionEliminar}>
                <h2 className={cuentaStyles.tituloEliminar}>
                    Cerrar sesión
                </h2>

                <p className={cuentaStyles.descripcion}>
                    Al cerrar sesión, tendrás que volver a iniciar sesión para acceder al panel de administrador.
                </p>

                <div className={cuentaStyles.botonesCuenta}>
                    <button type="button" className={cuentaStyles.botonCerrarSesion} onClick={cerrarSesion}>
                        Cerrar sesión
                    </button>
                </div>
            </section>
        </main>
    );
}