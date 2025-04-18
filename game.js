// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLANE_WIDTH = 80;
const PLANE_HEIGHT = 40;
const ITEM_SIZE = 30;
const CLOUD_SIZE = 60;
const MAX_HEARTS = 10;

// Game state
let gameStarted = false;
let gameOver = false;
let score = 0;
let planeX = GAME_WIDTH / 2;
let planeY = GAME_HEIGHT / 2;
let planeSpeed = 5;
let items = [];
let clouds = [];
let lastItemSpawn = 0;
let lastCloudSpawn = 0;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// Touch controls
let touchStartX = 0;
let isDragging = false;

// Game screens
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('final-score');

// Event listeners
canvas.addEventListener('click', startGame);
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);
canvas.addEventListener('touchend', handleTouchEnd);
document.addEventListener('keydown', handleKeyDown);

// Game assets
const planeImg = new Image();
planeImg.src = 'assets/plane.png';
const heartImg = new Image();
heartImg.src = 'assets/heart.png';
const giftImg = new Image();
giftImg.src = 'assets/gift.png';
const cloudImg = new Image();
cloudImg.src = 'assets/cloud.png';

// Game loop
function gameLoop() {
    if (!gameStarted || gameOver) return;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

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

    // Update score
    scoreElement.textContent = `${score}/${MAX_HEARTS}`;

    // Check win condition
    if (score >= MAX_HEARTS) {
        endGame(true);
    }

    requestAnimationFrame(gameLoop);
}

function drawBackground() {
    // Draw sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

function updatePlane() {
    // Add slight floating animation
    planeY += Math.sin(Date.now() / 500) * 0.5;
}

function drawPlane() {
    ctx.drawImage(planeImg, planeX - PLANE_WIDTH/2, planeY - PLANE_HEIGHT/2, PLANE_WIDTH, PLANE_HEIGHT);
}

function updateItems() {
    items = items.filter(item => {
        item.x -= item.speed;
        return item.x > -ITEM_SIZE;
    });
}

function drawItems() {
    items.forEach(item => {
        ctx.drawImage(item.type === 'heart' ? heartImg : giftImg, item.x, item.y, ITEM_SIZE, ITEM_SIZE);
    });
}

function updateClouds() {
    clouds = clouds.filter(cloud => {
        cloud.x -= cloud.speed;
        return cloud.x > -CLOUD_SIZE;
    });
}

function drawClouds() {
    clouds.forEach(cloud => {
        ctx.drawImage(cloudImg, cloud.x, cloud.y, CLOUD_SIZE, CLOUD_SIZE);
    });
}

function checkCollisions() {
    // Check item collisions
    items.forEach((item, index) => {
        if (isColliding(planeX, planeY, PLANE_WIDTH/2, item.x, item.y, ITEM_SIZE/2)) {
            items.splice(index, 1);
            score++;
        }
    });

    // Check cloud collisions
    clouds.forEach((cloud, index) => {
        if (isColliding(planeX, planeY, PLANE_WIDTH/2, cloud.x, cloud.y, CLOUD_SIZE/2)) {
            clouds.splice(index, 1);
            score = Math.max(0, score - 1);
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
    if (!gameStarted) {
        gameStarted = true;
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameLoop();
    }
}

function endGame(isWin) {
    gameOver = true;
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
    finalScoreElement.textContent = `${score}/${MAX_HEARTS}`;
}

function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
    isDragging = true;
}

function handleTouchMove(e) {
    if (!isDragging) return;
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - touchStartX;
    planeX = Math.max(PLANE_WIDTH/2, Math.min(GAME_WIDTH - PLANE_WIDTH/2, planeX + deltaX));
    touchStartX = touchX;
}

function handleTouchEnd() {
    isDragging = false;
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') {
        planeX = Math.max(PLANE_WIDTH/2, planeX - planeSpeed);
    } else if (e.key === 'ArrowRight') {
        planeX = Math.min(GAME_WIDTH - PLANE_WIDTH/2, planeX + planeSpeed);
    }
}

// Preload assets
window.onload = function() {
    // Ensure all assets are loaded before starting
    const assets = [planeImg, heartImg, giftImg, cloudImg];
    let loadedAssets = 0;
    
    assets.forEach(img => {
        img.onload = () => {
            loadedAssets++;
            if (loadedAssets === assets.length) {
                startScreen.classList.remove('hidden');
            }
        };
    });
}; 