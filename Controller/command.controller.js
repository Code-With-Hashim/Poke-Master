const { userModel } = require("../model/userDetail");
const { battle, battleBeginFight, statusBattleActive, gameExitinBattle } = require("./battle.controller");
const { canHunt, isBattleActive } = require("./battle.fnc");
const { megaStones, inventory, TM } = require("./callbackQuery.controller");
const {
  getTMs,
  chooseinitoptions,
  evYieldPopup,
  getRandomPokemon,
  getMythicalPokemon,
  getLegendryPokemon,
  getRarePokemon,
} = require("./controller");
const { suggestPokemon, evolvePokemon } = require("./evolve.controller");
const { myPokemonTeam, changeBattlePokemon } = require("./myBattlePokemon.controller");
const { mypokeballs, pokeBack, catchPokemon, MyListPokeballs, pokemonCatch } = require("./pokemonCatch.controller");
const {
  pokeStoreItems,
  pokeBalls,
  pokeMegaStore,
} = require("./pokeStore.controller");
const { choosePokemon, getInventory } = require("./user.controller");


async function startCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const startPayload =
    match.input.trim().split(" ")[1] &&
    match.input.trim().split(" ")[1].trim().split("_")[0];

  try {
    const isUserExist = await userModel.findOne({ _id: userId });

    if (startPayload === "hunt") {
      huntCommand(bot, msg);
    } else {
      if (isUserExist) {
        bot.sendMessage(
          chatId,
          "Welcome in Pokemon Battle let's play Battle /hunt"
        );
      } else {
        await userModel.create({ _id: userId, userDetail: msg.chat });
        bot.sendMessage(
          chatId,
          "Choose an pokemon which would you like to play:",
          {
            ...chooseinitoptions,
          }
        );
      }

      // console.log(isUserExist);
    }

    //   const isUserExist = await userModel.create({_id : chatId , userDetail : msg.chat})
  } catch (err) {
    console.log(err);
  }
}

function huntCommand(bot, msg) {
  

  
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const legendaryRate = 1.50  ; // 8
  const mythicalRate = 0.5; // 6
  const rareRate = 1 // 7
  const normalShinyRate =  0.1; // 4
  const rareShinyRate = 0.03; // 3
  const legendaryShinyRate = 0.02; // 2
  const mythicalShinyRate = 0.001;// 1
  const TMsRate = 0.4 // 5
  const battle = 30 // 9
  
  const spawnRoll = Math.random() * 100
  
    if(isBattleActive(userId)) {
    bot.sendMessage(msg.chat.id , "Cannot Hunt While battling" , {
      reply_to_message_id : msg.message_id
    })
    return
  }
  
  if(spawnRoll <= mythicalShinyRate) {
    getMythicalPokemon(bot , msg , 'shiny')
  } else if (spawnRoll <= legendaryShinyRate) {
    getLegendryPokemon(bot , msg , 'shiny')
  } else if (spawnRoll <= rareShinyRate) {
    getRarePokemon(bot , msg , 'shiny')
  } else if (spawnRoll <= normalShinyRate) {
    getRandomPokemon(bot , msg , 'shiny')
  } else if (spawnRoll <= TMsRate) {
    getTMs(bot , msg)
  }else if (spawnRoll <= mythicalRate) {
    getMythicalPokemon(bot , msg , 'normal')
  } else if(spawnRoll <= rareRate) {
    getRarePokemon(bot , msg , 'normal')
  } else if (spawnRoll <= legendaryRate) {
    getLegendryPokemon(bot , msg , 'normal')
  } else if (spawnRoll <= battle) {
    getBattle(bot , msg)
  } else {
    getRandomPokemon(bot , msg , 'normal')
    
  }  
  
}

function myInvCommand(bot, msg, match) {
  getInventory(bot, msg, match);
}

function callbackQuery(bot, query) {
  const option = query.data.trim().split(" ")[0];

  // Create a message with the text you want to display in the modal
  // console.log(option
  

  switch (option) {
    
    case 'changepokemon' : {
      changeBattlePokemon(bot , query)
      break
    } 
    case 'evolve' : {
      evolvePokemon(bot , query)
      break
    }
    case 'suggest' : {
      suggestPokemon(bot , query)
      break
    }
    case 'game_left' : {
      gameExitinBattle(bot , query)
      break
    }
    case 'mypokemonTeam' : {
      myPokemonTeam(bot , query)
      break;
    }
    case 'feint' : {
      bot.answerCallbackQuery(query.id , 'This Pokemon has feint')
      break
    }
    case "fight" :{
      battleBeginFight(bot , query , 'battle')
      break
    } 
    case 'poke-back' : {
      pokeBack(bot , query)
      break
    }
    case 'catchPokemon' : {
      pokemonCatch(bot , query)
      break
    }
    
    case "ev_yield": {
      evYieldPopup(bot, query);
      break;
    }
    case "battle": {
      battle(bot , query)
       
      break;
    }
    case "choosePokemon": {
      choosePokemon(bot, query);
      // console.log('Hello')
      break;
    }
    case "mymegastones": {
      megaStones(bot, query);
      break;
    }
    case "myinventory": {
      inventory(bot, query);
      break;
    }
    case "mytm": {
      TM(bot, query);
      break;
    }
    case "items": {
      pokeStoreItems(bot, query);
      break;
    }
    case "pokeballs": {
      pokeBalls(bot, query);
      break;
    }
    case "megastones": {
      pokeMegaStore(bot, query);
      break;
    }
    case "mypokeballs" : {
      MyListPokeballs(bot , query)
      break;
    }
    
    default: {
      console.log("Invalid options");
      return;
    }
  }
}

module.exports = { startCommand, huntCommand, callbackQuery, myInvCommand };
