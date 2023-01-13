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
const pointsEl = document.getElementById("pointsEl");
const overlay = document.getElementById("overlay");
overlay.style.display = "none";
const highestEl = document.getElementById("highestEl");
const healthEl = document.getElementById("healthEl");
const startGameBtn = document.getElementById("startGameBtn");
const startWaveBtn = document.getElementById("startWaveBtn");
const selectHeroBtn = document.getElementById("selectHeroBtn");
const introEl = document.getElementById("introEl");
const prepareGameEl = document.getElementById("prepareGameEl");
let trackPoints = [
  { x: canvas.width / 2, y: canvas.height / 4 },
  { x: canvas.width / 1.5, y: canvas.height / 2 },
  { x: canvas.width / 4, y: canvas.height / 1.5 },
];

let x = canvas.width / 2;
let y = canvas.height / 2;
let player;
let playerDmg = 1;
let towerSelected;
let towers = [];
let towerIntervals = [];
let health = 10;
let towerSelect = false;
let mouseX = null;
let mouseY = null;
let enemySpawnX = canvas.width / 1.5;
let enemySpawnY = 0;
let projectiles = [];
let buildAreas = [];
let enemies = [];
let myKeys = [];
let enemiesToSpawn = 0;
let currentWave = 0;
let score = 0;
let highest = localStorage.getItem("highest") || 0;
let animationId;
let spawnEnemiesInterval;
let spawnProjectilesInterval;
let projectileSpawnTime = 500;
let spawnTime = 300;

// todo re name vars, organise waves fully, and use highest wave for highestEl.
highestEl.innerHTML = highest;
healthEl.innerHTML = health;

// Starting Ball Class
//todo - add stuff to properties like fire damage, explosive, whatever then compare when projectiles hit
class Ball {
  constructor(x, y, radius, color, range) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.range = range;
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
  drawRange() {
    c.beginPath();
    c.arc(this.x, this.y, this.range, Math.PI * 2, 0, false);
    c.fillStyle = "rgba(150,150,150, 0.3)";
    c.fill();
  }
  newPos() {
    this.x += this.speedX;
    this.y += this.speedY;
  }
}

// todo - rename and add constructor params for color, health, speed other properties etc
// Bloon Ball for Moving Ball
class Bloon extends Ball {
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

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
//? to set mouse position state. Passed to a canvas event listener for mousemove.
function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (towerSelect) {
    towerSelected.x = e.clientX;
    towerSelected.y = e.clientY;
  }
}

//todo - rework  how scoring works in the game
function updatePoints(times = 1) {
  score += 1 * times;
  pointsEl.innerHTML = score;
}
// Reinitializing Variables for Starting a New Game
function init(gameDifficultyStr) {
  player = new Ball(x, y, 10, "white");
  if (!gameDifficultyStr) {
    return;
  }
  if (gameDifficultyStr === "easy") {
    buildAreas.push(
      new BuildArea(trackPoints[0].x + 75 * 2, trackPoints[0].y, 75),
      new BuildArea(trackPoints[0].x, trackPoints[0].y + 75 * 2, 75),
      new BuildArea(trackPoints[0].x - 75, trackPoints[2].y + 75, 75)
    );
  } else if (gameDifficultyStr === "medium") {
    trackPoints = [
      { x: canvas.width / 2, y: canvas.height / 4 },
      { x: canvas.width / 1.5, y: canvas.height / 2 },
      { x: canvas.width / 4, y: canvas.height / 1.5 },
    ];

    buildAreas.push(
      new BuildArea(trackPoints[0].x + 75 * 2, trackPoints[0].y, 75),
      new BuildArea(trackPoints[0].x, trackPoints[0].y + 75 * 2, 75),
      new BuildArea(trackPoints[0].x - 75, trackPoints[2].y + 75, 75)
    );
  } else if (gameDifficultyStr === "hard") {
    buildAreas.push(
      new BuildArea(trackPoints[0].x + 75 * 2, trackPoints[0].y, 75),
      new BuildArea(trackPoints[0].x, trackPoints[0].y + 75 * 2, 75),
      new BuildArea(trackPoints[0].x - 75, trackPoints[2].y + 75, 75)
    );
  }

  projectiles = [];
  enemies = [];
  score = 0;
  spawnTime = 1000;
  pointsEl.innerHTML = score;
  highestEl.innerHTML = highest;
}

