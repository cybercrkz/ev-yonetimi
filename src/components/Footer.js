import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3">
            <h5>CANS</h5>
            <p className="text-muted">
              Isıtma ve soğutma sistemlerinde güvenilir çözüm ortağınız.
            </p>
          </div>
          <div className="col-md-4 mb-3">
            <h5>Hızlı Linkler</h5>
            <ul className="list-unstyled">
              <li><Link to="/" className="text-muted text-decoration-none">Ana Sayfa</Link></li>
              <li><Link to="/urunler" className="text-muted text-decoration-none">Ürünler</Link></li>
              <li><Link to="/hakkimizda" className="text-muted text-decoration-none">Hakkımızda</Link></li>
              <li><Link to="/iletisim" className="text-muted text-decoration-none">İletişim</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-3">
            <h5>İletişim</h5>
            <ul className="list-unstyled text-muted">
              <li><i className="fas fa-phone me-2"></i> +90 123 456 7890</li>
              <li><i className="fas fa-envelope me-2"></i> info@cans.com</li>
              <li><i className="fas fa-map-marker-alt me-2"></i> İstanbul, Türkiye</li>
            </ul>
          </div>
        </div>
        <hr className="bg-secondary" />
        <div className="row">
          <div className="col text-center">
            <p className="mb-0 text-muted">
              &copy; {new Date().getFullYear()} CANS. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 