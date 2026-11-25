import NavbarHabitanteCC from "@/app/components/NavbarHabitanteCC";

export default function HabitanteCCLayout({ children }) {
    return (
        <>
            <NavbarHabitanteCC />

            {children}
        </>
    );
}