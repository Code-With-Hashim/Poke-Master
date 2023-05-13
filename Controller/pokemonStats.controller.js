const axios = require('axios')

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

function mainPokemonStats(baseStats, IVs, EVs, level, nature) {
  const stats = {};

  stats.totalhp = calculateHP(baseStats.hp, IVs.hp, EVs.hp, level, nature);
  stats.currenthp = stats.totalhp,
  stats.attack = calculateAttack(
    baseStats.attack,
    IVs.attack,
    EVs.attack,
    level,
    nature
  );
  stats.defense = calculateDef(
    baseStats.defense,
    IVs.defense,
    EVs.defense,
    level,
    nature
  );
  stats.specialAttack = calculateSpecialAttack(
    baseStats.specialAttack,
    IVs.specialAttack,
    EVs.specialAttack,
    nature,
    level
  );
  stats.specialDefense = calculateSpecialDefense(
    baseStats.specialDefense,
    IVs.specialDefense,
    EVs.specialDefense,
    nature,
    level
  );
  stats.speed = calculateSpeed(
    baseStats.speed,
    IVs.speed,
    EVs.speed,
    nature,
    level
  );

  return stats;
}

async function calculateDamage(attacker, defender , Power , moveType ) {
  const Level = attacker.level; // Set the Pokémon's level
  // const Power = attacker.moves[1].power; // Set the power of the move
  const Attack = attacker.stats.attack; // Get the attacker's Attack stat
  const Defense = defender.stats.defense; // Get the defender's Defense stat
  const SpA = attacker.stats.specialAttack; // Get the attacker's Special Attack stat
  const SpD = defender.stats.specialDefense; //
  const attackerType1 = attacker.type[0];
  const attackerType2 = attacker.type[1];
  const defenderType = defender.type[0];
  // const moveType = attacker.moves[1].type;

  const Modifier1 = await calculateModifier(
    attackerType1,
    defenderType,
    moveType
  );
  const Modifier2 =
    (await attackerType2) &&
    calculateModifier(attackerType2, defenderType, moveType);

  const baseDamagePhysical =
    (((2 * Level) / 5 + 2) * Power * (Attack / Defense)) / 50 + 2;
  const baseSpecialDamage =
    (((2 * Level) / 5 + 2) * Power * (SpA / SpD)) / 50 + 2;
  const PhysicalDamage1 = Math.floor(baseDamagePhysical * Modifier1.modifier);
  const PhysicalDamage2 =
    Modifier2 && Math.floor(baseDamagePhysical * Modifier2.modifier);
  const SpecialDamage1 = Math.floor(baseSpecialDamage * Modifier1.modifier);
  const SpecialDamage2 = Modifier2 && Math.floor(baseSpecialDamage * Modifier2).modifier;

  const finalPhysicalDamage = PhysicalDamage2
    ? Math.max(PhysicalDamage1, PhysicalDamage2)
    : PhysicalDamage1;
  const finalSpecialDamage = SpecialDamage2
    ? Math.max(SpecialDamage1, SpecialDamage2)
    : SpecialDamage1;

  const isPhysicalMove = true; // Placeholder variable, replace with your move's category check

  // If the move is a physical move, use the PhysicalDamage value
  // If the move is a special move, use the SpecialDamage value
  const Damage = isPhysicalMove ? finalPhysicalDamage : finalSpecialDamage;
  let message = ""
  
  if(isPhysicalMove) {
     message = finalPhysicalDamage == PhysicalDamage1 ? Modifier1.message : Modifier2.message
  } else {
     message = finalSpecialDamage == SpecialDamage1 ? Modifier1.message : Modifier2.message
    
  }

  return {
    Damage,
    message
  }
}

async function calculateModifier(attackerType, defenderType, moveType) {
  
   let message = ''
  
  try {
    // Fetch the attacker's type data
    const attackerTypeResponse = await axios.get(
      `https://pokeapi.co/api/v2/type/${attackerType}`
    );
    const attackerDamageRelations = attackerTypeResponse.data.damage_relations;

    // Fetch the defender's type data
    const defenderTypeResponse = await axios.get(
      `https://pokeapi.co/api/v2/type/${defenderType}`
    );
    const defenderDamageRelations = defenderTypeResponse.data.damage_relations;

    // Determine the move's effectiveness against the defender's type
    let effectiveness = 1;

    // Check if the move is super effective against the defender's type
    if (
      defenderDamageRelations.double_damage_from.some(
        (type) => type.name === moveType
      )
    ) {
      effectiveness *= 2;
      message+="It's Super Effective"
    }

    // Check if the move is not very effective against the defender's type
    if (
      defenderDamageRelations.half_damage_from.some(
        (type) => type.name === moveType
      )
    ) {
      effectiveness *= 0.5;
      message+="It's not very Effective"
    }

    // Check if the move has no effect on the defender's type
    if (
      defenderDamageRelations.no_damage_from.some(
        (type) => type.name === moveType
      )
    ) {
      effectiveness *= 0;
      message+="It's not Effective"
    }

    if(message.length === 0) {
      message+="It's normal Effective"
    }
    // Check if the move is of the same type as the attacker
    const isSTAB = attackerType === moveType;

    // Calculate the final modifier
    const randomVariation = Math.random() * (1.0 - 0.85) + 0.85;
    const stabModifier = isSTAB ? 1.5 : 1;
    const criticalHitModifier = 1;
    // isCriticalHit ? 2 : 1;
    const modifier =
      effectiveness * criticalHitModifier * randomVariation * stabModifier;
      
      
    return {modifier , message};
  } catch (error) {
    console.log("Error:", error.message);
  }
}

module.exports = {
  calculateDamage,
  mainPokemonStats,
};
