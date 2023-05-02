require('dotenv').config()
const axios = require('axios')
const TelegramBot = require('node-telegram-bot-api')

const token = process.env.TELEGRAM_TOKEN

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg, match) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Welcome ${msg.chat.first_name} ${msg.chat.last_name} in pokemon battle \nlet's begin a pokemon battle /hunt`);
});

bot.onText(/\/hunt/, (msg, match) => {
    const chatId = msg.chat.id
    console.log(chatId)
    

})

bot.onText(/\/travel/, (msg, match) => {
    const chatId = msg.chat.id
    console.log(msg)
    bot.sendMessage(chatId, 'Which region would you like to travel to?: \n\n\n', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Kanto', callback_data: 'kanto' },
                    { text: 'Johto', callback_data: 'johto' }
                ]
            ]
        }
    })
})

// bot.on('callback_query', (callbackQuery) => {
//     const message = callbackQuery.message;
//     const chatId = message.chat.id;
//     const data = callbackQuery.data;

//     console.log(callbackQuery)

//     // if (data === 'option1') {
//     //     bot.sendMessage(chatId, 'You selected Option 1');
//     // } else if (data === 'option2') {
//     //     bot.sendMessage(chatId, 'You selected Option 2');
//     // } else if (data === 'option3') {
//     //     bot.sendMessage(chatId, 'You selected Option 3');
//     // } else if (data === 'option4') {
//     //     bot.sendMessage(chatId, 'You selected Option 4');
//     // } else {
//     //     bot.sendMessage(chatId, 'Unknown option selected');
//     // }
// })

async function fetchKantoPokemon() {
    const pokemonName = 'pikachu';

    const url = 'https://pokeapi.co/api/v2/pokemon?limit=151'

   try {
    const pokemon = await axios.get(url)

    console.log(pokemon.data)
    
   } catch (error) {
      console.log(error)
   }

}
fetchKantoPokemon()