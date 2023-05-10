const { userInvModal } = require("../model/userInventory");

async function megaStones(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id

  
  // console.log(userId)
  


  // bot.editMessageText("Not equipped", { chat_id: chat_id, message_id: message_id });
  // bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chat_id, message_id: message_id });

    const { megaRingisEquipped , megaStones} = await userInvModal.findOne({
      owner: userId,
    });

    // console.log(megaRingisEquipped)
  let message = `<b>Mega Ring</b>: ${!megaRingisEquipped ? "Not Equipped" : "Equipped"}`
    
    if(megaStones.length !== 0) {
      message+=`\n\n<b>————————————</b>\n\n`
    }
     megaStones.forEach(userItem => {
      message+=userItem.name+"\n"
    })

    // console.log(query)
   await bot.editMessageText(message,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "HTML",
      }
    );
   await bot.editMessageReplyMarkup(
      { inline_keyboard:  [
    [
      { text: "Inventory", callback_data: "myinventory" },
      { text: "TM", callback_data: "mytm" },
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
      const userId = query.from.id


    
    const { pokeDollars, pokeBalls } = await userInvModal.findOne({
      owner: userId,
    });
     let message = `<b>Poke Dollars 💵: ${pokeDollars}</b>
  
`;
  
  for (let i=0; i<pokeBalls.length; i++) {
    let [firstName , secondName] = pokeBalls[i].name.split(" ")
    firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1)
    secondName = secondName.charAt(0).toUpperCase() + secondName.slice(1)
    
    const name = `${firstName} ${secondName}`
    
    message+=`${name}: ${pokeBalls[i].stock} \n`
    
  }
    
    
   await bot.editMessageText(
      message,
      {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: "HTML",
      }
    );
   await bot.editMessageReplyMarkup(
      { inline_keyboard: [
    [
      { text: "Mega Stones", callback_data: "mymegastones" },
      { text: "TM", callback_data: "mytm" },
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
    const userId = query.from.id

try {
  
  
    const { TMs } = await userInvModal.findOne({ owner: userId });

    await bot.editMessageText(`<b>TM's 💿</b>:`, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: "HTML",
    });
    await bot.editMessageReplyMarkup(
      { inline_keyboard: [
    [
      { text: "Inventory", callback_data: "myinventory" },
      { text: "Mega Stones", callback_data: "mymegastones" },
    ]
  ] },
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    )
  
}
 catch(err)  {
   console.log(err)
 }
  

}

module.exports = { megaStones, inventory, TM };
