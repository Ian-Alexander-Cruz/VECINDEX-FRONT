import FondoCuenta from "@/app/components/FondoCuenta";
import styles from "@/app/styles/Home.module.css";
import ayudaStyles from "@/app/styles/Ayuda.module.css";

export default function Ayuda() {
    return (
        <main className={`${styles.container} ${ayudaStyles.paginaAyuda}`}>
            <FondoCuenta />

            <section className={ayudaStyles.seccionAyuda} aria-labelledby="para-habitantes">
                <h1 id="para-habitantes" className={ayudaStyles.tituloSeccion}>
                    Para habitantes
                </h1>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Unirse a una comunidad</h2>
                    <p>
                        Mientras no pertenezcas a una comunidad, la navegación lateral muestra Inicio, Unirse a comunidad y Ayuda, además del acceso a tu cuenta. Haz clic en Unirse a comunidad y elige Unirse a comunidad con código, si tu representante te dio uno, o Buscar comunidad para encontrar tu unidad. Podrás entrar cuando el representante acepte tu solicitud.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Inicio de tu comunidad</h2>
                    <p>
                        Cuando ya perteneces a una comunidad, Inicio muestra lo nuevo: anuncios del representante, encuestas y peticiones de tus vecinos. Usa los filtros, Publicaciones, Encuestas y Peticiones para ver solo lo que te interesa.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Crear una petición</h2>
                    <p>
                        Una petición sirve para avisar de una falla, una necesidad de mantenimiento o una propuesta en los espacios comunes. Así el representante sabe en qué conviene usar el presupuesto comunitario.
                    </p>
                    <ol className={ayudaStyles.listaPasos}>
                        <li>Haz clic en Crear petición en la navegación lateral y elige Con mapa o Sin mapa.</li>
                        <li>Elige el tipo de problema, escribe un título y describe el problema.</li>
                        <li>Con mapa, haz clic en Colocar ubicación para marcar el punto exacto. Escribe también la dirección y los detalles para identificar el lugar.</li>
                        <li>Agrega fotografías como evidencia.</li>
                        <li>Haz clic en Enviar petición.</li>
                    </ol>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Apoyar peticiones</h2>
                    <p>
                        En Inicio puedes ver las peticiones de tus vecinos y apoyar las que también te afecten. Mientras más apoyos tiene una petición, más importante se vuelve para la comunidad.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Mapa de peticiones</h2>
                    <p>
                        En la sección Mapa ves dónde están las peticiones de tu comunidad. El color indica su estatus: Pendiente, En revisión o Resuelta. Haz clic en un punto para ver su tipo, estatus y apoyos. Usa Centrar para volver a tu unidad.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Encuestas</h2>
                    <p>
                        El representante publica encuestas para decidir qué atender primero. Aparecen en Inicio con el porcentaje de cada opción y su fecha de cierre.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Eventos</h2>
                    <p>
                        En la sección Eventos ves la lista de actividades de tu comunidad. Haz clic en uno para ver su tipo, fecha y descripción. Los eventos marcados como CON CHAT tienen el botón Ir al chat del evento para organizarse.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Cuenta y configuración</h2>
                    <p>
                        Desde el menú lateral puedes acceder a tu perfil, Configuración y Cerrar sesión. En Configuración puedes elegir el modo claro, el modo oscuro o la apariencia predeterminada del sistema para el sitio web.
                    </p>
                </article>
            </section>

            <section className={ayudaStyles.seccionAyuda} aria-labelledby="para-representantes">
                <h1
                    id="para-representantes"
                    className={ayudaStyles.tituloSeccion}
                >
                    Para representantes
                </h1>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Menú principal</h2>
                    <p>
                        En el menú principal ves lo nuevo en tu comunidad con los mismos filtros que los habitantes: Publicaciones, Encuestas y Peticiones. Consulta las peticiones más apoyadas para decidir a dónde dirigir el presupuesto.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Solicitudes de ingreso</h2>
                    <p>
                        Haz clic en el icono de solicitudes del menú principal para ver a las personas que quieren unirse a tu comunidad.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Subir contenido</h2>
                    <p>
                        La sección Subir tiene dos opciones: Crear evento y Agregar información.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Crear un evento</h2>
                    <ol className={ayudaStyles.listaPasos}>
                        <li>Escribe el título del evento (máximo 60 caracteres).</li>
                        <li>Elige el tipo de evento de la lista.</li>
                        <li>Escribe la descripción y selecciona la fecha y la hora.</li>
                        <li>Activa Chat del evento si quieres que los habitantes tengan un chat exclusivo para organizarse.</li>
                        <li>Haz clic en Crear evento.</li>
                    </ol>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Compartir lo que haces por la comunidad</h2>
                    <p>
                        Con Agregar información publicas un título (máximo 60 caracteres), una descripción (máximo 500 caracteres) y una imagen para que todos los habitantes vean lo que has hecho por tu comunidad. Haz clic en Publicar información al terminar.
                    </p>
                </article>

                <article className={ayudaStyles.bloqueTema}>
                    <h2>Mapa, chat y eventos</h2>
                    <p>
                        Tienes las mismas secciones de Mapa, Chat y Eventos que los habitantes para dar seguimiento a las peticiones y conversar con tu comunidad.
                    </p>
                </article>
            </section>

            <section className={ayudaStyles.seccionAyuda} aria-labelledby="preguntas-frecuentes">
                <h1
                    id="preguntas-frecuentes"
                    className={ayudaStyles.tituloSeccion}
                >
                    Preguntas frecuentes
                </h1>

                <article className={ayudaStyles.preguntaFrecuente}>
                    <h2>No puedo avanzar en un formulario</h2>
                    <p>
                        Revisa los campos con aviso en rojo: alguno no cumple las reglas de longitud o formato.
                    </p>
                </article>

                <article className={ayudaStyles.preguntaFrecuente}>
                    <h2>Pedí unirme y todavía no entro</h2>
                    <p>
                        Tu solicitud queda pendiente hasta que el representante de la comunidad la acepte.
                    </p>
                </article>

                <article className={ayudaStyles.preguntaFrecuente}>
                    <h2>¿Qué cambia entre crear una petición con mapa y sin mapa?</h2>
                    <p>
                        Con mapa marcas el punto exacto del problema. Sin mapa solo escribes la dirección y los detalles del lugar.
                    </p>
                </article>

                <article className={ayudaStyles.preguntaFrecuente}>
                    <h2>¿Cómo cambia la apariencia del sitio?</h2>
                    <p>
                        Abre Configuración desde el menú lateral y elige modo claro, modo oscuro o el predeterminado del sistema.
                    </p>
                </article>
            </section>
        </main>
    );
}
