// Selecting Canvas
const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

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
const friction = 0.98;
let x = canvas.width / 2;
let y = canvas.height / 2;
let mouseX = null;
let mouseY = null;
let enemySpawnX = null;
let enemySpawnY = null;
let projectiles = [];
let enemies = [];
let myKeys = [];
let currentEnemies = 0;
let currentWave = 1;
let score = 0;
let highest = localStorage.getItem("highest") || 0;
let animationId;
let spanEnemiesInterval;
let spanProjectilesInterval;
let projectileSpawnTime = 500;
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

// Animation
function animate() {
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(80,12,12,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.beginPath();
  c.moveTo(canvas.width / 2, 0);
  c.lineTo(canvas.width / 2, canvas.height / 2);
  c.lineWidth = 15;
  c.stroke();

  player.speedX = 0;
  player.speedY = 0;

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

    // Calculate distance between player(player.x, player.y) and enemy(enemy.x, enemy.y) using Math.hypot(perpendicular, base) which gives hypotenuse / distance between them
    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // Checking if player and enemy is collided
    if (dist - enemy.radius - player.radius < 1) {
      stopGame();
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

function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;
}

// Shoot Enemy
function shootEnemy(e) {
  let x = player.x;
  y = player.y;
  v = calculateVelocity(x, y, e.clientX, e.clientY);
  v.x *= 5.5;
  v.y *= 5.5;

  projectiles.push(new Shooter(x, y, 5, "white", v));
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
  clearInterval(spanEnemiesInterval);
  clearInterval(spanProjectilesInterval);
  cancelAnimationFrame(animationId); // Exit Animation
  canvas.removeEventListener("mousemove", handleMouseMove);
  canvas.removeEventListener("click", shootEnemy); // Stop Shooting
  modelEl.style.display = "flex"; // Dialogue box
  overlay.style.display = "none"; // score and highest
  if (score > highest) {
    highest = score;
    localStorage.setItem("highest", highest);
  }
  scoreEl.innerHTML = score;
}

// todo - SPAWNING ENEMIES -
// todo - I need to spawn them at the same x+y and have them move down +5 then left -5 and so on, to imitate a bloons track I guess..
// todo - could optionally create a random mode, where exits and spawns are random on the edges of the canvas. Static maps also

// Spawning Random Enemies
function spanEnemies() {
  // Spawn a enemy every second
  spanEnemiesInterval = setTimeout(() => {
    let x, y;
    const radius = 6;
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius;
      y = Math.random() * canvas.height;
    } else {
      x = Math.random() * canvas.width;
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius;
    }
    const color = `hsl(${Math.floor(Math.random() * 360)}, 50%, 50%)`;

    if (currentEnemies > 0) {
      currentEnemies--;
      enemies.push(new Shooter(x, y, radius, color, calculateVelocity(x, y)));
    }

    console.log(currentEnemies);
    spanEnemies();
  }, spawnTime);
}
function spanProjectiles() {
  spanProjectilesInterval = setTimeout(() => {
    let x = player.x;
    y = player.y;
    v = calculateVelocity(x, y, mouseX, mouseY);
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Shooter(x, y, 12, "white", v));
    spanProjectiles();
  }, projectileSpawnTime);
}
// Start New Game
function startGame() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  canvas.addEventListener("mousemove", handleMouseMove);
  init();
  animate();
  clearInterval(spanProjectilesInterval);
  //todo - move spanProjectiles to startWave
  spanProjectiles();
  console.log("tick");
  modelEl.style.display = "none";
  overlay.style.display = "flex";
}

// Start Wave
function startWave() {
  //? Spawn enemies at enemyY/X var.
  //? Start a timeout
  if (currentEnemies > 0) {
    return;
  }
  currentWave++;
  clearInterval(spanEnemiesInterval);
  currentEnemies = 5;

  spanEnemies();
}

// Start Game Button
startGameBtn.addEventListener("click", startGame);
startWaveBtn.addEventListener("click", startWave);
