"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../components/NavbarCuenta.module.css";

export default function NavbarRepresentanteSC() {
    const pathname = usePathname();

    const opciones = [
        {nombre: "Inicio", ruta: "/representante/inicio_SC", icono: "inicio"},
        {nombre: "Crear comunidad", ruta: "/representante/crear-comunidad", icono: "crear"},
        {nombre: "Ayuda", ruta: "/representante/ayuda", icono: "ayudacc"},
        {nombre: "Cuenta", ruta: "/representante/cuenta", icono: "cuentacc"}
    ];

    function Icono({ tipo }) {
        const propiedades = {
            width: 25,
            height: 25,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: 1.8,
            strokeLinecap: "round",
            strokeLinejoin: "round"
        };

        return (
            <svg {...propiedades}>
                {tipo === "inicio" && (
                    <>
                        <path d="M3 10.5 12 3l9 7.5" />
                        <path d="M5 9.5V20h14V9.5" />
                        <path d="M9 20v-6h6v6" />
                    </>
                )}

                {tipo === "crear" && (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v8M8 12h8" />
                    </>
                )}

                {tipo === "ayudacc" && (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.7 1.4-1.7 3.2" />
                        <path d="M12 17h.01" />
                    </>
                )}

                {tipo === "cuentacc" && (
                    <>
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5 21a7 7 0 0 1 14 0" />
                    </>
                )}
            </svg>
        );
    }

    return (
        <nav className={styles.navbar} aria-label="Navegación del habitante">
            <ul className={styles.lista}>
                {opciones.map((opcion) => {
                    const activo = pathname === opcion.ruta;

                    return (
                        <li key={opcion.ruta}>
                            <Link
                                href={opcion.ruta}
                                className={`${styles.navLink} ${activo ? styles.activo : ""}`}
                                aria-current={activo ? "page" : undefined}
                            >
                                <Icono tipo={opcion.icono} />
                                <span>{opcion.nombre}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}