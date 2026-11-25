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


    function construirItems([publicaciones, encuestas, peticiones]) {
        const lista = [];

        if (publicaciones.status === "fulfilled" && Array.isArray(publicaciones.value)) {
            publicaciones.value.forEach((publicacion) => {
                lista.push({
                    clave: `publicacion-${publicacion.id_publicacion}`,
                    tipo: "publicacion",
                    titulo: publicacion.titulo,
                    descripcion: publicacion.descripcion,
                    imagen: publicacion.imagen,
                    fecha: publicacion.fecha_publicacion,
                    tiempo: aTiempo(publicacion.fecha_publicacion),
                    meta: [publicacion.estatus].filter(Boolean)
                });
            });
        }

        if (encuestas.status === "fulfilled" && Array.isArray(encuestas.value)) {
            encuestas.value.forEach((encuesta) => {
                const opciones = encuesta.opciones?.length ?? 0;

                lista.push({
                    clave: `encuesta-${encuesta.id_encuesta}`,
                    tipo: "encuesta",
                    titulo: encuesta.titulo,
                    descripcion: `Encuesta con ${opciones} ${opciones === 1 ? "opción" : "opciones"} para votar.`,
                    imagen: null,
                    fecha: encuesta.fecha_creacion,
                    tiempo: aTiempo(encuesta.fecha_creacion),
                    meta: [
                        encuesta.abierta ? "Abierta" : "Cerrada",
                        `${encuesta.total_votos ?? 0} ${encuesta.total_votos === 1 ? "voto" : "votos"}`
                    ]
                });
            });
        }

        if (peticiones.status === "fulfilled" && Array.isArray(peticiones.value)) {
            peticiones.value.forEach((peticion) => {
                const apoyos = peticion.total_apoyos ?? 0;

                lista.push({
                    clave: `peticion-${peticion.id_peticion}`,
                    tipo: "peticion",
                    titulo: peticion.titulo,
                    descripcion: peticion.descripcion,
                    imagen: peticion.evidencias?.[0]?.foto ?? null,
                    fecha: peticion.fecha_creacion,
                    tiempo: aTiempo(peticion.fecha_creacion),
                    apoyos,
                    meta: [
                        peticion.tipo_problema,
                        peticion.autor ? `Por ${peticion.autor}` : null,
                        `${apoyos} ${apoyos === 1 ? "apoyo" : "apoyos"}`,
                        peticion.estatus
                    ].filter(Boolean)
                });
            });
        }

        return lista;
    }

    useEffect(() => {
        let activo = true;

        async function cargarActividad() {
            const resultados = await Promise.allSettled([
                solicitarAPI("/api/publicacion/mias"),
                solicitarAPI("/api/encuesta/mias"),
                solicitarAPI("/api/peticion/mias")
            ]);

            if (!activo) return;

            const rechazados = resultados.filter((resultado) => resultado.status === "rejected");
            const mensajes = rechazados.map((resultado) => resultado.reason?.message).filter(Boolean);

            if (rechazados.length === 3 && mensajes.every((mensaje) => mensaje === sinComunidadApi)) {
                setSinComunidad(true);
            } else if (rechazados.length === 3) {
                setError(mensajes[0] || "No fue posible cargar la actividad de tu comunidad.");
            }

            setItems(construirItems(resultados));
            setCargando(false);
        }

        cargarActividad();

        return () => {
            activo = false;
        };
    }, []);

    const visibles = useMemo(() => {
        const texto = busqueda.trim().toLowerCase();

        const filtrados = items.filter((item) => {
            const coincideTipo = filtro === "todos" || item.tipo === filtro;

            const coincideTexto =
                !texto ||
                item.titulo?.toLowerCase().includes(texto) ||
                item.descripcion?.toLowerCase().includes(texto);

            return coincideTipo && coincideTexto;
        });

        if (filtro === "peticion") {
            return [...filtrados].sort((a, b) => b.apoyos - a.apoyos || b.tiempo - a.tiempo);
        }

        return [...filtrados].sort((a, b) => b.tiempo - a.tiempo);
    }, [items, filtro, busqueda]);

    return (
        <main className={styles.container}>
            <FondoCuenta />


        </main>
    );
}
