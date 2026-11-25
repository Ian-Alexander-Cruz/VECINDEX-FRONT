import { Suspense } from "react";
import NavbarHabitanteCC from "@/app/components/NavbarHabitanteCC";

export default function HabitanteCCLayout({ children }) {
    return (
        <>
            <Suspense fallback={null}>
                <NavbarHabitanteCC />
            </Suspense>

            <Suspense fallback={null}>
                {children}
            </Suspense>
        </>
    );
}
