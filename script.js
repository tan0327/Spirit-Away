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
let lastTime = 0; 
const gameSpeed = 60; 
const timeStep = 1000 / gameSpeed; // approx 16.67ms
let accumulator = 0; 

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
  // FIX: Reset time tracking variables on game restart
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
  if (lastTime === 0 || timestamp === undefined) {
      lastTime = performance.now(); 
      timestamp = lastTime;
  }
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += deltaTime;

  // 2. Fixed Time Step Loop (Game Logic Updates)
  while (accumulator >= timeStep) {
    // --- START OF GAME LOGIC UPDATE ---

    index++;

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

  // 3. Drawing/Rendering (only draw if image loaded)
  if (img.complete) {
      // Clear canvas (implicit when drawing over entire area)
      
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
  } else {
      // Fallback text if the image is still loading
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 30px 'ZCOOL QingKe HuangYou', courier";
      ctx.fillStyle = "white";
      ctx.fillText('Loading Assets...', 125, canvas.height / 2);
  }

  document.getElementById('bestScore').innerHTML = `Best : ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `Current : ${currentScore}`;

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
};

// launch setup
setup();

// Start the render loop immediately, do not wait for img.onload
window.requestAnimationFrame(render);


// Input Handlers
document.addEventListener('click', () => {
  gamePlaying = true;
  flight = jump;
  playJumpSound();
});

window.onclick = () => flight = jump;

document.addEventListener('touchstart', () => {
  // Use a simple touch trigger since isJumping logic is complex to maintain
  gamePlaying = true;
  flight = jump;
  playJumpSound();
});

function playJumpSound() {
  const jumpSound = document.getElementById('jump-sound');
  jumpSound.currentTime = 0; 
  jumpSound.play();
}
