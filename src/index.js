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
const towerControls = document.getElementById("towerControls");
const currentTowers = document.getElementById("currentTowers");
const towerUpgrades = document.getElementById("towerUpgrades");
overlay.style.display = "none";
towerControls.style.display = "none";
const highestEl = document.getElementById("highestEl");
const healthEl = document.getElementById("healthEl");
const startGameBtn = document.getElementById("startGameBtn");
const startWaveBtn = document.getElementById("startWaveBtn");
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
let heroInterval;
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
let projectileSpawnTime = 300;
let spawnTime = 300;

// todo re name these vars, organise waves fully, and use highest wave for highestEl.
highestEl.innerHTML = highest;
healthEl.innerHTML = health;

// Starting Ball Class
//todo - add stuff to properties like fire damage, explosive, whatever then compare when projectiles hit
class Ball {
  constructor(x, y, radius, color, range, firingMode, properties) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.range = range;
    this.speedX = 0;
    this.speedY = 0;
    this.firingMode = firingMode;
    this.properties = properties;
    this.enInRange;
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false);
    c.fillStyle = this.color;
    c.fill();

    // todo - text for tower/hero
    // c.font = "9px Teko";
    // c.fillStyle = "#000";
    // let textX = this.x;
    // c.fillText("tower", (textX -= 5), this.y);
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
  trackPoints.forEach((t, tIndex) => {
    c.lineTo(trackPoints[tIndex].x, trackPoints[tIndex].y);
  });
  c.stroke();
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

//? Run this when player towers hit & kill enemies
//todo - rework how scoring works in the game
function updatePoints(times = 1) {
  score += 1 * times;
  pointsEl.innerHTML = score;
}

//? Reinitialize the vars for new game, some imported constants being used
function init(gameDifficultyStr) {
  if (!gameDifficultyStr) {
    return;
  }
  //todo - need to clear some missing vars here
  buildAreas = [];
  projectiles = [];
  enemies = [];
  score = 0;
  spawnTime = 1000;
  pointsEl.innerHTML = score;
  highestEl.innerHTML = highest;
  //todo - use global enemyVelocity var
  //todo - use constants for gameDifficulty & change map accordingly also
  if (gameDifficultyStr === "easy") {
    trackPoints = [
      { x: canvas.width / 2, y: canvas.height / 4 },
      { x: canvas.width / 1.5, y: canvas.height / 2 },
      { x: canvas.width / 2, y: canvas.height / 1.5 },
      { x: canvas.width / 3, y: canvas.height / 4 },
    ];
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
  }, waveEnemies[currentWave - 1].spawnTime);
}

//todo - need set projectile.health to tower.pierce

//todo - remove targetEnemy

//todo - clean these up fully

function spawnTowerProjectiles(tower, towerIndex) {
  //todo - unsure about looping over tower.properties.numOfGuns and adding v to array.
  if (tower.firingMode === "spray") {
    let v = calculateVelocity(tower.x, tower.y, tower.x - 5, tower.y);
    let v2 = calculateVelocity(tower.x, tower.y, tower.x + 5, tower.y);
    let v3 = calculateVelocity(tower.x, tower.y, tower.x, tower.y + 5);
    let v4 = calculateVelocity(tower.x, tower.y, tower.x, tower.y - 5);
    v.x *= 5.5;
    v.y *= 5.5;
    v2.x *= 5.5;
    v2.y *= 5.5;
    v3.x *= 5.5;
    v3.y *= 5.5;
    v4.x *= 5.5;
    v4.y *= 5.5;
    setTimeout(() => {
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v)
      );
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v2)
      );
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v3)
      );
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v4)
      );
    }, 0);
    towerIntervals[towerIndex] = setTimeout(() => {
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v)
      );
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v2)
      );
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v3)
      );
      projectiles.push(
        new Bloon(tower.x, tower.y, 5, "rgba(150,150,150,1)", v4)
      );
      spawnTowerProjectiles(tower, towerIndex);
    }, projectileSpawnTime);
  } else if (tower.firingMode === "auto") {
    setTimeout(() => {
      let v = calculateVelocity(
        tower.x,
        tower.y,
        enemies[tower.enInRange].x,
        enemies[tower.enInRange].y
      );

      v.x *= 7.5;
      v.y *= 7.5;
      projectiles.push(new Bloon(tower.x, tower.y, 5, "red", v));
    }, 0);
    towerIntervals[towerIndex] = setTimeout(() => {
      let v = calculateVelocity(
        tower.x,
        tower.y,
        enemies[tower.enInRange].x,
        enemies[tower.enInRange].y
      );
      v.x *= 7.5;
      v.y *= 7.5;

      projectiles.push(new Bloon(tower.x, tower.y, 5, "red", v));
      spawnTowerProjectiles(tower, towerIndex);
    }, projectileSpawnTime);
  }
}

function spawnHeroProjectiles() {
  const dist = Math.hypot(mouseX - hero.x, mouseY - hero.y);
  let rand = getRandomArbitrary(0 - dist / 10, 0 + dist / 10);
  heroInterval = setTimeout(() => {
    let x = hero.x;
    let y = hero.y;
    let v = calculateVelocity(hero.x, hero.y, mouseX + rand, mouseY + rand);
    v.x *= 5.5;
    v.y *= 5.5;

    projectiles.push(new Bloon(x, y, 5, "rgba(150,150,150,1)", v));
    spawnHeroProjectiles();
  }, hero.properties.fireInterval);
}

/*
  ? ANIMATE FUNCTION
*/

