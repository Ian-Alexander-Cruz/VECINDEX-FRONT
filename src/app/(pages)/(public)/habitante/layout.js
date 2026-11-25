import ProteccionRuta from "../../../components/ProteccionRuta";

export default function HabitanteLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="habitante">
            {children}
        </ProteccionRuta>
    );
}