const { userModel } = require("../model/userDetail");
const { megaStones, inventory, TM } = require("./callbackQuery.controller");
const {
  fetchKantoPokemon,
  evYieldoptions,
  chooseinitoptions,
  evYieldPopup,
  getMinMaxPokemonLevel,
} = require("./controller");
const { pokeStoreItems, pokeBalls, pokeMegaStore } = require("./pokeStore.controller");
const { choosePokemon, getInventory } = require("./user.controller");

async function startCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const startPayload = match.input.trim().split(" ")[1] && match.input.trim().split(" ")[1].trim().split("_")[0]
  

  try {
    const isUserExist = await userModel.findOne({ _id: userId });
    
    if(startPayload === 'hunt') {
       huntCommand(bot , msg)
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
  const randomNum = Math.floor(Math.random() * 151) + 1;
  const pokeHunt = fetchKantoPokemon(randomNum);

  pokeHunt.then(async (res) => {
    let name = res.name.charAt(0).toUpperCase() + res.name.slice(1);
    const level = await getMinMaxPokemonLevel(res.name);

    if (msg.chat.type === "group") {
      bot.sendMessage(chatId, "Message me privately to hunt for pokemon", {
        reply_to_message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: [[{ text: "Hunt", url: "t.me/TestingPokemonBot?start=hunt_group" }]],
        },
      });
    } else {
      bot.sendPhoto(
        chatId,
        res.sprites.other["official-artwork"].front_default,
        {
          reply_to_message_id: msg.message_id,
          caption: `A wild <b>${name}</b> (Lv. ${level}) has appeared`,
          ...evYieldoptions(res),
          parse_mode: "HTML",
        }
      );
    }
  });
}

function myInvCommand(bot, msg, match) {
  getInventory(bot, msg, match);
}

function callbackQuery(bot, query) {
  const option = query.data.trim().split(" ")[0];

  // Create a message with the text you want to display in the modal

  switch (option) {
    case "ev_yield": {
      evYieldPopup(bot, query);
      break;
    }
    case "battle": {
      // getMinMaxPokemonLevel(query)
      break;
    }
    case "choosePokemon": {
      choosePokemon(bot, query);
      // console.log('Hello')
      break;
    }
    case "mymegastones": {
      console.log("megaStones");
      megaStones(bot, query);
      break;
    }
    case "myinventory": {
      inventory(bot, query);
      console.log("inventory");
      break;
    }
    case "mytm": {
      TM(bot, query);
      console.log("tms");
      break;
    }
    case 'items' : {
      pokeStoreItems(bot , query)
      break
    }
    case 'pokeballs' : {
      pokeBalls(bot , query)
      break
    }
    case 'megastones' : {
      pokeMegaStore(bot , query)
      break
    }
    default: {
      console.log('Invalid options')
      return ;
    }
  }
}

module.exports = { startCommand, huntCommand, callbackQuery, myInvCommand };
