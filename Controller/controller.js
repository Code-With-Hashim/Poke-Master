const Pokedex = require("pokeapi-js-wrapper");
const P = new Pokedex.Pokedex({ cache: false });
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
        { text: "Charmender", callback_data: "charmender" },
        { text: "Bulbasaur", callback_data: `bulbasaur` },
        { text: "Squirtal", callback_data: "squirtal" },
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

async function getMinMaxPokemonLevel(bot, query) {
  const pokeName = query.data.split(" ")[1];

  const pokeUrl = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokeName}`
  );
  const speciesUrl = await axios.get(pokeUrl.data.species.url);

  const url = speciesUrl.data.evolution_chain.url;

  try {
    const evolution_chain = await axios.get(url);
  let min_level = 0;
  let max_level = 0;

if (evolution_chain.data.chain.evolves_to.length !== 0) {
      
      
      
      if (evolution_chain.data.chain.species.name === pokeName) {
        min_level = 0;
        max_level = evolution_chain.data.chain.evolves_to[0].evolution_details[0].min_level
        
        if(max_level === null) {
          max = 24
        }
        

        
        console.log(min_level , max_level)// return {min_level , max_level
      } else if (evolution_chain.data.chain.evolves_to[0].species.name  == pokeName) {
        
        
        min_level = evolution_chain.data.chain.evolves_to[0].evolution_details[0].min_level
        max_level = evolution_chain.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level
        

        // return {min_level , max_level}
        console.log(min_level, max_level);
      } else {
        min_level = evolution_chain.data.chain.evolves_to[0].evolves_to[0].evolution_details[0].min_level
        max_level = 74;

        // return {min_level , max_level}
        console.log(min_level, max_level);
      }
 


   }
  } catch (error) {
    console.log(error);
  }
}
module.exports = {
  fetchKantoPokemon,
  evYieldoptions,
  chooseinitoptions,
  evYieldPopup,
  getMinMaxPokemonLevel,
};
