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
    <div className="min-vh-100 d-flex align-items-center bg-light py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                {/* Logo ve Başlık */}
                <div className="text-center mb-4">
                  <i className="fas fa-home fa-3x text-primary mb-3"></i>
                  <h2 className="fw-bold">Ev Yönetimi</h2>
                  <p className="text-muted">Hesabınıza giriş yapın</p>
                </div>

                {/* Hata Mesajı */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="fas fa-exclamation-circle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Giriş Formu */}
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <label htmlFor="email">E-posta adresi</label>
                  </div>

                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Şifre"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label htmlFor="password">Şifre</label>
                  </div>

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Giriş yapılıyor...
                        </>
                      ) : (
                        'Giriş Yap'
                      )}
                    </button>
                  </div>
                </form>

                {/* Alt Linkler */}
                <div className="text-center mt-4">
                  <Link to="/forgot-password" className="text-decoration-none">
                    Şifremi unuttum
                  </Link>
                  <hr className="my-4" />
                  <p className="mb-0">
                    Hesabınız yok mu?{' '}
                    <Link to="/register" className="text-decoration-none fw-bold">
                      Hemen kaydolun
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* Sosyal Medya Butonları */}
            <div className="text-center mt-4">
              <p className="text-muted mb-4">Sosyal medya ile giriş yapın</p>
              <div className="d-flex justify-content-center gap-3">
                <button className="btn btn-outline-dark btn-lg rounded-circle">
                  <i className="fab fa-google"></i>
                </button>
                <button className="btn btn-outline-dark btn-lg rounded-circle">
                  <i className="fab fa-facebook-f"></i>
                </button>
                <button className="btn btn-outline-dark btn-lg rounded-circle">
                  <i className="fab fa-twitter"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 