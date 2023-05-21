const { default: axios } = require("axios");
const { userPokeModal } = require("../model/userPoke");
const { getEvolutionDetails } = require("./pokeEvolve.controller");
const { makeProperName } = require("./pokemon.controller");
const { getBaseStats } = require("./user.controller");

async function evolveCommand(bot, msg, match) {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  const product = match.input.trim().split(" ")[1].toLowerCase();

  if (!product) {
    return bot.sendMessage(chatId, "Format: /evolve <pokemon name>", {
      reply_to_message_id: msg.message_id,
    });
  }

  const evolve_pokemon = await userPokeModal.find({ trainer: userId });

  const suggestPokemon = evolve_pokemon
    .filter((el) => {

      return el.nickname && el.nickname.toLowerCase().includes(product) || el.name.toLowerCase().includes(product);
    })
    .map((el) => {
      return {
        name: function() {
          if(el.nickname.toLowerCase().includes(product)) {
            return el.nickname
          } else if(el.name.toLowerCase().includes(product)) {
            return el.name
          }
        },
        poke_id: String(el._id),
        level : el.level
      };
    });

  if (suggestPokemon.length === 0) {
    bot.sendMessage(chatId, "You do not have this pokemon/invalid pokemon", {
      reply_to_message_id: msg.message_id,
    });
  } else if (
    suggestPokemon.length !== 0 &&
    suggestPokemon[0].name() !== product
  ) {
    bot.sendMessage(
      chatId,
      `Did you mean: <b>${makeProperName(suggestPokemon[0].name())}</b>`,
      {
        reply_to_message_id: msg.message_id,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Yes",
                callback_data: `suggest evolve ${suggestPokemon[0].name()}`,
              },
              { text: "No", callback_data: "suggest no" },
            ],
          ],
        },
      }
    );
  } else if(suggestPokemon.length === 1) {
        const evolve_pokemon = await userPokeModal.findOne({trainer : userId , _id : suggestPokemon[0].poke_id})
        const pokeName = suggestPokemon[0].name()
        if(evolve_pokemon.isReadytoEvolve.ready) {
          
       const evolvePoke_name = evolve_pokemon.isReadytoEvolve.evolve_to;
        const pokeDetail = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${evolvePoke_name}`);
        const stats = pokeDetail.data.stats;
        //changeImageLink
        const imageLink = evolve_pokemon.isShiny
          ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
          : pokeDetail.data.sprites.other["official-artwork"].front_default;
        const baseStats = getBaseStats(stats);

        const newEvolvePokemon = await getEvolutionDetails(pokeDetail.data.name);
        const isReadytoEvolve = {
          ...newEvolvePokemon,
          ready: false,
        }; //change
        
        await userPokeModal
          .findByIdAndUpdate(evolve_pokemon._id, {
            image: imageLink,
            name: pokeDetail.data.name,
            baseStats,
            isReadytoEvolve,
          })
          .then(async () => {
            bot.deleteMessage(chatId , query.message.message_id)
            await bot.sendPhoto(
              chatId,
              evolve_pokemon[0].isShiny === 'true'
                ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
                : pokeDetail.data.sprites.other["official-artwork"]
                    .front_default,
              {
                reply_to_message_id: query.message.reply_to_message.message_id,
                caption: `<b>${makeProperName(pokeName)}</b> has evolved to <b>${makeProperName(evolvePoke_name)}</b>`,
                parse_mode: "HTML",
              }
            );
          });
        } else {
          const evolvePokemon_name = evolve_pokemon.isReadytoEvolve.evolve_to;
        const newEvolvePokemon = getEvolutionDetails(evolvePokemon_name)
        
         if(newEvolvePokemon.evolve_level === 'max_level') {
          bot.sendMessage(chatId , `<b>${makeProperName(pokeName)}</b> does not evolve` , {
             reply_to_message_id: msg.message_id,
             parse_mode : 'HTML'
          })
         } else {
          bot.sendMessage(chatId , `<b>${makeProperName(pokeName)}</b> cannot evolve Yet` , {
             reply_to_message_id: msg.message_id,
             parse_mode : 'HTML'
          })
         }
        }
        
     } else {
       let message = ""
      let inline_markup = []
      let inline_count = 0
       suggestPokemon.forEach((el , i) => {
        message+=`${i+1}. <b>${makeProperName(el.name())}</b> ${sortBy(el)} \n`
        if(inline_markup.length === 0) {
          inline_markup.push([])
        } else if (inline_markup[inline_count].length === 2) {
          count++
          inline_markup.push([])
        }
        if(inline_markup[inline_count].length!==2 ) {
          inline_markup[inline_count].push({
            text : i+1,
            callback_data :`evolve ${el.name()} ${el.poke_id}`
          })
        }
        
      })
      console.log(inline_markup)
      bot.sendMessage(chatId , message , {
        reply_markup : {
          inline_keyboard : inline_markup
        },
        parse_mode : 'HTML'
      })
     }
} 
  
async function suggestPokemon(bot, query) {
  const NoAnySuggest = query.data.trim().split(" ")[1];
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const pokeName = query.data.trim().split(" ")[2];


  if (NoAnySuggest === "no") {
    bot.deleteMessage(chatId, query.message.message_id);
  } else if (NoAnySuggest === "evolve") {
    const evolve_pokemon = await userPokeModal.find({
      trainer: userId,
      $or: [{ nickname: pokeName }, { name: pokeName }],
    });
    if (evolve_pokemon.length === 1) {
      if (evolve_pokemon[0].isReadytoEvolve.ready) {
        const evolvePoke_name = evolve_pokemon[0].isReadytoEvolve.evolve_to;
        const pokeDetail = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${evolvePoke_name}`);
        const stats = pokeDetail.data.stats;
        //changeImageLink
        const imageLink = evolve_pokemon[0].isShiny
          ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
          : pokeDetail.data.sprites.other["official-artwork"].front_default;
        const baseStats = getBaseStats(stats);

        const newEvolvePokemon = await getEvolutionDetails(pokeDetail.data.name);
        const isReadytoEvolve = {
          ...newEvolvePokemon,
          ready: false,
        }; //change


        await userPokeModal
          .findByIdAndUpdate(evolve_pokemon[0]._id, {
            image: imageLink,
            name: pokeDetail.data.name,
            baseStats,
            isReadytoEvolve,
          })
          .then(async () => {
            bot.deleteMessage(chatId , query.message.message_id)
            await bot.sendPhoto(
              chatId,
              evolve_pokemon[0].isShiny === 'true'
                ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
                : pokeDetail.data.sprites.other["official-artwork"]
                    .front_default,
              {
                reply_to_message_id: query.message.reply_to_message.message_id,
                caption: `<b>${makeProperName(pokeName)}</b> has evolved to <b>${makeProperName(evolvePoke_name)}</b>`,
                parse_mode: "HTML",
              }
            );
          });
      } else {
        
        const evolvePokemon_name = evolve_pokemon[0].isReadytoEvolve.evolve_to;
        const newEvolvePokemon = getEvolutionDetails(evolvePokemon_name)
        
          bot.deleteMessage(chatId , query.message.message_id)
         if(newEvolvePokemon.evolve_level === 'max_level') {
          bot.sendMessage(chatId , `<b>${makeProperName(pokeName)}</b> does not evolve` , {
             reply_to_message_id: query.message.reply_to_message.message_id,
             parse_mode : 'HTML'
          })
         } else {
          bot.sendMessage(chatId , `<b>${makeProperName(pokeName)}</b> cannot evolve Yet` , {
             reply_to_message_id: query.message.reply_to_message.message_id,
             parse_mode : 'HTML'
          })
         }
      }
    } else {
    
      let message = ""
      let inline_markup = []
      let inline_count = 0
      pokeNameList = suggestPokemon.forEach((el , i) => {
        message+=`${i+1}. <b>${makeProperName(el.name())}</b> ${sortBy(el)} \n`
        if(inline_markup.length === 0) {
          inline_markup.push([])
        } else if (inline_markup[inline_count].length === 2) {
          count++
          inline_markup.push([])
        }
        if(inline_markup[inline_count].length!==2 ) {
          inline_markup[inline_count].push({
            text : i+1,
            callback_data :`evolve ${el.name()} ${el.poke_id}`
          })
        }
      })
      bot.editMessageText(message , {
        chat_id : chatId,
        message_id : query.message.message_id,
        parse_mode : 'HTML'
      }).then(() => {
        bot.editMessageReplyMarkup({inline_keyboard :  inline_markup} , {
          chat_id : chatId,
          message_id : query.message.message_id
        })
        console.log(173 , inline_markup)
      })
    }
  }
}

