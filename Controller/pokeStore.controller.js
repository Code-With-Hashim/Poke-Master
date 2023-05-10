const { PokeMartModel } = require("../model/pokeStore.model");
const { userModel } = require("../model/userDetail");

async function pokeStoreCommand(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const inline_keyboard = [
    [
      { text: "Items", callback_data: "items" },
      { text: "Mega Stone", callback_data: "megastones" },
    ]
  ];

  let message = `Welcome to the Poke Store 🏪
where you can /buy and /sell items
——————————————————————————————

<b>Poke Balls</b>
————————————

`;

  const last_line =
    "/pokeballs for more info on the different kinds of poke balls";

  try {
    const { pokeBalls } = await PokeMartModel.findOne({});

    pokeBalls.forEach((el) => {
      message += `<b>${el.name}</b> - ${el.price} 💵 \n`;
    });

    message += `\n${last_line}\n`;

    await bot.sendMessage(chatId, message, {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard,
      },
    });
  } catch (err) {
    console.log(err);
  }
}

async function pokeStoreItems(bot, query) {
  const chatId = query.message.chat.id;

  let message = `Welcome to the Poke Store 🏪
where you can /buy and /sell items
——————————————————————————————

Items
———————

`;

  let last_line = `/items for more info on the different types of items`;

  const inline_keyboard = [
    [
      { text: "Poke Balls", callback_data: "pokeballs" },
      { text: "Mega Stone", callback_data: "megastones" },
    ],
  ];

  try {
    const { items } = await PokeMartModel.findOne({});

    items.forEach((el) => {
      if (el.name === "Boost") {
        message += `💉<b>${el.name}</b> - ${el.price}\n`;
      } else if (el.name === "Vitamin") {
        message += `💊<b>${el.name}</b> - ${el.price}\n`;
      } else if (el.name === "Berry") {
        message += `🍇<b>${el.name}</b> - ${el.price}\n`;
      } else if (el.name === "Rare Candy") {
        message += `🍬<b>${el.name}</b> - ${el.price}\n`;
      }
    });
    
    message += `\n<b> Mega Ring</b> - 5000\n`;
    
    message += `\n${last_line}\n`;
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "HTML",
    }).then(async() => {
        await bot.editMessageReplyMarkup(
      {
        inline_keyboard,
      },
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    );
    });

  } catch (err) {
    console.log(err);
  }
}

async function pokeBalls(bot, query) {
  const chatId = query.message.chat.id;

  let message = `Welcome to the Poke Store 🏪
where you can /buy and /sell items
——————————————————————————————

<b>Poke Balls</b>
————————————

`;

  const last_line =
    "/pokeballs for more info on the different kinds of poke balls";

  const inline_keyboard = [
    [
      { text: "Items", callback_data: "items" },
      { text: "Mega Stone", callback_data: "megastones" },
    ]
  ];

  try {
    const { pokeBalls } = await PokeMartModel.findOne({});

    pokeBalls.forEach((el) => {
      message += `<b>${el.name}</b> - ${el.price} 💵 \n`;
    });

    message += `\n${last_line}\n`;

    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode : 'HTML'
    }).then(async() => {
    await bot.editMessageReplyMarkup(
      {
        inline_keyboard,
      },
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    );
        
    });
  } catch (err) {
    console.log(err);
  }
}

async function pokeMegaStore(bot , query) {
    const chatId = query.message.chat.id;
    
    const inline_keyboard = [
    [
      { text: "Items", callback_data: "items" },
      { text: "Poke Balls", callback_data: "pokeballs" },
    ]
  ];
    
      let message = `Welcome to the Poke Store 🏪
where you can /buy and /sell items
——————————————————————————————

<b>Mega Stones</b>
————————————

`;

  const last_line = "/megastones for more info on the different kinds of MegaStone";
  
  try {
    
    const { megaStone } = await PokeMartModel.findOne({});
    
    megaStone.forEach(el => {
        message += `<b>${el.name}</b> - ${el.price} 💵\n`
    })
    message +="\n"+last_line+"\n"
    
    await bot.editMessageText(message, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode : 'HTML'
    }).then(async() => {
        await bot.editMessageReplyMarkup(
      {
        inline_keyboard,
      },
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    );
    })
      
  }
  catch(err) {
      console.log(err)
  }
}

module.exports = { pokeStoreCommand, pokeStoreItems, pokeBalls , pokeMegaStore };
