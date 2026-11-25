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

    const opciones = [
        {clave: "evento", nombre: "Crear evento", descripcion: "Una actividad con fecha para los habitantes de tu comunidad."},
        {clave: "publicacion", nombre: "Crear publicación", descripcion: "Un informe de algo que ya se hizo en la comunidad."},
        {clave: "encuesta", nombre: "Crear encuesta", descripcion: "Una votación para que los habitantes opinen."}
    ];


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

    function elegir(clave) {
        setSeleccion(seleccion === clave ? "" : clave);
        setMensaje("");
        setTipoMensaje("");
    }

    async function crearEvento(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");

        const formulario = evento.currentTarget;
        const datosFormulario = new FormData(formulario);

        const escrito = String(datosFormulario.get("tipo")).trim();
        const tipo = tipos.find(t => t.nombre.toLowerCase() === escrito.toLowerCase());

        if (!tipo) {
            setMensaje("Elige un tipo de evento de la lista");
            setTipoMensaje("error");
            return;
        }

        setCargando(true);

        try {
            await solicitarAPI("/api/evento", {
                method: "POST",
                body: JSON.stringify({
                    idTipoEvento: tipo.id_tipo_evento,
                    titulo: datosFormulario.get("titulo"),
                    descripcion: datosFormulario.get("descripcion"),
                    fechaEvento: datosFormulario.get("fechaEvento")
                })
            });

            setMensaje("Evento creado correctamente. Ya puedes verlo en Eventos");
            setTipoMensaje("exito");
            formulario.reset();
            setSeleccion("");

        } catch (error) {
            setMensaje(error.message);
            setTipoMensaje("error");

        } finally {
            setCargando(false);
        }
    }

    return (
        <main className={styles.paginaSubir}>
            <FondoCuenta />

            <section className={styles.seccionSubir} aria-labelledby="titulo-subir">
                <div className={styles.encabezadoSubir}>
                    <div className={styles.iconoSubir}>
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
                            <path d="M12 16V4" />
                            <path d="M8 8l4-4 4 4" />
                            <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                        </svg>
                    </div>

                    <div>
                        <h1 id="titulo-subir">Subir</h1>
                        <p>Elige qué quieres publicar en tu comunidad.</p>
                    </div>
                </div>

                {mensaje && (
                    <p className={styles.mensaje} data-tipo={tipoMensaje} role="alert">
                        {mensaje}
                    </p>
                )}

                <div className={styles.opciones}>
                    {opciones.map((opcion) => (
                        <button
                            key={opcion.clave}
                            type="button"
                            className={styles.opcion}
                            data-activo={seleccion === opcion.clave}
                            onClick={() => elegir(opcion.clave)}
                            aria-expanded={seleccion === opcion.clave}
                        >
                            <span className={styles.nombreOpcion}>{opcion.nombre}</span>
                            <span className={styles.descripcionOpcion}>{opcion.descripcion}</span>
                        </button>
                    ))}
                </div>

                {seleccion === "evento" && (
                    <form className={styles.formulario} onSubmit={crearEvento}>
                        <div className={styles.campo}>
                            <label htmlFor="titulo"> Título del evento </label>
                            <input type="text" id="titulo" name="titulo" placeholder="Jornada de limpieza" maxLength={150} required/>
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="tipo"> Tipo de evento </label>
                            <input type="text" id="tipo" name="tipo" list="tiposEvento" placeholder="Escribe o elige un tipo" required/>

                            <datalist id="tiposEvento">
                                {tipos.map((t) => (
                                    <option key={t.id_tipo_evento} value={t.nombre} />
                                ))}
                            </datalist>
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="descripcion"> Descripción </label>
                            <textarea id="descripcion" name="descripcion" rows={4} maxLength={1000} placeholder="¿De qué trata el evento?"/>
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="fechaEvento"> Fecha del evento </label>
                            <input type="date" id="fechaEvento" name="fechaEvento" required/>
                        </div>

                        <button type="submit" className={styles.botonGuardar} disabled={cargando}>
                            {cargando ? "Creando..." : "Guardar evento"}
                        </button>
                    </form>
                )}

                {/* AQUI VA EL FORMULARIO DE PUBLICACION */}
                {seleccion === "publicacion" && (
                    <p className={styles.pendiente}>El formulario de publicaciones todavía no está hecho.</p>
                )}

                {/* AQUI VA EL FORMULARIO DE ENCUESTA */}
                {seleccion === "encuesta" && (
                    <p className={styles.pendiente}>El formulario de encuestas todavía no está hecho.</p>
                )}
            </section>
        </main>
    );
}