async function evolvePokemon(bot , query) {
   const pokeName = query.data.trim().split(" ")[1]
   const pokeId = query.data.trim().split(" ")[2]
   const chatId = query.message.chat.id
   const userId = query.from.id
   
   const evolve_pokemon = await userPokeModal.findOne({trainer : userId , _id : pokeId})
   

   if (evolve_pokemon.isReadytoEvolve.ready) {
        const evolvePoke_name = evolve_pokemon.isReadytoEvolve.evolve_to;
        const pokeDetail = await axios.get(
          `https://pokeapi.co/api/v2/pokemon/${evolvePoke_name}`);
        const stats = pokeDetail.data.stats;
        //changeImageLink
        const imageLink = evolve_pokemon.isShiny
          ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
          : pokeDetail.data.sprites.other["official-artwork"].front_default;
        const baseStats = getBaseStats(stats);

        const newEvolvePokemon = await getEvolutionDetails(pokeDetail.data.name);
        const isReadytoEvolve = {
          ...newEvolvePokemon,
          ready: false,
        }; //change


        await userPokeModal
          .findByIdAndUpdate(evolve_pokemon._id, {
            image: imageLink,
            name: pokeDetail.data.name,
            baseStats,
            isReadytoEvolve,
          })
          .then(async () => {
            bot.deleteMessage(chatId , query.message.message_id)
            await bot.sendPhoto(
              chatId,
              evolve_pokemon.isShiny === 'true'
                ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
                : pokeDetail.data.sprites.other["official-artwork"]
                    .front_default,
              {
                reply_to_message_id: query.message.reply_to_message.message_id,
                caption: `<b>${makeProperName(pokeName)}</b> has evolved to <b>${makeProperName(evolvePoke_name)}</b>`,
                parse_mode: "HTML",
              }
            );
          });
      } else {
        
        const evolvePokemon_name = evolve_pokemon.isReadytoEvolve.evolve_to;
        const newEvolvePokemon = await getEvolutionDetails(evolvePokemon_name)
        
         if(newEvolvePokemon.evolve_level === 100) {
           bot.answerCallbackQuery(query.id , `${makeProperName(pokeName)} does not evolve`)
         } else {
          bot.answerCallbackQuery(chatId , `${makeProperName(pokeName)} cannot evolve Yet`)
         }
      }
   
}

function sortBy(poke) {
  const bysort = 'level'
  
  if(bysort === 'level') {
    return `Lv. ${poke[bysort]}`
  }
}

module.exports = { evolveCommand, suggestPokemon , evolvePokemon };
