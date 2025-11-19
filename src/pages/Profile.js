import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { exportUserData, importUserData, getUserDataStats, clearAllUserData } from '../utils/exportImport';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const fileInputRef = useRef(null);

  // İstatistikleri yükle
  const loadStats = () => {
    if (user) {
      const userStats = getUserDataStats(user.id);
      setStats(userStats);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, [user]);

  // Verileri dışa aktar
  const handleExport = () => {
    try {
      exportUserData(user.id);
      toast.success('Verileriniz başarıyla dışa aktarıldı!');
    } catch (error) {
      console.error('Dışa aktarma hatası:', error);
      toast.error('Veriler dışa aktarılırken hata oluştu');
    }
  };

  // Verileri içe aktar
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await importUserData(file, user.id);
      
      toast.success(
        `Veriler başarıyla içe aktarıldı!\n` +
        `Faturalar: ${result.itemCount.bills}\n` +
        `Giderler: ${result.itemCount.expenses}\n` +
        `Yapılacaklar: ${result.itemCount.todos}\n` +
        `Market: ${result.itemCount.shopping}`
      );
      
      // İstatistikleri güncelle
      loadStats();
      
      // Sayfayı yenile
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('İçe aktarma hatası:', error);
      toast.error(error.message || 'Veriler içe aktarılırken hata oluştu');
    } finally {
      setLoading(false);
      // Input'u sıfırla
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Tüm verileri temizle
  const handleClearData = () => {
    if (window.confirm('TÜM VERİLERİNİZ SİLİNECEK! Bu işlem geri alınamaz. Devam etmek istiyor musunuz?')) {
      if (window.confirm('Son kez soruyorum: Tüm faturalar, giderler, yapılacaklar ve market listesi silinecek. Emin misiniz?')) {
        try {
          clearAllUserData(user.id);
          toast.success('Tüm verileriniz başarıyla temizlendi');
          loadStats();
          
          // Sayfayı yenile
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } catch (error) {
          console.error('Temizleme hatası:', error);
          toast.error('Veriler temizlenirken hata oluştu');
        }
      }
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          {/* Kullanıcı Bilgileri */}
          <div className="card shadow mb-4">
            <div className="card-body">
              <h2 className="card-title mb-4">
                <i className="fas fa-user-circle me-2"></i>
                Profil Bilgilerim
              </h2>
              
              <div className="mb-3">
                <label className="form-label fw-bold">E-posta</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                />
                <small className="text-muted">E-posta adresi değiştirilemez</small>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Kullanıcı ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={user?.id || ''}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Veri İstatistikleri */}
          {stats && (
            <div className="card shadow mb-4">
              <div className="card-body">
                <h5 className="card-title mb-4">
                  <i className="fas fa-chart-bar me-2"></i>
                  Veri İstatistikleri
                </h5>
                <div className="row text-center">
                  <div className="col-6 col-md-3 mb-3">
                    <div className="border rounded p-3">
                      <div className="fs-4 fw-bold text-primary">{stats.bills}</div>
                      <small className="text-muted">Fatura</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3 mb-3">
                    <div className="border rounded p-3">
                      <div className="fs-4 fw-bold text-success">{stats.expenses}</div>
                      <small className="text-muted">Gider</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3 mb-3">
                    <div className="border rounded p-3">
                      <div className="fs-4 fw-bold text-warning">{stats.todos}</div>
                      <small className="text-muted">Yapılacak</small>
                    </div>
                  </div>
                  <div className="col-6 col-md-3 mb-3">
                    <div className="border rounded p-3">
                      <div className="fs-4 fw-bold text-info">{stats.shopping}</div>
                      <small className="text-muted">Market Ürünü</small>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3">
                  <div className="fs-5 fw-bold">Toplam: {stats.total} kayıt</div>
                </div>
              </div>
            </div>
          )}

          {/* Veri Yönetimi */}
          <div className="card shadow mb-4">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="fas fa-database me-2"></i>
                Veri Yönetimi
              </h5>

              <div className="alert alert-info">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Cihazlar arası veri aktarımı:</strong>
                <ol className="mb-0 mt-2">
                  <li>PC'de "Verileri Dışa Aktar" butonuna tıklayın</li>
                  <li>İndirilen JSON dosyasını telefonunuza gönderin</li>
                  <li>Telefonda "Verileri İçe Aktar" ile dosyayı yükleyin</li>
                </ol>
              </div>

              <div className="d-grid gap-2 mb-3">
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleExport}
                  disabled={loading || !stats || stats.total === 0}
                >
                  <i className="fas fa-download me-2"></i>
                  Verileri Dışa Aktar (Yedekle)
                </button>
                <small className="text-muted text-center">
                  {stats && stats.total > 0 
                    ? `${stats.total} kayıt JSON dosyası olarak indirilecek`
                    : 'Dışa aktarılacak veri bulunmuyor'}
                </small>
              </div>

              <div className="d-grid gap-2 mb-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                <button
                  className="btn btn-success btn-lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-2"></i>
                      Verileri İçe Aktar (Geri Yükle)
                    </>
                  )}
                </button>
                <small className="text-muted text-center">
                  Başka cihazdan dışa aktardığınız JSON dosyasını seçin
                </small>
              </div>

              <hr />

              <div className="d-grid gap-2">
                <button
                  className="btn btn-danger btn-lg"
                  onClick={handleClearData}
                  disabled={loading || !stats || stats.total === 0}
                >
                  <i className="fas fa-trash-alt me-2"></i>
                  Tüm Verileri Temizle
                </button>
                <small className="text-danger text-center">
                  ⚠️ Bu işlem geri alınamaz! Önce yedek almanızı öneririz.
                </small>
              </div>
            </div>
          </div>

          {/* Oturum Yönetimi */}
          <div className="card shadow">
            <div className="card-body">
              <h5 className="card-title mb-4">
                <i className="fas fa-sign-out-alt me-2"></i>
                Oturum Yönetimi
              </h5>
              <div className="d-grid">
                <button
                  className="btn btn-outline-secondary btn-lg"
                  onClick={signOut}
                >
                  <i className="fas fa-door-open me-2"></i>
                  Çıkış Yap
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
