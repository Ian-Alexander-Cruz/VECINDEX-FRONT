"use client";


import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import FondoCuenta from "@/app/components/FondoCuenta";
import { useAuth } from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css";
import comunidadStyles from "@/app/styles/UnirseComunidad.module.css";
import { solicitarAPI } from "@/app/services/api";

const ERRORES_SESION = ["Token requerido", "Token inválido o expirado"];

const normalizar = (texto) => String(texto ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const PATRON_CODIGO = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

export default function UnirseComunidad() {
    const { setUsuario } = useAuth();
    const router = useRouter();
    const [errorCodigo, setErrorCodigo] = useState("");
    const [nombreBusqueda, setNombreBusqueda] = useState("");
    const [comunidades, setComunidades] = useState([]);
    const [codigoComunidad, setCodigoComunidad] = useState("");
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [recargas, setRecargas] = useState(0);
    const [idsOcupados, setIdsOcupados] = useState([]);

    useEffect(() => {
        async function cargarComunidades() {
            try {
                const [respuesta, perfil] = await Promise.all([
                    solicitarAPI("/api/comunidad"),
                    solicitarAPI("/api/habitante/perfil")
                ])

                const ocupadas = [
                    ...(Array.isArray(perfil.membresias) ? perfil.membresias : []),
                    ...(Array.isArray(perfil.solicitudes) ? perfil.solicitudes.filter((solicitud) => solicitud.id_estado === 3) : [])
                ].map((fila) => fila.id_comunidad)

                setComunidades(Array.isArray(respuesta) ? respuesta : [])
                setIdsOcupados(ocupadas)
            }catch(error) {
                if(ERRORES_SESION.includes(error.message)) {
                    setUsuario(null)
                    return
                }
                setError(error.message || "No fue posible cargar las comunidades")
            }finally {
                setCargando(false);
            }
        }
        cargarComunidades()
    }, [recargas, setUsuario])

    function recargar() {
        setCargando(true)
        setError("")
        setNombreBusqueda("")
        setRecargas((n) => n + 1)
    }

    function continuarConCodigo(evento) {
        evento.preventDefault();

        const codigo = codigoComunidad.match(PATRON_CODIGO)?.[0].toLowerCase();

        if (!codigo) {
            setErrorCodigo("El código no es válido.");
            return;
        }

        const comunidad = comunidades.find((comunidad) => comunidad.codigo?.toLowerCase() === codigo);

        if (!comunidad) {
            setErrorCodigo("No encontramos una comunidad con ese código.");
            return;
        }

        if (idsOcupados.includes(comunidad.id_comunidad)) {
            setErrorCodigo("Ya perteneces a esta comunidad o tienes una solicitud pendiente.");
            return;
        }

        router.push(`/habitante/comunidad/${comunidad.id_comunidad}`);
    }

    const busqueda = normalizar(nombreBusqueda);
    const disponibles = comunidades.filter((comunidad) => !idsOcupados.includes(comunidad.id_comunidad));
    const resultados = busqueda ? disponibles.filter((comunidad) => normalizar(comunidad.nombre).includes(busqueda)) : disponibles;

    return (
        <main className={`${styles.container} ${comunidadStyles.paginaUnirse}`}>
            <FondoCuenta />

            <header className={comunidadStyles.encabezado}>
                <h1>Encuentra tu comunidad</h1>
                <p>
                    Únete a tu comunidad para comenzar a utilizar todas las
                    funciones de VECINDEX.
                </p>
            </header>

            <div className={comunidadStyles.tarjetas}>
                <section className={comunidadStyles.tarjeta}>
                    <div className={comunidadStyles.encabezadoTarjeta}>
                        <div className={comunidadStyles.icono}>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
                                <path d="M14 14h3v3h-3zM20 14v2M14 20h2M20 20h1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div>
                            <h2>Unirse con código</h2>
                            <p>¿Ya tienes un código de invitación?</p>
                        </div>
                    </div>

                    <p className={comunidadStyles.descripcion}>
                        Ingresa el código que obtuviste al escanear el código
                        QR proporcionado por tu representante.
                    </p>

                    <form className={comunidadStyles.formulario} onSubmit={continuarConCodigo}>
                        <label htmlFor="codigoComunidad">
                            Código de comunidad
                        </label>
                        <input type="text" id="codigoComunidad" name="codigoComunidad" placeholder="Introduce tu código de invitación" autoComplete="off" maxLength={300} value={codigoComunidad} onChange={(evento) => {
                            setCodigoComunidad(evento.target.value);
                            setErrorCodigo("");
                        }}/>
                        <small className={comunidadStyles.ayudaCodigo}>
                            Introduce o pega el código que obtuviste al escanear el QR de tu comunidad.
                        </small>

                        <button type="submit" className={comunidadStyles.boton} disabled={cargando || !codigoComunidad.trim()}>
                            Continuar
                        </button>
                    </form>

                    {errorCodigo && (
                        <p className={comunidadStyles.errorBusqueda}>
                            {errorCodigo}
                        </p>
                    )}
                </section>

                <section className={comunidadStyles.tarjeta}>
                    <div className={comunidadStyles.encabezadoTarjeta}>
                        <div className={comunidadStyles.icono}>
                            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                <circle cx="10.8" cy="10.8" r="6.8" stroke="currentColor" strokeWidth="2" />
                                <path d="m16 16 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>

                        <div>
                            <h2>Buscar comunidad</h2>
                            <p>Encuentra una comunidad por su nombre.</p>
                        </div>
                    </div>

                    <p className={comunidadStyles.descripcion}>
                        Escribe el nombre de la comunidad y la lista se
                        actualizará mientras escribes.
                    </p>

                    <form className={comunidadStyles.formulario} onSubmit={(evento) => evento.preventDefault()}>
                        <label htmlFor="buscarComunidad">
                            Nombre de la comunidad
                        </label>
                        <input type="search" id="buscarComunidad" name="buscarComunidad" placeholder="Nombre de la comunidad" autoComplete="off" maxLength={150} value={nombreBusqueda} disabled={cargando} onChange={(evento) => setNombreBusqueda(evento.target.value)}/>

                        <button type="button" className={comunidadStyles.boton} disabled={cargando} onClick={recargar}>
                            {cargando ? "Cargando..." : "Recargar"}
                        </button>
                    </form>

                    {error && (
                        <p className={comunidadStyles.errorBusqueda}>
                            {error}
                        </p>
                    )}

                    {cargando && (
                        <p className={comunidadStyles.estadoBusqueda}>
                            Cargando comunidades...
                        </p>
                    )}

                    {!cargando && !error && resultados.length === 0 && (
                        <p className={comunidadStyles.estadoBusqueda}>
                            {busqueda
                                ? "No encontramos comunidades con ese nombre. Intenta con otra búsqueda."
                                : "Todavía no hay comunidades disponibles."}
                        </p>
                    )}

                    {!cargando && resultados.length > 0 && (
                        <div className={comunidadStyles.resultados}>
                            <h3>{busqueda ? "Resultados de búsqueda" : "Todas las comunidades"}</h3>

                            {resultados.map((comunidad) => (
                                <article key={comunidad.id_comunidad} className={comunidadStyles.resultado}>
                                    {comunidad.foto && (
                                        <img
                                            src={comunidad.foto}
                                            alt={`Fotografía de ${comunidad.nombre}`}
                                            className={comunidadStyles.fotoResultado}
                                        />
                                    )}

                                    <div className={comunidadStyles.datosResultado}>
                                        <h4>{comunidad.nombre}</h4>

                                        <p>
                                            {comunidad.ubicacion}
                                        </p>

                                        <Link href={`/habitante/comunidad/${comunidad.id_comunidad}`} className={comunidadStyles.botonVisualizar}>
                                            Visualizar
                                        </Link>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}