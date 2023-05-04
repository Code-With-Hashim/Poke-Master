const axios = require("axios");

async function fetchKantoPokemon(random) {
  const url = "https://pokeapi.co/api/v2/pokemon?limit=151";
  try {
    const kantoPokemon = await axios.get(url);

    let pokeDetail = undefined;

    kantoPokemon &&
      kantoPokemon.data.results &&
      kantoPokemon.data.results.forEach((element) => {
        const pokemonDex = element.url.split("/").map(Number)[6];

        if (pokemonDex === random) {
          pokeDetail = fetchPokemonDetail(pokemonDex);
        }
      });
    return pokeDetail && pokeDetail;
  } catch (error) {
    console.log(error);
  }
}

const fetchPokemonDetail = async (pokeId) => {
  const url = `https://pokeapi.co/api/v2/pokemon/${pokeId}`;
  const pokeDetail = await axios.get(url);

  return pokeDetail.data;
};

function evYieldoptions(res) {
  const ev_point = [];

  for (let i = 0; i < res.stats.length; i++) {
    if (res.stats[i].effort !== 0) {
      ev_point.push({
        ev_name: res.stats[i].stat.name,
        ev_value: res.stats[i].effort,
      });
    }
  }

  //  console.log(res.)

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "Battle", callback_data: `battle ${res.name}` },
          {
            text: "EV Yield",
            callback_data: `ev_yield ${JSON.stringify(ev_point)}`,
          },
        ],
      ],
    },
  };

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
  const data = JSON.parse(query.data.trim().split(" ")[1]);
  const pokeName = query.message.caption.trim().split(" ")[2];
  let message = `If you defeat ${pokeName}, your pokemon will gain the following EV points: \n\n`;

  for (let i = 0; i < data.length; i++) {
    const name =
      data[i].ev_name.charAt(0).toUpperCase() + data[i].ev_name.slice(1);

    message += `+${data[i].ev_value} ${
      data[i].ev_name === "hp" ? "HP" : name
    } Point \n`;
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
    
    const randomLevel = getRandomLevel(minLevel , maxLevel)
    
    return randomLevel
    
  } catch (error) {
    console.error(error);
  }
}

function getRandomLevel(minLevel , maxLevel) {
  
  const range = maxLevel - minLevel + 1
  
  const randomLevel = Math.floor(Math.random() * range) + minLevel
  
  return randomLevel
  
}






module.exports = {
  fetchKantoPokemon,
  evYieldoptions,
  chooseinitoptions,
  evYieldPopup,
  getMinMaxPokemonLevel,
};
