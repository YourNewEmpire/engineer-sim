const waveEnemies = [
  // todo - think about an array per difficulty
  {
    spawnTime: 300,

    enemies: ["blue", "blue"].reverse(),
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
    spawnTime: 30,

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
    ].reverse(),
  },
];

const towerUpgrades = {
  spray: {
    a: [
      {
        name: "faster firing",
        desc: "shoots 1.5 times faster",
        price: 100,
      },
      {
        name: "even faster shots",
        desc: "shoots 2x as fast",
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

//const towerSpaces = {};
export { waveEnemies, towerUpgrades };
