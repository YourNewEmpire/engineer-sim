const waveEnemies = [
  // todo - think about an array per difficulty
  {
    spawnTime: 300,

    enemies: ["red", "red", "red", "red", "blue"].reverse(),
  },
  {
    spawnTime: 250,

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
    spawnTime: 200,

    enemies: ["blue", "blue", "blue", "blue", "blue", "green"].reverse(),
  },
  {
    spawnTime: 200,

    enemies: ["green", "green", "green", "green", "green", "green"].reverse(),
  },
  {
    spawnTime: 200,

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
    spawnTime: 125,

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
    spawnTime: 100,

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
    spawnTime: 100,

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
    spawnTime: 75,

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
        desc: "shoots 10 instead of 8",
        price: 120,
        payload: {},
      },
      // {
      //   name: "even more shots",
      //   desc: "shoots 12",
      //   price: 150,
      //   payload: {},
      // },
      // {
      //   name: "more shots",
      //   desc: "shoots 16 shots",
      //   price: 400,
      //   payload: {},
      // },
    ],
  },
  auto: {
    a: [
      {
        name: "sharper shots",
        desc: "can pierce 1 more enemy",
        price: 100,
        payload: {
          pierce: 2,
        },
      },
      {
        name: "even sharper shots",
        desc: "another pierce +1",
        price: 175,
        payload: {
          pierce: 3,
        },
      },
      {
        name: "AP sharts",
        desc: "massive 5 pierce",
        price: 440,
        payload: {
          pierce: 5,
          damage: 2,
        },
      },
    ],
    b: [
      {
        name: "faster firing",
        desc: "shoots 1.5 times faster",
        price: 150,
        payload: {
          fireInterval: 300,
        },
      },
      {
        name: "even faster firing",
        desc: "shoots 1.5 times faster",
        price: 200,
        payload: {
          fireInterval: 200,
        },
      },
      {
        name: "auto machine gun",
        desc: "shoots 1.5 times faster",
        price: 250,
        payload: {
          fireInterval: 150,
        },
      },
    ],
    c: [
      {
        name: "longer range",
        desc: "shoots 1.5 times faster",
        price: 100,
        payload: {
          range: 200,
        },
      },
      {
        name: "even longer range",
        desc: "shoots 1.5 times faster",
        price: 150,
        payload: {
          range: 250,
        },
      },
      {
        name: "auto sniper",
        desc: "shoots 1.5 times faster",
        price: 150,
        payload: {
          range: 300,
        },
      },
    ],
  },
};
const sprayProjectiles = [];
//const towerSpaces = {};
export { waveEnemies, towerUpgrades };
