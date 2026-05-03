import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <span className="footer__logo">UCC</span>
          <div>
            <p className="footer__brand-name">Universidad Cooperativa de Colombia</p>
            <p className="footer__brand-sub">Portal Institucional del Egresado · 2025</p>
          </div>
        </div>

        {/* Columns */}
        <div className="footer__cols">
          <div className="footer__col">
            <h4 className="footer__col-title">Portal</h4>
            <ul>
              <li><a href="#funciones">Funciones</a></li>
              <li><a href="#como-funciona">¿Cómo funciona?</a></li>
              <li><a href="#estadisticas">Estadísticas</a></li>
              <li><a href="#testimonios">Testimonios</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Cuenta</h4>
            <ul>
              <li><a href="/registro">Registrarse</a></li>
              <li><a href="/login">Ingresar</a></li>
              <li><a href="/perfil">Mi perfil</a></li>
              <li><a href="/postulaciones">Mis postulaciones</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Legal</h4>
            <ul>
              <li><a href="/privacidad">Política de privacidad</a></li>
              <li><a href="/terminos">Términos de uso</a></li>
              <li><a href="/datos">Tratamiento de datos</a></li>
            </ul>
          </div>
          <div className="footer__col">
            <h4 className="footer__col-title">Soporte</h4>
            <ul>
              <li><a href="/ayuda">Centro de ayuda</a></li>
              <li><a href="/contacto">Contacto</a></li>
              <li><a href="mailto:egresados@ucc.edu.co">egresados@ucc.edu.co</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p className="footer__copy">
            © 2025 Universidad Cooperativa de Colombia. Todos los derechos reservados.
          </p>
          <div className="footer__socials">
            <a href="#" aria-label="Facebook">fb</a>
            <a href="#" aria-label="Instagram">ig</a>
            <a href="#" aria-label="LinkedIn">in</a>
          </div>
        </div>
      </div>
    </footer>
  );
}