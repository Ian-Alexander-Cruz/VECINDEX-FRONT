import ProteccionRuta from "../../../components/ProteccionRuta";
import NavbarRepresentanteSC from "../../../components/NavbarRepresentanteSC";

export default function RepresentanteLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="representante">
            <NavbarRepresentanteSC/>

            {children}
        </ProteccionRuta>
    );
}