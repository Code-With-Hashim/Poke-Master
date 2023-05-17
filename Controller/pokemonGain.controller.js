const axios = require("axios");
const { makeProperMoveName } = require("../Message Format/BattleMsg");
const {
  getCurrentPokemon,
  getGainPokeExp,
  getPokemonTrainerList,
  myPokemonTeam,
  gainEvsWild,
  gainEVstrainer,
  makeProperName,
} = require("./pokemon.controller");
const { getExperience } = require("./user.controller");

const gainExpwithWildPokemon = async (bot , query ,  wildPokemon, userId) => {
  const WildbaseExp = await getBaseExp(wildPokemon.name);
  let wildPokemonlevel = wildPokemon.level;
  const trainersPokemon = getPokemonTrainerList(userId);
  const partySize = checkPartySize(trainersPokemon);
  const selectPokemon = getCurrentPokemon(userId);
  let myPokecurrentExp = selectPokemon.experience;
  let myPokeLvl = selectPokemon.level;
  const mypokeId = selectPokemon.poke_id;
  const myPokemon = selectPokemon.name;
  const myPokeMove = selectPokemon.moves;
  const myexperienceGained = experienceGain(
    WildbaseExp,
    wildPokemonlevel,
    partySize
  );
  const pokemonGrowthName = await getGrowthRate(myPokemon);
  myPokecurrentExp += myexperienceGained;

  let expThreshold = getAnExp(pokemonGrowthName, myPokeLvl);

  while (myPokecurrentExp >= expThreshold) {
    myPokeLvl++;
    expThreshold = getAnExp(pokemonGrowthName, myPokeLvl);
  }
  myPokeLvl--;

  const poke_move_set = await getMoves(myPokemon, myPokeLvl);

  const uniqueMoves = poke_move_set.filter(
    (el) => !myPokeMove.some((obj) => obj.name === el.name)
  );
  

   if(uniqueMoves) {
     
     uniqueMoves.forEach((el) => {
       bot.sendMessage(query.message.chat.id , `Lv. ${el.level} ${myPokemon} learned <b>${makeProperMoveName(el.name)}</b>` , {
       parse_mode : 'HTML'
     })
     })
     
     
   }



  myPokeMove.push(...uniqueMoves);

  getGainPokeExp(userId, mypokeId, myPokeLvl, myPokecurrentExp, myPokeMove);
};

const wildExperienceGained = async (wildPokemon, userId) => {
  let wildPokemonlevel = wildPokemon.level;
  const myPokebaseExp = await getBaseExp(getCurrentPokemon(userId).name);
  const selectPokemon = getCurrentPokemon(userId);
  let wildPokemonCurrExp = wildPokemon.experience;
  const gainExp = experienceGain(myPokebaseExp, selectPokemon.level, 1);
  const wildPokemonGrowthName = await getGrowthRate(wildPokemon.name);
  wildPokemonCurrExp += gainExp;
  let wildexpThreshold = getAnExp(wildPokemonGrowthName, wildPokemonlevel);
  while (wildPokemonCurrExp >= wildexpThreshold) {
    wildPokemonlevel++;
    wildexpThreshold = getAnExp(wildPokemonGrowthName, wildPokemonlevel);
  }
  wildPokemonlevel--;

  const wild_move_set = await getMoves(wildPokemon.name, wildPokemonlevel);

  const uniqueMoves = wild_move_set.filter(
    (el) => !wildPokemon.moves.some((obj) => obj.name === el.name)
  );

  wildPokemon.moves.push(...uniqueMoves);

  getGainPokeExp(
    userId,
    "wild",
    wildPokemonlevel,
    wildPokemonCurrExp,
    wildPokemon.moves
  );
};

const experienceGain = (baseExp, wildPokemonlevel, partySize) => {
  return Math.floor((1 * 1 * baseExp * wildPokemonlevel) / (7 * partySize));
};

const getGrowthRate = async (pokeName) => {
  const growthRate = await axios.get(
    `https://pokeapi.co/api/v2/pokemon-species/${pokeName}`
  );

  const growthRateName = growthRate.data.growth_rate.name;

  return growthRateName;
};

