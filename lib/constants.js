const waveEnemies = [
  // todo - think about an array per difficulty
  {
    spawnTime: 300,

    enemies: ["red", "blue", "blue"].reverse(),
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
const towerSpaces = {};
export { waveEnemies };
