"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { solicitarAPI } from "../services/api";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [cargandoSesion, setCargandoSesion] = useState(true);
    const [errorSesion, setErrorSesion] = useState(false);

    useEffect(() => {
        let activo = true;

        async function verificarSesion() {
            try {
                const perfil = await solicitarAPI("/api/usuario/perfil");

                if (activo) {
                    setUsuario(perfil);
                    setErrorSesion(false);
                }
            } catch (error) {
                if (activo) {
                    if (
                        error.message === "Token requerido" ||
                        error.message === "Token inválido o expirado"
                    ) {
                        setUsuario(null);
                        setErrorSesion(false);
                    } else {
                        setErrorSesion(true);
                    }
                }
            } finally {
                if (activo) {
                    setCargandoSesion(false);
                }
            }
        }

        verificarSesion();

        return () => {
            activo = false;
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                usuario,
                setUsuario,
                cargandoSesion,
                errorSesion
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
