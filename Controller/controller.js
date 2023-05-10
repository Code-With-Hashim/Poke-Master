const axios = require("axios");
const pokemonjson = require("../sample.json");
const TMsList = require('../TMList.json')

const fetchPokemonDetail = async (pokeId, typePokemon, bot, msg) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${pokeId}`;
  const pokeDetail = await axios.get(url);
  const chatId = msg.chat.id;

  let name =
    pokeDetail.data.name.charAt(0).toUpperCase() +
    pokeDetail.data.name.slice(1);
  const level = await getMinMaxPokemonLevel(pokeDetail.data.name);

  if (typePokemon === "shiny") {
    bot.sendMessage(chatId, "You found a shiny pokemon");
  }
  await bot.sendPhoto(
    chatId,
    typePokemon == "shiny"
      ? pokeDetail.data.sprites.other["official-artwork"].front_shiny
      : pokeDetail.data.sprites.other["official-artwork"].front_default,
    {
      reply_to_message_id: msg.message_id,
      caption: `A wild <b>${name}</b> (Lv. ${level}) has appeared`,
      ...evYieldoptions(pokeDetail.data , level),
      parse_mode: "HTML",
    }
  );
};

function evYieldoptions(res , lvl) {
  const ev_point = [];

  for (let i = 0; i < res.stats.length; i++) {
    if (res.stats[i].effort !== 0) {
      ev_point.push({
        ev_name: res.stats[i].stat.name,
        ev_value: res.stats[i].effort,
      });
    }
  }

  const ev_yield = ev_point
    .map((ev) => `${ev.ev_name}: ${ev.ev_value}`)
    .join(", ");

  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          { text: "Battle", callback_data: `battle ${res && res.name} ${lvl}` },
          {
            text: "EV Yield",
            callback_data: `ev_yield ${ev_yield}`,
          },
        ],
      ],
    }),
  };

  // console.log(options)

  return options;
}

const chooseinitoptions = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: "Charmander", callback_data: "choosePokemon charmander" },
        { text: "Bulbasaur", callback_data: `choosePokemon bulbasaur` },
        { text: "Squirtal", callback_data: "choosePokemon squirtal" },
      ],
    ],
  },
};

function evYieldPopup(bot, query) {
  const data = query.data.trim().split(" ");
  const pokeName = query.message.caption.trim().split(" ")[2];
  let message = `If you defeat ${pokeName}, your pokemon will gain the following EV points: \n\n`;
  const ev_point = [];

  for (let i = 1; i < data.length; i++) {
    if (i % 2 == 0) {
      ev_point.push({ ev_value: data[i], ev_stats: data[i - 1] });
    }
  }
  for (let i = 0; i < ev_point.length; i++) {
    const name =
      ev_point[i].ev_stats.charAt(0).toUpperCase() +
      ev_point[i].ev_stats.slice(1);

    message += `+${ev_point[i].ev_value} ${
      ev_point[i].ev_stats === "hp" ? "HP" : name
    } EV \n`;
  }

  bot.answerCallbackQuery({
    callback_query_id: query.id,
    text: message,
    show_alert: true,
    // cache_time: 5,
    parse_mode: "MarkdownV2",
    resize_keyboard: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Close",
            callback_data: "close",
          },
        ],
      ],
    },
  });
}
// Use the answerCallbackQuery method to display the modal with a white background

async function getMinMaxPokemonLevel(pokemonNameOrId) {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${pokemonNameOrId}/`
    );
    const evolutionChainResponse = await axios.get(
      response.data.evolution_chain.url
    );
    const evolutionChain = evolutionChainResponse.data.chain;

    let minLevel = 1;
    let maxLevel = 100;

    if (evolutionChain.evolves_to.length !== 0) {
      if (evolutionChain.species.name === pokemonNameOrId) {
        // console.log(evolutionChain.evolves_to[0])
        maxLevel = evolutionChain.evolves_to[0].evolution_details[0].min_level;

        // console.log(evolutionChain.evolves_to[0].evolution_details[0].min_level)

        if (maxLevel === null) {
          maxLevel = 24;
        }
      } else if (
        evolutionChain.evolves_to[0].species.name === pokemonNameOrId
      ) {
        minLevel = evolutionChain.evolves_to[0].evolution_details[0].min_level;

        if (minLevel === null) {
          minLevel = 25;
        }

        if (evolutionChain.evolves_to[0].length !== 0) {
          // console.log(evolutionChain.evolves_to[0].evolves_to);

          if (evolutionChain.evolves_to[0].evolves_to.length !== 0) {
            maxLevel =
              evolutionChain.evolves_to[0].evolves_to[0].evolution_details[0]
                .min_level;
          } else {
            maxLevel = 45;
          }
        } else {
          maxLevel = 45;
        }

        if (maxLevel === null) {
          maxLevel = 55;
        }
      } else {
        if (evolutionChain.evolves_to[0].evolves_to.length !== 0) {
          if (evolutionChain.evolves_to[0].evolves_to[0].length !== 0) {
            minLevel =
              evolutionChain.evolves_to[0].evolves_to[0].evolution_details[0]
                .min_level;
            maxLevel = 75;

            if (minLevel === null) {
              minLevel = 46;
            }
          } else {
            minLevel = 46;
            maxLevel = 75;
          }
        } else {
          (minLevel = 35), (maxLevel = 50);
        }

        // console.log()
      }
    } else {
      maxLevel = 24;
    }

    const randomLevel = getRandomLevel(minLevel, maxLevel);

    return randomLevel;
  } catch (error) {
    console.error(error);
  }
}

