const fs = require('fs');
const { createCanvas } = require('canvas');

// Create assets directory if it doesn't exist
if (!fs.existsSync('assets')) {
    fs.mkdirSync('assets');
}

// Generate plane image
const planeCanvas = createCanvas(80, 40);
const planeCtx = planeCanvas.getContext('2d');
planeCtx.fillStyle = '#3498db';
planeCtx.beginPath();
planeCtx.moveTo(0, 20);
planeCtx.lineTo(60, 0);
planeCtx.lineTo(80, 20);
planeCtx.lineTo(60, 40);
planeCtx.closePath();
planeCtx.fill();
fs.writeFileSync('assets/plane.png', planeCanvas.toBuffer());

// Generate heart image
const heartCanvas = createCanvas(30, 30);
const heartCtx = heartCanvas.getContext('2d');
heartCtx.fillStyle = '#e74c3c';
heartCtx.beginPath();
heartCtx.moveTo(15, 5);
heartCtx.bezierCurveTo(15, 5, 25, 0, 25, 10);
heartCtx.bezierCurveTo(25, 20, 15, 25, 15, 25);
heartCtx.bezierCurveTo(15, 25, 5, 20, 5, 10);
heartCtx.bezierCurveTo(5, 0, 15, 5, 15, 5);
heartCtx.fill();
fs.writeFileSync('assets/heart.png', heartCanvas.toBuffer());

// Generate gift image
const giftCanvas = createCanvas(30, 30);
const giftCtx = giftCanvas.getContext('2d');
giftCtx.fillStyle = '#2ecc71';
giftCtx.fillRect(5, 5, 20, 20);
giftCtx.fillStyle = '#e74c3c';
giftCtx.fillRect(5, 5, 20, 5);
giftCtx.fillRect(10, 5, 5, 20);
fs.writeFileSync('assets/gift.png', giftCanvas.toBuffer());

// Generate cloud image
const cloudCanvas = createCanvas(60, 60);
const cloudCtx = cloudCanvas.getContext('2d');
cloudCtx.fillStyle = '#ffffff';
cloudCtx.beginPath();
cloudCtx.arc(15, 15, 15, 0, Math.PI * 2);
cloudCtx.arc(30, 15, 20, 0, Math.PI * 2);
cloudCtx.arc(45, 15, 15, 0, Math.PI * 2);
cloudCtx.arc(30, 30, 20, 0, Math.PI * 2);
cloudCtx.fill();
fs.writeFileSync('assets/cloud.png', cloudCanvas.toBuffer());

console.log('Assets generated successfully!'); 