// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLANE_WIDTH = 80;
const PLANE_HEIGHT = 40;
const ITEM_SIZE = 30;
const CLOUD_SIZE = 60;
const MAX_SCORE = 100;

// Game state
let gameStarted = false;
let gameOver = false;
let score = 0;
let planeX = GAME_WIDTH / 2;
let planeY = GAME_HEIGHT / 2;
let planeSpeed = 8; // Increased speed
let items = [];
let clouds = [];
let lastItemSpawn = 0;
let lastCloudSpawn = 0;

// Sound effects
const sounds = {
    collect: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'),
    crash: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.mp3'),
    victory: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
};

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Touch controls
let touchStartX = 0;
let isDragging = false;

// Game screens
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameCanvas').parentElement;
const endScreen1 = document.getElementById('endScreen1');
const endScreen2 = document.getElementById('endScreen2');
const scoreElement = document.querySelector('.score');
const finalScoreElement = document.getElementById('finalScore');

// Add key state tracking
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    ArrowUp: false,
    ArrowDown: false
};

// Event listeners
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('showGiftButton').addEventListener('click', showGiftScreen);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
document.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});
document.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
    }
});

// Game loop
function gameLoop() {
    if (!gameStarted || gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Update plane position based on key states
    if (keys.ArrowLeft) {
        planeX = Math.max(PLANE_WIDTH/2, planeX - planeSpeed);
    }
    if (keys.ArrowRight) {
        planeX = Math.min(GAME_WIDTH - PLANE_WIDTH/2, planeX + planeSpeed);
    }
    if (keys.ArrowUp) {
        planeY = Math.max(PLANE_HEIGHT/2, planeY - planeSpeed);
    }
    if (keys.ArrowDown) {
        planeY = Math.min(GAME_HEIGHT - PLANE_HEIGHT/2, planeY + planeSpeed);
    }

    // Draw background
    drawBackground();

    // Update and draw plane
    updatePlane();
    drawPlane();

    // Update and draw items
    updateItems();
    drawItems();

    // Update and draw clouds
    updateClouds();
    drawClouds();

    // Check collisions
    checkCollisions();

    // Spawn new items and clouds
    spawnItems();
    spawnClouds();

    // Update score display
    scoreElement.textContent = `Score: ${score}`;

    // Check win condition
    if (score >= MAX_SCORE) {
        endGame(true);
    }

    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#1E90FF'); // Deeper blue at top
    gradient.addColorStop(0.5, '#87CEEB'); // Sky blue in middle
    gradient.addColorStop(1, '#E0F7FA'); // Light blue at bottom
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw sun
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(GAME_WIDTH - 100, 100, 40, 0, Math.PI * 2);
    ctx.fill();

    // Draw sun rays
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(GAME_WIDTH - 100 + Math.cos(angle) * 40, 100 + Math.sin(angle) * 40);
        ctx.lineTo(GAME_WIDTH - 100 + Math.cos(angle) * 60, 100 + Math.sin(angle) * 60);
        ctx.stroke();
    }

    // Draw distant mountains
    ctx.fillStyle = '#2E8B57';
    ctx.beginPath();
    ctx.moveTo(0, GAME_HEIGHT);
    ctx.lineTo(GAME_WIDTH * 0.2, GAME_HEIGHT * 0.7);
    ctx.lineTo(GAME_WIDTH * 0.4, GAME_HEIGHT * 0.8);
    ctx.lineTo(GAME_WIDTH * 0.6, GAME_HEIGHT * 0.6);
    ctx.lineTo(GAME_WIDTH * 0.8, GAME_HEIGHT * 0.9);
    ctx.lineTo(GAME_WIDTH, GAME_HEIGHT);
    ctx.fill();
}

function updatePlane() {
    // Add slight floating animation
    planeY += Math.sin(Date.now() / 500) * 0.5;
}

