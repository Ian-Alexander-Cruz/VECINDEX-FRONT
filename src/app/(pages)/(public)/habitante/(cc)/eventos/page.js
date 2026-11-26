"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FondoCuenta from "@/app/components/FondoCuenta";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "@/app/styles/Eventos.module.css";
import { solicitarAPI } from "@/app/services/api";

const ERRORES_SESION = ["Token requerido", "Token inválido o expirado"];

export default function Eventos() {
    const idComunidad = useSearchParams().get("comunidad");
    const idValido = /^\d+$/.test(idComunidad ?? "");
    const { setUsuario } = useAuth();
    const [eventos, setEventos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [cargandoLista, setCargandoLista] = useState(idValido);

    useEffect(() => {
        if (!idValido) return;

        async function cargarEventos() {
            try {
                const lista = await solicitarAPI(`/api/evento/comunidad/${idComunidad}`);
                setEventos(Array.isArray(lista) ? lista : []);
            } catch (error) {
                if (ERRORES_SESION.includes(error.message)) {
                    setUsuario(null);
                    return;
                }
                setMensaje(error.message || "No fue posible cargar los eventos");
            } finally {
                setCargandoLista(false);
            }
        }

        cargarEventos();
    }, [idComunidad, idValido, setUsuario]);

    function fechaLegible(fecha) {
        const [anio, mes, dia] = fecha.slice(0, 10).split("-");
        return `${dia}/${mes}/${anio}`;
    }
    return (
        <main className={styles.paginaEventos}>
            <FondoCuenta />

            <section className={styles.seccionEventos} aria-labelledby="titulo-eventos">
                <div className={styles.encabezadoEventos}>
                    <div className={styles.iconoEventos}>
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
                            <rect x="3" y="5" width="18" height="16" rx="2" />
                            <path d="M3 10h18M8 3v4M16 3v4" />
                        </svg>
                    </div>

                    <div>
                        <h1 id="titulo-eventos">Eventos</h1>
                        <p>Actividades organizadas para los habitantes de tu comunidad.</p>
                    </div>
                </div>

                {mensaje && (
                    <p className={styles.mensaje} data-tipo="error" role="alert">
                        {mensaje}
                    </p>
                )}

                {!idValido ? (
                    <p className={styles.mensaje} data-tipo="error" role="alert">
                        No sabemos qué comunidad abrir. <Link href="/habitante/inicio_SC">Elegir una de mis comunidades</Link>
                    </p>
                ) : mensaje ? null : cargandoLista ? (
                    <p className={styles.sinEventos}>Cargando eventos...</p>
                ) : eventos.length === 0 ? (
                    <p className={styles.sinEventos}>Todavía no hay eventos en tu comunidad.</p>
                ) : (
                    <ul className={styles.listaEventos}>
                        {eventos.map((evento) => (
                            <li key={evento.id_evento}>
                                <Link href={`/habitante/detalles/evento/${evento.id_evento}?comunidad=${idComunidad}`} className={`${styles.tarjetaEvento} ${styles.enlaceEvento}`}>
                                    <span className={styles.tipoEvento}>{evento.tipo_evento}</span>

                                    <h3>{evento.titulo}</h3>

                                    <p className={styles.fechaEvento}>{fechaLegible(evento.fecha_evento)}</p>

                                    {evento.descripcion && (
                                        <p className={styles.descripcionEvento}>{evento.descripcion}</p>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}