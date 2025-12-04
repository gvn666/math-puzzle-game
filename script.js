// LocalStorage Yönetimi
class StorageManager {
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            return false;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            return false;
        }
    }
}

// Oyun İstatistikleri
class GameStats {
    constructor() {
        this.stats = StorageManager.get('gameStats', {
            totalGames: 0,
            highScore: 0,
            maxNumber: 0,
            totalMatches: 0,
            totalScore: 0,
            maxCombo: 0,
            achievements: []
        });
    }

    updateStats(gameData) {
        this.stats.totalGames++;
        this.stats.totalScore += gameData.score;
        this.stats.totalMatches += gameData.matches || 0;
        
        if (gameData.score > this.stats.highScore) {
            this.stats.highScore = gameData.score;
        }
        if (gameData.maxNumber > this.stats.maxNumber) {
            this.stats.maxNumber = gameData.maxNumber;
        }
        if (gameData.maxCombo > this.stats.maxCombo) {
            this.stats.maxCombo = gameData.maxCombo;
        }

        StorageManager.set('gameStats', this.stats);
    }

    getStats() {
        return this.stats;
    }

    getAverageScore() {
        return this.stats.totalGames > 0 
            ? Math.floor(this.stats.totalScore / this.stats.totalGames) 
            : 0;
    }
}

// Başarı Rozetleri
class AchievementSystem {
    constructor() {
        this.achievements = [
            { id: 'first_game', name: 'İlk Oyun', desc: 'İlk oyununu tamamla', icon: '🎮' },
            { id: 'score_100', name: 'Yüzler', desc: '100 puan kazan', icon: '💯' },
            { id: 'score_500', name: 'Beş Yüz', desc: '500 puan kazan', icon: '🔥' },
            { id: 'score_1000', name: 'Binler', desc: '1000 puan kazan', icon: '⭐' },
            { id: 'number_64', name: 'Altmış Dört', desc: '64 sayısına ulaş', icon: '🔢' },
            { id: 'number_256', name: 'İki Yüz Elli Altı', desc: '256 sayısına ulaş', icon: '💎' },
            { id: 'number_1024', name: 'Bin Yirmi Dört', desc: '1024 sayısına ulaş', icon: '👑' },
            { id: 'combo_5', name: 'Combo Ustası', desc: '5x combo yap', icon: '⚡' },
            { id: 'perfect_match', name: 'Mükemmel Eşleştirme', desc: 'Hiç hata yapmadan oyunu bitir', icon: '🎯' }
        ];
    }

    checkAchievements(gameData, stats) {
        const earned = [];
        
        if (stats.totalGames === 1) earned.push('first_game');
        if (gameData.score >= 100) earned.push('score_100');
        if (gameData.score >= 500) earned.push('score_500');
        if (gameData.score >= 1000) earned.push('score_1000');
        if (gameData.maxNumber >= 64) earned.push('number_64');
        if (gameData.maxNumber >= 256) earned.push('number_256');
        if (gameData.maxNumber >= 1024) earned.push('number_1024');
        if (gameData.maxCombo >= 5) earned.push('combo_5');

        return earned.map(id => this.achievements.find(a => a.id === id)).filter(Boolean);
    }
}

// Ana Oyun Sınıfı
class MathPuzzleGame {
    constructor() {
        this.board = Array(16).fill(0);
        this.selectedCells = [];
        this.totalScore = 0;
        this.comboCount = 0;
        this.comboTimer = null;
        this.gameInterval = null;
        this.isPaused = false;
        this.isGameOver = false;
        this.numberCount = 0;
        this.maxNumber = 0;
        this.numberColors = new Map();
        this.difficulty = StorageManager.get('difficulty', 'normal');
        this.soundEnabled = StorageManager.get('soundEnabled', true);
        this.hapticEnabled = StorageManager.get('hapticEnabled', true);
        this.darkTheme = StorageManager.get('darkTheme', false);
        this.matchCount = 0;
        this.maxCombo = 0;
        this.streakCount = 0;
        this.lastMatchTime = 0;
        this.powerUps = { bomb: 0, freeze: 0, double: 0 };
        this.freezeTimer = null;
        this.stats = new GameStats();
        this.achievements = new AchievementSystem();
        this.currentScreen = 'mainMenu';
        
        this.difficultySettings = {
            easy: { interval: 2000, name: 'Kolay' },
            normal: { interval: 1300, name: 'Normal' },
            hard: { interval: 800, name: 'Zor' }
        };

        this.initColors();
        this.init();
    }