function drawPlane() {
    // Draw plane shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(planeX, planeY + 20, PLANE_WIDTH/2, PLANE_HEIGHT/4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw main plane body (flipped to face right)
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/2, planeY);
    ctx.lineTo(planeX - PLANE_WIDTH/2, planeY - PLANE_HEIGHT/2);
    ctx.lineTo(planeX - PLANE_WIDTH/2, planeY + PLANE_HEIGHT/2);
    ctx.lineTo(planeX + PLANE_WIDTH/2, planeY);
    ctx.fill();

    // Draw cockpit window
    ctx.fillStyle = '#87CEEB';
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4, planeY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw pilot's head
    ctx.fillStyle = '#FFE4B5'; // White skin tone
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4, planeY - 5, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw pilot's blonde hair
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4, planeY - 15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/4 - 15, planeY - 15);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 15, planeY - 15);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 15, planeY - 5);
    ctx.lineTo(planeX + PLANE_WIDTH/4 - 15, planeY - 5);
    ctx.fill();

    // Draw pilot's face
    ctx.fillStyle = '#FFE4B5';
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4, planeY - 5, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw pilot's eyes
    ctx.fillStyle = '#87CEEB'; // Blue eyes
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4 - 4, planeY - 7, 2, 0, Math.PI * 2);
    ctx.arc(planeX + PLANE_WIDTH/4 + 4, planeY - 7, 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw pilot's mouth (smile)
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4, planeY - 2, 3, 0, Math.PI);
    ctx.stroke();

    // Draw pilot's body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/4 - 8, planeY + 5);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 8, planeY + 5);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 8, planeY + 20);
    ctx.lineTo(planeX + PLANE_WIDTH/4 - 8, planeY + 20);
    ctx.closePath();
    ctx.fill();

    // Draw pilot's arms
    ctx.fillStyle = '#FFE4B5';
    // Left arm
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/4 - 8, planeY + 10);
    ctx.lineTo(planeX + PLANE_WIDTH/4 - 15, planeY + 15);
    ctx.lineTo(planeX + PLANE_WIDTH/4 - 12, planeY + 20);
    ctx.closePath();
    ctx.fill();
    // Right arm
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/4 + 8, planeY + 10);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 15, planeY + 15);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 12, planeY + 20);
    ctx.closePath();
    ctx.fill();

    // Draw pilot's legs
    ctx.fillStyle = '#4682B4'; // Pilot pants
    // Left leg
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/4 - 4, planeY + 20);
    ctx.lineTo(planeX + PLANE_WIDTH/4 - 4, planeY + 30);
    ctx.lineTo(planeX + PLANE_WIDTH/4 - 8, planeY + 30);
    ctx.closePath();
    ctx.fill();
    // Right leg
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/4 + 4, planeY + 20);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 4, planeY + 30);
    ctx.lineTo(planeX + PLANE_WIDTH/4 + 8, planeY + 30);
    ctx.closePath();
    ctx.fill();

    // Draw pilot's hat
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.arc(planeX + PLANE_WIDTH/4, planeY - 15, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(planeX + PLANE_WIDTH/4 - 8, planeY - 15, 16, 5);

    // Draw plane wings
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.moveTo(planeX + PLANE_WIDTH/2, planeY);
    ctx.lineTo(planeX + PLANE_WIDTH/2 + 20, planeY);
    ctx.lineTo(planeX + PLANE_WIDTH/2 + 10, planeY + 10);
    ctx.lineTo(planeX + PLANE_WIDTH/2, planeY + 10);
    ctx.closePath();
    ctx.fill();

    // Draw plane tail
    ctx.fillStyle = '#4682B4';
    ctx.beginPath();
    ctx.moveTo(planeX - PLANE_WIDTH/2, planeY);
    ctx.lineTo(planeX - PLANE_WIDTH/2 - 15, planeY - 10);
    ctx.lineTo(planeX - PLANE_WIDTH/2 - 15, planeY + 10);
    ctx.closePath();
    ctx.fill();

    // Draw pilot name in top right corner
    ctx.fillStyle = '#4682B4';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('Pilot: Thomas Hughes', GAME_WIDTH - 20, 20);
}

function updateItems() {
    items = items.filter(item => {
        item.x -= item.speed;
        return item.x > -ITEM_SIZE;
    });
}

function drawItems() {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    items.forEach(item => {
        ctx.fillText(item.type === 'heart' ? '💖' : '🎁', item.x, item.y);
    });
}

function updateClouds() {
    clouds = clouds.filter(cloud => {
        cloud.x -= cloud.speed;
        return cloud.x > -CLOUD_SIZE;
    });
}

function drawClouds() {
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    clouds.forEach(cloud => {
        ctx.fillText('☁️', cloud.x, cloud.y);
    });
}

function checkCollisions() {
    // Check item collisions
    items.forEach((item, index) => {
        if (isColliding(planeX, planeY, PLANE_WIDTH/2, item.x, item.y, ITEM_SIZE/2)) {
            items.splice(index, 1);
            // Update score based on item type
            if (item.type === 'heart') {
                score += 5; // Hearts worth 5 points
            } else {
                score += 1; // Gifts worth 1 point
            }
            sounds.collect.currentTime = 0;
            sounds.collect.play();
            
            // Show floating score
            showFloatingScore(item.x, item.y, item.type === 'heart' ? '+5' : '+1');
        }
    });

    // Check cloud collisions
    clouds.forEach((cloud, index) => {
        if (isColliding(planeX, planeY, PLANE_WIDTH/2, cloud.x, cloud.y, CLOUD_SIZE/2)) {
            clouds.splice(index, 1);
            score = Math.max(0, score - 1); // Clouds subtract 1 point
            sounds.crash.currentTime = 0;
            sounds.crash.play();
            
            // Show floating score
            showFloatingScore(cloud.x, cloud.y, '-1');
        }
    });
}

