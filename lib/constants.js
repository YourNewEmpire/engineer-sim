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
        name: "Faster Firing",
        desc: "shoots 50ms faster",
        price: 350,
        payload: {
          fireInterval: 300,
        },
      },
      {
        name: "Even Faster Firing",
        desc: "ok, this is fast",
        price: 500,
        payload: {
          fireInterval: 225,
        },
      },
      {
        name: "Hot Shots",
        desc: "Shots have massive pierce and deal more",
        price: 750,
        payload: {
          damage: 2,
          pierce: 3,
        },
      },
    ],

    b: [
      {
        name: "Improved Radar",
        desc: "Increased detection range",
        price: 100,
        payload: {
          range: 150,
        },
      },
      {
        name: "Scout Sprayer",
        desc: "Considerable range increase",
        price: 150,
        payload: {
          range: 200,
        },
      },
      {
        name: "Sniper Sprayer",
        desc: "This a big radar now..",
        price: 800,
        payload: {
          range: 300,
        },
      },
    ],
    c: [
      {
        name: "More Shots",
        desc: "Shoots 10 instead of 8",
        price: 140,
        payload: {},
      },
      // {
      //   name: "King Sprayer",
      //   desc: "Shoots 12",
      //   price: 300,
      //   payload: {},
      // },
    ],
  },
  auto: {
    a: [
      {
        name: "Sharper Shots",
        desc: "Can pierce 1 more enemy",
        price: 100,
        payload: {
          pierce: 2,
        },
      },
      {
        name: "Even Sharper Shots",
        desc: "Another pierce +1",
        price: 175,
        payload: {
          pierce: 3,
        },
      },
      {
        name: "AP Pellets",
        desc: "massive 5 pierce and damage increase",
        price: 440,
        payload: {
          pierce: 5,
          damage: 2,
        },
      },
    ],
    b: [
      {
        name: "Faster Firing",
        desc: "Shoots slightly faster",
        price: 150,
        payload: {
          fireInterval: 300,
        },
      },
      {
        name: "Semi Auto",
        desc: "shoots 1.5 times faster",
        price: 300,
        payload: {
          fireInterval: 200,
        },
      },
      {
        name: "Machine Gun Sentry",
        desc: "shoots 1.5 times faster",
        price: 425,
        payload: {
          fireInterval: 150,
        },
      },
    ],
    c: [
      {
        name: "Improved Radar",
        desc: "Increased detection range",
        price: 100,
        payload: {
          range: 200,
        },
      },
      {
        name: "Military Radar",
        desc: "Considerable range increase",
        price: 150,
        payload: {
          range: 275,
        },
      },
      // todo - set for map wide
      {
        name: "Sniper Sentry",
        desc: "Assassinates presidents regularly",
        price: 800,
        payload: {
          range: 450,
        },
      },
    ],
  },
};
const allTowerPrices = {
  easy: {
    auto: 200,
    spray: 150,
  },
  medium: {
    auto: 350,
    spray: 300,
  },
  hard: { auto: 450, spray: 400 },
};
//const towerSpaces = {};
export { waveEnemies, towerUpgrades, allTowerPrices };