    initColors() {
        const baseColors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#e67e22', '#34495e', '#c0392b', '#16a085',
            '#8e44ad', '#27ae60', '#d35400', '#2980b9', '#c0392b',
            '#7f8c8d', '#f1c40f', '#e74c3c', '#3498db', '#2ecc71'
        ];
        
        baseColors.forEach((color, index) => {
            this.numberColors.set(Math.pow(2, index), color);
        });
    }

    getColorForNumber(num) {
        if (this.numberColors.has(num)) {
            return this.numberColors.get(num);
        }
        
        const hue = (num * 137.508) % 360;
        const saturation = 60 + (num % 20);
        const lightness = this.darkTheme ? (35 + (num % 20)) : (45 + (num % 15));
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        this.numberColors.set(num, color);
        return color;
    }

    init() {
        this.applyTheme();
        this.showMainMenu();
        this.setupEventListeners();
        this.loadStats();
    }

    applyTheme() {
        document.body.classList.toggle('dark-theme', this.darkTheme);
        if (this.darkTheme) {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', '#1a1a1a');
        } else {
            document.querySelector('meta[name="theme-color"]').setAttribute('content', '#2c3e50');
        }
    }

    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('mainMenu').classList.add('show');
        this.currentScreen = 'mainMenu';
        this.updateHighScoreDisplay();
    }

    showDifficultyMenu() {
        this.hideAllScreens();
        document.getElementById('difficultyMenu').classList.add('show');
        this.currentScreen = 'difficultyMenu';
        
        // Aktif zorluk seviyesini işaretle
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.difficulty === this.difficulty) {
                btn.classList.add('active');
            }
        });
    }

    showGameArea() {
        this.hideAllScreens();
        document.getElementById('gameArea').classList.add('show');
        this.currentScreen = 'gameArea';
    }

    hideAllScreens() {
        document.querySelectorAll('.main-menu, .difficulty-menu, .countdown-screen, .game-area, .game-over-screen, .pause-screen, .settings-screen, .stats-screen, .leaderboard-screen').forEach(el => {
            el.classList.remove('show');
        });
    }

    setupEventListeners() {
        // Ana menü
        document.getElementById('startGameBtn').addEventListener('click', () => {
            const showTutorial = !StorageManager.get('tutorialShown', false);
            if (showTutorial) {
                this.showTutorial();
            } else {
                this.showDifficultyMenu();
            }
        });
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
        document.getElementById('leaderboardBtn').addEventListener('click', () => this.showLeaderboard());

        // Zorluk seçimi
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                StorageManager.set('difficulty', this.difficulty);
            });
        });
        document.getElementById('startWithDifficulty').addEventListener('click', () => this.startGameWithCountdown());

        // Oyun kontrolleri
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('restartBtnPause').addEventListener('click', () => this.restart());
        document.getElementById('backToMenuBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('backToMenuPauseBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('shareBtn').addEventListener('click', () => this.shareScore());

        // Ayarlar
        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            StorageManager.set('soundEnabled', this.soundEnabled);
        });
        document.getElementById('hapticToggle').addEventListener('change', (e) => {
            this.hapticEnabled = e.target.checked;
            StorageManager.set('hapticEnabled', this.hapticEnabled);
        });
        document.getElementById('darkThemeToggle').addEventListener('change', (e) => {
            this.darkTheme = e.target.checked;
            StorageManager.set('darkTheme', this.darkTheme);
            this.applyTheme();
        });
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.showMainMenu());

        // İstatistikler
        document.getElementById('closeStatsBtn').addEventListener('click', () => this.showMainMenu());
        document.getElementById('closeLeaderboardBtn').addEventListener('click', () => this.showMainMenu());

        // Tutorial
        document.getElementById('tutorialNext1').addEventListener('click', () => {
            document.getElementById('tutorialStep1').style.display = 'none';
            document.getElementById('tutorialStep2').style.display = 'block';
        });
        document.getElementById('tutorialNext2').addEventListener('click', () => {
            document.getElementById('tutorialStep2').style.display = 'none';
            document.getElementById('tutorialStep3').style.display = 'block';
        });
        document.getElementById('tutorialStart').addEventListener('click', () => {
            StorageManager.set('tutorialShown', true);
            document.getElementById('tutorialOverlay').classList.remove('show');
            this.showDifficultyMenu();
        });
    }

    showTutorial() {
        document.getElementById('tutorialOverlay').classList.add('show');
        document.getElementById('tutorialStep1').style.display = 'block';
        document.getElementById('tutorialStep2').style.display = 'none';
        document.getElementById('tutorialStep3').style.display = 'none';
    }

    startGameWithCountdown() {
        this.hideAllScreens();
        document.getElementById('countdownScreen').classList.add('show');
        
        let count = 3;
        const countdownEl = document.getElementById('countdownNumber');
        countdownEl.textContent = count;
        
        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                countdownEl.textContent = count;
                this.playCountdownSound();
            } else {
                countdownEl.textContent = 'BAŞLA!';
                clearInterval(countdownInterval);
                setTimeout(() => {
                    this.startGame();
                }, 500);
            }
        }, 1000);
    }

    startGame() {
        this.isGameOver = false;
        this.isPaused = false;
        this.board = Array(16).fill(0);
        this.selectedCells = [];
        this.totalScore = 0;
        this.comboCount = 0;
        this.numberCount = 0;
        this.maxNumber = 0;
        this.matchCount = 0;
        this.maxCombo = 0;
        this.streakCount = 0;
        this.lastMatchTime = 0;
        this.powerUps = { bomb: 0, freeze: 0, double: 0 };
        
        this.showGameArea();
        this.updateStreakDisplay();
        this.createBoard();
        this.updateDisplay();
        this.hideGameOver();
        this.hidePause();
        
        // İlk sayıyı ekle
        setTimeout(() => this.addRandomNumber(), 500);
        
        // Zorluk seviyesine göre interval ayarla
        const interval = this.difficultySettings[this.difficulty].interval;
        this.gameInterval = setInterval(() => {
            if (!this.isPaused && !this.isGameOver && !this.freezeTimer) {
                this.addRandomNumber();
            }
        }, interval);
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleCellClick(i);
            }, { passive: false });
            gameBoard.appendChild(cell);
        }
    }

    addRandomNumber() {
        const emptyCells = this.board
            .map((val, idx) => val === 0 ? idx : -1)
            .filter(idx => idx !== -1);
        
        if (emptyCells.length === 0) {
            this.endGame();
            return;
        }

        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const newNumber = this.getNewNumberValue();
        
        this.board[randomIndex] = newNumber;
        this.numberCount++;
        this.maxNumber = Math.max(this.maxNumber, newNumber);
        
        // Bonus yıldız kontrolü
        if (this.numberCount % 50 === 0) {
            this.board[randomIndex] = 'bonus';
        }
        
        this.totalScore += newNumber;
        this.updateDisplay();
        this.updateCell(randomIndex);
        this.updateProgressBar();
        
        // Yeni sayı animasyonu
        const cell = document.querySelector(`[data-index="${randomIndex}"]`);
        cell.classList.add('new-number');
        setTimeout(() => cell.classList.remove('new-number'), 400);

        // Özel sayı efektleri
        if (newNumber === 64 || newNumber === 256 || newNumber === 1024) {
            this.playSpecialNumberEffect(newNumber);
        }
    }

    getNewNumberValue() {
        if (this.maxNumber < 64) return 1;
        if (this.maxNumber < 128) return 2;
        if (this.maxNumber < 256) return 4;
        if (this.maxNumber < 512) return 8;
        if (this.maxNumber < 1024) return 16;
        if (this.maxNumber < 2048) return 32;
        if (this.maxNumber < 4096) return 64;
        if (this.maxNumber < 8192) return 128;
        if (this.maxNumber < 16384) return 256;
        if (this.maxNumber < 32768) return 512;
        if (this.maxNumber < 65536) return 1024;
        if (this.maxNumber < 131072) return 2048;
        if (this.maxNumber < 262144) return 4096;
        if (this.maxNumber < 524288) return 8192;
        if (this.maxNumber < 1048576) return 16384;
        return 32768;
    }

    formatNumber(num) {
        if (num === 'bonus') return '⭐';
        if (num === 0) return '';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1).replace('.0', '') + 'm';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace('.0', '') + 'k';
        }
        return num.toString();
    }

    handleCellClick(index) {
        if (this.isPaused || this.isGameOver || this.board[index] === 0) return;
        
        const cell = document.querySelector(`[data-index="${index}"]`);
        
        if (this.selectedCells.includes(index)) {
            this.selectedCells = this.selectedCells.filter(i => i !== index);
            cell.classList.remove('selected');
        } else {
            if (this.selectedCells.length === 0) {
                this.selectedCells.push(index);
                cell.classList.add('selected');
                this.vibrate(10);
            } else if (this.selectedCells.length === 1) {
                const firstIndex = this.selectedCells[0];
                const firstValue = this.board[firstIndex];
                const secondValue = this.board[index];
                
                if (firstValue === secondValue || 
                    (firstValue === 'bonus' && secondValue !== 0 && secondValue !== 'bonus') ||
                    (secondValue === 'bonus' && firstValue !== 0 && firstValue !== 'bonus')) {
                    this.matchCells(firstIndex, index);
                } else {
                    // Eşleşmedi - görsel geri bildirim
                    document.querySelector(`[data-index="${firstIndex}"]`).classList.add('wrong-match');
                    cell.classList.add('wrong-match');
                    setTimeout(() => {
                        document.querySelector(`[data-index="${firstIndex}"]`).classList.remove('wrong-match', 'selected');
                        cell.classList.remove('wrong-match');
                    }, 300);
                    document.querySelector(`[data-index="${firstIndex}"]`).classList.remove('selected');
                    this.selectedCells = [index];
                    cell.classList.add('selected');
                    this.vibrate([50, 30, 50]);
                }
            }
        }
    }

    matchCells(index1, index2) {
        const value1 = this.board[index1];
        const value2 = this.board[index2];
        
        let newValue;
        
        if (value1 === 'bonus' && value2 !== 'bonus' && value2 !== 0) {
            newValue = this.maxNumber;
        } else if (value2 === 'bonus' && value1 !== 'bonus' && value1 !== 0) {
            newValue = this.maxNumber;
        } else {
            newValue = value1 + value2;
        }
        
        // Yeni sayı ikinci tıklanan (index2) yerde oluşsun
        this.board[index2] = newValue;
        this.board[index1] = 0; // İlk tıklanan yeri boşalt
        this.maxNumber = Math.max(this.maxNumber, newValue);
        this.matchCount++;
        
        // Streak ve combo hesaplama
        const now = Date.now();
        if (now - this.lastMatchTime < 3000) {
            this.streakCount++;
        } else {
            this.streakCount = 1;
        }
        this.lastMatchTime = now;
        
        this.comboCount++;
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        this.comboTimer = setTimeout(() => {
            this.comboCount = 0;
        }, 2000);
        
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }
        
        // Puan hesaplama
        let matchScore = 5;
        const timeBonus = Math.max(0, 3000 - (now - this.lastMatchTime));
        matchScore += Math.floor(timeBonus / 100);
        
        if (this.comboCount >= 2) {
            matchScore *= this.comboCount;
            this.showCombo(this.comboCount);
        }
        
        this.totalScore += matchScore;
        this.playMatchSound();
        this.vibrate(20);
        
        // Gelişmiş görsel efektler
        const cell1 = document.querySelector(`[data-index="${index1}"]`);
        const cell2 = document.querySelector(`[data-index="${index2}"]`);
        
        // Ekran titreşimi efekti
        this.screenShake();
        
        // Sayıların birbirine doğru kayması animasyonu
        this.animateMerge(cell1, cell2, () => {
            // Animasyon tamamlandıktan sonra güncelle
            this.selectedCells = [];
            cell1.classList.remove('selected');
            cell2.classList.remove('selected');
            
            this.updateDisplay();
            this.updateCell(index1);
            this.updateCell(index2);
            this.updateStreakDisplay();
            
            // Oyun sonu kontrolü
            const emptyCells = this.board.filter(val => val === 0);
            if (emptyCells.length === 0) {
                setTimeout(() => this.endGame(), 500);
            }
        });
    }

    animateMerge(cell1, cell2, callback) {
        // İlk hücreyi kaybolma animasyonu ile boşalt
        cell1.classList.add('merging-out');
        
        // İkinci hücreye patlama ve büyüme efekti
        cell2.classList.add('merging-in');
        
        // Parçacık efektleri
        this.createParticles(cell1, cell2);
        this.createExplosion(cell2);
        
        // Glow efekti
        cell2.classList.add('glow-effect');
        
        setTimeout(() => {
            cell1.classList.remove('merging-out', 'selected');
            cell2.classList.remove('merging-in', 'glow-effect');
            if (callback) callback();
        }, 600);
    }

    createExplosion(cell) {
        const rect = cell.getBoundingClientRect();
        const container = document.getElementById('particleContainer');
        
        // Patlama efektleri için daha fazla parçacık
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            
            const angle = (Math.PI * 2 * i) / 20;
            const distance = 80 + Math.random() * 60;
            const duration = 800 + Math.random() * 400;
            const size = 4 + Math.random() * 6;
            
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = cell.style.backgroundColor || '#fff';
            particle.style.setProperty('--angle', angle);
            particle.style.setProperty('--distance', distance + 'px');
            particle.style.setProperty('--duration', duration + 'ms');
            
            container.appendChild(particle);
            setTimeout(() => particle.remove(), duration);
        }
    }

    updateStreakDisplay() {
        const streakEl = document.getElementById('streakValue');
        if (streakEl) {
            streakEl.textContent = this.streakCount;
            if (this.streakCount > 1) {
                streakEl.parentElement.classList.add('active');
            } else {
                streakEl.parentElement.classList.remove('active');
            }
        }
    }

    createParticles(cell1, cell2) {
        const container = document.getElementById('particleContainer');
        const rect1 = cell1.getBoundingClientRect();
        const rect2 = cell2.getBoundingClientRect();
        
        // İlk hücreden ikinci hücreye doğru akan parçacıklar
        const startX = rect1.left + rect1.width / 2;
        const startY = rect1.top + rect1.height / 2;
        const endX = rect2.left + rect2.width / 2;
        const endY = rect2.top + rect2.height / 2;
        
        const dx = endX - startX;
        const dy = endY - startY;
        const angle = Math.atan2(dy, dx);
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = startX + 'px';
            particle.style.top = startY + 'px';
            particle.style.background = cell1.style.backgroundColor || '#fff';
            
            const spread = (Math.random() - 0.5) * 0.5; // Yayılma açısı
            const particleAngle = angle + spread;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const duration = 400 + Math.random() * 200;
            const size = 6 + Math.random() * 4;
            
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.setProperty('--angle', particleAngle);
            particle.style.setProperty('--distance', distance + 'px');
            particle.style.setProperty('--duration', duration + 'ms');
            
            container.appendChild(particle);
            setTimeout(() => particle.remove(), duration);
        }
    }

    showCombo(multiplier) {
        const comboDisplay = document.getElementById('comboDisplay');
        comboDisplay.textContent = `${multiplier}x COMBO!`;
        comboDisplay.classList.add('show');
        setTimeout(() => {
            comboDisplay.classList.remove('show');
        }, 600);
    }

    updateCell(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        const value = this.board[index];
        
        if (value === 0) {
            cell.className = 'cell empty';
            cell.textContent = '';
            cell.removeAttribute('data-value');
            cell.style.backgroundColor = '';
        } else {
            cell.className = 'cell';
            if (value === 'bonus') {
                cell.classList.add('bonus');
                cell.textContent = '⭐';
                cell.style.backgroundColor = '#ffd700';
            } else {
                cell.classList.remove('bonus');
                const formatted = this.formatNumber(value);
                cell.textContent = formatted;
                cell.dataset.value = value;
                cell.style.backgroundColor = this.getColorForNumber(value);
                
                // Dinamik font boyutu
                if (formatted.length > 4) {
                    cell.style.fontSize = '14px';
                } else if (formatted.length > 3) {
                    cell.style.fontSize = '16px';
                } else {
                    cell.style.fontSize = '20px';
                }
            }
        }
    }

    updateDisplay() {
        const scoreEl = document.getElementById('totalScore');
        if (scoreEl) {
            scoreEl.textContent = this.formatNumber(this.totalScore);
        }
        
        const bestScoreEl = document.getElementById('currentBestScore');
        if (bestScoreEl) {
            const stats = this.stats.getStats();
            bestScoreEl.textContent = this.formatNumber(stats.highScore);
        }
        
        for (let i = 0; i < 16; i++) {
            this.updateCell(i);
        }
    }

    updateProgressBar() {
        const progress = (this.numberCount % 50) / 50 * 100;
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = `${this.numberCount % 50}/50`;
        }
    }

    updateHighScoreDisplay() {
        const stats = this.stats.getStats();
        const highScoreEl = document.getElementById('highScoreDisplay');
        if (highScoreEl) {
            highScoreEl.textContent = this.formatNumber(stats.highScore);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.gameInterval);
            this.showPause();
        } else {
            const interval = this.difficultySettings[this.difficulty].interval;
            this.gameInterval = setInterval(() => {
                if (!this.isPaused && !this.isGameOver && !this.freezeTimer) {
                    this.addRandomNumber();
                }
            }, interval);
            this.hidePause();
        }
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        const gameData = {
            score: this.totalScore,
            maxNumber: this.maxNumber,
            matches: this.matchCount,
            maxCombo: this.maxCombo
        };
        
        this.stats.updateStats(gameData);
        const earnedAchievements = this.achievements.checkAchievements(gameData, this.stats.getStats());
        
        this.playGameOverSound();
        this.showGameOver(gameData, earnedAchievements);
    }

    showGameOver(gameData, achievements) {
        document.getElementById('finalScore').textContent = this.formatNumber(this.totalScore);
        document.getElementById('finalMaxNumber').textContent = this.formatNumber(gameData.maxNumber);
        document.getElementById('finalMatches').textContent = gameData.matches;
        
        const stats = this.stats.getStats();
        const isNewRecord = this.totalScore >= stats.highScore;
        const newRecordEl = document.getElementById('newRecord');
        if (newRecordEl) {
            newRecordEl.style.display = isNewRecord ? 'block' : 'none';
        }
        
        // Başarı rozetleri
        const badgesEl = document.getElementById('badgesEarned');
        if (badgesEl && achievements.length > 0) {
            badgesEl.innerHTML = '<div class="badges-title">Kazanılan Rozetler:</div>' +
                achievements.map(a => `<div class="badge">${a.icon} ${a.name}</div>`).join('');
            badgesEl.style.display = 'block';
        } else {
            badgesEl.style.display = 'none';
        }
        
        document.getElementById('gameOverScreen').classList.add('show');
    }

    hideGameOver() {
        document.getElementById('gameOverScreen').classList.remove('show');
    }

    showPause() {
        document.getElementById('pauseScreen').classList.add('show');
    }

    hidePause() {
        document.getElementById('pauseScreen').classList.remove('show');
    }

    showSettings() {
        this.hideAllScreens();
        document.getElementById('settingsScreen').classList.add('show');
        
        document.getElementById('soundToggle').checked = this.soundEnabled;
        document.getElementById('hapticToggle').checked = this.hapticEnabled;
        document.getElementById('darkThemeToggle').checked = this.darkTheme;
    }

    showStats() {
        this.hideAllScreens();
        document.getElementById('statsScreen').classList.add('show');
        
        const stats = this.stats.getStats();
        document.getElementById('totalGames').textContent = stats.totalGames;
        document.getElementById('highScoreStat').textContent = this.formatNumber(stats.highScore);
        document.getElementById('maxNumberStat').textContent = this.formatNumber(stats.maxNumber);
        document.getElementById('totalMatchesStat').textContent = stats.totalMatches;
        document.getElementById('avgScoreStat').textContent = this.formatNumber(this.stats.getAverageScore());
        document.getElementById('maxComboStat').textContent = stats.maxCombo;
    }

    showLeaderboard() {
        this.hideAllScreens();
        document.getElementById('leaderboardScreen').classList.add('show');
        
        const leaderboard = StorageManager.get('leaderboard', []);
        const listEl = document.getElementById('leaderboardList');
        
        if (leaderboard.length === 0) {
            listEl.innerHTML = '<div class="no-leaderboard">Henüz skor yok. İlk skoru sen kaydet!</div>';
        } else {
            listEl.innerHTML = leaderboard
                .sort((a, b) => b.score - a.score)
                .slice(0, 10)
                .map((entry, index) => `
                    <div class="leaderboard-item">
                        <span class="rank">#${index + 1}</span>
                        <span class="score">${this.formatNumber(entry.score)}</span>
                        <span class="date">${new Date(entry.date).toLocaleDateString('tr-TR')}</span>
                    </div>
                `).join('');
        }
    }

    addToLeaderboard(score) {
        const leaderboard = StorageManager.get('leaderboard', []);
        leaderboard.push({
            score: score,
            date: Date.now()
        });
        StorageManager.set('leaderboard', leaderboard);
    }

    shareScore() {
        const stats = this.stats.getStats();
        const text = `Math Puzzle oyununda ${this.formatNumber(this.totalScore)} puan kazandım! 🎮\nEn yüksek skorum: ${this.formatNumber(stats.highScore)}`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Math Puzzle Skorum',
                text: text
            });
        } else {
            // Fallback: kopyala
            navigator.clipboard.writeText(text).then(() => {
                alert('Skor panoya kopyalandı!');
            });
        }
    }

    restart() {
        clearInterval(this.gameInterval);
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        if (this.freezeTimer) {
            clearTimeout(this.freezeTimer);
            this.freezeTimer = null;
        }
        this.startGame();
    }

    loadStats() {
        this.updateHighScoreDisplay();
    }

    vibrate(pattern) {
        if (!this.hapticEnabled || !navigator.vibrate) return;
        
        if (typeof pattern === 'number') {
            navigator.vibrate(pattern);
        } else {
            navigator.vibrate(pattern);
        }
    }

    playMatchSound() {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            console.log('Audio context error:', e);
        }
    }

    playGameOverSound() {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 400;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Audio context error:', e);
        }
    }

    playCountdownSound() {
        if (!this.soundEnabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            console.log('Audio context error:', e);
        }
    }

    playSpecialNumberEffect(number) {
        const cell = document.querySelector(`[data-value="${number}"]`);
        if (cell) {
            cell.classList.add('special-number');
            setTimeout(() => cell.classList.remove('special-number'), 1000);
        }
    }

    screenShake() {
        const gameArea = document.getElementById('gameArea');
        if (gameArea) {
            gameArea.classList.add('screen-shake');
            setTimeout(() => {
                gameArea.classList.remove('screen-shake');
            }, 500);
        }
    }
}

// Service Worker kaydı ve güncelleme kontrolü
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js', {
            updateViaCache: 'none' // Her zaman network'ten kontrol et
        })
        .then(reg => {
            console.log('Service Worker registered:', reg.scope);
            
            // Güncelleme kontrolü
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                console.log('New Service Worker found, updating...');
                
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // Yeni versiyon hazır, kullanıcıya bildir
                        console.log('New version available! Reloading...');
                        // Otomatik yenileme (opsiyonel)
                        window.location.reload();
                    }
                });
            });
            
            // Periyodik güncelleme kontrolü (her 60 saniyede bir)
            setInterval(() => {
                reg.update();
            }, 60000);
        })
        .catch(err => console.log('Service Worker registration failed:', err));
    });
    
    // Sayfa görünür olduğunda güncelleme kontrolü
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && 'serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then(reg => {
                if (reg) {
                    reg.update();
                }
            });
        }
    });
}

// Oyunu başlat
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new MathPuzzleGame();
});
