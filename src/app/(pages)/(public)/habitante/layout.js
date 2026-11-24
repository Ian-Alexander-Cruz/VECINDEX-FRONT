import ProteccionRuta from "../../../components/ProteccionRuta";
import NavbarHabitanteSC from "../../../components/NavbarHabitanteSC";

export default function HabitanteLayout({ children }) {
    return (
        <ProteccionRuta rolPermitido="habitante">
            <NavbarHabitanteSC />

            {children}
        </ProteccionRuta>
    );
}