// Stop Game
function stopGame() {
  clearInterval(spawnEnemiesInterval);
  clearInterval(spawnProjectilesInterval);
  cancelAnimationFrame(animationId); // Exit Animation
  canvas.removeEventListener("mousemove", handleMouseMove);
  introEl.style.display = "flex"; // Dialogue box
  overlay.style.display = "none"; // score and highest
  if (points > highest) {
    highest = score;
    localStorage.setItem("highest", highest);
  }
  pointsEl.innerHTML = score;
}

//? Spawns enemies at start of track
function spawnEnemies() {
  //? Spawn a enemy every spawnTime
  spawnEnemiesInterval = setTimeout(() => {
    const radius = 10;

    if (enemiesToSpawn > 0) {
      enemies.push(
        new Bloon(
          enemySpawnX,
          enemySpawnY,
          radius,
          waveEnemies[currentWave - 1].enemies[enemiesToSpawn - 1],
          calculateVelocity(
            enemySpawnX,
            enemySpawnY,
            trackPoints[0].x,
            trackPoints[0].y
          )
        )
      );
      enemiesToSpawn--;
    }
    spawnEnemies();
  }, spawnTime);
}

//? Shooting projectiles from player/hero to direction of mouse pos
function spawnProjectiles() {
  const dist = Math.hypot(mouseX - player.x, mouseY - player.y);
  let rand = getRandomArbitrary(0 - dist / 10, 0 + dist / 10);
  spawnProjectilesInterval = setTimeout(() => {
    let x = player.x;
    let y = player.y;
    let v = calculateVelocity(player.x, player.y, mouseX + rand, mouseY + rand);
    //todo - Use this in spawnEnemies for enemy speed
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Bloon(x, y, 5, "rgba(150,150,150,1)", v));
    spawnProjectiles();
  }, projectileSpawnTime);
}
function spawnTowerProjectilesNow(tower, towerIndex) {
  setTimeout(() => {
    let v = calculateVelocity(tower.x, tower.y, tower.x - 5, tower.y);
    v.x *= 5.5;
    v.y *= 5.5;

    //todo - push 8 projectiles, all

    projectiles.push(new Bloon(tower.x, tower.y, 10, "rgba(150,150,150,1)", v));
  }, 0);
}

