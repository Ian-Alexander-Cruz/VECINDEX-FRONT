import ProteccionRuta from "@/app/components/ProteccionRuta";

export default function RepresentanteLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="representante">
            {children}
        </ProteccionRuta>
    );
}
