import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/');
    } catch (error) {
      setError('E-posta veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0">
      <div className="row g-0 w-100">
        {/* Sol Taraf - Login Formu */}
        <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-white p-5">
          <div className="w-100" style={{ maxWidth: '450px' }}>
            <div className="mb-5 text-center text-lg-start">
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-3">
                <i className="fas fa-home fa-2x text-primary me-2"></i>
                <h3 className="fw-bold mb-0 text-primary">Ev Yönetimi</h3>
              </div>
              <h2 className="fw-bold mb-2">Tekrar Hoş Geldiniz!</h2>
              <p className="text-muted">Lütfen hesabınıza giriş yapın</p>
            </div>

            {error && (
              <div className="alert alert-danger d-flex align-items-center" role="alert">
                <i className="fas fa-exclamation-circle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control bg-light border-0"
                  id="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ height: '60px' }}
                />
                <label htmlFor="email">E-posta Adresi</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control bg-light border-0"
                  id="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ height: '60px' }}
                />
                <label htmlFor="password">Şifre</label>
              </div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label text-muted" htmlFor="rememberMe">
                    Beni Hatırla
                  </label>
                </div>
                <Link to="/forgot-password" className="text-primary text-decoration-none fw-medium">
                  Şifremi Unuttum?
                </Link>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-4"
                disabled={loading}
                style={{ letterSpacing: '0.5px' }}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Giriş Yapılıyor...
                  </>
                ) : (
                  'GİRİŞ YAP'
                )}
              </button>

              <div className="text-center">
                <span className="text-muted">Hesabınız yok mu? </span>
                <Link to="/register" className="text-primary text-decoration-none fw-bold ms-1">
                  Hemen Kayıt Olun
                </Link>
              </div>
            </form>

            {/* Sosyal Medya Girişi */}
            <div className="mt-5">
              <div className="position-relative text-center mb-4">
                <hr className="text-muted opacity-25" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                  veya şununla devam et
                </span>
              </div>
              <div className="d-flex gap-3 justify-content-center">
                <button className="btn btn-light border rounded-circle p-3 shadow-sm transition-hover">
                  <i className="fab fa-google fa-lg text-danger"></i>
                </button>
                <button className="btn btn-light border rounded-circle p-3 shadow-sm transition-hover">
                  <i className="fab fa-facebook-f fa-lg text-primary"></i>
                </button>
                <button className="btn btn-light border rounded-circle p-3 shadow-sm transition-hover">
                  <i className="fab fa-apple fa-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Görsel ve Mesaj */}
        <div className="col-lg-6 d-none d-lg-block position-relative overflow-hidden p-0">
          <img
            src="https://images.unsplash.com/photo-1556911220-bff31c812dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80"
            alt="Ev Yönetimi"
            className="w-100 h-100 object-fit-cover"
            style={{ filter: 'brightness(0.7)' }}
          />
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white p-5 text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <h1 className="display-4 fw-bold mb-4">Evinizi Kolayca Yönetin</h1>
            <p className="lead fs-4 mb-5" style={{ maxWidth: '500px' }}>
              Faturalar, giderler ve alışveriş listeniz artık tek bir yerde. Finansal özgürlüğünüzü planlamaya hemen başlayın.
            </p>
            <div className="d-flex gap-4">
              <div className="text-center">
                <h3 className="fw-bold mb-0">100%</h3>
                <small>Ücretsiz</small>
              </div>
              <div className="text-center">
                <h3 className="fw-bold mb-0">Güvenli</h3>
                <small>Veri Şifreleme</small>
              </div>
              <div className="text-center">
                <h3 className="fw-bold mb-0">7/24</h3>
                <small>Erişim</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
