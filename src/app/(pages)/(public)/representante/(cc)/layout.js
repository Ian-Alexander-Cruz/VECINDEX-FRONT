import NavbarRepresentanteCC from "@/app/components/NavbarRepresentanteCC";

export default function RepresentanteCCLayout({ children }) {
    return (
        <>
            <NavbarRepresentanteCC />

            {children}
        </>
    );
}
