"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../components/NavbarCuenta.module.css";

export default function NavbarRepresentanteCC() {
    const pathname = usePathname();

    const opciones = [
        {nombre: "Inicio", ruta: "/representante/inicio", icono: "inicio"},
        {nombre: "Subir", ruta: "/representante/subir", icono: "subir"},
        {nombre: "Eventos", ruta: "/representante/eventos", icono: "eventos"},
        {nombre: "Mapa", ruta: "/representante/mapa", icono: "mapa"},
        {nombre: "Comunidad", ruta: "/representante/comunidad", icono: "comunidad"},
        {nombre: "Ayuda", ruta: "/representante/ayudacc", icono: "ayuda"},
        {nombre: "Cuenta", ruta: "/representante/cuentacc", icono: "cuenta"}
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

                {tipo === "subir" && (
                    <>
                        <path d="M12 16V4" />
                        <path d="M8 8l4-4 4 4" />
                        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                    </>
                )}

                {tipo === "eventos" && (
                    <>
                        <rect x="3" y="5" width="18" height="16" rx="2" />
                        <path d="M3 10h18M8 3v4M16 3v4" />
                    </>
                )}

                {tipo === "mapa" && (
                    <>
                        <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
                        <path d="M9 4v14M15 6v14" />
                    </>
                )}

                {tipo === "comunidad" && (
                    <>
                        <circle cx="9" cy="8" r="3.2" />
                        <path d="M3 20a6 6 0 0 1 12 0" />
                        <path d="M16 5.5a3.2 3.2 0 0 1 0 6" />
                        <path d="M17.5 14.5A6 6 0 0 1 21 20" />
                    </>
                )}

                {tipo === "ayuda" && (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2 1-1.7 1.4-1.7 3.2" />
                        <path d="M12 17h.01" />
                    </>
                )}

                {tipo === "cuenta" && (
                    <>
                        <circle cx="12" cy="8" r="3.5" />
                        <path d="M5 21a7 7 0 0 1 14 0" />
                    </>
                )}
            </svg>
        );
    }

    return (
        <nav className={styles.navbar} aria-label="Navegación del representante">
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