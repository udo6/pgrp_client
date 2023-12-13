import alt from 'alt-client';
import game from 'natives';

export const getRaycastResult = (range: number = 8): [number, boolean, alt.Vector3, alt.Vector3, number] => {
  const position = game.getGameplayCamCoord()
  const direction = getDirection(game.getGameplayCamRot(2))
  const away = new alt.Vector3(
    direction.x * range + position.x,
    direction.y * range + position.y,
    direction.z * range + position.z
  );

  const raycast = game.startExpensiveSynchronousShapeTestLosProbe(
    position.x,
    position.y,
    position.z,
    away.x,
    away.y,
    away.z,
    4294967295,
    alt.Player.local.scriptID,
    4
  );

  return game.getShapeTestResult(raycast);
}

export const getEntity = (range: number = 8): number | null => {
  const position = game.getGameplayCamCoord();
  const direction = getDirection(game.getGameplayCamRot(2));
  const away = new alt.Vector3(
    direction.x * range + position.x,
    direction.y * range + position.y,
    direction.z * range + position.z
  );

  const raycast = game.startExpensiveSynchronousShapeTestLosProbe(
    position.x,
    position.y,
    position.z,
    away.x,
    away.y,
    away.z,
    4294967295, //vehicles 2, peds 8, object 16
    alt.Player.local.scriptID,
    4
  );

  const [_, hasHit, endCoords, surfaceNormal, entity] = game.getShapeTestResult(raycast);

  return hasHit ? entity : null;
}

export const getDirection = (rotation: alt.Vector3): alt.Vector3 => {
  const z = rotation.z * (Math.PI / 180.0);
  const x = rotation.x * (Math.PI / 180.0);
  const num = Math.abs(Math.cos(x));

  return new alt.Vector3(
    (-Math.sin(z) * num),
    (Math.cos(z) * num),
    Math.sin(x)
  );
}