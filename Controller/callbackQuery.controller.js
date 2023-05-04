const { userInvModal } = require("../model/userInventory");

async function megaStones(bot, query) {
  console.log(query);
  const chatId = query.message.chat.id;


  // bot.editMessageText("Not equipped", { chat_id: chat_id, message_id: message_id });
  // bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chat_id, message_id: message_id });

    const { megaStones, megaRingisEquipped } = await userInvModal.findOne({
      owner: chatId,
    });

    // console.log(megaRingisEquipped)

    // console.log(query)
    bot.editMessageText(
      `<b>Mega Ring</b>: ${!megaRingisEquipped ? "Not Equipeed" : "Equipped"}`,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "HTML",
      }
    );
    bot.editMessageReplyMarkup(
      { inline_keyboard:  [
    [
      { text: "Inventory", callback_data: "inventory" },
      { text: "TM", callback_data: "tm" },
    ],
  ]},
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    );
}

async function inventory(bot, query) {
  const chatId = query.message.chat.id;
    
    const { pokeDollars, pokeBalls } = await userInvModal.findOne({
      owner: chatId,
    });
     let message = `Poke Dollars 💵: ${pokeDollars}
  
`;
  
  for (let i=0; i<pokeBalls.length; i++) {
    let [firstName , secondName] = pokeBalls[i].name.split(" ")
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    secondName = secondName.charAt(0).toUpperCase() + secondName.slice(1)
    
    const name = `${firstName} ${secondName}`
    
    message+=`${name}: ${pokeBalls[i].stock} \n`
    
  }
    
    bot.editMessageText(
      message,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "HTML",
      }
    );
    bot.editMessageReplyMarkup(
      { inline_keyboard: [
    [
      { text: "Mega Stones", callback_data: "megastones" },
      { text: "TM", callback_data: "tm" },
    ],
  ] },
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    );
}

async function TM(bot, query) {
  const chatId = query.message.chat.id;

    const { TMs } = await userInvModal.findOne({ owner: chatId });

    bot.editMessageText(`<b>TM's 💿</b>:`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "HTML",
    });
    bot.editMessageReplyMarkup(
      { inline_keyboard: [
    [
      { text: "Inventory", callback_data: "inventory" },
      { text: "Mega Stones", callback_data: "megastones" },
    ]
  ] },
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    )
}

module.exports = { megaStones, inventory, TM };
