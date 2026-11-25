"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import FondoCuenta from "../../../../components/FondoCuenta";
import { solicitarAPI } from "../../../../services/api";
import styles from "@/app/styles/InicioComunidad.module.css";

export default function Inicio() {

    const [items, setItems] = useState([]);
    const [filtro, setFiltro] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(true);
    const [sinComunidad, setSinComunidad] = useState(false);
    const [error, setError] = useState("");

    const tipos = {
        publicacion: "Publicación",
        encuesta: "Encuesta",
        peticion: "Petición"
    };

    const claseChip = {
        publicacion: styles.chipPublicacion,
        encuesta: styles.chipEncuesta,
        peticion: styles.chipPeticion
    };

    const filtros = [
        { valor: "todos", etiqueta: "Todos" },
        { valor: "publicacion", etiqueta: "Publicaciones" },
        { valor: "encuesta", etiqueta: "Encuestas" },
        { valor: "peticion", etiqueta: "Peticiones" }
    ];

    const mensajeVacio = {
        todos: "Todavía no hay publicaciones, encuestas ni peticiones en tu comunidad.",
        publicacion: "Todavía no hay publicaciones en tu comunidad.",
        encuesta: "Todavía no hay encuestas en tu comunidad.",
        peticion: "Todavía no hay peticiones en tu comunidad."
    };

    const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

    const sinComunidadApi = "Comunidad no encontrada";

    function formatearFecha(fecha) {
        const valor = new Date(fecha ?? 0);

        if (Number.isNaN(valor.getTime())) return "Sin fecha";

        return `${String(valor.getDate()).padStart(2, "0")} ${meses[valor.getMonth()]} ${valor.getFullYear()}`;
    }

    function aTiempo(fecha) {
        const valor = new Date(fecha ?? 0).getTime();
        return Number.isNaN(valor) ? 0 : valor;
    }

    return (
        <main className={styles.container}>
            <FondoCuenta />


        </main>
    );
}
