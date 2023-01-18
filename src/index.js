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
// todo - hero will get choice: heli or dartling
let hero;
// todo - perhaps put in hero class
let playerDmg = 1;
let towerPurchased;
let towerPlacing = false;
let towerSelected;
let towerSelecting = false;
let towers = [];
let towerIntervals = [];
let health = 10;

let points = 0;
let mouseX = null;
let mouseY = null;
let enemySpawnX = canvas.width / 1.5;
let enemySpawnY = 0;
let projectiles = [];
let buildAreas = [];
let enemies = [];
let enemyVelocity = 1;
let enemiesToSpawn = 0;
let currentWave = 0;
let score = 0;
let highest = localStorage.getItem("highest") || 0;
let animationId;
let spawnEnemiesInterval;
let spawnProjectilesInterval;
let projectileSpawnTime = 500;
let spawnTime = 300;

// todo re name these vars, organise waves fully, and use highest wave for highestEl.
highestEl.innerHTML = highest;
healthEl.innerHTML = health;

// Starting Ball Class
//todo - add stuff to properties like fire damage, explosive, whatever then compare when projectiles hit
class Ball {
  constructor(x, y, radius, color, range, firingMode) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.range = range;
    this.speedX = 0;
    this.speedY = 0;
    this.firingMode = firingMode;
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
    //? used as index number to calc velocity to the next trackpoint
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

function drawTrack() {
  c.lineWidth = 35;
  c.lineJoin = "round";
  c.beginPath();
  c.moveTo(enemySpawnX, enemySpawnY);
  c.lineTo(trackPoints[0].x, trackPoints[0].y);
  c.lineTo(trackPoints[1].x, trackPoints[1].y);
  c.lineTo(trackPoints[2].x, trackPoints[2].y);
  c.stroke();
}
function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}
//? to set mouse position state. Passed to a canvas event listener for mousemove.
function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (towerPlacing) {
    towerPurchased.x = e.clientX;
    towerPurchased.y = e.clientY;
  }
}

//todo - rework  how scoring works in the game
function updatePoints(times = 1) {
  score += 1 * times;
  pointsEl.innerHTML = score;
}
// Reinitializing Variables for Starting a New Game
function init(gameDifficultyStr) {
  //todo - not clearing build areas after game stop
  hero = new Ball(x, y, 10, "white");
  if (!gameDifficultyStr) {
    return;
  }
  //todo - use global enemyVelocity var
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
    let v = calculateVelocity(
      enemySpawnX,
      enemySpawnY,
      trackPoints[0].x,
      trackPoints[0].y
    );
    //todo - use global enemyVelocity var
    v.x *= enemyVelocity;
    v.y *= enemyVelocity;

    if (enemiesToSpawn > 0) {
      enemies.push(
        new Bloon(
          enemySpawnX,
          enemySpawnY,
          radius,
          waveEnemies[currentWave - 1].enemies[enemiesToSpawn - 1],
          v
        )
      );
      enemiesToSpawn--;
    }
    spawnEnemies();
  }, spawnTime);
}

//? Shooting projectiles from hero/hero to direction of mouse pos
function spawnProjectiles() {
  const dist = Math.hypot(mouseX - hero.x, mouseY - hero.y);
  let rand = getRandomArbitrary(0 - dist / 10, 0 + dist / 10);
  spawnProjectilesInterval = setTimeout(() => {
    let x = hero.x;
    let y = hero.y;
    let v = calculateVelocity(hero.x, hero.y, mouseX + rand, mouseY + rand);
    //todo - Use this in spawnEnemies for enemy speed
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Bloon(x, y, 5, "rgba(150,150,150,1)", v));
    spawnProjectiles();
  }, projectileSpawnTime);
}

//todo - can pass enemies here for firing at enemies
function spawnTowerProjectilesNow(tower, towerIndex) {
  //todo - configure firing mode with tower var
  // if(tower.firingMode === "sprayer"){

  // }
  // else if(tower.firingMode === "auto"){

  // }
  setTimeout(() => {
    let v = calculateVelocity(tower.x, tower.y, tower.x - 5, tower.y);
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Bloon(tower.x, tower.y, 10, "rgba(150,150,150,1)", v));
  }, 0);
}