const gainEvs = async (wildPokemon, userId, win) => {
  let currentPokemon = getCurrentPokemon(userId);

  const baseStats = [
    "hp",
    "attack",
    "defense",
    "specialAttack",
    "specialDefense",
    "speed",
  ];

  if (win === "wild") {
    const myPokemonsEV = await getEvs(currentPokemon.name);

    baseStats.forEach((ev_name) => {
      myPokemonsEV.forEach((ev_val) => {
        if (ev_val[ev_name]) {
          wildPokemon.ev[ev_name] += ev_val[ev_name];
        }
      });
    });
    gainEvsWild(userId , wildPokemon)

    
  } else {
    const wildPokemonEV = await getEvs(wildPokemon.name);
    
     console.log('line : 122' ,  wildPokemonEV)

    
    baseStats.forEach((ev_name) => {
      wildPokemonEV.forEach((ev_val) => {
        if(ev_val[ev_name]) {
          currentPokemon.ev[ev_name] += ev_val[ev_name]
          // console.log(currentPokemon.ev[ev_name])
          console.log('line : 126' , currentPokemon)
        }
      })
    })
    
   gainEVstrainer(userId , currentPokemon)
    console.log(wildPokemonEV)
    
  }
  
};

const getEvs = async (pokeName) => {
  
  console.log(pokeName)
  
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokeName}`
    );

    const EV_Value = response.data.stats;
    const TotalEV = [];
    EV_Value.forEach((el) => {
      if (el.effort !== 0) {
         TotalEV.push({
          [makeBaseStateProperName(el.stat.name)]: el.effort,
          });
      }
    });
    

    return TotalEV;
  } catch (err) {
    console.log(err);
  }
};

function makeBaseStateProperName(statName) {
  let [first , second] = statName.trim().split("-")
  
  second = second ? second.charAt(0).toUpperCase()+second.slice(1) : second
  
  let fullName = second ? `${first}${second}` : first
  
  return fullName
}

async function getMoves(pokemonName, pokeLvl) {
  const response = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );

  const pokeMoveList = response.data.moves;

  let move_set = [];

  pokeMoveList.forEach((el) => {
    el.version_group_details.forEach((ele) => {
      if (
        ele.version_group.name === "diamond-pearl" &&
        ele.move_learn_method.name === "level-up" &&
        ele.level_learned_at <= pokeLvl
      ) {
        move_set.push({...el.move , level : ele.level_learned_at});
      }
    });
  });

  move_set = await Promise.all(
    move_set.map(async (ele) => {
      const detail = await getMoveDetail(ele.url , ele.level);
      if (detail) {
        return detail;
      }
    })
  );
  // console.log(move_set)
  move_set = move_set.filter((el) => el);
  
  console.log(move_set)

  return move_set;
}

async function getMoveDetail(url , level) {
  console.log(level)
  try {
    const response = await axios.get(url);

    const move = response.data;

    if (move.accuracy && move.power) {
      return {
        name: move.name,
        power: move.power,
        accuracy: move.accuracy,
        type: move.type.name,
        category: move.damage_class.name,
        level,
        
      };
    }
  } catch (err) {
    console.log(err);
  }
}

function getAnExp(growthRate, level) {
  switch (growthRate) {
    case "fast": {
      totalExp = Math.floor(0.8 * Math.pow(level, 3));
      nextExp = Math.floor(0.8 * Math.pow(level + 1, 3));
      return totalExp;
    }
    case "medium-fast": {
      totalExp = Math.floor(level ** 3);
      nextExp = Math.floor((level + 1) ** 3);

      return totalExp;
    }
    case "medium-slow": {
      totalExp = Math.floor(
        1.2 * Math.pow(level, 3) - 15 * Math.pow(level, 2) + 100 * level - 140
      );
      nextExp = Math.floor(
        1.2 * Math.pow(level + 1, 3) -
          15 * Math.pow(level + 1, 2) +
          100 * (level + 1) -
          140
      );
      return totalExp;
    }
    case "slow": {
      totalExp = Math.floor(1.25 * Math.pow(level, 3));
      nextExp = Math.floor(1.25 * Math.pow(level + 1, 3));
      return totalExp;
    }
    default: {
      let totalExp;
      if (level <= 50) {
        totalExp = Math.floor(0.8 * Math.pow(level, 3));
        nextExp = Math.floor(0.8 * Math.pow(level + 1, 3));
      } else {
        totalExp = Math.floor(
          0.8 * Math.pow(50, 3) + 1.2 * Math.pow(level - 50, 3)
        );
        nextExp = Math.floor(
          0.8 * Math.pow(50, 3) + 1.2 * Math.pow(level + 1 - 50, 3)
        );
      }
      return totalExp;
    }
  }
}

const checkPartySize = (trainersPokemon) => {
  let count = 0;
  

  trainersPokemon.forEach((el) => {
    if (!el.isFeint) {
      count++;
    }
  });
  return count === 0 ? 1 : count;
};

async function getBaseExp(pokemonName) {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const baseExp = response.data.base_experience;

    return baseExp;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  gainExpwithWildPokemon,
  gainEvs,
  wildExperienceGained,
};
