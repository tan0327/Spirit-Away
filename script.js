const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = new Image();
img.src = "https://raw.githubusercontent.com/tan0327/tesing123/main/JavaScript%20Fly%20Ghost.png";

// general settings
let gamePlaying = false;
const gravity = 0.5;
const speed = 5;
const size = [51, 36];
const jump = -11.5;
const cTenth = canvas.width / 10;

// Time tracking variables for Fixed Time Step
let lastTime = 0; // To store the timestamp of the previous frame
const gameSpeed = 60; // Target update rate (e.g., 60 updates per second)
const timeStep = 1000 / gameSpeed; // Milliseconds per update (approx 16.67ms)
let accumulator = 0; // To track time that needs to be processed

let index = 0,
  bestScore = 0,
  flight,
  flyHeight,
  currentScore,
  pipes;

// pipe settings
const pipeWidth = 78;
const pipeGap = 270;

const pipeLoc = () => Math.random() * (canvas.height - (pipeGap + pipeWidth)) + pipeWidth;

const setup = () => {
  // FIX: Reset time tracking variables on game restart to prevent stalls
  lastTime = 0; 
  accumulator = 0;
  
  currentScore = 0;
  flight = jump;
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
};

// Define render function with Fixed Time Step logic
const render = (timestamp) => { 
  // 1. Calculate Delta Time
  if (lastTime === 0) lastTime = timestamp;
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += deltaTime;

  // 2. Fixed Time Step Loop (Game Logic Updates)
  // This loop ensures game logic runs a fixed number of times per second (e.g., 60),
  // making the game speed consistent across all devices.
  while (accumulator >= timeStep) {
    // --- START OF GAME LOGIC UPDATE ---

    index++; // Used for animation frames and background scroll speed

    // pipe display (Movement and Collision)
    if (gamePlaying) {
      pipes.map(pipe => {
        // Horizontal Movement
        pipe[0] -= speed;

        // give 1 point & create new pipe
        if (pipe[0] <= -pipeWidth) {
          currentScore++;
          bestScore = Math.max(bestScore, currentScore);

          pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
        }

        // if hit the pipe, end (Collision Check)
        if ([pipe[0] <= cTenth + size[0], pipe[0] + pipeWidth >= cTenth, pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]].every(elem => elem)) {
          gamePlaying = false;
          setup();
        }
      });
    }

    // draw bird logic (Gravity and Vertical Movement)
    if (gamePlaying) {
      flight += gravity;
      flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
    }
    
    // --- END OF GAME LOGIC UPDATE ---
    accumulator -= timeStep;
  }

  // 3. Drawing/Rendering (runs at max FPS, using positions calculated in the loop)

  // background first part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
  // background second part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

  // pipe drawing
  if (gamePlaying) {
    pipes.map(pipe => {
      // top pipe
      ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);
    });
  }

  // draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
  } else {
    // Draw in center when game is not playing
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);

    // text accueil
    ctx.font = "bold 40px 'ZCOOL QingKe HuangYou', courier";
    ctx.fillStyle = "white";
    ctx.fillText(`Best score : ${bestScore}`, 125, 245);
    ctx.fillText('Click to play', 125, 535);
  }

  document.getElementById('bestScore').innerHTML = `Best : ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `Current : ${currentScore}`;

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
};

// launch setup
setup();

// 在图片加载完成后调用 render 函数
img.onload = render;

// start game (handles mouse click)
document.addEventListener('click', () => {
  gamePlaying = true;
  flight = jump;
  playJumpSound();
});

// window.onclick is generally redundant if click listener is present, 
// but keeping it if it targets a specific area:
window.onclick = () => flight = jump;

let isJumping = false; // Note: This variable is currently unused in the updated logic

// handles touch input
document.addEventListener('touchstart', () => {
  if (!isJumping) {
    gamePlaying = true;
    flight = jump;
    // isJumping = true; // Kept commented as its reset logic is complex and not fully implemented
    playJumpSound();
  }
});

function playJumpSound() {
  const jumpSound = document.getElementById('jump-sound');
  jumpSound.currentTime = 0; // Reset sound position to allow rapid jumps
  jumpSound.play();
}
