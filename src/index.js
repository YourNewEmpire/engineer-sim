import "../styles/main.css";
import { calculateVelocity } from "../lib/velocity.js";
import { waveEnemies, towerUpgrades } from "../lib/constants.js";
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

const towerUpgradeButtons = document.getElementById("towerUpgradeButtons");
overlay.style.display = "none";
towerControls.style.display = "none";
// const highestEl = document.getElementById("highestEl");
const waveEl = document.getElementById("waveEl");
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
let tempTowerPrices = {
  auto: 200,
  spray: 150,
};
let x = canvas.width / 2;
let y = canvas.height / 2;
// todo - hero will get choice: heli or dartling
let hero;
// todo - use from hero/tower class properties
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
let enemyProjectileCollided = [];
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

// Starting Ball Class
//todo - add stuff to properties like fire damage, explosive, whatever then compare when projectiles hit
class Ball {
  constructor(x, y, radius, color, properties) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.speedX = 0;
    this.speedY = 0;
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
    c.arc(this.x, this.y, this.properties.range, Math.PI * 2, 0, false);
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

// todo - add properties param for health, damage
class Shot extends Ball {
  constructor(x, y, radius, color, velocity, health) {
    super(x, y, radius, color);
    this.velocity = velocity;
    this.health = health;
    this.collided = [];
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
//? Only checks for other towers and build areas. Not the hero
const checkBuildCollision = (mouseEvent) => {
  let collided;
  let inBuildArea;
  towers.forEach((tower, towerIndex) => {
    const dist = Math.hypot(
      mouseEvent.clientX - tower.x,
      mouseEvent.clientY - tower.y
    );
    if (dist - towerPurchased.radius - tower.radius < 0) {
      collided = true;
    }
  });
  buildAreas.forEach((area, areaIndex) => {
    const dist = Math.hypot(
      mouseEvent.clientX - area.x,
      mouseEvent.clientY - area.y
    );
    if (dist - area.radius < 0) {
      inBuildArea = true;
    }
  });
  if (!collided && inBuildArea) return true;
  else return false;
};
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
  points += 1 * times;
}

//? Reinitialize the vars for new game, some imported constants being used
function init(gameDifficultyStr) {
  if (!gameDifficultyStr) {
    return;
  }
  //todo - need to reset some missing vars here
  towers = [];
  towerIntervals = [];
  buildAreas = [];
  projectiles = [];
  enemies = [];
  //todo - use global enemyVelocity var
  //todo - use constants for gameDifficulty & change map accordingly also
  if (gameDifficultyStr === "easy") {
    points = 750;

    trackPoints = [
      { x: canvas.width / 2, y: canvas.height / 4 },
      { x: canvas.width / 1.5, y: canvas.height / 2 },
      { x: canvas.width / 4, y: canvas.height / 1.5 },
      { x: canvas.width / 3, y: canvas.height / 4 },
    ];
    buildAreas.push(
      new BuildArea(trackPoints[0].x + 75 * 2, trackPoints[0].y, 75),
      new BuildArea(trackPoints[0].x, trackPoints[0].y + 75 * 2, 75),
      new BuildArea(trackPoints[0].x - 75, trackPoints[2].y + 75, 75)
    );
  } else if (gameDifficultyStr === "medium") {
    points = 500;
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
    points = 300;
    trackPoints = [
      { x: canvas.width / 2, y: canvas.height / 4 },
      { x: canvas.width / 3, y: canvas.height / 2.5 },
      { x: canvas.width / 3.5, y: canvas.height / 2.5 },
    ];
    buildAreas.push(
      new BuildArea(trackPoints[0].x - 100, trackPoints[0].y - 75, 75),
      new BuildArea(trackPoints[0].x + 175, trackPoints[0].y, 75)
    );
  }
}

// Stop Game
function stopGame() {
  clearInterval(spawnEnemiesInterval);
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
function calcSprayProjectiles(t) {
  if (t.properties.paths.c === -1) {
    let velArr = [
      calculateVelocity(t.x, t.y, t.x - 5, t.y),
      calculateVelocity(t.x, t.y, t.x + 5, t.y),
      calculateVelocity(t.x, t.y, t.x, t.y - 5),
      calculateVelocity(t.x, t.y, t.x, t.y + 5),
      calculateVelocity(t.x, t.y, t.x + 5, t.y - 5),
      calculateVelocity(t.x, t.y, t.x + 5, t.y + 5),
      calculateVelocity(t.x, t.y, t.x - 5, t.y - 5),
      calculateVelocity(t.x, t.y, t.x - 5, t.y + 5),
    ];
    const retArr = velArr.map((v) => {
      return {
        x: (v.x *= 5),
        y: (v.y *= 5),
      };
    });
    return retArr;
  }
}
//todo - clean these up fully, perhaps use switch statement over the tower types

function spawnTowerProjectiles(tower, towerIndex) {
  //todo - unsure about looping over tower.properties.numOfGuns and adding v to array.

  if (tower.properties.fireMode === "spray") {
    // import constant of
    let oldV = calculateVelocity(tower.x, tower.y, tower.x - 5, tower.y);
    let vArr = calcSprayProjectiles(tower);
    let projs = [];
    for (const el of vArr) {
      projs.push(
        new Shot(
          tower.x,
          tower.y,
          5,
          "rgba(150,150,150,1)",
          el,
          tower.properties.pierce
        )
      );
    }
    towerIntervals[towerIndex] = setTimeout(() => {
      projectiles.push(...projs);
      spawnTowerProjectiles(tower, towerIndex);
    }, tower.properties.fireInterval);
  } else if (tower.properties.fireMode === "auto") {
    towerIntervals[towerIndex] = setTimeout(() => {
      let v = calculateVelocity(
        tower.x,
        tower.y,
        enemies[tower.enInRange].x,
        enemies[tower.enInRange].y
      );
      v.x *= 7.5;
      v.y *= 7.5;

      projectiles.push(
        new Shot(tower.x, tower.y, 5, "red", v, tower.properties.pierce)
      );
      spawnTowerProjectiles(tower, towerIndex);
    }, tower.properties.fireInterval);
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

    projectiles.push(new Shot(x, y, 5, "rgba(150,150,150,1)", v, 1));
    spawnHeroProjectiles();
  }, hero.properties.fireInterval);
}

/*
  ? ANIMATE FUNCTION
*/

function animate() {
  healthEl.innerHTML = health;
  pointsEl.innerHTML = points;
  waveEl.innerHTML = currentWave;
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
    if (projectile.health === 0) {
      setTimeout(() => {
        projectiles.splice(index, 1);
      }, 0);
    }
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
      let dmg = enemy.health;
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
    //? In each enemy iteration, loop over the projectiles here to check for collisions, update points etc.
    projectiles.forEach((projectile, projectileIndex) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);

      //? If the enemy has already collided, return and move on to next projectile
      if (projectile.collided.includes(enemy)) {
        return;
      }
      //? When Projectiles touch Enemy
      if (dist - enemy.radius - projectile.radius < 0) {
        let allColors = Object.keys(bloonHealth);
        //? Push enemy to collided array to avoid collision in next frame
        projectile.collided.push(enemy);
        projectile.health--;
        if (enemy.health - playerDmg > 0) {
          updatePoints();
          enemy.health -= playerDmg;
          enemy.color = allColors[enemy.health - 1];
        } else {
          //handle enemy kill
          updatePoints(2);
          setTimeout(() => {
            enemies.splice(index, 1);
          }, 0);
        }
      }
    });
  });
  //? loop over towers and draw them. This is where the shooting starts
  towers.forEach((tower, towerIndex) => {
    tower.draw();
    let enemiesInRange = 0;

    //? for each tower, loop over the enemies
    enemies.forEach((enemy, enemyIndex) => {
      const dist = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);

      //? If enemy is in tower range, increment this local enemiesInRange variable
      if (dist - enemy.radius <= tower.properties.range) {
        /* 
        ? tower.enInRange is initially undefined
        ? I use it to store the index of the enemy in range
        ? crucially, I dont want to set enInRange again in the next iteration.
        ? so if enInRange isn't a number, it is either undefined (from the start)
        ? or it is "" which is set below (if the enemy is no longer in range)
        ? 
        */
        if (typeof tower.enInRange !== "number") {
          //? Will use this later in spawnTowerProjectiles
          tower.enInRange = enemyIndex;
        }
        enemiesInRange += 1;
      } else if (enemyIndex === tower.enInRange) {
        /*
      ? if not in tower range then check if the enemy is the current enInRange.
      ? if so, then reset the enInRange var back to something that is not a number
      */
        tower.enInRange = "";
      }
    });
    if (enemiesInRange > 0 && !towerIntervals[towerIndex]) {
      spawnTowerProjectiles(tower, towerIndex);
    } else if (enemiesInRange === 0) {
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
  introEl.style.opacity = 0;

  setTimeout(() => {
    introEl.style.display = "none";
  }, 800);
  prepareGameEl.style.display = "flex";
  setTimeout(() => {
    prepareGameEl.style.opacity = 1;
  }, 800);
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
  prepareGameEl.style.display = "none";
  overlay.style.display = "flex";
}

//? Start Wave
function startWave() {
  //? return so that this code cannot be ran when there are still current enemies
  if (enemies.length > 0) {
    return;
  }
  //? Clear projectiles collided data.
  projectiles.forEach((proj, ind) => {
    setTimeout(() => {
      proj.collided.splice(0, proj.collided.length);
    }, 0);
  });
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
function handleHeroSelect(fireModeArg) {
  //? if a tower is already being placed, or there already is hero, end here.
  if (towerPlacing || hero) {
    towerPurchased = {};
    towerPlacing = false;
    return;
  }
  //? properties to be passed to hero
  let obj = {
    damage: 1,
    pierce: 2,
    range: 150,
    fireMode: fireModeArg,
    fireInterval: 400,
  };
  towerPurchased = new Ball(mouseX, mouseY, 25, "#fff", obj);
  towerPlacing = true;
  canvas.addEventListener("click", heroPlaced);
}

function heroPlaced(e) {
  let canBuild = checkBuildCollision(e);

  if (canBuild) {
    towerPurchased.x = e.clientX;
    towerPurchased.y = e.clientY;
    towerPlacing = false;
    hero = towerPurchased;
    towerPurchased = {};
    canvas.removeEventListener("click", heroPlaced);
  }
}

// todo - add heroButtonClicked and display upgrades

// todo - towers are currently unlimited, perhaps wont matter if there's not enough cash for player
//? When a tower purchase button is clicked, use fireModeArg
function handleTowerSelect(fireModeArg) {
  //todo - use constant with difficulty adjustment

  let obj = {
    damage: 1,
    pierce: 1,
    range: fireModeArg === "spray" ? 110 : 150,
    projNum: 4,
    fireMode: fireModeArg,
    fireInterval: 350,
    paths: {
      a: -1,
      b: -1,
      c: -1,
    },
  };

  //? if a tower is already being placed, assume the user wants to cancel
  if (towerPlacing) {
    towerPurchased = {};
    towerPlacing = false;
    return;
  }

  //? not enough points? return
  if (points < tempTowerPrices[obj.fireMode]) {
    return;
  }

  //? Using towerPurchased var to store temporary "placing" tower
  //? Set the ball to the mouseX,Y vars to follow mouse until player has picked placement.
  towerPurchased = new Ball(mouseX, mouseY, 15, "#fff", obj);
  towerPlacing = true;
  // ? towerPlacing will be set back to false in towerPlaced function
  canvas.addEventListener("click", towerPlaced);
  // todo - canvas.addEventListener("click", handleTowerCancel/heroCancel )
}

function towerPlaced(e) {
  let canBuild = checkBuildCollision(e);
  let heroCollided;
  if (!canBuild) return;
  //? check for hero collision
  if (hero) {
    const dist = Math.hypot(e.clientX - hero.x, e.clientY - hero.y);
    if (dist - towerPurchased.radius - hero.radius < 0) {
      heroCollided = true;
    }
  }
  if (heroCollided) return;
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
  button.innerText = `tower${towerLength + 1} (${
    towerPurchased.properties.fireMode
  })`;
  button.addEventListener("click", towerButtonClicked);
  towerControls.style.display = "grid";
  currentTowers.appendChild(button);
  canvas.removeEventListener("click", towerPlaced);
  points -= tempTowerPrices[towerPurchased.properties.fireMode];
  towerPlacing = false;
  towerPurchased = {};
}

//? When player clicks owned tower button on the overlay div
function towerButtonClicked(e) {
  let towerButton = document.getElementById(e.target.id);
  let towerLength = towers.length - 1;
  let buttonArr = [];
  // todo - add event listener for hover to display tooltip
  if (!towerSelecting) {
    towerSelected = towers[e.target.id.replace("tower", "")];
    towerSelecting = true;
    let pathKeys = Object.keys(towerSelected.properties.paths);
    for (let i = 0; i < 3; i++) {
      let button = document.createElement("button");
      button.setAttribute("id", `path${pathKeys[i]}`);

      button.addEventListener("click", upgradeButtonClicked);
      button.style.margin = "2px 0px";
      buttonArr.push(button);
    }
    for (const btn of buttonArr) {
      towerUpgradeButtons.appendChild(btn);
      let pathLetter = btn.id.replace("path", "");
      let nextUpgradeIndex = towerSelected.properties.paths[pathLetter] + 1;
      let towerSelectedUpgrades =
        towerUpgrades[towerSelected.properties.fireMode];
      let pathSelected = towerSelectedUpgrades[pathLetter];
      let nextUpgrade = pathSelected[nextUpgradeIndex];

      btn.innerText = `${
        nextUpgrade.name + "\n" + nextUpgrade.price + " points"
      }`;
    }
    towerButton.innerText = `tower${towerLength + 1} (${
      towerSelected.properties.fireMode
    }) 👁️`;
  } else if (towerSelected === towers[e.target.id.replace("tower", "")]) {
    towerSelecting = false;
    towerUpgradeButtons.textContent = "";
    towerButton.innerText = `tower${towerLength + 1} (${
      towerSelected.properties.fireMode
    }) `;
    towerSelected = {};
  } else {
    let oldSelect = towers.indexOf(towerSelected);
    let oldButton = document.getElementById("tower" + oldSelect);
    oldButton.innerText = `tower${towerLength + 1} (${
      towerSelected.properties.fireMode
    }) `;
    towerSelected = towers[e.target.id.replace("tower", "")];
    towerSelecting = true;
    let pathKeys = Object.keys(towerSelected.properties.paths);
    for (let i = 0; i < 3; i++) {
      let button = document.createElement("button");
      button.setAttribute("id", `path${pathKeys[i]}`);
      button.addEventListener("click", upgradeButtonClicked);
      button.style.margin = "2px 0px";
      buttonArr.push(button);
    }
    towerUpgradeButtons.textContent = "";
    for (const btn of buttonArr) {
      towerUpgradeButtons.appendChild(btn);
      let pathLetter = btn.id.replace("path", "");
      let nextUpgradeIndex = towerSelected.properties.paths[pathLetter] + 1;
      let towerSelectedUpgrades =
        towerUpgrades[towerSelected.properties.fireMode];
      let pathSelected = towerSelectedUpgrades[pathLetter];
      let nextUpgrade = pathSelected[nextUpgradeIndex];

      btn.innerText = `${
        nextUpgrade.name + "\n" + nextUpgrade.price + " points"
      }`;
    }
    towerButton.innerText = `tower${towerLength + 1} (${
      towerSelected.properties.fireMode
    }) 👁️`;
  }
  //todo - need to display another div of tower upgrades
}

function upgradeButtonClicked(e) {
  let upgradeButton = document.getElementById(e.target.id);
  let upgradeKeys = Object.keys(towerUpgrades);
  let pathLetter = e.target.id.replace("path", "");
  let towerType = upgradeKeys.find(
    (type) => type === towerSelected.properties.fireMode
  );

  let towerSelectedUpgrades = towerUpgrades[towerSelected.properties.fireMode];
  let pathSelected = towerSelectedUpgrades[pathLetter];
  let upgradeIndex = towerSelected.properties.paths[pathLetter] + 1;
  let upgrade = pathSelected[upgradeIndex];

  if (points >= upgrade.price) {
    towerSelected.properties = {
      ...towerSelected.properties,
      ...upgrade.payload,
    };
    towerSelected.properties.paths[pathLetter] += 1;
    let nextUpgradeIndex = towerSelected.properties.paths[pathLetter] + 1;
    let nextUpgrade = pathSelected[nextUpgradeIndex];

    upgradeButton.innerText = `${
      nextUpgrade.name + "\n" + nextUpgrade.price + " points"
    }`;
  }

  //console.log(pathLetter + (currentUpgrade + 1));
  console.log(towerSelected.properties.paths[pathLetter]);
}

//? Listen and set mouse position state. Passed to a canvas event listener for mousemove.
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
