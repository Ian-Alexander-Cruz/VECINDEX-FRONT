import ProteccionRuta from "../../../components/ProteccionRuta";
import NavbarAdministrador from "@/app/components/NavbarAdministrador";

export default function ComunidadLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="habitante">
            {children}
        </ProteccionRuta>
    );
}