"use client"

import {useEffect, useState} from "react"
import Link from "next/link"
import FondoCuenta from "@/app/components/FondoCuenta";
import {useAuth} from "@/app/components/AuthProvider";
import styles from "@/app/styles/Home.module.css"
import comunidadStyles from "@/app/styles/UnirseComunidad.module.css"
import {solicitarAPI} from "@/app/services/api";

const ERRORES_SESION = ["Token requerido", "Token inválido o expirado"]

export default function InicioSC(){
    const {setUsuario} = useAuth()
    const [membresias, setMembresias] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        async function cargarComunidades(){
            try {
                setCargando(true)
                setError("")

                const respuesta = await solicitarAPI("/api/habitante/perfil")

                setMembresias(Array.isArray(respuesta.membresias) ? respuesta.membresias : [])
            }catch(error){
                if(ERRORES_SESION.includes(error.message)){
                    setUsuario(null)
                    return
                }
                setError(error.message || "No fue posible cargar las comunidades")
            }finally {
                setCargando(false)
            }
        }
        cargarComunidades()
    }, [setUsuario])

    return (
        <main className={styles.container}>
            <FondoCuenta />

            <section className={styles.Principal}>
                <h1>Hola, vecino</h1>

                {cargando ? (
                    <p className={comunidadStyles.estadoBusqueda}>Cargando tus comunidades...</p>
                ) : error ? (
                    <p className={comunidadStyles.errorBusqueda}>{error}</p>
                ) : membresias.length === 0 ? (
                    <>
                        <p>Unete a una comunidad para poder usar todas las funciones de tu cuenta de habitante.</p>
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
                                    <p>Miembro desde {new Date(membresia.fecha_solicitud).toLocaleDateString("es-MX")}</p>

                                    <Link href={`/habitante/comunidad/${membresia.id_comunidad}`} className={comunidadStyles.botonVisualizar}>
                                        Visualizar
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}