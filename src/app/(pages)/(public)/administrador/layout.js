import ProteccionRuta from "../../../components/ProteccionRuta";
import NavbarAdministrador from "@/app/components/NavbarAdministrador";

export default function AdministradorLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="administrador">
            <NavbarAdministrador />

            {children}
        </ProteccionRuta>
    );
}