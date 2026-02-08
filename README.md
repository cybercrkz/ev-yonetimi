# Ev Yönetimi Uygulaması

Bu proje, ev yönetimi işlemlerini kolaylaştırmak için geliştirilmiş bir React uygulamasıdır. [Create React App](https://github.com/facebook/create-react-app) kullanılarak oluşturulmuştur.

## Özellikler

- 📊 Dashboard ile genel bakış
- 💰 Fatura takibi
- 📝 Gider yönetimi
- ✅ Yapılacaklar listesi
- 🛒 Market alışveriş listesi
- 📈 Gider analizi ve raporlama
- 👥 Kullanıcı yönetimi
- 🔐 Güvenli oturum yönetimi

## Kullanılan Teknolojiler

- React.js
- Supabase (Veritabanı ve Kimlik Doğrulama)
- Bootstrap 5
- Chart.js (Grafikler için)
- React Router
- React Toastify

## Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

1. Repoyu klonlayın:
```bash
git clone [repo-url]
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve Supabase bilgilerinizi ekleyin:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Uygulamayı başlatın:
```bash
npm start
```

## Kullanılabilir Komutlar

### `npm start`

Uygulamayı geliştirme modunda çalıştırır.\
[http://localhost:3000](http://localhost:3000) adresinden tarayıcınızda görüntüleyebilirsiniz.

Yaptığınız değişiklikler otomatik olarak sayfayı yenileyecektir.\
Konsoldaki hata mesajlarını da görebilirsiniz.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Uygulamayı production modunda derler ve `build` klasörüne çıktı üretir.\
React'i production modunda doğru şekilde paketler ve en iyi performans için yapıyı optimize eder.

Derleme işlemi sıkıştırılır ve dosya adları hash'leri içerir.\
Uygulamanız deployment için hazır!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`
**Not: Bu tek yönlü bir işlemdir. `eject` komutunu kullandıktan sonra geri dönemezsiniz!**

Eğer derleme aracı ve yapılandırma seçeneklerinden memnun değilseniz, istediğiniz zaman `eject` komutunu kullanabilirsiniz. Bu komut, projenizden tek derleme bağımlılığını kaldıracaktır.

Bunun yerine, tüm yapılandırma dosyalarını ve geçişli bağımlılıkları (webpack, Babel, ESLint vb.) doğrudan projenize kopyalayarak tam kontrol sahibi olmanızı sağlar. `eject` dışındaki tüm komutlar çalışmaya devam edecektir, ancak artık kopyalanan scriptleri işaret edeceklerdir ve bunları düzenleyebilirsiniz. Bu noktadan sonra kendi başınızasınız.

`eject` komutunu kullanmak zorunda değilsiniz. Mevcut özellik seti küçük ve orta ölçekli dağıtımlar için uygundur ve bu özelliği kullanmak zorunda hissetmemelisiniz. Ancak hazır olduğunuzda özelleştirme yapamamanız durumunda bu aracın faydalı olmayacağını anlıyoruz.

## Güvenlik

- Oturum yönetimi Supabase ile sağlanmaktadır
- 1 dakika hareketsizlik sonrası otomatik çıkış yapılır
- Tüm API istekleri güvenli HTTPS üzerinden gerçekleştirilir
- Hassas veriler şifrelenerek saklanır

## Veritabanı Şeması

### Tablolar

1. users
   - id (UUID)
   - email (String)
   - created_at (Timestamp)

2. bills
   - id (UUID)
   - user_id (UUID, FK)
   - title (String)
   - amount (Decimal)
   - due_date (Date)
   - status (String)
   - created_at (Timestamp)

3. expenses
   - id (UUID)
   - user_id (UUID, FK)
   - category (String)
   - amount (Decimal)
   - date (Date)
   - description (String)
   - created_at (Timestamp)

4. todos
   - id (UUID)
   - user_id (UUID, FK)
   - title (String)
   - completed (Boolean)
   - created_at (Timestamp)

5. shopping_items
   - id (UUID)
   - user_id (UUID, FK)
   - item (String)
   - quantity (Integer)
   - completed (Boolean)
   - created_at (Timestamp)

## Katkıda Bulunma

1. Bu repoyu fork edin
2. Feature branch'inizi oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## İletişim

Proje Sahibi - [@cybercrkz](https://github.com/cybercrkz)

Proje Linki: [https://github.com/cybercrkz/ev-yonetimi](https://github.com/cybercrkz/ev-yonetimi)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
