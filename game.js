// Selecting Canvas
const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
// window listeners
window.addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  stopGame();
});
window.addEventListener("keydown", function (e) {
  myKeys = myKeys || [];
  myKeys[e.code] = true;
});
window.addEventListener("keyup", function (e) {
  myKeys[e.code] = false;
});
// Variables & Constants

const c = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreEl");
const overlay = document.getElementById("overlay");
overlay.style.display = "none";
const highestEl = document.getElementById("highestEl");
const startGameBtn = document.getElementById("startGameBtn");
const startWaveBtn = document.getElementById("startWaveBtn");
const modelEl = document.getElementById("modelEl");
let x = canvas.width / 2;
let y = canvas.height / 2;
let mouseX = null;
let mouseY = null;
let enemySpawnX = canvas.width / 1.5;
let enemySpawnY = 0;
const trackPoints = [
  { x: canvas.width / 2, y: canvas.height / 2 },
  { x: canvas.width / 2, y: 30 },
  { x: canvas.width / 0.5, y: canvas.height / 0.25 },
];
const waveEnemies = [
  {
    spawnTime: 300,

    enemies: [
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
    ],
  },
  {
    spawnTime: 150,

    enemies: [
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
    ],
  },
  {
    spawnTime: 30,

    enemies: [
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "red",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
      "blue",
    ],
  },
];

let projectiles = [];
let enemies = [];
let myKeys = [];
let currentEnemies = 0;
let currentWave = 0;
let score = 0;
let highest = localStorage.getItem("highest") || 0;
let animationId;
let spawnEnemiesInterval;
let spawnProjectilesInterval;
let projectileSpawnTime = 800;
let spawnTime = 300;

highestEl.innerHTML = highest;

// Starting Ball Class

class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speedX = 0;
    this.speedY = 0;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false);
    c.fillStyle = this.color;
    c.fill();
  }
  newPos() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
}

// Shooter Ball for Moving Ball
class Shooter extends Ball {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.trackPoint = 0;
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}
function updateScore(times = 1) {
  score += 100 * times;
  scoreEl.innerHTML = score;
}
// TODO - This needs to be replaced/refactored for enemies following bloons track
// Calculate Velocity from center(x, y) to (x1,y1)
function calculateVelocity(
  x,
  y,
  x1 = canvas.width / 2,
  y1 = canvas.height / 2
) {
  const angle = Math.atan2(y1 - y, x1 - x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };

  return velocity;
}
//? to set mouse position state. Passed to a canvas event listener for mousemove.
function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

// Reinitializing Variables for Starting a New Game
function init() {
  player = new Ball(x, y, 10, "white");
  projectiles = [];
  enemies = [];
  score = 0;
  spawnTime = 1000;
  highestEl.innerHTML = score;
  scoreEl.innerHTML = score;
  highestEl.innerHTML = highest;
}

// Stop Game
function stopGame() {
  clearInterval(spawnEnemiesInterval);
  clearInterval(spawnProjectilesInterval);
  cancelAnimationFrame(animationId); // Exit Animation
  canvas.removeEventListener("mousemove", handleMouseMove);
  modelEl.style.display = "flex"; // Dialogue box
  overlay.style.display = "none"; // score and highest
  if (score > highest) {
    highest = score;
    localStorage.setItem("highest", highest);
  }
  scoreEl.innerHTML = score;
}

// Spawning Random Enemies
function spawnEnemies() {
  // Spawn a enemy every second
  spawnEnemiesInterval = setTimeout(() => {
    const radius = 10;

    if (currentEnemies > 0) {
      enemies.push(
        new Shooter(
          enemySpawnX,
          enemySpawnY,
          radius,
          waveEnemies[currentWave - 1].enemies[currentEnemies - 1],
          calculateVelocity(
            enemySpawnX,
            enemySpawnY,
            trackPoints[0].x,
            trackPoints[0].y
          )
        )
      );
      currentEnemies--;
    }
    spawnEnemies();
  }, spawnTime);
}

