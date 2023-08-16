<script lang="ts">
  import { onMount } from "svelte";
  import { calculateVelocity } from "$lib/calcVelocity";
  import {
    waveEnemies,
    towerUpgrades,
    allTowerPrices,
  } from "$lib/constants.js";
  const bloonHealth = {
    red: 1,
    blue: 2,
    green: 3,
    rainbow: 6,
  };
  type Velocity = {
    x: number;
    y: number;
  };
  let canvas: HTMLCanvasElement;

  let c: CanvasRenderingContext2D;
  //@ts-ignore
  let trackPoints;
  let x;
  let y;
  let towerPrices = {
    auto: 200,
    spray: 150,
  };
  let playing: boolean = false;
  // todo - hero will get choice: heli or dartling
  let hero;
  // todo - use from hero/tower class properties
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
  let enemySpawnX: number;
  let enemySpawnY: number;
  let enemyProjectileCollided = [];
  let projectiles = [];
  let buildAreas = [];
  let enemies = [];
  let enemyVelocity = 1;
  let enemiesToSpawn = 0;
  let currentWave = 0;
  let waveEnded = true;
  let score = 0;
  let animationId: number;
  let spawnEnemiesInterval;
  onMount(() => {
    //@ts-ignore

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  });
  let towerSelectedUpgrades;
  let pathKeys;
  $: if (towerSelected) {
    towerSelectedUpgrades = towerUpgrades[towerSelected.properties.fireMode];
    pathKeys = Object.keys(towerSelected.properties.paths);
  }
  class Ball {
    x: number;
    y: number;
    radius: number;
    color: string;
    speedX: number;
    speedY: number;
    //  needs typing
    properties: {
      damage: number;
      pierce: number;
      range: number;
      //todo - projSize: 10,
      //todo - projNum: 3,
      // todo - projSpeed (multiplying when calcVelocity is used)
      fireMode: string;
      fireInterval: number;
      paths: {
        a: number;
        b: number;
        c: number;
      };
    };
    enInRange: number | string;
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

  // todo - rename and add constructor params for color/health, speed, and other properties etc
  // Enemy class
  class Bloon extends Ball {
    constructor(x, y, radius, color, velocity) {
      super(x, y, radius, color, {});
      //@ts-ignore
      this.velocity = velocity;
      //? used as index number to calc velocity to the next trackpoint
      //@ts-ignore
      this.trackPoint = 0;
      //@ts-ignore
      this.health = bloonHealth[color];
    }

    update() {
      this.draw();
      //@ts-ignore
      this.x = this.x + this.velocity.x;
      //@ts-ignore

      this.y = this.y + this.velocity.y;
    }
  }

  // todo - add properties param for health, damage
  class Shot extends Ball {
    velocity: Velocity;
    collided: [];
    constructor(x, y, radius, color, velocity, properties) {
      super(x, y, radius, color, properties);
      this.velocity = velocity;
      this.collided = [];
    }

    update() {
      this.draw();
      this.x = this.x + this.velocity.x;
      this.y = this.y + this.velocity.y;
    }
  }

  class BuildArea {
    x: number;
    y: number;
    radius: number;
    color: string;
    constructor(x, y, radius) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.color = "#6C9A8B";
    }
    draw() {
      c.beginPath();
      c.arc(this.x, this.y, this.radius, Math.PI * 2, 0, false);
      c.fillStyle = this.color;
      c.fill();
    }
  }
  // todo - check for collision with hero
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
    c.lineWidth = 40;
    c.lineJoin = "round";
    c.strokeStyle = "rgb(96, 64, 32)";
    c.beginPath();
    c.moveTo(enemySpawnX, enemySpawnY);
    //@ts-ignore
    trackPoints.forEach((t, tIndex) => {
      //@ts-ignore
      c.lineTo(trackPoints[tIndex].x, trackPoints[tIndex].y);
    });
    c.stroke();
  }
  function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }
  function startGame(gameDifficulty: string) {
    // todo - set bloon speed, and select correct waveEnemies constants
    // todo - move currentWave to init and test
    playing = true;

    canvas.addEventListener("mousemove", handleMouseMove);
    init(gameDifficulty);
    animate();
    // prepareGameEl.style.display = "none";
    // overlay.style.display = "flex";
  }
  function init(gameDifficultyStr: string) {
    if (!gameDifficultyStr) {
      return;
    }
    //todo - need to reset some missing vars here
    towers = [];
    towerIntervals = [];
    buildAreas = [];
    projectiles = [];
    enemies = [];
    //@ts-ignore
    c = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    enemySpawnX = canvas.width / 1.5;
    enemySpawnY = 0;
    trackPoints = [
      { x: canvas.width / 2, y: canvas.height / 4 },
      { x: canvas.width / 1.5, y: canvas.height / 2 },
      { x: canvas.width / 4, y: canvas.height / 1.5 },
    ];
    x = canvas.width / 2;
    y = canvas.height / 2;
    //   towerPrices = allTowerPrices[gameDifficultyStr];

    //todo - use constants for gameDifficulty & change map accordingly also
    if (gameDifficultyStr === "easy") {
      console.log("starting?S");
      points = 800;
      trackPoints = [
        { x: canvas.width / 2, y: canvas.height / 4 },
        { x: canvas.width / 1.5, y: canvas.height / 2 },
        { x: canvas.width / 4, y: canvas.height / 1.5 },
        { x: canvas.width / 3, y: canvas.height / 4 },
      ];
      buildAreas.push(
        new BuildArea(trackPoints[0].x + 175, trackPoints[0].y, 75),
        new BuildArea(trackPoints[0].x - 25, trackPoints[0].y + 125, 75),
        new BuildArea(trackPoints[2].x, trackPoints[2].y + 100, 75)
      );
    } else if (gameDifficultyStr === "medium") {
      points = 650;
      trackPoints = [
        { x: canvas.width / 2, y: canvas.height / 4 },
        { x: canvas.width / 1.5, y: canvas.height / 2 },
        { x: canvas.width / 4, y: canvas.height / 1.5 },
      ];
      buildAreas.push(
        new BuildArea(trackPoints[0].x + 175, trackPoints[0].y, 75),
        new BuildArea(trackPoints[0].x, trackPoints[0].y + 75 * 2, 75),
        new BuildArea(trackPoints[0].x - 75, trackPoints[2].y + 75, 75)
      );
    } else if (gameDifficultyStr === "hard") {
      points = 500;
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
  //? Spawns enemies at start of track
  function spawnEnemies() {
    //? Spawn a enemy every spawnTime
    spawnEnemiesInterval = setTimeout(() => {
      const radius = 12.5;
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

  //? Dirty function - I am not good enough at maths to make this beautiful
  //? i just return a hard coded array for whatever a spray tower is upgraded to.

  function calcSprayProjectiles(t) {
    let circum = 2 * Math.PI * t.radius;
    console.log(circum);
    //? the stock sprayer
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
      //? Set velocity.
      const retArr = velArr.map((v) => {
        return {
          x: (v.x *= 5),
          y: (v.y *= 5),
        };
      });
      return retArr;
    }
    //? first upgrade, and so on
    if (t.properties.paths.c === 0) {
      let tenthPerc = circum / 10;
      let velArr = [
        //? north and south
        calculateVelocity(t.x, t.y, t.x, t.y - 5),
        calculateVelocity(t.x, t.y, t.x, t.y + 5),
        //? top right
        calculateVelocity(t.x, t.y, t.x + tenthPerc, t.y - 5),
        //? just below top right
        calculateVelocity(t.x, t.y, t.x + 5, t.y - tenthPerc),
        //? just above bottom right
        calculateVelocity(t.x, t.y, t.x + 5, t.y + tenthPerc),
        //? bottom right
        calculateVelocity(t.x, t.y, t.x + tenthPerc, t.y + 5),
        //? bottom left
        calculateVelocity(t.x, t.y, t.x - tenthPerc, t.y + 5),
        //? just above bottom left
        calculateVelocity(t.x, t.y, t.x - 5, t.y + tenthPerc),
        //? just below top left
        calculateVelocity(t.x, t.y, t.x - 5, t.y - tenthPerc),
        //? top left
        calculateVelocity(t.x, t.y, t.x - tenthPerc, t.y - 5),
      ];
      //? Set velocity.
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
      let vArr = calcSprayProjectiles(tower);
      let projs = [];

      for (const el of vArr) {
        projs.push(
          new Shot(tower.x, tower.y, 5, "rgba(150,150,150,1)", el, {
            pierce: tower.properties.pierce,
            damage: tower.properties.damage,
          })
        );
      }
      towerIntervals[towerIndex] = setTimeout(() => {
        projectiles.push(...projs);
        spawnTowerProjectiles(tower, towerIndex);
      }, tower.properties.fireInterval);
    } else if (tower.properties.fireMode === "auto") {
      towerIntervals[towerIndex] = setTimeout(function () {
        let v = calculateVelocity(
          tower.x,
          tower.y,
          enemies[tower.enInRange].x,
          enemies[tower.enInRange].y
        );
        v.x *= 7.5;
        v.y *= 7.5;

        projectiles.push(
          new Shot(tower.x, tower.y, 5, "red", v, {
            pierce: tower.properties.pierce,
            damage: tower.properties.damage,
          })
        );
        spawnTowerProjectiles(tower, towerIndex);
      }, tower.properties.fireInterval);
    }
  }
  function spawnHeroProjectiles() {
    const dist = Math.hypot(mouseX - hero.x, mouseY - hero.y);
    let rand = getRandomArbitrary(0 - dist / 8, 0 + dist / 8);
    heroInterval = setTimeout(() => {
      let x = hero.x;
      let y = hero.y;
      let v = calculateVelocity(hero.x, hero.y, mouseX + rand, mouseY + rand);
      v.x *= 5.5;
      v.y *= 5.5;

      projectiles.push(new Shot(x, y, 5, "rgb(178, 142, 59)", v, 1));
      spawnHeroProjectiles();
    }, hero.properties.fireInterval);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = "rgb(17, 34, 17)";
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
    if (enemies.length + enemiesToSpawn === 0 && waveEnded === false) {
      waveEnded = true;
      points += 100;
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
        //? When Projectiles touch Enemies
        if (dist - enemy.radius - projectile.radius < 0) {
          let allColors = Object.keys(bloonHealth);
          //? Push enemy to collided array to avoid collision in next frame
          projectile.collided.push(enemy);
          projectile.health--;
          if (enemy.health - projectile.damage > 0) {
            enemy.health -= projectile.damage;
            enemy.color = allColors[enemy.health - 1];
          } else {
            //handle enemy kill
            points += 1;

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
      if (enemies.length > 0) {
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
          console.log(enemiesInRange);
          spawnTowerProjectiles(tower, towerIndex);
        } else if (enemiesInRange === 0) {
          clearInterval(towerIntervals[towerIndex]);
          //? importantly set the interval to false so it cant be cleared again when this condition is met
          towerIntervals[towerIndex] = false;
        }
      } else {
        clearInterval(towerIntervals[towerIndex]);
        //? importantly set the interval to false so it cant be cleared again when this condition is met
        towerIntervals[towerIndex] = false;
      }
    });
  }
  function startWave() {
    //? return so that this code cannot be ran when there are still current enemies
    if (!waveEnded) {
      return;
    }

    // todo - dont think i need this

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
    waveEnded = false;
  }
  //? When a hero button is clicked
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
      range: 0,
      fireMode: fireModeArg,
      fireInterval: 375,
    };
    towerPurchased = new Ball(mouseX, mouseY, 25, "#fff", obj);
    towerPlacing = true;
    canvas.addEventListener("click", heroPlaced);
  }

  //*
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

    //? if a tower is already being placed, assume the user wants to cancel
    if (towerPlacing) {
      towerPurchased = {};
      towerPlacing = false;
      return;
    }

    let obj = {
      damage: 1,
      pierce: 1,
      range: fireModeArg === "spray" ? 110 : 150,
      //todo - projSize: 10,
      //todo - projNum: 3,
      // todo - projSpeed (multiplying when calcVelocity is used)
      fireMode: fireModeArg,
      fireInterval: 350,
      paths: {
        a: -1,
        b: -1,
        c: -1,
      },
    };

    //? not enough points? return
    if (points < towerPrices[obj.fireMode]) {
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
    if (!canBuild) return;
    let heroCollided;
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
    //todo - withdraw points, think about correct order of line calls here

    canvas.removeEventListener("click", towerPlaced);
    points -= towerPrices[towerPurchased.properties.fireMode];
    towerPlacing = false;
    towerPurchased = {};
  }

  function towerButtonClicked(tIndex: number) {
    towerSelected = towers[tIndex];
    towerSelecting = !towerSelecting;
    //todo - do the upgrade
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
  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
</script>

<div>
  {#if !playing}
    <div id="prepareGame">
      <button style="color: red;" on:click={() => startGame("medium")}>
        Start Game</button
      >
    </div>
  {:else}
    <div id="overlay">
      <p>
        Points:
        <span class="ml-1" id="pointsEl">{points}</span>
      </p>
      <p>
        Health:
        <span class="ml-1" id="healthEl">{health}</span>
      </p>
      <p>
        Wave:
        <span class="ml-1" id="waveEl">{currentWave}</span>
      </p>
      <div class="buttonGroup">
        <button disabled={hero} on:click={() => handleHeroSelect("point")}>
          Select Point Shooter Hero
        </button>
        <button disabled>Heli Coming Soon</button>
        <button on:click={() => handleTowerSelect("spray")}
          >Select Sprayer</button
        >
        <button on:click={() => handleTowerSelect("auto")}
          >Select Auto Shooter</button
        >
      </div>
      <button on:click={() => startWave()}> Start Wave </button>
      <div id="towerControls" class="towerButtons">
        <div id="currentTowers" style="display: flex; flex-direction: column">
          <p>Current Towers:</p>

          {#if towers.length > 0}
            {#each towers as t, i}
              <button on:click={() => towerButtonClicked(i)}>
                tower {towers.length}
                {t.properties.fireMode}
              </button>
            {/each}
          {/if}
        </div>
        <div style="display: flex; flex-direction: column">
          <p>Upgrades:</p>
          <div
            id="towerUpgradeButtons"
            style="display: flex; flex-direction: column; max-width: 200px"
          >
            {#if towerSelecting}
              {#each pathKeys as pKey}
                <button>{pKey}</button>
              {/each}
            {/if}
          </div>
        </div>
      </div>
    </div>
  {/if}
  <canvas bind:this={canvas} />
</div>
<svelte:window on:resize|passive={handleResize} />

<style>
  canvas {
    width: 100%;
    height: 100%;
    overflow: hidden;
    background-color: rgb(17, 34, 17);
  }
  #prepareGame {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    text-align: center;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
  }

  /*? overlay in-game element */
  #overlay {
    position: fixed;
    display: flex;
    flex-direction: column;
    column-gap: 12px;
    padding: 5px;
    z-index: 99;
    color: var(--primary-color);
    background-color: #d6d6d6;
    font-size: 32px;
    border-radius: 0.75rem;
    user-select: none;
    /*cant figure out why it creates a pointer */
    cursor: default;
  }

  #overlay p {
    display: inline-block;
  }

  #overlay .buttonGroup {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 0.5rem;
    font-size: 22px;
  }
  #overlay .towerButtons {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-top: 0.5rem;
    font-size: 16px;
  }
  #overlay button {
    width: 100%;
    color: white;
    cursor: pointer;
    border-radius: 0.5rem;
    border: none;
    padding: 0.75rem;
    background: var(--primary-color);
    font-size: inherit;
    box-sizing: border-box;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    transition: all 0.2s ease;
  }

  #overlay button:hover {
    background: #320000;
    border-radius: 0.25rem;
    box-shadow: 0px 0px 6px var(--primary-color);
  }

  #overlay button:active {
    transform: scale(0.9);
  }

  #overlay button:disabled {
    background: #320000;
    cursor: not-allowed;
  }
</style>
