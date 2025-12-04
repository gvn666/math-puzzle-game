#!/bin/bash

# GitHub Repository Setup Script
# Bu script'i çalıştırmadan önce GitHub'da repository oluşturmalısın!

echo "🚀 GitHub Repository Setup"
echo "=========================="
echo ""
echo "1️⃣  Önce GitHub'da yeni bir repository oluştur:"
echo "   - https://github.com/new adresine git"
echo "   - Repository adı: math-puzzle-game"
echo "   - Public seç"
echo "   - README ekleme (boş bırak)"
echo ""
echo "2️⃣  Repository URL'ini buraya yapıştır:"
read -p "GitHub Repository URL (örn: https://github.com/kullaniciadi/math-puzzle-game.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ URL boş olamaz!"
    exit 1
fi

echo ""
echo "📦 GitHub'a bağlanıyor..."

# Remote ekle
git remote add origin $REPO_URL 2>/dev/null || git remote set-url origin $REPO_URL

# Branch'i main olarak ayarla
git branch -M main

# GitHub'a push et
echo ""
echo "⬆️  GitHub'a gönderiliyor..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Başarılı! Repository GitHub'a yüklendi!"
    echo ""
    echo "🌐 Şimdi Vercel'e deploy edebilirsin:"
    echo "   1. https://vercel.com adresine git"
    echo "   2. GitHub hesabınla giriş yap"
    echo "   3. 'Add New Project' → Repository'ni seç"
    echo "   4. Deploy butonuna tıkla"
    echo ""
else
    echo ""
    echo "❌ Hata oluştu! Lütfen kontrol et:"
    echo "   - GitHub'da repository oluşturdun mu?"
    echo "   - URL doğru mu?"
    echo "   - GitHub kimlik doğrulaması yaptın mı?"
fi

