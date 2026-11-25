"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import FondoCuenta from "@/app/components/FondoCuenta";
import {useAuth} from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css"
import comunidadStyles from "@/app/styles/UnirseComunidad.module.css"
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
    const {setUsuario} = useAuth()
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

    return (
        <main className={styles.container}>
            <FondoCuenta/>

            <section className={styles.Principal}>
                <h1>Hola, vecino</h1>

                {cargando ? (
                    <p className={comunidadStyles.estadoBusqueda}>Cargando tus comunidades...</p>
                ) : error ? (
                    <p className={comunidadStyles.errorBusqueda}>{error}</p>
                ) : (
                    <>
                        {membresias.length === 0 ? (
                            <>
                                <p>Unete a una comunidad para poder usar todas las funciones de tu cuenta de
                                    habitante.</p>
                                <Link href="/habitante/unirse-comunidad" className={comunidadStyles.botonVisualizar}>
                                    Unirse a una comunidad
                                </Link>
                            </>
                        ) : (
                            <div className={comunidadStyles.resultados}>
                                <h3>Tus comunidades</h3>

                                {membresias.map((membresia) => (
                                    <article key={membresia.id_integrante} className={comunidadStyles.resultado}>
                                        <div className={comunidadStyles.datosResultado}>
                                            <h4>{membresia.comunidad}</h4>
                                            <p>Miembro
                                                desde {new Date(membresia.fecha_solicitud).toLocaleDateString("es-MX")}</p>

                                            <Link href={`/habitante/comunidad/${membresia.id_comunidad}`}
                                                  className={comunidadStyles.botonVisualizar}>
                                                Visualizar
                                            </Link>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {solicitudes.length > 0 && (
                            <div className={`${comunidadStyles.resultados} ${inicioStyles.seccionSolicitudes}`}>
                                <h3>Tus solicitudes</h3>

                                {errorBorrar && (
                                    <p className={comunidadStyles.errorBusqueda}>{errorBorrar}</p>
                                )}

                                {solicitudes.map((solicitud) => (
                                    <article key={solicitud.id_integrante} className={comunidadStyles.resultado}>
                                        <div className={comunidadStyles.datosResultado}>
                                            <div className={inicioStyles.encabezadoSolicitud}>
                                                <h4>{solicitud.comunidad}</h4>
                                                <span
                                                    className={`${inicioStyles.etiqueta} ${claseEtiqueta(solicitud.id_estado)}`}>
                                                    {String(solicitud.estado).toLowerCase()}
                                                </span>
                                            </div>
                                            <p>Solicitada
                                                el {new Date(solicitud.fecha_solicitud).toLocaleDateString("es-MX")}</p>
                                        </div>

                                        {solicitud.id_estado === ID_ESTADO_PENDIENTE && (
                                            <div className={inicioStyles.menu}
                                                 onClick={(evento) => evento.stopPropagation()}>
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
                                    </article>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </section>
        </main>
    )
}