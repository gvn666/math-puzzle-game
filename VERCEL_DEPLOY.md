# Vercel Deploy Güncelleme

## Otomatik Deploy (Önerilen)

GitHub repository'nize push yaptığınızda, Vercel otomatik olarak deploy başlatır.

✅ **Son push:** `0435ac5` - "Update README - trigger Vercel deploy"

### Deploy Durumunu Kontrol Etme

1. **Vercel Dashboard'a Git:**
   - https://vercel.com/dashboard
   - GitHub hesabınızla giriş yapın

2. **Projeyi Bul:**
   - `math-puzzle-game` projesini seçin

3. **Deploy Durumunu Kontrol Et:**
   - "Deployments" sekmesine gidin
   - En son deploy'un durumunu kontrol edin
   - "Ready" durumunda ise, URL'yi tıklayarak oyunu açabilirsiniz

## Manuel Deploy

Eğer otomatik deploy çalışmıyorsa:

### Yöntem 1: Vercel Dashboard'dan

1. Vercel Dashboard → Proje → "Deployments"
2. En son deploy'un yanındaki "..." menüsüne tıklayın
3. "Redeploy" seçeneğini seçin

### Yöntem 2: Vercel CLI ile

```bash
# Vercel'e giriş yap (ilk seferinde)
vercel login

# Deploy et
cd /Users/guvenkelleci/math-puzzle-game
vercel --prod
```

## Sorun Giderme

### Deploy Çalışmıyor

1. **GitHub Bağlantısını Kontrol Et:**
   - Vercel Dashboard → Proje → Settings → Git
   - Repository'nin bağlı olduğundan emin olun

2. **Build Ayarlarını Kontrol Et:**
   - Settings → General → Build & Development Settings
   - Framework Preset: **Other**
   - Build Command: Boş bırak
   - Output Directory: Boş bırak

3. **Yeni Deploy Tetikle:**
   - GitHub'a küçük bir commit push edin
   - Veya Dashboard'dan "Redeploy" yapın

### Deploy Başarısız Oluyor

- `vercel.json` dosyasının doğru olduğundan emin olun
- Console loglarını kontrol edin
- Build hatası varsa, hata mesajını kontrol edin

## Deploy URL'i

Deploy tamamlandıktan sonra, Vercel size bir URL verecek:
- Örnek: `https://math-puzzle-game.vercel.app`
- Veya özel domain'iniz varsa: `https://yourdomain.com`

Bu URL'i mobil cihazınızda açarak oyunu test edebilirsiniz!

