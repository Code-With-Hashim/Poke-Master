require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startCommand, huntCommand, callbackQuery, myInvCommand } = require("./Controller/command.controller");
const { connect } = require("./config/db.config");
const PokeMart = require("./model/pokeStore.model");
const { pokeStoreCommand } = require("./Controller/pokeStore.controller");

const token = "6235641191:AAEgYT5jZMy9cfIL-ZK-clM58-ffT0LchtA";

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg , match) => startCommand(bot , msg , match));



bot.onText(/\/hunt/, (msg, match) => huntCommand(bot , msg , match));

bot.onText(/\/myinventory/ , (msg , match) => myInvCommand(bot , msg , match) )

bot.onText(/\/pokestore/ , (msg) => pokeStoreCommand(bot , msg))

bot.on("callback_query", (query) => callbackQuery(bot , query));


async function DatabaseRun() {
   try {
     await connect
     console.log('Database Connected Successfully')
   }
   catch(err) {
     console.log(err)
   }
}

DatabaseRun()