import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Şifreler eşleşmiyor');
    }

    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/');
    } catch (error) {
      setError('Kayıt olurken bir hata oluştu: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex p-0">
      <div className="row g-0 w-100">
        {/* Sol Taraf - Görsel ve Mesaj */}
        <div className="col-lg-6 d-none d-lg-block position-relative overflow-hidden p-0 order-lg-1">
          <img
            src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
            alt="Ev Yönetimi"
            className="w-100 h-100 object-fit-cover"
            style={{ filter: 'brightness(0.7)' }}
          />
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-center align-items-center text-white p-5 text-center" style={{ background: 'rgba(0,0,0,0.3)' }}>
            <h1 className="display-4 fw-bold mb-4">Aramıza Katılın</h1>
            <p className="lead fs-4 mb-5" style={{ maxWidth: '500px' }}>
              Bütçenizi kontrol altına almak için ilk adımı atın. Hesap oluşturmak tamamen ücretsiz ve sadece birkaç saniye sürer.
            </p>
            <div className="border border-light rounded p-4" style={{ backdropFilter: 'blur(5px)' }}>
              <i className="fas fa-quote-left fa-2x mb-3 opacity-50"></i>
              <p className="fst-italic mb-0">
                "Ev bütçesini yönetmek hiç bu kadar kolay olmamıştı. Harika bir uygulama!"
              </p>
              <div className="mt-3 fw-bold">- Mutlu Kullanıcı</div>
            </div>
          </div>
        </div>

        {/* Sağ Taraf - Kayıt Formu */}
        <div className="col-lg-6 d-flex flex-column justify-content-center align-items-center bg-white p-5 order-lg-2">
          <div className="w-100" style={{ maxWidth: '450px' }}>
            <div className="mb-5 text-center text-lg-start">
              <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-3">
                <i className="fas fa-home fa-2x text-primary me-2"></i>
                <h3 className="fw-bold mb-0 text-primary">Ev Yönetimi</h3>
              </div>
              <h2 className="fw-bold mb-2">Hesap Oluşturun 🚀</h2>
              <p className="text-muted">Bilgilerinizi girerek hemen başlayın</p>
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

              <div className="form-floating mb-3">
                <input
                  type="password"
                  className="form-control bg-light border-0"
                  id="password"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ height: '60px' }}
                />
                <label htmlFor="password">Şifre</label>
              </div>

              <div className="form-floating mb-4">
                <input
                  type="password"
                  className="form-control bg-light border-0"
                  id="confirmPassword"
                  placeholder="Şifre Tekrar"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  style={{ height: '60px' }}
                />
                <label htmlFor="confirmPassword">Şifre Tekrar</label>
              </div>

              <div className="form-check mb-4">
                <input className="form-check-input" type="checkbox" id="terms" required />
                <label className="form-check-label text-muted small" htmlFor="terms">
                  <Link to="#" className="text-primary text-decoration-none">Kullanım Şartları</Link> ve <Link to="#" className="text-primary text-decoration-none">Gizlilik Politikası</Link>'nı kabul ediyorum.
                </label>
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
                    Kayıt Yapılıyor...
                  </>
                ) : (
                  'HESAP OLUŞTUR'
                )}
              </button>

              <div className="text-center">
                <span className="text-muted">Zaten hesabınız var mı? </span>
                <Link to="/login" className="text-primary text-decoration-none fw-bold ms-1">
                  Giriş Yapın
                </Link>
              </div>
            </form>

            {/* Sosyal Medya */}
            <div className="mt-5">
              <div className="position-relative text-center mb-4">
                <hr className="text-muted opacity-25" />
                <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small">
                  veya şununla kayıt ol
                </span>
              </div>
              <div className="d-flex gap-3 justify-content-center">
                <button className="btn btn-light border rounded-circle p-3 shadow-sm transition-hover">
                  <i className="fab fa-google fa-lg text-danger"></i>
                </button>
                <button className="btn btn-light border rounded-circle p-3 shadow-sm transition-hover">
                  <i className="fab fa-facebook-f fa-lg text-primary"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
