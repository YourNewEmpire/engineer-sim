//? Calculate Velocity from center(x, y) to (x1,y1)
function calculateVelocity(x, y, x1, y1) {
  const angle = Math.atan2(y1 - y, x1 - x);
  const velocity = {
    x: Math.cos(angle),
    y: Math.sin(angle),
  };

  return velocity;
}
export { calculateVelocity };
