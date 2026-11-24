"use client"

import Link from "next/link";
import FondoCuenta from "../../../../components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import cuentaStyles from "@/app/styles/Cuenta.module.css";
import { useAuth } from "../../../../components/AuthProvider";
import { useRouter } from "next/navigation";
import { solicitarAPI } from "../../../../services/api";

export default function Cuenta() {
    const { usuario, setUsuario } = useAuth();
    const router = useRouter();

    async function cerrarSesion() {
        try {
            await solicitarAPI("/api/usuario/cerrarSesion", {method: "POST"});
            setUsuario(null);
            router.replace("/login");
        } catch (error) {
            alert(error.message || "No fue posible cerrar la sesión.");
        }
    }

    async function eliminarCuenta() {
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.");

        if (!confirmar) return;

        try {
            await solicitarAPI("/api/habitante/perfil", {method: "DELETE"});

            try {
                await solicitarAPI("/api/usuario/cerrarSesion", {method: "POST"});
            } catch (error) {
                console.error("No se pudo limpiar la cookie:", error);
            }

            setUsuario(null);

            alert("Tu cuenta ha sido eliminada correctamente.");

            router.replace("/login");

        } catch (error) {
            alert(error.message || "No fue posible eliminar tu cuenta.");
        }
    }


    return (
        <main className={`${styles.container} ${cuentaStyles.paginaCuenta}`}>
            <FondoCuenta />

            <section className={cuentaStyles.seccionCuenta} aria-labelledby="datos-personales">
                <div className={cuentaStyles.encabezadoCuentaPerfil}>
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
                            <circle cx="12" cy="8" r="4" />
                            <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                        </svg>
                    </div>

                    <div>
                        <h1>Mi cuenta</h1>
                        <p>Consulta y administra tu información personal.</p>
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

                <Link href="/representante/editar-cuenta" className={cuentaStyles.botonEditar}>
                    Editar cuenta
                </Link>
            </section>

            <section className={cuentaStyles.seccionEliminar} aria-labelledby="eliminar-cuenta">
                <h2
                    id="eliminar-cuenta"
                    className={cuentaStyles.tituloEliminar}
                >
                    Eliminar cuenta
                </h2>

                <p className={cuentaStyles.descripcion}>
                    Si deseas eliminar tu cuenta, te pediremos confirmar tu
                    decisión antes de continuar.
                </p>

                <div className={cuentaStyles.botonesCuenta}>
                    <button type="button" className={cuentaStyles.botonEliminar} onClick={eliminarCuenta}>
                        Eliminar cuenta
                    </button>

                    <button type="button" className={cuentaStyles.botonCerrarSesion} onClick={cerrarSesion}>
                        Cerrar sesión
                    </button>
                </div>
            </section>
        </main>
    );
}
