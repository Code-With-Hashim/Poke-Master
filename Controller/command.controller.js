const { userModel } = require("../model/userDetail");
const {
  fetchKantoPokemon,
  evYieldoptions,
  chooseinitoptions,
  findMinMaxLevels,
  evYieldPopup,
  getMinMaxPokemonLevel,
} = require("./controller");

async function startCommand(bot, msg, match) {
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

  //   bot.sendMessage(chatId, "Welcome in Pokemon Battle let's play /hunt");
}

function huntCommand(bot, msg, match) {
  const chatId = msg.chat.id;
  const randomNum = Math.floor(Math.random() * 151) + 1;
  const pokeHunt = fetchKantoPokemon(randomNum);

  pokeHunt.then((res) => {
    let name = res.name.charAt(0).toUpperCase() + res.name.slice(1);
    bot.sendPhoto(chatId, res.sprites.other["official-artwork"].front_default, {
      reply_to_message_id: msg.message_id,
      caption: `A wild <b>${name}</b> (Lv. 29) has appeared`,
      ...evYieldoptions(res),
      parse_mode: "HTML",
    });
  });
}

function callbackQuery(bot, query) {
  const option = query.data.trim().split(" ")[0];

  // Create a message with the text you want to display in the modal
  switch (option) {
    case "ev_yield": {
      evYieldPopup(bot, query);
      break;
    }
    case 'battle' : {
        getMinMaxPokemonLevel(bot , query)
        break
    }
    default : {
        return option
    }
  }
}

module.exports = { startCommand, huntCommand, callbackQuery };
