import ProteccionRuta from "../../../components/ProteccionRuta";
import NavbarRepresentante from "../../../components/NavbarRepresentante";

export default function RepresentanteLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="representante">
            <NavbarRepresentante/>

            {children}
        </ProteccionRuta>
    );
}