function spawnTowerProjectiles(tower, towerIndex) {
  towerIntervals[towerIndex] = setTimeout(() => {
    let v = calculateVelocity(tower.x, tower.y, tower.x - 5, tower.y);
    v.x *= 5.5;
    v.y *= 5.5;

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
  drawTrack();
  buildAreas.forEach((area, index) => {
    area.draw();
  });

  if (towerPlacing) {
    towerPurchased.draw();
    towerPurchased.drawRange();
  }
  if (towerSelecting) {
    towerSelected.drawRange();
  }

  towers.forEach((tower, towerIndex) => {
    tower.draw();

    let enemiesInRange = [];
    enemies.forEach((enemy, enemyIndex) => {
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
      if (dist - enemy.radius <= tower.range) {
        enemiesInRange.push(enemy);
      }
    });
    if (enemiesInRange.length > 0 && !towerIntervals[towerIndex]) {
      spawnTowerProjectilesNow(tower, towerIndex);
      spawnTowerProjectiles(tower, towerIndex);
    } else if (enemiesInRange.length === 0) {
      clearInterval(towerIntervals[towerIndex]);
      towerIntervals[towerIndex] = false;
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

    // todo - enemies need to be centered in the track. Leaving this for now, unsure
    // todo - enemies also can't arc corners like this
    if (dist - enemy.radius < 0) {
      let v = calculateVelocity(
        trackPoints[enemy.trackPoint].x,
        trackPoints[enemy.trackPoint].y,
        trackPoints[enemy.trackPoint + 1].x,
        trackPoints[enemy.trackPoint + 1].y
      );
      v.x *= enemyVelocity;
      v.y *= enemyVelocity;
      enemy.velocity = v;
      enemy.trackPoint++;
    }

    //todo - loop over towers here as well if I want enemies that can attack (stun, debuff something)

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
  // todo - set bloon speed, and select correct waveEnemies constants
  x = canvas.width / 2;
  y = canvas.height / 2;
  currentWave = 0;
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

// todo - use e to  and determine tower type with button id
function handleTowerSelect() {
  if (towerPlacing) {
    return;
  }
  /* //todo
  let towerFireMode;
if(e.target.id ==="selectAutoShooterBtn"){ towerFireMode = "auto"}
etc
  */
  towerPlacing = true;
  towerPurchased = new Ball(mouseX, mouseY, 10, "#fff", 150);
  canvas.addEventListener("click", towerPlaced);
}

function towerPlaced(e) {
  //todo - need to check for buildArea & other towers collision and then fill range red. test here
  towerPurchased.x = e.clientX;
  towerPurchased.y = e.clientY;
  towerPlacing = false;
  towers.push(towerPurchased);
  towerPurchased = {};
  let towerLength = towers.length - 1;
  //todo - withdraw points

  let button = document.createElement("button");
  button.setAttribute("id", `tower${towerLength}`);
  button.innerText = `new tower${towerLength}`;
  button.addEventListener("click", towerButtonClicked);
  overlay.appendChild(button);
  canvas.removeEventListener("click", towerPlaced);
}

function towerButtonClicked(e) {
  if (!towerSelecting) {
    towerSelected = towers[e.target.id.replace("tower", "")];
    towerSelecting = true;
    document.getElementById(e.target.id).focus();
  } else if (towerSelected === towers[e.target.id.replace("tower", "")]) {
    towerSelecting = false;
    document.getElementById(e.target.id).blur();
  } else {
    towerSelected = towers[e.target.id.replace("tower", "")];
    towerSelecting = true;
  }
  //todo - need to display another div
}
//? Start Game Button
window.startGame = startGame;
window.selectHero;
window.selectSprayer;
window.selectAutoShooter;
startGameBtn.addEventListener("click", introClick);
startWaveBtn.addEventListener("click", startWave);
selectHeroBtn.addEventListener("click", handleTowerSelect);
