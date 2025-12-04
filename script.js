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
        this.initColors();
        this.init();
    }

    initColors() {
        // İlk 20 sayı için benzersiz renkler
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
        
        // Yeni sayılar için dinamik renk üret
        const hue = (num * 137.508) % 360; // Golden angle approximation
        const saturation = 60 + (num % 20);
        const lightness = 45 + (num % 15);
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        this.numberColors.set(num, color);
        return color;
    }

    init() {
        this.createBoard();
        this.setupEventListeners();
        this.startGame();
    }

    createBoard() {
        const gameBoard = document.getElementById('gameBoard');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell empty';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.handleCellClick(i));
            gameBoard.appendChild(cell);
        }
    }

    setupEventListeners() {
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
        document.getElementById('restartBtnPause').addEventListener('click', () => this.restart());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('resumeBtn').addEventListener('click', () => this.togglePause());
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
        this.updateDisplay();
        this.hideGameOver();
        this.hidePause();
        
        // İlk sayıyı ekle
        this.addRandomNumber();
        
        // Her 1.3 saniyede bir yeni sayı ekle
        this.gameInterval = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.addRandomNumber();
            }
        }, 1300);
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
        
        // Yeni sayı animasyonu
        const cell = document.querySelector(`[data-index="${randomIndex}"]`);
        cell.classList.add('new-number');
        setTimeout(() => cell.classList.remove('new-number'), 400);
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
            // Seçimi kaldır
            this.selectedCells = this.selectedCells.filter(i => i !== index);
            cell.classList.remove('selected');
        } else {
            if (this.selectedCells.length === 0) {
                // İlk seçim
                this.selectedCells.push(index);
                cell.classList.add('selected');
            } else if (this.selectedCells.length === 1) {
                // İkinci seçim - eşleştirme kontrolü
                const firstIndex = this.selectedCells[0];
                const firstValue = this.board[firstIndex];
                const secondValue = this.board[index];
                
                if (firstValue === secondValue || 
                    (firstValue === 'bonus' && secondValue !== 0 && secondValue !== 'bonus') ||
                    (secondValue === 'bonus' && firstValue !== 0 && firstValue !== 'bonus')) {
                    this.matchCells(firstIndex, index);
                } else {
                    // Eşleşmedi, seçimi sıfırla
                    document.querySelector(`[data-index="${firstIndex}"]`).classList.remove('selected');
                    this.selectedCells = [index];
                    cell.classList.add('selected');
                }
            }
        }
    }

    matchCells(index1, index2) {
        const value1 = this.board[index1];
        const value2 = this.board[index2];
        
        let newValue;
        let bonusUsed = false;
        
        if (value1 === 'bonus' && value2 !== 'bonus' && value2 !== 0) {
            newValue = this.maxNumber;
            bonusUsed = true;
        } else if (value2 === 'bonus' && value1 !== 'bonus' && value1 !== 0) {
            newValue = this.maxNumber;
            bonusUsed = true;
        } else {
            newValue = value1 + value2;
        }
        
        this.board[index1] = newValue;
        this.board[index2] = 0;
        this.maxNumber = Math.max(this.maxNumber, newValue);
        
        // Puan hesaplama
        let matchScore = 5;
        this.comboCount++;
        
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        this.comboTimer = setTimeout(() => {
            this.comboCount = 0;
        }, 2000);
        
        if (this.comboCount >= 2) {
            matchScore *= this.comboCount;
            this.showCombo(this.comboCount);
        }
        
        this.totalScore += matchScore;
        this.playMatchSound();
        
        // Animasyonlar
        const cell1 = document.querySelector(`[data-index="${index1}"]`);
        const cell2 = document.querySelector(`[data-index="${index2}"]`);
        
        cell1.classList.add('merged');
        setTimeout(() => cell1.classList.remove('merged'), 500);
        
        this.selectedCells = [];
        cell1.classList.remove('selected');
        cell2.classList.remove('selected');
        
        this.updateDisplay();
        this.updateCell(index1);
        this.updateCell(index2);
        
        // Oyun sonu kontrolü
        const emptyCells = this.board.filter(val => val === 0);
        if (emptyCells.length === 0) {
            setTimeout(() => this.endGame(), 500);
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
                cell.textContent = this.formatNumber(value);
                cell.dataset.value = value;
                cell.style.backgroundColor = this.getColorForNumber(value);
            }
        }
    }

    updateDisplay() {
        document.getElementById('totalScore').textContent = this.formatNumber(this.totalScore);
        
        for (let i = 0; i < 16; i++) {
            this.updateCell(i);
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            clearInterval(this.gameInterval);
            this.showPause();
        } else {
            this.gameInterval = setInterval(() => {
                if (!this.isPaused && !this.isGameOver) {
                    this.addRandomNumber();
                }
            }, 1300);
            this.hidePause();
        }
    }

    endGame() {
        this.isGameOver = true;
        clearInterval(this.gameInterval);
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        this.playGameOverSound();
        this.showGameOver();
    }

    showGameOver() {
        document.getElementById('finalScore').textContent = this.formatNumber(this.totalScore);
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

    restart() {
        clearInterval(this.gameInterval);
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        this.startGame();
    }

    playMatchSound() {
        // Basit bir beep sesi (Web Audio API ile)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }

    playGameOverSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 400;
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

// Service Worker kaydı
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}

// Oyunu başlat
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new MathPuzzleGame();
});

