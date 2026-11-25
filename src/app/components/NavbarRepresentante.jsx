"use client";

import { useEffect, useState } from "react";
import NavbarRepresentanteSC from "./NavbarRepresentanteSC";
import NavbarRepresentanteCC from "./NavbarRepresentanteCC";
import { solicitarAPI } from "../services/api";

export default function NavbarRepresentante() {
    const [tieneComunidad, setTieneComunidad] = useState(null);


    useEffect(() => {
        async function revisarComunidad() {
            try {
                const perfil = await solicitarAPI("/api/representante/perfil");
                const comunidad = perfil.comunidad;

                setTieneComunidad(
                    Array.isArray(comunidad) ? comunidad.length > 0 : Boolean(comunidad)
                );
            } catch (error) {
                console.error(error);
                setTieneComunidad(false);
            }
        }

        revisarComunidad();
    }, []);

    if (tieneComunidad === null) return null;

    return tieneComunidad ? <NavbarRepresentanteCC /> : <NavbarRepresentanteSC />;
}
