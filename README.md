# Math Puzzle Game

Mobil cihazlar için tasarlanmış birleştirme (matching) oyunu.

## Nasıl Çalıştırılır?

### Yöntem 1: Python HTTP Sunucusu (Önerilen)

Terminal'de proje klasöründe şu komutu çalıştırın:

```bash
python3 -m http.server 8000
```

Sonra tarayıcınızda şu adresi açın:
- **Yerel bilgisayar:** http://localhost:8000
- **Aynı ağdaki mobil cihaz:** http://[BILGISAYAR-IP]:8000

### Yöntem 2: Node.js HTTP Server

Eğer Node.js yüklüyse:

```bash
npx http-server -p 8000
```

### Yöntem 3: Doğrudan Dosya Açma (Sınırlı)

`index.html` dosyasını doğrudan tarayıcıda açabilirsiniz, ancak Service Worker çalışmayabilir.

## Mobil Cihazda Test Etme

1. **Bilgisayarınızın IP adresini öğrenin:**
   - Mac/Linux: Terminal'de `ifconfig` veya `ip addr` komutunu çalıştırın
   - Windows: `ipconfig` komutunu çalıştırın

2. **Mobil cihazınızı aynı WiFi ağına bağlayın**

3. **Mobil tarayıcıda şu adresi açın:**
   ```
   http://[BILGISAYAR-IP]:8000
   ```

4. **iPhone Safari'de Ana Ekrana Ekle:**
   - Paylaş butonuna tıklayın
   - "Ana Ekrana Ekle" seçeneğini seçin
   - Oyun artık bir uygulama gibi çalışacak!

## Oyun Kontrolleri

- **Sayıları Eşleştirme:** İki aynı sayıya dokunarak eşleştirin
- **Bonus Yıldız:** Her 50 sayıda bir çıkan yıldız, eşleştirildiğinde en büyük sayıya dönüşür
- **Durdur Butonu:** Oyunu duraklatmak için üstteki "Durdur" butonuna tıklayın
- **Combo:** Hızlı ardışık eşleştirmeler bonus puan kazandırır

## Özellikler

✅ Tam ekran mobil görünüm (kaydırma yok)
✅ 4x4 oyun tahtası
✅ Her sayı için benzersiz renk
✅ Dinamik sayı üretimi
✅ Combo sistemi
✅ Bonus yıldızlar
✅ PWA desteği (Ana ekrana eklenebilir)
✅ Çevrimdışı çalışma
✅ Ses efektleri
✅ Animasyonlar

## Notlar

- Service Worker çalışması için HTTPS veya localhost gerekir
- Mobil cihazda test ederken aynı ağda olduğunuzdan emin olun
- PWA icon dosyaları (icon-192.png, icon-512.png) eklenirse daha iyi görünür

## Son Güncelleme

Tüm özellikler tamamlandı ve oyun hazır! 🎮✨

