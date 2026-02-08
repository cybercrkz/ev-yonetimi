import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!email || !password || !confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    try {
      setError('');
      setLoading(true);
      console.log('Kayıt işlemi başlatılıyor...', { email });
      const response = await signUp({ email, password });
      console.log('Kayıt cevabı:', response);
      
      if (response?.user) {
        navigate('/login');
        alert('Kayıt başarılı! Lütfen e-posta adresinize gönderilen onay linkine tıklayın.');
      } else {
        throw new Error('Kayıt işlemi başarısız oldu');
      }
    } catch (error) {
      console.error('Kayıt hatası:', error);
      setError(`Kayıt olurken bir hata oluştu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-center mb-4">Kayıt Ol</h2>
              {error && (
                <div className="alert alert-danger">
                  <strong>Hata:</strong> {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">E-posta</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Şifre</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="En az 6 karakter"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Şifre Tekrar</label>
                  <input
                    type="password"
                    className="form-control"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Şifrenizi tekrar girin"
                    required
                    disabled={loading}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Kayıt yapılıyor...
                    </>
                  ) : (
                    'Kayıt Ol'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 