import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Çıkış yapılırken hata oluştu:', error.message);
    }
  };

  // E-posta adresinden kullanıcı adını çıkar
  const getUserFirstName = () => {
    if (!user?.email) return '';
    return user.email.split('@')[0].charAt(0).toUpperCase() + 
           user.email.split('@')[0].slice(1);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="fas fa-home me-2"></i>Ev Yönetimi
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          {user && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/">
                  <i className="fas fa-chart-line me-1"></i>Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/todo">
                  <i className="fas fa-tasks me-1"></i>Yapılacaklar
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/shopping">
                  <i className="fas fa-shopping-cart me-1"></i>Market Listesi
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/bills">
                  <i className="fas fa-file-invoice-dollar me-1"></i>Faturalar
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/expenses">
                  <i className="fas fa-wallet me-1"></i>Giderler
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/income">
                  <i className="fas fa-money-bill-wave me-1"></i>Gelirler
                </Link>
              </li>
            </ul>
          )}
          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item dropdown">
                  <button
                    className="nav-link dropdown-toggle btn btn-link"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-user-circle me-1"></i>
                    Merhaba, {getUserFirstName()}
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="fas fa-user me-2"></i>Profilim
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button
                        className="dropdown-item text-danger"
                        onClick={handleSignOut}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i>Çıkış Yap
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="fas fa-sign-in-alt me-1"></i>Giriş Yap
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/register">
                    <i className="fas fa-user-plus me-1"></i>Kayıt Ol
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 