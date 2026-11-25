"use client"

import { useEffect, useState } from "react";
import FondoCuenta from "../../../../components/FondoCuenta";
import styles from "@/app/styles/Subir.module.css";
import { solicitarAPI } from "../../../../services/api";

export default function Subir() {
    const [seleccion, setSeleccion] = useState("");
    const [tipos, setTipos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    // Lo que se puede crear desde esta pantalla
    const opciones = [
        {clave: "evento", nombre: "Crear evento", descripcion: "Una actividad con fecha para los habitantes de tu comunidad."},
        {clave: "publicacion", nombre: "Crear publicación", descripcion: "Un informe de algo que ya se hizo en la comunidad."},
        {clave: "encuesta", nombre: "Crear encuesta", descripcion: "Una votación para que los habitantes opinen."}
    ];

    // El catalogo de tipos de evento llena el datalist del formulario
    useEffect(() => {
        async function cargarTipos() {
            try {
                setTipos(await solicitarAPI("/api/evento/tipos"));
            } catch (error) {
                setMensaje(error.message);
                setTipoMensaje("error");
            }
        }

        cargarTipos();
    }, []);