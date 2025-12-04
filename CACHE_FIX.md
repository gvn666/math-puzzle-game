# Cache Sorunu Çözümü

## Sorun
Vercel deploy ediyor ama tarayıcıda değişiklikler görünmüyor.

## Çözümler

### 1. Hard Refresh (En Hızlı Çözüm)

**Mac:**
- Chrome/Safari: `Cmd + Shift + R`
- Firefox: `Cmd + Shift + R`

**Windows/Linux:**
- Chrome/Edge: `Ctrl + Shift + R` veya `Ctrl + F5`
- Firefox: `Ctrl + Shift + R`

### 2. Service Worker Cache Temizleme

**Chrome DevTools:**
1. F12 ile DevTools'u aç
2. Application sekmesine git
3. Sol menüden "Service Workers" seç
4. "Unregister" butonuna tıkla
5. "Storage" altından "Clear site data" yap
6. Sayfayı yenile

**Safari (iOS):**
1. Ayarlar → Safari → Gelişmiş → Web Sitesi Verileri
2. İlgili siteyi bul ve "Tüm Verileri Temizle"

### 3. Tarayıcı Cache Temizleme

**Chrome:**
1. Ayarlar → Gizlilik ve Güvenlik → Tarama Verilerini Temizle
2. "Önbelleğe alınan resimler ve dosyalar" seç
3. "Verileri temizle"

**Safari:**
1. Gelişmiş → "Geliştirici menüsünü göster" aktif et
2. Geliştirici → "Önbellekleri Temizle"

### 4. Otomatik Çözüm (Yapıldı)

Service Worker artık:
- ✅ Network-first stratejisi kullanıyor (önce network'ten kontrol ediyor)
- ✅ Otomatik güncelleme kontrolü yapıyor
- ✅ Yeni versiyon bulunca otomatik yeniliyor
- ✅ Cache versiyonu güncellendi (v2.1)

### 5. Manuel Kontrol

Tarayıcı konsolunda (F12) şunu çalıştır:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(reg => reg.unregister());
    location.reload();
});
```

## Önleme

Gelecekte bu sorunu önlemek için:
- Service Worker artık network-first kullanıyor
- Her 60 saniyede bir otomatik güncelleme kontrolü yapılıyor
- Sayfa görünür olduğunda güncelleme kontrolü yapılıyor

## Test

Değişikliklerin geldiğini kontrol etmek için:
1. Hard refresh yap (Cmd+Shift+R veya Ctrl+Shift+R)
2. Konsolu aç (F12) ve Service Worker mesajlarını kontrol et
3. Eğer hala eski versiyon görüyorsan, Service Worker'ı unregister et

