import NavbarHabitanteSC from "@/app/components/NavbarHabitanteSC";

export default function HabitanteSCLayout({ children }) {
    return (
        <>
            <NavbarHabitanteSC />

            {children}
        </>
    );
}