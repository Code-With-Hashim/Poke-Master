const axios = require('axios');
const { userPokeModal } = require('../model/userPoke');
const { mainPokemonStats } = require('./pokemonStats.controller');
const { getBaseStats, generateIVs, generateNat, getMoves, getTypes, getExperience } = require("./user.controller");


  const baseStats = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

function generateEVs() {
    return {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0
}
}


async function battle(bot, query) {
  const userId = query.from.id
  const pokemonName = query.data.trim().split(" ")[1];
  const pokeLvl = query.data.trim().split(" ").map(Number)[2];

  const pokeDetail = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  
  const opponentPokemon = await getOpponentPokemon(pokeDetail , pokeLvl , pokemonName)
  const trainerPokemon = await getTrainerPokemon(userId)
  
  const Damage1 = calculateDamage(trainerPokemon , opponentPokemon)
  
   
   
  //  console.log(opponentPokemon)
    
  // console.log(hp , attack , defense , Damage1)
  //  console.log(Damage1 , Damage2)
}

async function calculateDamage(attacker, defender) {
 
const Level = attacker.level; // Set the Pokémon's level
const Power = attacker.moves[1].power; // Set the power of the move
const Attack = attacker.stats.attack; // Get the attacker's Attack stat
const Defense = defender.stats.defense; // Get the defender's Defense stat
const SpA = attacker.stats.specialAttack; // Get the attacker's Special Attack stat
const SpD = defender.stats.specialDefense; // 
const attackerType1 = attacker.type[0]
const  attackerType2 = attacker.type[1]
const defenderType = defender.type[0].type.name
const moveType = attacker.moves[1].type
  
   const Modifier1 = await calculateModifier(attackerType1, defenderType, moveType)
   const Modifier2 = await attackerType2 && calculateModifier(attackerType2, defenderType, moveType) 
   
   const baseDamagePhysical = (((2 * Level / 5 + 2) * Power * (Attack / Defense) / 50) + 2)
   const baseSpecialDamage = (((2 * Level / 5 + 2) * Power * (SpA / SpD) / 50) + 2)
  const PhysicalDamage1 = Math.floor(baseDamagePhysical * Modifier1)
  const PhysicalDamage2 = Modifier2 && Math.floor(baseDamagePhysical * Modifier2)
  const SpecialDamage1 = Math.floor( baseSpecialDamage * Modifier1);
  const SpecialDamage2 = Modifier2 && Math.floor( baseSpecialDamage * Modifier2);
  
  
  const finalPhysicalDamage = PhysicalDamage2 ? Math.max(PhysicalDamage1 , PhysicalDamage2) : PhysicalDamage1
  const finalSpecialDamage = SpecialDamage2 ? Math.max(SpecialDamage1 , SpecialDamage2) : SpecialDamage1
  
 
 const isPhysicalMove = true; // Placeholder variable, replace with your move's category check

// If the move is a physical move, use the PhysicalDamage value
// If the move is a special move, use the SpecialDamage value
const Damage = isPhysicalMove ? finalPhysicalDamage : finalSpecialDamage;
 
 console.log(Damage)
 return Damage

}


async function calculateModifier(attackerType, defenderType, moveType) {
  
  console.log(attackerType ,)
  
  try {
    // Fetch the attacker's type data
    const attackerTypeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${attackerType}`);
    const attackerDamageRelations = attackerTypeResponse.data.damage_relations;

    // Fetch the defender's type data
    const defenderTypeResponse = await axios.get(`https://pokeapi.co/api/v2/type/${defenderType}`);
    const defenderDamageRelations = defenderTypeResponse.data.damage_relations;

    // Determine the move's effectiveness against the defender's type
    let effectiveness = 1;

    // Check if the move is super effective against the defender's type
    if (defenderDamageRelations.double_damage_from.some((type) => type.name === moveType)) {
      effectiveness *= 2;
      console.log( 'Super Effective' , effectiveness)
    }

    // Check if the move is not very effective against the defender's type
    if (defenderDamageRelations.half_damage_from.some((type) => type.name === moveType)) {
      effectiveness *= 0.5;
      console.log( 'very effect' , effectiveness)
      
    }

    // Check if the move has no effect on the defender's type
    if (defenderDamageRelations.no_damage_from.some((type) => type.name === moveType)) {
      effectiveness *= 0;
      console.log( 'No Effect' , effectiveness)
    }

    // Check if the move is of the same type as the attacker
    const isSTAB = attackerType === moveType;
    const stabModifier = isSTAB ? 1.5 : 1;

    // Calculate the final modifier
    console.log(stabModifier)
    const modifier = effectiveness * stabModifier;

    return modifier;
  } catch (error) {
    console.log('Error:', error.message);
  }
}

async function getTrainerPokemon(userId) {
  
    const pokeDetail = await userPokeModal.findOne({trainer : userId})
  
     const level = pokeDetail.level
     const pokeMoves = pokeDetail.moves;
      const types = pokeDetail.type;
      const abilities = pokeDetail.abilities;
      const baseStats = pokeDetail.baseStats;
      const pokeEVs = pokeDetail.ev
      const experience = pokeDetail.experience
      const pokeNat = pokeDetail.nature
      const pokeIVs = pokeDetail.iv
      
  const mainStats = mainPokemonStats(baseStats , pokeIVs , pokeEVs , level , pokeNat)
  
   const myPokemon = {
      level,
      type : types,
      stats : mainStats,
      moves : pokeMoves,
   }
    
    return myPokemon
    
  
}

async function getOpponentPokemon(pokeDetail , pokeLvl , pokemonName) {
  
      const moves = pokeDetail.data.moves;
      const types = pokeDetail.data.types;
      const abilities = pokeDetail.data.abilities;
      const stats = pokeDetail.data.stats;
      

  const pokeTypes = getTypes(types);
  const pokeMoves = await getMoves(moves, pokeLvl);
  // const pokeAbilities = await getAbilites(abilities);
  const pokeBaseStats = getBaseStats(stats);
  const pokeNat = await generateNat();
  const pokeIVs = generateIVs();
  const pokeEVs = generateEVs()
  const pokeExp = await getExperience(pokeLvl, pokemonName);
  const mainStats = mainPokemonStats(pokeBaseStats , pokeIVs , pokeEVs , pokeLvl , pokeNat)
  
   const BattlePokemon = {
      level : pokeLvl,
      type : types,
      stats : mainStats,
      moves : pokeMoves,
      
   }
   
   return BattlePokemon
}

module.exports = { battle };
