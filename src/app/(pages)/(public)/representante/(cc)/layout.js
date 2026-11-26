import NavbarRepresentanteCC from "@/app/components/NavbarRepresentanteCC";
import ProteccionRuta from "@/app/components/ProteccionRuta";

export default function RepresentanteCCLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="representante" requiereComunidad>
            <NavbarRepresentanteCC />

            {children}
        </ProteccionRuta>
    );
}
