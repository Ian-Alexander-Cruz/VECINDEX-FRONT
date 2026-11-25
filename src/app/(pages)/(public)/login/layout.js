import RedireccionSesion from "../../../components/RedireccionSesion";

export default function LoginLayout({children}) {
    return <RedireccionSesion>{children}</RedireccionSesion>;
}