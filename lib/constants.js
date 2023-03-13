const waveEnemies = [
  // todo - think about an array per difficulty
  {
    spawnTime: 300,

    enemies: [
      "blue",
      "blue",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
    ].reverse(),
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
    ].reverse(),
  },
  {
    spawnTime: 100,

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
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
      "green",
    ].reverse(),
  },
];

const towerUpgrades = {
  spray: {
    a: [
      {
        name: "faster firing",
        desc: "shoots 50ms faster",
        price: 125,
        payload: {
          fireInterval: 300,
        },
      },
      {
        name: "even faster shots",
        desc: "shoots 2x as fast",
        price: 250,
        payload: {
          fireInterval: 225,
        },
      },
      {
        name: "more damage & pierce",
        desc: "shoots 2x as fast",
        price: 750,
        payload: {
          damage: 2,
          pierce: 3,
        },
      },
    ],

    b: [
      {
        name: "longer range",
        desc: "shoots 1.5 times faster",
        price: 100,
        payload: {
          range: 150,
        },
      },
      {
        name: "even longer range",
        desc: "shoots 1.5 times faster",
        price: 150,
        payload: {
          range: 200,
        },
      },
      {
        name: "sniper sprayer",
        desc: "shoots 1.5 times faster",
        price: 150,
        payload: {
          range: 300,
        },
      },
    ],
    c: [
      {
        name: "more shots",
        desc: "shoots 1.5 times faster",
        price: 150,
        payload: {},
      },
      {
        name: "more shots",
        desc: "shoots 1.5 times faster",
        price: 100,
        payload: {
          range: 300,
        },
      },
      {
        name: "more shots",
        desc: "shoots 1.5 times faster",
        price: 100,
        payload: {
          range: 300,
        },
      },
    ],
  },
  auto: {
    a: [
      {
        name: "sharper shots",
        desc: "can pierce 1 more enemy",
        price: 100,
      },
      {
        name: "even sharper shots",
        desc: "another pierce +1",
        price: 175,
      },
    ],

    b: [
      {
        name: "longer range",
        desc: "shoots 1.5 times faster",
        price: 100,
      },
    ],
    c: [
      {
        name: "more shots",
        desc: "shoots 1.5 times faster",
        price: 100,
      },
    ],
  },
};
const sprayProjectiles = [];
//const towerSpaces = {};
export { waveEnemies, towerUpgrades };
