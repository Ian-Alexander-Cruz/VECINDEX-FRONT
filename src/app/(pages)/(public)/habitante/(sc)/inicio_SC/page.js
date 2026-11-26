"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import FondoCuenta from "@/app/components/FondoCuenta";
import {useAuth} from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css"
import inicioStyles from "@/app/styles/InicioSC.module.css"
import {solicitarAPI} from "@/app/services/api";

const ERRORES_SESION = ["Token requerido", "Token inválido o expirado"]
const ID_ESTADO_PENDIENTE = 3
const ID_ESTADO_RECHAZADO = 6

function claseEtiqueta(idEstado) {
    if (idEstado === ID_ESTADO_PENDIENTE) return inicioStyles.etiquetaPendiente
    if (idEstado === ID_ESTADO_RECHAZADO) return inicioStyles.etiquetaRechazado
    return inicioStyles.etiquetaOtro
}

export default function InicioSC() {
    const {usuario, setUsuario} = useAuth()
    const [membresias, setMembresias] = useState([])
    const [solicitudes, setSolicitudes] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")
    const [menuAbierto, setMenuAbierto] = useState(null)
    const [borrando, setBorrando] = useState(null)
    const [errorBorrar, setErrorBorrar] = useState("")

    useEffect(() => {
        async function cargarComunidades() {
            try {
                setCargando(true)
                setError("")

                const respuesta = await solicitarAPI("/api/habitante/perfil")

                setMembresias(Array.isArray(respuesta.membresias) ? respuesta.membresias : [])
                setSolicitudes(Array.isArray(respuesta.solicitudes) ? respuesta.solicitudes : [])
            } catch (error) {
                if (ERRORES_SESION.includes(error.message)) {
                    setUsuario(null)
                    return
                }
                setError(error.message || "No fue posible cargar las comunidades")
            } finally {
                setCargando(false)
            }
        }

        cargarComunidades()
    }, [setUsuario])

    useEffect(() => {
        if (menuAbierto === null) return

        const cerrarMenu = () => setMenuAbierto(null)

        document.addEventListener("click", cerrarMenu)

        return () => document.removeEventListener("click", cerrarMenu)
    }, [menuAbierto])

    async function borrarSolicitud(solicitud) {
        try {
            setBorrando(solicitud.id_integrante)
            setErrorBorrar("")

            await solicitarAPI(`/api/integrante/comunidad/${solicitud.id_comunidad}`, {method: "DELETE"})

            setSolicitudes((actuales) => actuales.filter((actual) => actual.id_integrante !== solicitud.id_integrante))
            setMenuAbierto(null)
        } catch (error) {
            if (ERRORES_SESION.includes(error.message)) {
                setUsuario(null)
                return
            }
            setErrorBorrar(error.message || "No fue posible borrar la solicitud")
        } finally {
            setBorrando(null)
        }
    }

    const nombre = usuario?.nombre?.trim().split(/\s+/)[0] || "vecino"

    return (
        <main className={styles.container}>
            <FondoCuenta/>

            <div className={inicioStyles.paginaInicio}>
                <div className={inicioStyles.contenido}>
                    <header className={inicioStyles.saludo}>
                        <h1>Hola, {nombre}</h1>
                        <p>
                            {membresias.length > 0
                                ? "Entra a una de tus comunidades o revisa cómo van tus solicitudes."
                                : "Únete a la comunidad donde vives para usar todas las funciones de tu cuentacc."}
                        </p>
                    </header>

                    {cargando ? (
                        <p className={inicioStyles.mensaje} role="status">Cargando tus comunidades...</p>
                    ) : error ? (
                        <p className={inicioStyles.mensajeError} role="alert">{error}</p>
                    ) : (
                        <>
                            {membresias.length === 0 ? (
                                <section className={inicioStyles.vacio} aria-labelledby="sin-comunidad">
                                    <div className={inicioStyles.pinVacio} aria-hidden="true">
                                        <span className={inicioStyles.onda}/>
                                        <svg viewBox="0 0 40 46">
                                            <path fillRule="evenodd" d="M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z"/>
                                        </svg>
                                    </div>

                                    <div className={inicioStyles.textoVacio}>
                                        <h2 id="sin-comunidad">Todavía no estás en ninguna comunidad</h2>
                                        <p>Busca tu comunidad por nombre o usa el código del QR que te dio tu representante.</p>
                                        <Link href="/habitante/unirse-comunidad" className={inicioStyles.boton}>
                                            Unirse a una comunidad
                                        </Link>
                                    </div>
                                </section>
                            ) : (
                                <section className={inicioStyles.seccion} aria-labelledby="tus-comunidades">
                                    <h2 id="tus-comunidades">Tus comunidades</h2>

                                    <ul className={inicioStyles.listaComunidades}>
                                        {membresias.map((membresia) => (
                                            <li key={membresia.id_integrante}>
                                                <article className={inicioStyles.tarjetaComunidad}>
                                                    <div className={inicioStyles.marcador} aria-hidden="true">
                                                        <svg viewBox="0 0 40 46">
                                                            <path fillRule="evenodd" d="M20 2C11 2 4 9 4 18c0 11 16 26 16 26s16-15 16-26C36 9 29 2 20 2zM20 12a6 6 0 1 0 0 12a6 6 0 1 0 0-12z"/>
                                                        </svg>
                                                    </div>

                                                    <div className={inicioStyles.datosComunidad}>
                                                        <h3>{membresia.comunidad}</h3>
                                                        <p>Miembro desde {new Date(membresia.fecha_solicitud).toLocaleDateString("es-MX")}</p>

                                                        <Link href={`/habitante/inicio_CC?comunidad=${membresia.id_comunidad}`} className={inicioStyles.boton}>
                                                            Ingresar
                                                        </Link>
                                                    </div>
                                                </article>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}

                            {solicitudes.length > 0 && (
                                <section className={inicioStyles.seccion} aria-labelledby="tus-solicitudes">
                                    <h2 id="tus-solicitudes">Tus solicitudes</h2>

                                    {errorBorrar && (
                                        <p className={`${inicioStyles.mensajeError} ${inicioStyles.errorMenu}`} role="alert">{errorBorrar}</p>
                                    )}

                                    <ul className={inicioStyles.listaSolicitudes}>
                                        {solicitudes.map((solicitud) => (
                                            <li key={solicitud.id_integrante} className={inicioStyles.filaSolicitud}>
                                                <div className={inicioStyles.datosSolicitud}>
                                                    <div className={inicioStyles.encabezadoSolicitud}>
                                                        <h3>{solicitud.comunidad}</h3>
                                                        <span className={`${inicioStyles.etiqueta} ${claseEtiqueta(solicitud.id_estado)}`}>
                                                            {String(solicitud.estado).toLowerCase()}
                                                        </span>
                                                    </div>
                                                    <p>Solicitada el {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-MX")}</p>
                                                </div>

                                                {solicitud.id_estado === ID_ESTADO_PENDIENTE && (
                                                    <div className={inicioStyles.menu} onClick={(evento) => evento.stopPropagation()}>
                                                        <button type="button" className={inicioStyles.botonMenu}
                                                                aria-label={`Opciones de la solicitud a ${solicitud.comunidad}`}
                                                                aria-haspopup="menu"
                                                                aria-expanded={menuAbierto === solicitud.id_integrante}
                                                                onClick={() => setMenuAbierto(menuAbierto === solicitud.id_integrante ? null : solicitud.id_integrante)}>
                                                            ⋮
                                                        </button>

                                                        {menuAbierto === solicitud.id_integrante && (
                                                            <div className={inicioStyles.opcionesMenu} role="menu">
                                                                <button type="button" role="menuitem"
                                                                        className={inicioStyles.opcionMenu}
                                                                        disabled={borrando === solicitud.id_integrante}
                                                                        onClick={() => borrarSolicitud(solicitud)}>
                                                                    {borrando === solicitud.id_integrante ? "Borrando..." : "Borrar solicitud"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </>
                    )}
                </div>
            </div>
        </main>
    )
}
