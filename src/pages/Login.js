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
    <div className="min-vh-100 d-flex bg-white">
      {/* Sol Panel: Giriş Formu */}
      <div className="col-12 col-lg-5 d-flex align-items-center justify-content-center p-4 p-md-5">
        <div className="w-100" style={{ maxWidth: '400px' }}>
          <div className="text-center mb-5">
            <div className="d-inline-block p-3 rounded-circle bg-light mb-3">
              <i className="fas fa-home fa-2x text-primary"></i>
            </div>
            <h2 className="fw-bold text-dark">Ev Yönetimi</h2>
            <p className="text-muted">Pro Max Deneyimine Giriş Yapın</p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 glass-pro-max text-danger mb-4" role="alert">
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
                style={{ borderRadius: '12px' }}
              />
              <label htmlFor="email">E-posta adresi</label>
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
                style={{ borderRadius: '12px' }}
              />
              <label htmlFor="password">Şifre</label>
            </div>

            <div className="d-grid">
              <button
                type="submit"
                className="btn btn-pro-max btn-lg py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Hesabıma Giriş Yap'
                )}
              </button>
            </div>
          </form>

          <div className="text-center mt-5">
            <p className="mb-0 text-muted">
              Hesabınız yok mu?{' '}
              <Link to="/register" className="text-primary text-decoration-none fw-bold">
                Ücretsiz Kaydolun
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Sağ Panel: Görsel */}
      <div className="d-none d-lg-block col-lg-7 p-4">
        <div
          className="w-100 h-100 rounded-4 shadow-lg"
          style={{
            backgroundImage: `url('/assets/login-bg.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: '600px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div
            className="position-absolute bottom-0 start-0 p-5 w-100"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
              color: 'white'
            }}
          >
            <h3 className="fw-bold mb-2">Evinizin Kontrolü Sizin Elinizde</h3>
            <p className="opacity-75 mb-0">Faturalar, giderler ve planlar artık daha düzenli ve şık.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 