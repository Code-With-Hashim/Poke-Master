const axios = require('axios')
const ballModifiers = require("../ballModifier.json");
const { userInvModal } = require("../model/userInventory");
const { userPokeModal } = require("../model/userPoke");
const { userPokemon, wildPokemon, ProperMoveName } = require("./battle.controller");

let reply_markup;

async function MyListPokeballs(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;
   reply_markup = query.message.reply_markup.inline_keyboard

  console.log(query)

  try {
    const { pokeBalls } = await userInvModal.findOne({ owner: userId });

    const inline_pokeBalls = [];

    let trainerBalls = [];

    for (let i=0; i<pokeBalls.length; i++) {
       trainerBalls.push(isMake(pokeBalls[i].name))
       
       if(pokeBalls.length%3 === 0) {
           if(trainerBalls.length%3 === 0) {
             inline_pokeBalls.push(trainerBalls)
         trainerBalls = []
           }
       } else if (pokeBalls.length % 2 === 0) {
             inline_pokeBalls.push(trainerBalls)
         trainerBalls = []
       } else {
             inline_pokeBalls.push(trainerBalls)
         trainerBalls = []
       }
    }
    

     inline_pokeBalls.push([{
       text : "🔙",
       callback_data : `poke-back` 
     }])

     bot.editMessageReplyMarkup({inline_keyboard : inline_pokeBalls} , {
        chat_id : chatId,
        message_id : messageId
    })

    
  } catch (err) {
    console.log(err);
  }
}

function isMake(ballName) {
  let first = ballName.trim().split(" ")[0];
  let fullName = ballName.trim().split(" ").join("-");
  first = first.charAt(0).toUpperCase() + first.slice(1);
  return {
    text: first,
    callback_data: `catchPokemon ${fullName}`,
  };
}


async function pokemonCatch(bot , query) {
  // ballName, level, wildLevel, hasCaught, baseSpeed, types
    // maxHP, currentHP, catchRate, ballModifier, statusModifier

    const chatId = query.message.chat.id
    const userId = query.from.id
    const message_id = query.message.message_id
    const usePokeBall = query.data.trim().split(" ")[1] //ballName
    
  try {
    const userPokemonLevel = userPokemon().level // level
    const wildPokemonLevel = wildPokemon().level //wildLevel
    const hasCaught = await userHavePokemon(wildPokemon().name , userId) // hasCaught
    const wildBaseSpeed = wildPokemon().baseStats.speed // baseSpeed
    const wildTypes = wildPokemon().type // types
    const maxHP = wildPokemon().stats.totalhp //maxHP
    const currentHP = wildPokemon().stats.currenthp
    const catchRate = await getWildCatchRate(wildPokemon().name)
    const ballModifier = calculateBallModifier(usePokeBall, userPokemonLevel, wildPokemonLevel, hasCaught, wildBaseSpeed, wildTypes)
    const statusModifier = 1
    
    console.log(maxHP , currentHP , catchRate , ballModifier , statusModifier)
    
    
     const catchChance = calculateCatchRate(maxHP, currentHP, catchRate, ballModifier, statusModifier)
     
     const isCaught = isPokemonCaught(catchChance)
     
     let message = `You used one ${ProperMoveName(usePokeBall)} \n`
     
     
      
    
  } catch(err) {
    console.log(err)
  }
}

function calculateThrowTime() {
  const randomTimer = Math.floor(Math.random() * 3000 + 1) + 2000
  
  return randomTimer
}


function isPokemonCaught(calculatedCatchRate) {
  console.log(calculatedCatchRate)
  const randomValue = Math.random() * 100; // Generate a random number between 0 and 100
  return randomValue <= calculatedCatchRate; // Compare the random value with the calculated catch rate
}


async function getWildCatchRate(pokeName) {
  
  try {
    
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon-species/${pokeName}`)
    
    const catchRate = response.data.capture_rate
    
    return catchRate
    
  } catch(err) {
    console.log(err)
  }
}

async function userHavePokemon(pokeName , userId) {
  try {
    
    const hasCaught = await userPokeModal.findOne({trainer : userId , name : pokeName})
    
    return hasCaught ? true : false
    
  } catch(err) {
    console.log(err)
  }
}

function calculateCatchRate(maxHP, currentHP, catchRate, ballModifier, statusModifier) {
  const numerator = (3 * maxHP - 2 * currentHP) * (catchRate * ballModifier);
  const denominator = 3 * maxHP;
  const catchRatePercentage = (numerator / denominator) * statusModifier;
  return Math.floor(catchRatePercentage);
}

// Example usage
// const maxHP = 100;
// const currentHP = 50;
// const catchRate = 30;
// const ballModifier = 1.5; // Let's say we're using a Great Ball
// const statusModifier = 1; // No status effect

function calculateBallModifier(ballName, level, wildLevel, hasCaught, baseSpeed, types) {
  const ballModifier = ballModifiers[ballName];

  if (ballModifier) {
    if (ballName === "level-ball") {
      let { multiplier } = ballModifier.find(({ threshold }) => level >= wildLevel * threshold) || {};
        return multiplier = multiplier ? multiplier : 1
  } else if (ballName === "fast-ball") {
      if (baseSpeed >= ballModifier.speedThreshold) {
        return ballModifier.modifier;
      }
    } else if (ballName === "repeat-ball") {
      return hasCaught ? ballModifier.hasCaught : ballModifier.modifier;
    } else if (ballName === "nest-ball") {
      if (wildLevel <= ballModifier.maxLevel) {
        return ballModifier.modifier[1];
      } else if (wildLevel <= ballModifier.maxLevel * 2) {
        return ballModifier.modifier[2];
      } else {
        return ballModifier.modifier[3];
      }
    } else if (ballName === "net-ball") {
      if (types.includes(...ballModifier.typeThreshold)) {
        return ballModifier.modifier;
      }
    }

    return ballModifier;
  }

  return 1; // Default modifier if ball name is not found
}

// Usage example
// const ballName = "level-ball";
// const level = 50;
// const wildLevel = 60;
// const hasCaught = false;
// const baseSpeed = 120;
// const types = ["water", "bug"];

// const ballModifier = calculateBallModifier(ballName, level, wildLevel, hasCaught, baseSpeed, types);

function pokeBack(bot , query) {
  const chatId = query.message.chat.id
  const messageId = query.message.message_id
  
  
  
  bot.editMessageReplyMarkup({
    inline_keyboard : reply_markup,
  } , {
    chat_id : chatId,
    message_id : messageId
  })
}

module.exports = { MyListPokeballs  , pokeBack , pokemonCatch};
