"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavbarCuenta.module.css";

export default function NavbarAdministrador() {
    const pathname = usePathname();

    const opciones = [
        { nombre: "Inicio", ruta: "/administrador/inicio", icono: "inicio" },
        { nombre: "Habitantes", ruta: "/administrador/habitantes", icono: "habitantes" },
        { nombre: "Representantes", ruta: "/administrador/representantes", icono: "representantes" },
        { nombre: "Comunidades", ruta: "/administrador/comunidades", icono: "comunidades" }
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

                {tipo === "habitantes" && (
                    <>
                        <circle cx="9" cy="8" r="3" />
                        <path d="M3 20a6 6 0 0 1 12 0" />
                        <path d="M16 5.5a3 3 0 0 1 0 5.8" />
                        <path d="M17 14a5 5 0 0 1 4 5" />
                    </>
                )}

                {tipo === "representantes" && (
                    <>
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5 21a7 7 0 0 1 14 0" />
                        <path d="m16 11 1.5 1.5L21 9" />
                    </>
                )}

                {tipo === "comunidades" && (
                    <>
                        <path d="M3 21h18" />
                        <path d="M5 21V7l7-4 7 4v14" />
                        <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
                        <path d="M10 21v-4h4v4" />
                    </>
                )}
            </svg>
        );
    }

    return (
        <nav className={styles.navbar} aria-label="Navegación del administrador">
            <ul className={styles.lista}>
                {opciones.map((opcion) => {
                    const activo =
                        pathname === opcion.ruta ||
                        (opcion.ruta !== "/administrador/inicio" &&
                            pathname.startsWith(opcion.ruta + "/"));

                    return (
                        <li key={opcion.ruta}>
                            <Link href={opcion.ruta} className={`${styles.navLink} ${activo ? styles.activo : ""}`} aria-current={activo ? "page" : undefined}>
                                <Icono tipo={opcion.icono} />
                                <span>{opcion.nombre}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>

            <div className={styles.identidadAdministrador}>
                <svg
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M12 2 20 5v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3Z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>

                <span>Administrador</span>
            </div>
        </nav>
    );
}
