# Ev Yönetimi Uygulaması

Modern ve kullanıcı dostu bir ev yönetimi uygulaması. Tüm veriler tarayıcınızda localStorage ile güvenli şekilde saklanır.

## ✨ Özellikler

* 📊 **Dashboard** - Genel bakış ve istatistikler
* 💰 **Fatura Takibi** - Faturalarınızı takip edin, ödeme durumlarını yönetin
* 📝 **Gider Yönetimi** - Günlük giderlerinizi kategorilere ayırarak kaydedin
* ✅ **Yapılacaklar Listesi** - Görevlerinizi organize edin
* 🛒 **Market Alışveriş Listesi** - Alışveriş listenizi kolayca yönetin
* 📈 **Gider Analizi ve Raporlama** - Grafik ve tablolarla harcamalarınızı görselleştirin
* 👥 **Kullanıcı Yönetimi** - Kişisel hesap sistemi
* 🔐 **Güvenli Oturum Yönetimi** - 1 dakika hareketsizlik sonrası otomatik çıkış
* 💾 **LocalStorage Depolama** - Tüm veriler tarayıcınızda güvenle saklanır

## 🚀 Kullanılan Teknolojiler

* **React.js** - Modern UI framework
* **Bootstrap 5** - Responsive tasarım
* **Chart.js** - Grafik görselleştirme
* **React Router** - Sayfa yönlendirme
* **React Toastify** - Bildirim sistemi
* **LocalStorage API** - Tarayıcı tabanlı veri saklama

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

1. **Repoyu klonlayın:**
```bash
git clone https://github.com/cybercrkz/ev-yonetimi.git
cd ev-yonetimi
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Uygulamayı başlatın:**
```bash
npm start
```

Uygulama otomatik olarak tarayıcınızda `http://localhost:3000` adresinde açılacaktır.

## 🎯 Kullanım

### İlk Başlangıç

1. Uygulamayı başlattıktan sonra "Kayıt Ol" butonuna tıklayın
2. E-posta adresinizi ve şifrenizi girerek hesap oluşturun
3. Giriş yaparak uygulamayı kullanmaya başlayın

### Özellikler

#### 📊 Ana Sayfa (Dashboard)
- Faturalar, giderler, yapılacaklar ve market listesi özetini görün
- Gider dağılımı grafiğini inceleyin
- Yaklaşan faturaları kontrol edin

#### 💰 Faturalar
- Yeni fatura ekleyin (elektrik, su, internet vb.)
- Fatura durumunu "Ödendi/Bekliyor" olarak işaretleyin
- Son ödeme tarihlerine göre renkli uyarılar alın
- Ödenen ve bekleyen fatura toplamlarını görün

#### 📝 Giderler
- Kategoriye göre gider kaydedin
- Ödeme yöntemini belirleyin (nakit, kredi kartı vb.)
- Kategori ve ödeme yöntemine göre toplam raporları görün
- Tarih bazlı gider takibi yapın

#### ✅ Yapılacaklar
- Görevlerinizi ekleyin ve yönetin
- Son tarih belirleyin
- Tamamlanan görevleri işaretleyin
- Açıklama ve notlar ekleyin

#### 🛒 Market Listesi
- Alışveriş ürünlerini kategorilere göre gruplandırın
- Miktar belirleyin ve güncelleyin
- Alınan ürünleri işaretleyin
- Liste otomatik olarak kategorilere ayrılır

## 🔒 Güvenlik

* Tüm veriler **localStorage** ile tarayıcınızda saklanır
* Şifreler kullanıcı tarafında tutulur
* 1 dakika hareketsizlik sonrası otomatik çıkış
* Her kullanıcının verileri izole edilmiştir

## 📱 Responsive Tasarım

Uygulama tüm cihazlarda (masaüstü, tablet, mobil) sorunsuz çalışır.

## 🛠️ Geliştirme

### Kullanılabilir Komutlar

#### `npm start`
Uygulamayı geliştirme modunda çalıştırır.  
[http://localhost:3000](http://localhost:3000) adresinden erişilebilir.

#### `npm test`
Test runner'ı interaktif mod olarak başlatır.

#### `npm run build`
Uygulamayı production modu için derler ve `build` klasörüne çıktı üretir.  
React'i production modunda optimize eder.

## 🌐 Deploy

### Vercel'e Deploy

1. [Vercel](https://vercel.com) hesabınıza giriş yapın
2. GitHub reposunu bağlayın
3. Deploy butonuna tıklayın
4. Otomatik olarak build alınıp yayınlanır

### Netlify'a Deploy

1. [Netlify](https://netlify.com) hesabınıza giriş yapın
2. "New site from Git" seçeneğini kullanın
3. GitHub reposunu seçin
4. Build command: `npm run build`
5. Publish directory: `build`

## 📊 Veritabanı Yapısı

Tüm veriler localStorage'da JSON formatında saklanır:

### Kullanıcılar
```javascript
{
  id: "timestamp",
  email: "user@example.com",
  password: "hashed_password",
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

### Faturalar
```javascript
{
  id: "timestamp",
  bill_type: "Elektrik",
  amount: 150.50,
  due_date: "2025-01-15",
  status: "pending",
  notes: "Not",
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

### Giderler
```javascript
{
  id: "timestamp",
  category: "Market",
  description: "Haftalık alışveriş",
  amount: 250.00,
  date: "2025-01-01",
  payment_method: "nakit",
  createdAt: "2025-01-01T00:00:00.000Z"
}
```

## 🤝 Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch'inizi oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik eklendi'`)
4. Branch'inizi push edin (`git push origin feature/YeniOzellik`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📧 İletişim

Proje Sahibi - [@cybercrkz](https://github.com/cybercrkz)

Proje Linki: [https://github.com/cybercrkz/ev-yonetimi](https://github.com/cybercrkz/ev-yonetimi)

## 🙏 Teşekkürler

Bu proje Create React App kullanılarak oluşturulmuştur.

* [Create React App Dokümantasyonu](https://facebook.github.io/create-react-app/docs/getting-started)
* [React Dokümantasyonu](https://reactjs.org/)
* [Bootstrap Dokümantasyonu](https://getbootstrap.com/)
