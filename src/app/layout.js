import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
import AuthProvider from "./components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Vecindex | Tu comunidad, conectada",
  description: "Mantente comunicado con tu comunidad de tu Unidad Habitacional",
};

export default function RootLayout({ children }) {
  return (
      <html lang="es" className={`${geistSans.variable} ${geistMono.variable}`}>
      <AuthProvider>
        {children}
      </AuthProvider>
      </html>
  );
}
