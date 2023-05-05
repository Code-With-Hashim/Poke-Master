const {PokeMartModel} = require("../model/pokeStore.model");
const { userModel } = require("../model/userDetail");

async function pokeStoreCommand (bot , msg) {
    const chatId = msg.chat.id;
    const userId = msg.from.id
    
    const inline_keyboard = [
        [
            {text : 'Items' , callback_data : 'items'},
            {text : 'TMs' , callback_data : 'tms'}
        ]
    ]
    
    let message = `Welcome to the Poke Store 🏪
where you can /buy and /sell items
——————————————————————————————

<b>Poke Balls</b>
————————————

`

const last_line = "/pokeballs for more info on the different kinds of poke balls"

try {
    const {pokeBalls} = await PokeMartModel.findOne({})
    
    pokeBalls.forEach((el) => {
        message+=`<b>${el.name}</b> - ${el.price} 💵 \n`
    })
    
    message+=`\n${last_line}\n`
    
   await bot.sendMessage(chatId , message , {
        reply_to_message_id: msg.message_id,
        parse_mode : 'HTML',
        reply_markup : {
            inline_keyboard
        }
    })
    
}
catch(err) {
    console.log(err)
}

}

async function pokeStoreItems(bot , query) {
  
}

module.exports = {pokeStoreCommand , pokeStoreItems}