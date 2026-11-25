const ProteccionRuta = require("../../../../components/ProteccionRuta");

export default function CuentaLayout({children}){
    return (<ProteccionRuta>{children}</ProteccionRuta>)
}