function isColliding(x1, y1, r1, x2, y2, r2) {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
}

function spawnItems() {
    const now = Date.now();
    if (now - lastItemSpawn > 1000) {
        const type = Math.random() > 0.5 ? 'heart' : 'gift';
        items.push({
            x: GAME_WIDTH + ITEM_SIZE,
            y: Math.random() * (GAME_HEIGHT - ITEM_SIZE),
            speed: 2 + Math.random() * 2,
            type
        });
        lastItemSpawn = now;
    }
}

function spawnClouds() {
    const now = Date.now();
    if (now - lastCloudSpawn > 2000) {
        clouds.push({
            x: GAME_WIDTH + CLOUD_SIZE,
            y: Math.random() * (GAME_HEIGHT - CLOUD_SIZE),
            speed: 1 + Math.random()
        });
        lastCloudSpawn = now;
    }
}

function startGame() {
    gameStarted = true;
    gameOver = false;
    score = 0;
    planeX = GAME_WIDTH / 2;
    planeY = GAME_HEIGHT / 2;
    items = [];
    clouds = [];
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    gameLoop();
}

function endGame(isWin) {
    gameOver = true;
    gameScreen.classList.add('hidden');
    endScreen1.classList.remove('hidden');
    
    if (isWin) {
        sounds.victory.currentTime = 0;
        sounds.victory.play();
        // Reset game state
        gameStarted = false;
        score = 0;
        items = [];
        clouds = [];
    }
}

function showGiftScreen() {
    endScreen1.classList.add('hidden');
    endScreen2.classList.remove('hidden');
    
    // Add character animations
    const pilotCharacter = document.querySelector('.pilot-character');
    const girlCharacter = document.querySelector('.girl-character');
    
    pilotCharacter.style.animation = 'moveToCenter 1s forwards';
    girlCharacter.style.animation = 'moveToCenter 1s forwards';
    
    // Add hugging animation
    setTimeout(() => {
        pilotCharacter.style.animation = 'hug 2s infinite';
        girlCharacter.style.animation = 'hug 2s infinite';
    }, 1000);
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
}

function handleTouchMove(e) {
    if (!isDragging) return;
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    planeX = Math.max(PLANE_WIDTH/2, Math.min(GAME_WIDTH - PLANE_WIDTH/2, planeX + deltaX * 1.5)); // Increased sensitivity
    touchStartX = touchX;
}

function handleTouchEnd() {
    isDragging = false;
}

// Start the game when the page loads
window.onload = function() {
    startScreen.classList.remove('hidden');
};

// Add floating score animation
function showFloatingScore(x, y, points) {
    const floatingScore = document.createElement('div');
    floatingScore.textContent = points;
    floatingScore.style.position = 'absolute';
    floatingScore.style.left = `${x}px`;
    floatingScore.style.top = `${y}px`;
    floatingScore.style.color = points.startsWith('+') ? '#FF69B4' : '#FF0000';
    floatingScore.style.fontSize = '24px';
    floatingScore.style.fontWeight = 'bold';
    floatingScore.style.pointerEvents = 'none';
    floatingScore.style.transition = 'all 1s ease-out';
    floatingScore.style.opacity = '1';
    floatingScore.style.transform = 'translateY(0)';
    
    document.body.appendChild(floatingScore);
    
    // Animate the score
    setTimeout(() => {
        floatingScore.style.opacity = '0';
        floatingScore.style.transform = 'translateY(-50px)';
    }, 0);
    
    // Remove the element after animation
    setTimeout(() => {
        document.body.removeChild(floatingScore);
    }, 1000);
}

// Add new keyframes for character animations
const style = document.createElement('style');
style.textContent = `
    @keyframes moveToCenter {
        0% { transform: translateX(0); }
        100% { transform: translateX(calc(50% - 75px)); }
    }
    
    @keyframes hug {
        0% { transform: translateX(calc(50% - 75px)) rotate(0deg); }
        25% { transform: translateX(calc(50% - 75px)) rotate(5deg); }
        50% { transform: translateX(calc(50% - 75px)) rotate(0deg); }
        75% { transform: translateX(calc(50% - 75px)) rotate(-5deg); }
        100% { transform: translateX(calc(50% - 75px)) rotate(0deg); }
    }
`;
document.head.appendChild(style); 