import "../styles/main.css";
import { calculateVelocity } from "../lib/velocity.js";
import { waveEnemies } from "../lib/constants.js";
//? Selecting Canvas and setting width and height
const canvas = document.querySelector("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
// window listeners
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
const bloonsHealth = [
  {
    health: 1,
    color: "red",
  },
  {
    health: 2,
    color: "blue",
    childs: {
      red: 1,
    },
  },
  {
    health: 3,
    color: "green",
    childs: {
      blue: 1,
    },
  },
  {
    health: 6,
    color: "pink",
    childs: {
      green: 1,
    },
  },
];
const bloonHealth = {
  red: 1,
  blue: 2,
  green: 3,
  rainbow: 6,
};
const c = canvas.getContext("2d");
const scoreEl = document.getElementById("scoreEl");
const overlay = document.getElementById("overlay");
overlay.style.display = "none";
const highestEl = document.getElementById("highestEl");
const healthEl = document.getElementById("healthEl");
const startGameBtn = document.getElementById("startGameBtn");
const startWaveBtn = document.getElementById("startWaveBtn");
const selectHeroBtn = document.getElementById("selectHeroBtn");
const modelEl = document.getElementById("modelEl");
const trackPoints = [
  { x: canvas.width / 2, y: canvas.height / 4 },
  { x: canvas.width / 1.5, y: canvas.height / 2 },
  { x: canvas.width / 4, y: canvas.height / 1.5 },
];

let x = canvas.width / 2;
let y = canvas.height / 2;
let player;
let playerDmg = 1;
let hero;
let health = 10;
let heroSelect = false;
let mouseX = null;
let mouseY = null;
let enemySpawnX = canvas.width / 1.5;
let enemySpawnY = 0;
let projectiles = [];
let buildAreas = [];
let enemies = [];
let myKeys = [];
let enemiesToSpawn = 0;
let totalEnemies = 0;
let currentWave = 0;
let score = 0;
let highest = localStorage.getItem("highest") || 0;
let animationId;
let spawnEnemiesInterval;
let spawnProjectilesInterval;
let projectileSpawnTime = 300;
let spawnTime = 300;

highestEl.innerHTML = highest;
healthEl.innerHTML = health;

// Starting Ball Class
//todo - add stuff to properties like fire damage, explosive, whatever then compare when projectiles hit
class Ball {
  constructor(x, y, radius, color) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speedX = 0;
    this.speedY = 0;
    this.properties = {};
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

// todo - rename and add constructor params for color, health, speed other properties etc
// Shooter Ball for Moving Ball
class Shooter extends Ball {
  constructor(x, y, radius, color, velocity) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.trackPoint = 0;
    this.health = bloonHealth[color];
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

class BuildArea extends Ball {
  constructor(x, y, radius) {
    super(x, y, radius);
    this.color = "#6C9A8B";
  }
}
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
//? to set mouse position state. Passed to a canvas event listener for mousemove.
function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (heroSelect) {
    hero.x = e.clientX;
    hero.y = e.clientY;
    //todo - loop over the buildAreas
  }
}

//todo - rework  how scoring works in the game
function updateScore(times = 1) {
  score += 100 * times;
  scoreEl.innerHTML = score;
}
// Reinitializing Variables for Starting a New Game
function init() {
  player = new Ball(x, y, 10, "white");
  buildAreas.push(
    new BuildArea(trackPoints[0].x + 75 * 2, trackPoints[0].y, 75),
    new BuildArea(trackPoints[0].x, trackPoints[0].y + 75 * 2, 75),
    new BuildArea(trackPoints[0].x - 75, trackPoints[2].y + 75, 75)
  );
  projectiles = [];
  enemies = [];
  score = 0;
  spawnTime = 1000;
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

//? Spawns enemies at start of track
function spawnEnemies() {
  //? Spawn a enemy every spawnTime
  spawnEnemiesInterval = setTimeout(() => {
    const radius = 10;

    if (enemiesToSpawn > 0) {
      enemies.push(
        new Shooter(
          enemySpawnX,
          enemySpawnY,
          radius,
          waveEnemies[currentWave - 1].enemies[totalEnemies - 1],
          calculateVelocity(
            enemySpawnX,
            enemySpawnY,
            trackPoints[0].x,
            trackPoints[0].y
          )
        )
      );
      enemiesToSpawn--;
      console.log(enemiesToSpawn);
    } else {
      console.log("still running");
    }
    spawnEnemies();
  }, spawnTime);
}

//? Shooting projectiles from player to direction of mouse pos
function spawnProjectiles() {
  const dist = Math.hypot(mouseX - player.x, mouseY - player.y);
  let rand = getRandomArbitrary(0 - dist / 10, 0 + dist / 10);
  spawnProjectilesInterval = setTimeout(() => {
    let x = player.x;
    let y = player.y;
    let v = calculateVelocity(player.x, player.y, mouseX + rand, mouseY + rand);
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Shooter(x, y, 5, "rgba(150,150,150,1)", v));
    spawnProjectiles();
  }, projectileSpawnTime);
}

//? Recursive animate func
function animate() {
  healthEl.innerHTML = health;
  animationId = requestAnimationFrame(animate);
  c.fillStyle = "rgba(80,12,12,1)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  //? test line
  c.lineWidth = 35;
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(enemySpawnX, enemySpawnY);
  c.lineTo(trackPoints[0].x, trackPoints[0].y);
  c.lineTo(trackPoints[1].x, trackPoints[1].y);
  c.lineTo(trackPoints[2].x, trackPoints[2].y);

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

  if (hero) {
    hero.draw();
  }
  buildAreas.forEach((area, index) => {
    area.draw();
  });

  //TODO - convert player & hero to towers array and loop over them

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
      let dmg = bloonHealth[enemy.color];
      health -= dmg;
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
    }

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //? When Projectiles touch Enemy
      if (dist - enemy.radius - projectile.radius < 0) {
        let allColors = Object.keys(bloonHealth);

        if (enemy.health - playerDmg > 0) {
          updateScore();
          enemy.health -= playerDmg;
          enemy.color = allColors[enemy.health - 1];
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //handle enemy kill
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

//? Start New Game
function startGame() {
  x = canvas.width / 2;
  y = canvas.height / 2;
  canvas.addEventListener("mousemove", handleMouseMove);
  init();
  animate();
  clearInterval(spawnProjectilesInterval);

  modelEl.style.display = "none";
  overlay.style.display = "flex";
}

//? Start Wave
function startWave() {
  //? return so that this code cannot be ran when there are still current enemies
  if (enemies.length > 0) {
    return;
  }

  //? increment currentWave state and reset enemy spawn interval
  currentWave++;
  clearInterval(spawnEnemiesInterval);
  clearInterval(spawnProjectilesInterval);
  totalEnemies = waveEnemies[currentWave - 1].enemies.length;
  enemiesToSpawn = waveEnemies[currentWave - 1].enemies.length;
  spawnEnemies();
  spawnProjectiles();
}

//todo - use for towerSelected when adding towers
function heroSelected() {
  if (hero) {
    return;
  }
  heroSelect = true;
  hero = new Ball(mouseX, mouseY, 10, "white");
  canvas.addEventListener("click", heroPlaced);
}
function heroPlaced(e) {
  hero.x = e.clientX;
  hero.y = e.clientY;
  heroSelect = false;

  canvas.removeEventListener("click", heroPlaced);
}

//? Start Game Button
startGameBtn.addEventListener("click", startGame);
startWaveBtn.addEventListener("click", startWave);
selectHeroBtn.addEventListener("click", heroSelected);
