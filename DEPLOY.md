# GitHub ve Vercel Deploy Rehberi

## 1. GitHub Repository Oluşturma

### Adım 1: GitHub'da Yeni Repository Oluştur
1. https://github.com adresine git
2. Sağ üstteki "+" butonuna tıkla → "New repository"
3. Repository adı: `math-puzzle-game` (veya istediğin isim)
4. **Public** veya **Private** seç (Public önerilir - ücretsiz)
5. **"Initialize this repository with a README"** seçeneğini **İŞARETLEME**
6. "Create repository" butonuna tıkla

### Adım 2: GitHub Repository'yi Yerel Projeye Bağla

GitHub'da repository oluşturduktan sonra, GitHub sana bir URL verecek. Şu komutları çalıştır:

```bash
cd /Users/guvenkelleci/math-puzzle-game

# GitHub'dan aldığın URL'i buraya yapıştır (örnek: https://github.com/kullaniciadi/math-puzzle-game.git)
git remote add origin https://github.com/KULLANICI_ADIN/math-puzzle-game.git

# Ana branch'i main olarak ayarla
git branch -M main

# GitHub'a gönder
git push -u origin main
```

**Not:** Eğer GitHub'da 2FA (İki Faktörlü Doğrulama) açıksa, Personal Access Token kullanman gerekebilir.

## 2. Vercel'e Deploy Etme

### Yöntem 1: Vercel Web Arayüzü (Önerilen)

1. **Vercel'e Git:**
   - https://vercel.com adresine git
   - GitHub hesabınla giriş yap

2. **Yeni Proje Oluştur:**
   - "Add New..." → "Project" tıkla
   - GitHub repository'ni seç (math-puzzle-game)
   - "Import" butonuna tıkla

3. **Ayarları Yap:**
   - Framework Preset: **Other** veya **Vite** seç
   - Root Directory: `./` (varsayılan)
   - Build Command: Boş bırak (static site)
   - Output Directory: Boş bırak
   - Install Command: Boş bırak

4. **Deploy:**
   - "Deploy" butonuna tıkla
   - 1-2 dakika içinde oyunun canlı olacak!

### Yöntem 2: Vercel CLI (Terminal)

```bash
# Vercel CLI'yi yükle (eğer yoksa)
npm i -g vercel

# Proje klasörüne git
cd /Users/guvenkelleci/math-puzzle-game

# Vercel'e deploy et
vercel

# İlk seferinde:
# - GitHub hesabınla giriş yap
# - Proje ayarlarını onayla
# - Deploy tamamlanınca URL'i al
```

## 3. Service Worker Düzeltmesi

Vercel'de deploy ettikten sonra, service-worker.js dosyasındaki cache URL'lerini güncellemek gerekebilir. Eğer sorun olursa, `service-worker.js` dosyasındaki URL'leri kontrol et.

## 4. PWA Icon Dosyaları (Opsiyonel)

Daha iyi görünüm için icon dosyaları ekleyebilirsin:

1. `icon-192.png` (192x192 piksel)
2. `icon-512.png` (512x512 piksel)

Bu dosyaları proje klasörüne ekle ve commit et.

## 5. Özel Domain (Opsiyonel)

Vercel'de ücretsiz olarak özel domain ekleyebilirsin:
- Vercel Dashboard → Project → Settings → Domains
- Domain ekle ve DNS ayarlarını yap

## Hızlı Komutlar

```bash
# Git durumunu kontrol et
git status

# Değişiklikleri ekle
git add .

# Commit yap
git commit -m "Değişiklik açıklaması"

# GitHub'a gönder
git push

# Vercel'de yeniden deploy et (CLI ile)
vercel --prod
```

## Sorun Giderme

### Service Worker Çalışmıyor
- HTTPS gereklidir (Vercel otomatik sağlar)
- Cache'i temizle: Tarayıcı ayarları → Site verilerini temizle

### Mobil Cihazda Çalışmıyor
- Vercel URL'ini kontrol et
- HTTPS kullanıldığından emin ol
- Service Worker'ın kayıtlı olduğunu kontrol et (DevTools → Application → Service Workers)

### Build Hatası
- `vercel.json` dosyasının doğru olduğundan emin ol
- Static site olduğu için build komutu gerekmez