function animate() {
  healthEl.innerHTML = health;
  pointsEl.innerHTML = points;
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
  if (hero) {
    hero.draw();
    // todo - need to configure heli here
    // todo - check if heli then loop over enemies
    // if (enemies.length > 0 && !heroInterval) {
    //   spawnHeroProjectiles();
    // } else {
    //   clearInterval(heroInterval);
    //   heroInterval = false;
    // }
  }

  //? Update and remove projectiles
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

    //todo - need to configure projectile.health (pierce) and minus the enemy health from it
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
  towers.forEach((tower, towerIndex) => {
    tower.draw();
    let enemiesInRange = [];

    enemies.forEach((enemy, enemyIndex) => {
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
      if (dist - enemy.radius <= tower.range) {
        if (typeof tower.enInRange !== "number") {
          tower.enInRange = enemyIndex;
        }
        enemiesInRange.push(enemy);
      } else if (enemyIndex === tower.enInRange) {
        tower.enInRange = "";
      }
    });
    if (enemiesInRange.length > 0 && !towerIntervals[towerIndex]) {
      spawnTowerProjectiles(tower, towerIndex, enemiesInRange[0]);
    } else if (enemiesInRange.length === 0) {
      clearInterval(towerIntervals[towerIndex]);
      //? importantly set the interval to false so it cant be cleared again when this condition is met
      towerIntervals[towerIndex] = false;
    }
  });
}

/*
  ? CLICK HANDLERS
*/

function introClick() {
  introEl.style.display = "none";
  prepareGameEl.style.display = "flex";
}

//? Start New Game when a difficulty button is selected
function startGame(gameDifficulty) {
  // todo - set bloon speed, and select correct waveEnemies constants
  // todo - move currentWave to init and test
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
  clearInterval(heroInterval);
  enemiesToSpawn = waveEnemies[currentWave - 1].enemies.length;
  spawnEnemies();
  if (hero) {
    spawnHeroProjectiles();
  }
}
// ? When a hero button is clicked
function handleHeroSelect(fireMode) {
  if (towerPlacing || hero) {
    return;
  }
  let obj = { fireMode: fireMode, fireInterval: 400 };
  towerPlacing = true;
  towerPurchased = new Ball(mouseX, mouseY, 25, "#fff", 150, fireMode, obj);
  canvas.addEventListener("click", heroPlaced);
}
function heroPlaced(e) {
  //todo - need to check for buildArea & other towers collision and then fill range red. test here
  let collided;
  towers.forEach((tower, towerIndex) => {
    const dist = Math.hypot(e.clientX - tower.x, e.clientY - tower.y);
    if (dist - towerPurchased.radius - tower.radius < 0) {
      collided = true;
    }
  });
  if (!collided) {
    towerPurchased.x = e.clientX;
    towerPurchased.y = e.clientY;
    towerPlacing = false;
    hero = towerPurchased;
    towerPurchased = {};

    canvas.removeEventListener("click", heroPlaced);
  }
}

// todo - add heroButtonClicked and display upgrades

// todo - use e to  and determine tower type with button id
function handleTowerSelect(fireModeArg) {
  //? towerPlacing boolean is set to true when this is ran
  if (towerPlacing) {
    return;
  }
  // todo - pass obj to new Ball for properties arg, including fireModeArg as an entry in the obj
  //? Using towerPurchased var to store temporary "placing" tower
  //? Set the ball to the mouseX,Y vars to follow mouse until player has picked placement.
  towerPlacing = true;
  towerPurchased = new Ball(mouseX, mouseY, 15, "#fff", 150, fireModeArg);
  // ? towerPlacing will be set back to false in towerPlaced function
  canvas.addEventListener("click", towerPlaced);
}

function towerPlaced(e) {
  //todo - need to check for buildArea & other towers collision and then fill range red. test here

  //? Stop animating/following mouseX/Y & Set towerPurchased x,y to mouse click x,y from click event arg.
  towerPurchased.x = e.clientX;
  towerPurchased.y = e.clientY;
  //? push the new tower to the animated towers array and reset vars
  towers.push(towerPurchased);
  //? Use tower length when creating a button for the tower (essentially want the highest index)
  let towerLength = towers.length - 1;
  //todo - withdraw points, think about correct order of line calls here

  let button = document.createElement("button");
  //? set id here for towerButtonClicked arg
  button.setAttribute("id", `tower${towerLength}`);
  button.innerText = `tower${towerLength + 1} (${towerPurchased.firingMode})`;
  button.addEventListener("click", towerButtonClicked);
  towerControls.style.display = "grid";
  currentTowers.appendChild(button);
  canvas.removeEventListener("click", towerPlaced);
  towerPlacing = false;
  towerPurchased = {};
}

function towerButtonClicked(e) {
  if (!towerSelecting) {
    towerSelected = towers[e.target.id.replace("tower", "")];
    towerSelecting = true;
  } else if (towerSelected === towers[e.target.id.replace("tower", "")]) {
    towerSelecting = false;
  } else {
    towerSelected = towers[e.target.id.replace("tower", "")];
    towerSelecting = true;
  }
  //todo - need to display another div of tower upgrades
}

//? Listen and et mouse position state. Passed to a canvas event listener for mousemove.
function handleMouseMove(e) {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (towerPlacing) {
    towerPurchased.x = e.clientX;
    towerPurchased.y = e.clientY;
  }

  // todo - if hero fire mode is heli, calc hero velocity to mouse and set v to hero
}

//? Buttons
window.startGame = startGame;
window.handleHeroSelect = handleHeroSelect;
window.handleTowerSelect = handleTowerSelect;
startGameBtn.addEventListener("click", introClick);
startWaveBtn.addEventListener("click", startWave);
