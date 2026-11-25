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
        {nombre: "Ayuda", ruta: "/representante/ayuda", icono: "ayuda"},
        {nombre: "Cuenta", ruta: "/representante/cuenta", icono: "cuenta"}
    ];