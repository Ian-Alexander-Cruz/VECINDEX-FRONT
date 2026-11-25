"use client"

import { useEffect, useState } from "react";
import FondoCuenta from "../../../../components/FondoCuenta";
import styles from "@/app/styles/Eventos.module.css";
import { solicitarAPI } from "../../../../services/api";

export default function Eventos() {
    const [eventos, setEventos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [cargandoLista, setCargandoLista] = useState(true);
    useEffect(() => {
        async function cargarEventos() {
            try {
                setEventos(await solicitarAPI("/api/evento/mios"));
            } catch (error) {
                setMensaje(error.message);
            } finally {
                setCargandoLista(false);
            }
        }

        cargarEventos();
    }, []);

    function fechaLegible(fecha) {
        const [anio, mes, dia] = fecha.slice(0, 10).split("-");
        return `${dia}/${mes}/${anio}`;
    }