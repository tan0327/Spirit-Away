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
  currentScore = 0;
  flight = jump;
  flyHeight = (canvas.height / 2) - (size[1] / 2);

  pipes = Array(3).fill().map((a, i) => [canvas.width + (i * (pipeGap + pipeWidth)), pipeLoc()]);
};

// 定义 render 函数
const render = () => {
  index++;

  // background first part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -((index * (speed / 2)) % canvas.width) + canvas.width, 0, canvas.width, canvas.height);
  // background second part
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height, -(index * (speed / 2)) % canvas.width, 0, canvas.width, canvas.height);

  // pipe display
  if (gamePlaying) {
    pipes.map(pipe => {
      pipe[0] -= speed;

      // top pipe
      ctx.drawImage(img, 432, 588 - pipe[1], pipeWidth, pipe[1], pipe[0], 0, pipeWidth, pipe[1]);
      // bottom pipe
      ctx.drawImage(img, 432 + pipeWidth, 108, pipeWidth, canvas.height - pipe[1] + pipeGap, pipe[0], pipe[1] + pipeGap, pipeWidth, canvas.height - pipe[1] + pipeGap);

      // give 1 point & create new pipe
      if (pipe[0] <= -pipeWidth) {
        currentScore++;
        bestScore = Math.max(bestScore, currentScore);

        pipes = [...pipes.slice(1), [pipes[pipes.length - 1][0] + pipeGap + pipeWidth, pipeLoc()]];
      }

      // if hit the pipe, end
      if ([pipe[0] <= cTenth + size[0], pipe[0] + pipeWidth >= cTenth, pipe[1] > flyHeight || pipe[1] + pipeGap < flyHeight + size[1]].every(elem => elem)) {
        gamePlaying = false;
        setup();
      }
    });
  }

  // draw bird
  if (gamePlaying) {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, cTenth, flyHeight, ...size);
    flight += gravity;
    flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
  } else {
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);
    flyHeight = (canvas.height / 2) - (size[1] / 2);

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

// start game
document.addEventListener('click', () => gamePlaying = true);
window.onclick = () => flight = jump;

let isJumping = false;

document.addEventListener('touchstart', () => {
  if (!isJumping) {
    gamePlaying = true;
    flight = jump;
    isJumping = true;
  }
});

// 在小鸟降落后重置 isJumping 变量

document.addEventListener('click', () => {
  gamePlaying = true;
  flight = jump;
  playJumpSound();
});

window.onclick = () => flight = jump;

function playJumpSound() {
  const jumpSound = document.getElementById('jump-sound');
  jumpSound.play();
}