async function getRandomPokemon(bot, msg, typePokemon) {
  const trainerSpot = 3; //where is poke trainer ?
  const { message_id } = await bot.sendMessage(msg.chat.id, "Searching...");

  try {
    const pokemonList = await axios
      .get(`https://pokeapi.co/api/v2/generation/${trainerSpot}/`)
      .then((res) => {
        return res.data.pokemon_species;
      });

    const data = await Promise.all(
      pokemonList.map(async (ele) => {
        try {
          const randomPokemon = await axios.get(ele.url).then((res) => {
            if (!res.data.is_legendary) {
              return {
                id: res.data.id,
                name: res.data.name,
              };
            }
          });

          return randomPokemon;
        } catch (err) {
          console.log(err);
        }
      })
    );

    const allPokemon = await data.filter((el) => el);

    const normalPokemon = []
    
    for (let i=0; i<allPokemon.length; i++) {
       let check = false
       const pokemonList = pokemonjson[trainerSpot]
       for (let j=0; j<pokemonList.length;j++) {
        
        if(pokemonList[j].name.toLowerCase() === allPokemon[i].name) {
          check = true
          break
        }
        
       }
       if(!check) {
         normalPokemon.push(allPokemon[i])        
       }
    }
    const getRandomLevel = Math.floor(Math.random() * normalPokemon.length) + 1;

    const randomPokemon = await normalPokemon.reduce((acc, el, index) => {
      // console.log(acc)

      if (index + 1 === getRandomLevel) {
        return (acc = el);
      }
      return acc;
    }, {});

    fetchPokemonDetail(randomPokemon.id, typePokemon, bot, msg);
    await bot.deleteMessage(msg.chat.id, message_id);
  } catch (err) {
    console.log(err);
  }
}

