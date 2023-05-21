require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const { startCommand, huntCommand, callbackQuery, myInvCommand } = require("./Controller/command.controller");
const { connect } = require("./config/db.config");
const PokeMart = require("./model/pokeStore.model");
const { pokeStoreCommand } = require("./Controller/pokeStore.controller");
const { userBuyCommand, userGivePokeDollar } = require("./Controller/userBuyGive.controller");
const { evolveCommand } = require("./Controller/evolve.controller");

const token = "6235641191:AAEgYT5jZMy9cfIL-ZK-clM58-ffT0LchtA";

const bot = new TelegramBot(token , {polling : true});


bot.onText(/\/start/, (msg , match) => startCommand(bot , msg , match));

bot.onText(/\/hunt/, (msg) => huntCommand(bot , msg));

bot.onText(/\/myinventory/ , (msg , match) => myInvCommand(bot , msg , match) )

bot.onText(/\/pokestore/ , (msg) => pokeStoreCommand(bot , msg))

bot.onText(/\/buy/ , (msg , match) => userBuyCommand(bot , msg , match))

bot.onText(/\/give/ , (msg , match) => userGivePokeDollar(bot , msg , match))

// bot.onText(/\/safari/ , (msg , match) => safariCommand(bot , msg , match))

bot.onText(/\/evolve/ , (msg , match) => evolveCommand(bot , msg , match))

bot.onText(/\/evolve/ , (msg , match) => nickNameCommand(bot , msg , match))

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
