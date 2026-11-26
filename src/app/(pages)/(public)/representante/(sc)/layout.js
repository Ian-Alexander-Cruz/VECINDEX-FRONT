import NavbarRepresentanteSC from "@/app/components/NavbarRepresentanteSC";

export default function RepresentanteSCLayout({ children }) {
    return (
        <>
            <NavbarRepresentanteSC />

            {children}
        </>
    );
}
