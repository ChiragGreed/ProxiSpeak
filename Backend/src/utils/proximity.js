const PROXIMITY_RADIUS = 100;

export const isWithinProximity = (userA, userB) => {
  if (
    userA.x == null ||
    userA.y == null ||
    userB.x == null ||
    userB.y == null
  ) {
    return false;
  }

  const dx = userA.x - userB.x;
  const dy = userA.y - userB.y;

  const distanceSquared = dx * dx + dy * dy;

  return distanceSquared <= PROXIMITY_RADIUS * PROXIMITY_RADIUS;
};

export default PROXIMITY_RADIUS;