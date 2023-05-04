const { userModel } = require("../model/userDetail");
const { userInvModal } = require("../model/userInventory");
const { megaStones, inventory, TM } = require("./callbackQuery.controller");
const {
  fetchKantoPokemon,
  evYieldoptions,
  chooseinitoptions,
  evYieldPopup,
  getMinMaxPokemonLevel,
} = require("./controller");
const { choosePokemon, getInventory } = require("./user.controller");

async function startCommand(bot , msg, match) {
  const chatId = msg.chat.id;

  try {
    const isUserExist = await userModel.findOne({ _id: chatId });

    //   console.log(isUserExist)
    if (isUserExist) {
      bot.sendMessage(
        chatId,
        "Welcome in Pokemon Battle let's play Battle /hunt"
      );
    } else {
      await userModel.create({ _id: chatId, userDetail: msg.chat });
      bot.sendMessage(
        chatId,
        "Choose an pokemon which would you like to play:",
        {
          ...chooseinitoptions,
        }
      );
    }

    //   const isUserExist = await userModel.create({_id : chatId , userDetail : msg.chat})
  } catch (err) {
    console.log(err);
  }
}

function huntCommand(bot , msg, match) {
  const chatId = msg.chat.id;
  const randomNum = Math.floor(Math.random() * 151) + 1;
  const pokeHunt = fetchKantoPokemon(randomNum);

  pokeHunt.then(async(res) => {
    let name = res.name.charAt(0).toUpperCase() + res.name.slice(1);
    const level = await getMinMaxPokemonLevel(res.name)
    

    bot.sendPhoto(chatId, res.sprites.other["official-artwork"].front_default, {
      reply_to_message_id: msg.message_id,
      caption: `A wild <b>${name}</b> (Lv. ${level}) has appeared`,
      ...evYieldoptions(res),
      parse_mode: "HTML",
    });
  });
}

function myInvCommand (bot , msg , match) {
  getInventory(bot , msg , match)  
}
 

function callbackQuery(bot , query) {
  const option = query.data.trim().split(" ")[0];

  // Create a message with the text you want to display in the modal
  
  console.log(option)
  
  switch (option) {
    case "ev_yield": {
      evYieldPopup(bot, query);
      break;
    }
    case 'battle' : {
        // getMinMaxPokemonLevel(query)
        break
    }
    case 'choosePokemon' : {
      choosePokemon(bot , query)
      // console.log('Hello')
      break
    }
    case 'megastones' : {
      console.log('megaStones')
      megaStones(bot , query)
      break
    }
    case 'inventory' : {
      inventory(bot , query)
      console.log('inventory')
      break
    }
    case 'tm' : {
      TM(bot , query)
      console.log('tms')
      break
    }
    default : {
        return option
    }
  }
}

module.exports = { startCommand, huntCommand, callbackQuery , myInvCommand};
