function calculateHP(baseHP, IV, EV, level) {
  const hp = Math.floor(
    ((2 * baseHP + IV + EV / 4) * level) / 100 + level + 10
  );
  return hp;
}
function calculateAttack(BaseAttack, IV, EV, Level, nature) {
  let natureModifer = 1;

  if (nature.attack && nature.attack > 1) {
    natureModifer += nature.attack / 100;
  } else if (nature.attack && nature.attack < 0) {
    natureModifer += nature.attack / 100;
  }

  const Attack =
    (((2 * BaseAttack + IV + EV / 4) * Level) / 100 + 5) * natureModifer;

  return +Attack.toFixed();
}

function calculateDef(BaseDefense, IV, EV, Level, nature) {
  let natureModifer = 1;

  if (nature.defense && nature.defense > 1) {
    natureModifer += nature.defense / 100;
  } else if (nature.defense && nature.defense < 0) {
    natureModifer += nature.defense / 100;
  }

  const Defense =
    Math.floor(((2 * BaseDefense + IV + EV / 4) * Level) / 100 + 5) *
    natureModifer;

  return +Defense.toFixed();
}

function calculateSpecialAttack(baseSpecialAttack, IV, EV, nature, level) {
  let natureModifer = 1;

  if (nature.specialAttack && nature.specialAttack > 1) {
    natureModifer += nature.specialAttack / 100;
  } else if (nature.specialAttack && nature.specialAttack < 0) {
    natureModifer += nature.specialAttack / 100;
  }

  const stat =
    Math.floor(
      ((2 * baseSpecialAttack + IV + Math.floor(EV / 4)) * level) / 100 + 5
    ) * natureModifer;
  return +stat.toFixed();
}

function calculateSpecialDefense(baseSpecialDefense, IV, EV, nature, level) {
  let natureModifer = 1;

  if (nature.specialDefense && nature.specialDefense > 1) {
    natureModifer += nature.specialDefense / 100;
  } else if (nature.specialDefense && nature.specialDefense < 0) {
    natureModifer += nature.specialDefense / 100;
  }
  const stat =
    Math.floor(
      ((2 * baseSpecialDefense + IV + Math.floor(EV / 4)) * level) / 100 + 5
    ) * natureModifer;
  return stat;
}

function calculateSpeed(baseSpeed, IV, EV, nature, level) {
  let natureModifer = 1;

  if (nature.speed && nature.speed > 1) {
    natureModifer += nature.speed / 100;
  } else if (nature.speed && nature.speed < 0) {
    natureModifer += nature.speed / 100;
  }
  const speed =
    Math.floor(
      ((2 * baseSpeed + IV + Math.floor(EV / 4)) * natureModifer * level) / 100
    ) + 5;
  return speed;
}

function mainPokemonStats(baseStats , IVs , EVs , level , nature) {
  const stats = {}

  stats.hp = calculateHP(baseStats.hp , IVs.hp , EVs.hp , level , nature)
  stats.attack = calculateAttack(baseStats.attack , IVs.attack , EVs.attack , level , nature)
  stats.defense = calculateDef(baseStats.defense , IVs.defense , EVs.defense , level , nature)
  stats.specialAttack = calculateSpecialAttack(baseStats.specialAttack, IVs.specialAttack, EVs.specialAttack, nature, level)
  stats.specialDefense = calculateSpecialDefense(baseStats.specialDefense, IVs.specialDefense, EVs.specialDefense, nature, level)
  stats.speed = calculateSpeed(baseStats.speed, IVs.speed, EVs.speed, nature, level)

  return stats
}

module.exports = {
  calculateAttack,
  calculateDef,
  calculateHP,
  calculateSpecialAttack,
  calculateSpecialDefense,
  calculateSpeed,
  mainPokemonStats
};
