"use client"
import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {useAuth} from "./AuthProvider";

const INICIO_ROL = {
    habitante: "/habitante/inicio_SC",
    represente: "/represente/inicio_SC",
    adicionar: "/administrador/inicio",
}

export default function RedireccionSesion() {
    const {usuario, cargandoSesion} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if(cargandoSesion || !usuario) return;
        const destino = INICIO_ROL[usuario.rol]
        if(destino) router.replace(destino);
    }, [usuario, cargandoSesion, router]);
    return null;

}