function spawnTowerProjectiles(tower, towerIndex) {
  towerIntervals[towerIndex] = setTimeout(() => {
    let v = calculateVelocity(tower.x, tower.y, tower.x - 5, tower.y);
    v.x *= 5.5;
    v.y *= 5.5;

    //todo - push 8 projectiles, all

    projectiles.push(new Bloon(tower.x, tower.y, 10, "rgba(150,150,150,1)", v));
    spawnTowerProjectiles(tower, towerIndex);
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

  buildAreas.forEach((area, index) => {
    area.draw();
    //todo - check for player collision? test here
  });

  if (towerSelect) {
    towerSelected.draw();
    towerSelected.drawRange();
  }

  towers.forEach((tower, towerIndex) => {
    tower.draw();
    tower.drawRange();
    let enemiesInRange = [];
    enemies.forEach((enemy, enemyIndex) => {
      //! calculation here not accurate, not working as expected
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
      if (dist <= tower.range) {
        enemiesInRange.push(enemy);
      }
    });
    if (enemiesInRange.length > 0 && !towerIntervals[towerIndex]) {
      //todo - can pass enemies here for firing at enemies
      spawnTowerProjectilesNow(tower, towerIndex);
      spawnTowerProjectiles(tower, towerIndex);
    } else if (enemiesInRange.length === 0) {
      clearInterval(towerIntervals[towerIndex]);
    }
  });
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

    //todo - loop over towers here as well for tower detection

    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //? When Projectiles touch Enemy
      if (dist - enemy.radius - projectile.radius < 0) {
        let allColors = Object.keys(bloonHealth);

        if (enemy.health - playerDmg > 0) {
          updatePoints();
          enemy.health -= playerDmg;
          enemy.color = allColors[enemy.health - 1];
          setTimeout(() => {
            projectiles.splice(projectileIndex, 1);
          }, 0);
        } else {
          //handle enemy kill
          updatePoints(2);
          setTimeout(() => {
            enemies.splice(index, 1);
            projectiles.splice(projectileIndex, 1);
          }, 0);
        }
      }
    });
  });
}
function introClick() {
  introEl.style.display = "none";
  prepareGameEl.style.display = "flex";
}
//? Start New Game
function startGame(gameDifficulty) {
  x = canvas.width / 2;
  y = canvas.height / 2;
  canvas.addEventListener("mousemove", handleMouseMove);
  init(gameDifficulty);
  animate();
  clearInterval(spawnProjectilesInterval);
  prepareGameEl.style.display = "none";
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
  //clearInterval(spawnProjectilesInterval);
  enemiesToSpawn = waveEnemies[currentWave - 1].enemies.length;
  spawnEnemies();
  //spawnProjectiles();
}

// todo - use e to get button id and determine tower
function handleTowerSelect() {
  if (towerSelect) {
    return;
  }
  towerSelect = true;
  towerSelected = new Ball(mouseX, mouseY, 10, "#fff", 150);
  canvas.addEventListener("click", towerPlaced);
}

function towerPlaced(e) {
  towerSelected.x = e.clientX;
  towerSelected.y = e.clientY;
  towerSelect = false;
  towers.push(towerSelected);
  towerSelected = {};
  canvas.removeEventListener("click", towerPlaced);
}

//? Start Game Button
window.startGame = startGame;
startGameBtn.addEventListener("click", introClick);
startWaveBtn.addEventListener("click", startWave);
selectHeroBtn.addEventListener("click", handleTowerSelect);
/*
towers.forEach((tower, towerIndex) => {
    tower.draw();
    let firstBloon = null;
    if (enemies.length > 0) {
      enemies.forEach((enemy, enemyIndex) => {
        if (firstBloon === null) {
          firstBloon = enemy;
        } else if ((firstBloon.health = 0)) {
          firstBloon = enemy;
        } else if (
          Math.hypot(
            firstBloon.x - trackPoints[trackPoints.length - 1].x,
            firstBloon.y - trackPoints[trackPoints.length - 1].y
          ) >
          Math.hypot(
            enemy.x - trackPoints[trackPoints.length - 1].x,
            enemy.y - trackPoints[trackPoints.length - 1].y
          )
        ) {
          firstBloon = enemy;
          console.log(enemy);
        }
      });

      const dist = Math.hypot(tower.x - firstBloon.x, tower.y - firstBloon.y);
      if (dist < tower.range && !towerIntervals[towerIndex]) {
        towerIntervals[towerIndex] = setInterval(() => {
          let v = calculateVelocity(
            tower.x,
            tower.y,
            firstBloon.x,
            firstBloon.y
          );
          v.x *= 5.5;
          v.y *= 5.5;

          projectiles.push(
            new Bloon(tower.x, tower.y, 10, "rgba(150,150,150,1)", v)
          );
        }, projectileSpawnTime);
      }
      if (dist > tower.range && towerIntervals[towerIndex]) {
        clearInterval(towerIntervals[towerIndex]);
      }
    } else {
      console.log("no enemies" + towerIntervals[towerIndex]);
      firstBloon = null;
    }
  });
*/
