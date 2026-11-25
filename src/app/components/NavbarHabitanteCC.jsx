"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "../components/NavbarCuenta.module.css";

export default function NavbarHabitanteCC() {
    const pathname = usePathname();
    const comunidad = useSearchParams().get("comunidad");
    const consulta = /^\d+$/.test(comunidad ?? "") ? `?comunidad=${comunidad}` : "";

    const opciones = [
        {nombre: "Inicio", ruta: "/habitante/inicio_CC", icono: "inicio"},
        {nombre: "Mapa", ruta: "/habitante/mapa", icono: "mapa"},
        {nombre: "Crear petición", ruta: "/habitante/crear-peticion", icono: "crear"},
        {nombre: "Eventos", ruta: "/habitante/eventos", icono: "eventos"},
        {nombre: "Ayuda", ruta: "/habitante/ayudacc", icono: "ayudacc"},
        {nombre: "Cuenta", ruta: "/habitante/cuentacc", icono: "cuentacc"},
        {nombre: "Mis comunidades", ruta: "/habitante/inicio_SC", icono: "salir", sinComunidad: true}
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

                {tipo === "mapa" && (
                    <>
                        <path d="M3 6.5 9 4l6 2.5 6-2.5v13.5L15 20l-6-2.5L3 20z" />
                        <path d="M9 4v13.5M15 6.5V20" />
                    </>
                )}

                {tipo === "crear" && (
                    <>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M12 8v8M8 12h8" />
                    </>
                )}

                {tipo === "eventos" && (
                    <>
                        <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
                        <path d="M3.5 10h17M8 3v4M16 3v4" />
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

                {tipo === "salir" && (
                    <>
                        <path d="M15 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9" />
                        <path d="M10 12h10M17 9l3 3-3 3" transform="rotate(180 15 12)" />
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
                                href={opcion.sinComunidad ? opcion.ruta : `${opcion.ruta}${consulta}`}
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