async function getMythicalPokemon(bot, msg, typePokemon) {
  const trainerSpot = 2; //where is poke trainer ?
  const { message_id } = await bot.sendMessage(msg.chat.id, "Searching...");

  try {
    const pokemonList = await axios
      .get(`https://pokeapi.co/api/v2/generation/${trainerSpot}/`)
      .then((res) => {
        return res.data.pokemon_species;
      });

    const data = await Promise.all(
      pokemonList.map(async (ele) => {
        try {
          const randomPokemon = await axios.get(ele.url).then((res) => {
            if (res.data.is_mythical) {
              return {
                id: res.data.id,
                name: res.data.name,
              };
            }
          });

          return randomPokemon;
        } catch (err) {
          console.log(err);
        }
      })
    );

    const mythicalPokemon = await data.filter((el) => el);

    const getRandomLevel =
      Math.floor(Math.random() * mythicalPokemon.length) + 1;

    const randomPokemon = await mythicalPokemon.reduce((acc, el, index) => {
      // console.log(acc)

      if (index + 1 === getRandomLevel) {
        return (acc = el);
      }
      return acc;
    }, {});

    await fetchPokemonDetail(randomPokemon.id, typePokemon, bot, msg);
    await bot.deleteMessage(msg.chat.id, message_id);
  } catch (err) {
    console.log(err);
    await bot.sendMessage(
      msg.chat.id,
      "Something went wrong , Please try again"
    );
    //  await bot.deleteMessage(msg.chat.id , message_id)
  }
}

async function getLegendryPokemon(bot, msg, typePokemon) {
  const trainerSpot = 2; //where is poke trainer ?
  const { message_id } = await bot.sendMessage(msg.chat.id, "Searching...");

  try {
    const pokemonList = await axios
      .get(`https://pokeapi.co/api/v2/generation/${trainerSpot}/`)
      .then((res) => {
        return res.data.pokemon_species;
      });

    const data = await Promise.all(
      pokemonList.map(async (ele) => {
        try {
          const randomPokemon = await axios.get(ele.url).then((res) => {
            if (res.data.is_legendary) {
              return {
                id: res.data.id,
                name: res.data.name,
              };
            }
          });

          return randomPokemon;
        } catch (err) {
          console.log(err);
        }
      })
    );

    const mythicalPokemon = await data.filter((el) => el);

    const getRandomLevel =
      Math.floor(Math.random() * mythicalPokemon.length) + 1;

    const randomPokemon = await mythicalPokemon.reduce((acc, el, index) => {
      // console.log(acc)

      if (index + 1 === getRandomLevel) {
        return (acc = el);
      }
      return acc;
    }, {});

    await fetchPokemonDetail(randomPokemon.id, typePokemon, bot, msg);
    await bot.deleteMessage(msg.chat.id, message_id);
  } catch (err) {
    console.log(err);
    await bot.sendMessage(
      msg.chat.id,
      "Something went wrong , Please try again"
    );
    //  await bot.deleteMessage(msg.chat.id , message_id)
  }
}

async function getRarePokemon(bot , msg , typePokemon) {
  const trainerSpot = 2; //where is poke trainer ?
  const  {message_id}  = await bot.sendMessage(msg.chat.id, "Searching...")
  
  const rarePokemon = pokemonjson[trainerSpot]
  
  const getRandomLevel =
      Math.floor(Math.random() * rarePokemon.length) + 1;

    const randomPokemon =  rarePokemon.reduce((acc, el, index) => {
      // console.log(acc)

      if (index + 1 === getRandomLevel) {
        return (acc = el);
      }
      return acc;
    }, {});
    
     fetchPokemonDetail(randomPokemon.name.toLowerCase(), typePokemon, bot, msg);
        await bot.deleteMessage(msg.chat.id, message_id);
}

function getTMs(bot , msg) {
  const chatId = msg.chat.id
  const getRandomLevel = Math.floor(Math.random() * TMsList.length) + 1;
  
  TMsList.forEach((el , index) => {
    if(index+1 === getRandomLevel) {
      el.name = el.name.substring(0 , 2).toUpperCase() + el.name.slice(2)
      bot.sendMessage(chatId , `<b>${el.name}</b> 💿 found!` , {
         reply_to_message_id: msg.message_id,
        parse_mode : 'HTML'
      })
    }
  })
  
}

function getRandomLevel(minLevel, maxLevel) {
  const range = maxLevel - minLevel + 1;

  const randomLevel = Math.floor(Math.random() * range) + minLevel;

  return randomLevel;
}




module.exports = {
  getTMs,
  getRarePokemon,
  evYieldoptions,
  chooseinitoptions,
  evYieldPopup,
  getMinMaxPokemonLevel,
  getRandomPokemon,
  getMythicalPokemon,
  getLegendryPokemon,
};