//Spawning projectiles
function spawnProjectiles() {
  spawnProjectilesInterval = setTimeout(() => {
    let x = player.x;
    y = player.y;
    v = calculateVelocity(x, y, mouseX, mouseY);
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Shooter(x, y, 4, "white", v));
    spawnProjectiles();
  }, projectileSpawnTime);
}

// Animation
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(80,12,12,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  //? test line
  c.beginPath();
  c.moveTo(enemySpawnX, enemySpawnY);
  c.lineTo(trackPoints[0].x, trackPoints[0].y);
  c.lineTo(trackPoints[1].x, trackPoints[1].y);
  c.lineTo(trackPoints[2].x, trackPoints[2].y);

  c.lineWidth = 35;
  c.stroke();

  player.speedX = 0;
  player.speedY = 0;

  // Update player position after checking for keys inputted.
  if (myKeys && myKeys["KeyA"] && player.x > 0) {
    player.speedX = -3;
  }
  if (myKeys && myKeys["KeyD"] && player.x < canvas.width - player.radius) {
    player.speedX = 3;
  }
  if (myKeys && myKeys["KeyW"] && player.y > 0) {
    player.speedY = -3;
  }
  if (myKeys && myKeys["KeyS"] && player.y < canvas.height - player.radius) {
    player.speedY = 3;
  }
  player.draw();
  player.newPos();

  // Update and remove projectiles
  projectiles.forEach((projectile, index) => {
    projectile.update();
    if (
      projectile.x + projectile.radius < 1 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
  });

  // TODO - The collision of enemy/player is not needed anymore, it should be collision with end
  // Update & Destroy Enemies, Create Explosions & Increase Score
  enemies.forEach((enemy, index) => {
    enemy.update();

    const dist = Math.hypot(
      enemy.x - trackPoints[enemy.trackPoint].x,
      enemy.y - trackPoints[enemy.trackPoint].y
    );

    const endDist = Math.hypot(
      enemy.x - trackPoints[trackPoints.length - 1].x,

      enemy.y - trackPoints[trackPoints.length - 1].y
    );
    if (endDist - enemy.radius < 0) {
      console.log("end");
      enemy.radius = 0;
      enemies.splice(index, 1);
    }

    if (dist - enemy.radius < 0) {
      // calc dist from next track point
      enemy.velocity = calculateVelocity(
        trackPoints[enemy.trackPoint].x,
        trackPoints[enemy.trackPoint].y,
        trackPoints[enemy.trackPoint + 1].x,
        trackPoints[enemy.trackPoint + 1].y
      );
      enemy.trackPoint++;
      console.log("point reached" + enemy.trackPoint);
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      // When Projectiles touch Enemy
      if (dist - enemy.radius - projectile.radius < 0) {
        // todo - add playerDmg var and use here for "8"
        // todo - use enemy.color instead of radius for bloons idea.
        // Check if enemy is to be removed or not
        if (enemy.radius - 10 > 10) {
          updateScore();
          enemy.radius -= 8;
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          updateScore(2.5);
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}

// Start New Game
function startGame() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  canvas.addEventListener("mousemove", handleMouseMove);
  init();
  animate();
  clearInterval(spawnProjectilesInterval);
  spawnProjectiles();

  //todo - move spawnProjectiles to startWave
  //todo - add ability to place hero
  modelEl.style.display = "none";
  overlay.style.display = "flex";
}

// Start Wave
function startWave() {
  //? return so that this code cannot be ran when there are still current enemies
  if (currentEnemies > 0) {
    return;
  }
  //? increment currentWave state and rest enemy spawn interval
  currentWave++;
  clearInterval(spawnEnemiesInterval);
  currentEnemies = waveEnemies[currentWave - 1].enemies.length;
  console.log(currentEnemies);
  spawnEnemies();
}

// Start Game Button
startGameBtn.addEventListener("click", startGame);
startWaveBtn.addEventListener("click", startWave);
