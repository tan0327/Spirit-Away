// Add these variables near the top of script.js, after 'let index = 0, ...'
let lastTime = 0; // To store the timestamp of the previous frame
const gameSpeed = 60; // Target update rate (e.g., 60 updates per second)
const timeStep = 1000 / gameSpeed; // Milliseconds per update
let accumulator = 0; // To track time that needs to be processed

// 替换掉原来的 const render = () => { ... } 函数
const render = (timestamp) => { // render now accepts the timestamp from requestAnimationFrame
  // 1. Calculate Delta Time
  if (lastTime === 0) lastTime = timestamp; // Initialize on first call
  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;
  accumulator += deltaTime;

  // This ensures game logic updates only when enough time has passed, 
  // keeping the update rate constant regardless of FPS.
  while (accumulator >= timeStep) {
    // === START OF GAME LOGIC UPDATE (moved from the original render loop) ===

    index++; // Still increment index for animation/score display, but it's now tied to the timeStep

    // pipe display (Movement and Collision)
    if (gamePlaying) {
      pipes.map(pipe => {
        // SCALING MOVEMENT: speed is divided by the target gameSpeed (60)
        // and multiplied by the timeStep (which is 1000/60).
        // A simpler way for a constant step is to divide by the original speed factor.
        // Since we're using a fixed timeStep, we don't need the complex scaling here 
        // if we define the movement relative to a 60 FPS standard.
        // Using a fixed step ensures the logic runs the correct number of times.

        pipe[0] -= speed; // Movement is now part of the fixed time step update

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

    // draw bird logic (Gravity and Vertical Movement)
    if (gamePlaying) {
      // Gravity and movement update logic is now inside the time-stepped loop
      flight += gravity;
      flyHeight = Math.min(flyHeight + flight, canvas.height - size[1]);
    } else {
      flyHeight = (canvas.height / 2) - (size[1] / 2);
    }
    
    // === END OF GAME LOGIC UPDATE ===
    accumulator -= timeStep;
  }

  // === START OF DRAWING (rendering only) ===

  // background first part (Visual only, still tied to index/speed for smooth scrolling)
  // Note: Background scroll speed might need adjustment now.
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
    ctx.drawImage(img, 432, Math.floor((index % 9) / 3) * size[1], ...size, ((canvas.width / 2) - size[0] / 2), flyHeight, ...size);

    // text accueil
    ctx.font = "bold 40px 'ZCOOL QingKe HuangYou', courier";
    ctx.fillStyle = "white";
    ctx.fillText(`Best score : ${bestScore}`, 125, 245);
    ctx.fillText('Click to play', 125, 535);
  }

  document.getElementById('bestScore').innerHTML = `Best : ${bestScore}`;
  document.getElementById('currentScore').innerHTML = `Current : ${currentScore}`;
  
  // === END OF DRAWING ===

  // tell the browser to perform anim
  window.requestAnimationFrame(render);
};