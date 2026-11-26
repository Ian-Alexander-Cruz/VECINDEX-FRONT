"use client"

import { useEffect, useState } from "react";
import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Subir.module.css";
import { solicitarAPI } from "@/app/services/api";

const MAXIMO_OPCIONES = 20;

export default function Subir() {
    const [seleccion, setSeleccion] = useState("");
    const [tipos, setTipos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);
    const [opcionesEncuesta, setOpcionesEncuesta] = useState(["", ""]);

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

    function actualizarOpcion(indice, valor) {
        setOpcionesEncuesta((actuales) => {
            const nuevas = actuales.map((opcion, posicion) => (posicion === indice ? valor : opcion));

            if (indice === nuevas.length - 1 && valor.trim() && nuevas.length < MAXIMO_OPCIONES) {
                nuevas.push("");
            }
            return nuevas;
        });
    }

    function quitarOpcionVacia(indice) {
        setOpcionesEncuesta((actuales) => {
            if (indice < 2 || actuales[indice]?.trim()) return actuales;

            const nuevas = actuales.filter((opcion, posicion) => posicion !== indice);

            return nuevas[nuevas.length - 1]?.trim() ? [...nuevas, ""] : nuevas;
        });
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
    async function crearPublicacion(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");

        const formulario = evento.currentTarget;
        const datosFormulario = new FormData(formulario);
        const datos = new FormData();

        datos.append("titulo", datosFormulario.get("titulo"));
        datos.append("descripcion", datosFormulario.get("descripcion"));
        datos.append("idEstatus", datosFormulario.get("idEstatus"));

        const imagen = datosFormulario.get("imagen");
        if (imagen && imagen.size > 0) datos.append("imagen", imagen);

        setCargando(true);

        try {
            await solicitarAPI("/api/publicacion", {
                method: "POST",
                body: datos
            });

            setMensaje("Publicación creada correctamente. Ya puedes verla en Inicio");
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
    async function crearEncuesta(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");

        const formulario = evento.currentTarget;
        const datosFormulario = new FormData(formulario);

        const opciones = opcionesEncuesta.map((opcion) => opcion.trim()).filter(Boolean);

        const fechaCierre = String(datosFormulario.get("fechaCierre") || "").trim();

        if (opciones.length < 2) {
            setMensaje("La encuesta necesita al menos 2 opciones");
            setTipoMensaje("error");
            return;
        }

        setCargando(true);

        try {
            await solicitarAPI("/api/encuesta", {
                method: "POST",
                body: JSON.stringify({
                    titulo: datosFormulario.get("titulo"),
                    opciones,
                    fechaCierre: fechaCierre || null
                })
            });

            setMensaje("Encuesta creada correctamente. Ya puedes verla en Inicio");
            setTipoMensaje("exito");
            formulario.reset();
            setOpcionesEncuesta(["", ""]);
            setSeleccion("");

        } catch (error) {
            setMensaje(error.message);
            setTipoMensaje("error");

        } finally {
            setCargando(false);
        }
    }
    const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Mexico_City" });
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

                {seleccion === "evento" && tipos.length === 0 && (
                    <p className={styles.pendiente}>
                        No se pudieron cargar los tipos de evento. Revisa que el catálogo tenga datos.
                    </p>
                )}

                {seleccion === "evento" && tipos.length > 0 && (
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
                            <input type="date" id="fechaEvento" name="fechaEvento" min={hoy} required/>
                        </div>

                        <button type="submit" className={styles.botonGuardar} disabled={cargando}>
                            {cargando ? "Creando..." : "Guardar evento"}
                        </button>
                    </form>
                )}

                {seleccion === "publicacion" && (
                    <form className={styles.formulario} onSubmit={crearPublicacion}>
                        <div className={styles.campo}>
                            <label htmlFor="tituloPublicacion"> Título de la publicación </label>
                            <input type="text" id="tituloPublicacion" name="titulo" placeholder="Reparación de la calle principal" maxLength={150} required/>
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="descripcionPublicacion"> Descripción </label>
                            <textarea id="descripcionPublicacion" name="descripcion" rows={4} maxLength={1000} placeholder="¿Qué se hizo en la comunidad?" required/>
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="imagenPublicacion"> Imagen (opcional) </label>
                            <input type="file" id="imagenPublicacion" name="imagen" accept=".jpg,.jpeg,.png"/>
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="idEstatus"> Estatus </label>
                            <select id="idEstatus" name="idEstatus" defaultValue="3" required>
                                <option value="3">En proceso</option>
                                <option value="4">Resuelto</option>
                            </select>
                        </div>

                        <button type="submit" className={styles.botonGuardar} disabled={cargando}>
                            {cargando ? "Creando..." : "Guardar publicación"}
                        </button>
                    </form>
                )}

                {seleccion === "encuesta" && (
                    <form className={styles.formulario} onSubmit={crearEncuesta}>
                        <div className={styles.campo}>
                            <label htmlFor="tituloEncuesta"> Título de la encuesta </label>
                            <input type="text" id="tituloEncuesta" name="titulo" placeholder="¿Qué mejora necesita la comunidad?" maxLength={150} required/>
                        </div>

                        <div className={styles.campo}>
                            <span className={styles.etiquetaOpciones}>Opciones</span>

                            {opcionesEncuesta.map((opcion, indice) => (
                                <input
                                    key={indice}
                                    type="text"
                                    value={opcion}
                                    onChange={(evento) => actualizarOpcion(indice, evento.target.value)}
                                    onBlur={() => quitarOpcionVacia(indice)}
                                    placeholder={`Opción ${indice + 1}`}
                                    aria-label={`Opción ${indice + 1}`}
                                    maxLength={120}
                                />
                            ))}
                        </div>

                        <div className={styles.campo}>
                            <label htmlFor="fechaCierre"> Fecha de cierre (opcional) </label>
                            <input type="date" id="fechaCierre" name="fechaCierre" min={hoy}/>
                        </div>

                        <button type="submit" className={styles.botonGuardar} disabled={cargando}>
                            {cargando ? "Creando..." : "Guardar encuesta"}
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}