"use client";

import { useState } from "react";
import Link from "next/link";

import FondoCuenta from "../../../../components/FondoCuenta";
import estilosBase from "@/app/styles/Home.module.css";
import cuentaStyles from "@/app/styles/Cuenta.module.css";
import { solicitarAPI } from "../../../../services/api";

export default function CrearComunidad() {

    const [mensaje, setMensaje] = useState("");
    const [tipoMensaje, setTipoMensaje] = useState("");
    const [cargando, setCargando] = useState(false);

    async function solicitarCreacion(evento) {
        evento.preventDefault();

        setMensaje("");
        setTipoMensaje("");
        setCargando(true);

        const formulario = evento.currentTarget;
        const datos = new FormData(formulario);

        try {
            await solicitarAPI("/api/comunidad", {
                method: "POST",
                body: datos
            });

            formulario.reset();
            setMensaje("Tu solicitud se envió correctamente. Un administrador revisará la comunidad antes de activarla.");
            setTipoMensaje("exito");
        } catch (error) {
            setMensaje(error.message || "No fue posible enviar la solicitud.");
            setTipoMensaje("error");
        } finally {
            setCargando(false);
        }
    }


    return (
        <main className={`${estilosBase.container} ${cuentaStyles.paginaCuenta}`}>
            <FondoCuenta />
            <section className={cuentaStyles.seccionCuenta} aria-labelledby="crear-comunidad">
                <div className={cuentaStyles.encabezadoEdicion}>
                    <div>
                        <h1 id="crear-comunidad">Crear comunidad</h1>
                        <p>
                            Registra tu Unidad Habitacional. Un administrador revisará
                            la solicitud antes de activarla.
                        </p>
                    </div>
                </div>

                <form className={cuentaStyles.formularioEdicion} onSubmit={solicitarCreacion}>
                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="nombre">Nombre de la unidad habitacional</label>
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            placeholder="Ej. Unidad Habitacional El Rosario"
                            maxLength={50}
                            autoComplete="organization"
                            required
                        />
                    </div>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="ubicacion">Ubicación</label>
                        <input
                            type="text"
                            id="ubicacion"
                            name="ubicacion"
                            placeholder="Ej. Calle, colonia, municipio"
                            maxLength={255}
                            required
                        />
                    </div>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="foto">Foto de la unidad habitacional</label>
                        <input
                            type="file"
                            id="foto"
                            name="foto"
                            accept=".jpg,.jpeg,.png"
                            required
                        />
                        <small>Formatos permitidos: JPG o PNG. Máximo 5 MB.</small>
                    </div>

                    <div className={cuentaStyles.campoEdicion}>
                        <label htmlFor="maximoHabitantes">Máximo de habitantes</label>
                        <input
                            type="number"
                            id="maximoHabitantes"
                            name="maximoHabitantes"
                            min={1}
                            max={200}
                            step={1}
                            placeholder="Entre 1 y 200"
                            required
                        />
                    </div>

                    {mensaje && (
                        <p className={cuentaStyles.mensaje} data-tipo={tipoMensaje} role="alert">
                            {mensaje}
                        </p>
                    )}

                    <button type="submit" className={cuentaStyles.botonGuardar} disabled={cargando}>
                        {cargando ? "Enviando solicitud..." : "Solicitar creación de comunidad"}
                    </button>

                </form>

            </section>

        </main>
    );
}
