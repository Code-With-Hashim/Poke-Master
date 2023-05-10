const axios = require("axios");
const { userModel } = require("../model/userDetail");
const { userInvModal } = require("../model/userInventory");
const { userPokeModal } = require("../model/userPoke");

const starterPack = [
  {
    name: "regular balls",
    defaultName: "regular-ball",
    stock: 3,
  },
  {
    name: "great balls",
    defaultName: "great-ball",
    stock: 1,
  },
  {
    name: "ultra balls",
    defaultName: "ultra-ball",
    stock: 1,
  },
];

async function choosePokemon(bot, query) {
  const pokemonName = query.data.trim().split(" ")[1];
  const chatId = query.message.chat.id;
  try {
    // const isUserExist = await userModel.findOne({ _id: chatId });
    const pokeDetail = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );

    const moves = pokeDetail.data.moves;
    const types = pokeDetail.data.types;
    const abilities = pokeDetail.data.abilities;
    const stats = pokeDetail.data.stats;

    const pokeLvl = 5;
    const pokeTypes = getTypes(types);
    const pokeMoves = await getMoves(moves, pokeLvl);
    const pokeAbilities = await getAbilites(abilities);
    const pokeBaseStats = getBaseStats(stats);
    const pokeNat = await generateNat();
    const pokeIVs = generateIVs();
    const pokeExp = await getExperience(pokeLvl, pokemonName);
    const trainer = await query.message.chat.id;

    const data = await userInvModal.create({
      owner: chatId,
      pokeBalls: starterPack,
    });

    const isDataEntrySucceed = await userPokeModal.create({
      name: pokemonName,
      abilities: pokeAbilities,
      baseStats: pokeBaseStats,
      experience: pokeExp,
      iv: pokeIVs,
      level: pokeLvl,
      moves: pokeMoves,
      nature: pokeNat,
      type: pokeTypes,
      trainer,
    });

    if (isDataEntrySucceed) {
      const userPokeId = isDataEntrySucceed._id;
      const prevPokeName =
        pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1);

      bot
        .sendMessage(
          query.message.chat.id,
          `What will be <b>${prevPokeName}'s</b> new name?`,
          {
            parse_mode: "HTML",
            reply_markup: {
              force_reply: true,
              // one_time_keyboard: true,
            },
          }
        )
        .then((msg) => {
          const messageId = msg.message_id;

          bot.on("message", async (message) => {
            if (
              message.reply_to_message &&
              message.chat.id === query.message.chat.id &&
              message.reply_to_message.message_id === messageId
            ) {
              const nickName = message.text;

              // Do something with the user's name here

              // Send a confirmation message
              const isNickNameChangeSucceed =
                await userPokeModal.findByIdAndUpdate(
                  { _id: userPokeId },
                  { nickname: nickName }
                );

              if (isNickNameChangeSucceed) {
                bot.sendMessage(
                  query.message.chat.id,
                  `${prevPokeName} will now be called <b>${nickName}</b>`,
                  {
                    reply_to_message_id: message.message_id,
                    parse_mode: "HTML",
                  }
                );
              }
            }
          });
        });
    }
  } catch (err) {
    console.log(err);
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateIVs() {
  const ivs = {};
  ivs.hp = getRandomInt(0, 31);
  ivs.attack = getRandomInt(0, 31);
  ivs.defense = getRandomInt(0, 31);
  ivs.specialAttack = getRandomInt(0, 31);
  ivs.specialDefense = getRandomInt(0, 31);
  ivs.speed = getRandomInt(0, 31);
  return ivs;
}

function getTypes(types) {
  const pokeTypes = [];

  for (let i = 0; i < types.length; i++) {
    pokeTypes.push(types[i].type.name);
  }

  return pokeTypes;
}

async function getMoves(moves, pokeLvl) {
  const moves_name = [];

  try {
    for (let i = 0; i < moves.length; i++) {
      const movesVersion = moves[i].version_group_details;
      const move_name = moves[i].move.name;
      for (let j = 0; j < movesVersion.length; j++) {
        const moveLearnMethod = movesVersion[j].move_learn_method.name;
        const lvlLearnedAt = movesVersion[j].level_learned_at;

        if (moveLearnMethod === "level-up" && lvlLearnedAt <= pokeLvl) {
          // moves_name.push(move_name)
          // console.log(move_name , lvlLearnedAt)
          const pokePower = await axios.get(moves[i].move.url);
          const {
            power,
            accuracy,
            type: { name },
          } = pokePower.data;

          if (power !== null && accuracy !== null) {
            moves_name.push({
              name: move_name,
              power,
              accuracy,
              type : name
            });
          }
          break;
        }
      }
    }
    while(moves_name.length > 4) {
      moves_name.shift()
    } 
  return moves_name;
  
    console.log(moves)
  } catch (error) {
    console.log(error);
  }

}

async function getAbilites(ability) {
  const abilities = [];

  for (let i = 0; i < ability.length; i++) {
    const pokeEffect = await axios.get(ability[i].ability.url);

    const effectEntries = pokeEffect.data.effect_entries;

    for (let j = 0; j < effectEntries.length; j++) {
      if (effectEntries[j].language.name === "en") {
        abilities.push({
          name: ability[i].ability.name,
          effect: effectEntries[j].effect,
        });
      }
    }
  }

  return abilities;
}

function getBaseStats(stats) {
  const baseStats = {};
  const baseStatsName = [
    "hp",
    "attack",
    "defense",
    "specialAttack",
    "specialDefense",
    "speed",
  ];

  for (let i = 0; i < baseStatsName.length; i++) {
    baseStats[baseStatsName[i]] = stats[i].base_stat;
  }

  return baseStats;
}

async function generateNat() {
  const natureList = [
    "Hardy",
    "Lonely",
    "Brave",
    "Adamant",
    "Naughty",
    "Bold",
    "Docile",
    "Relaxed",
    "Impish",
    "Lax",
    "Timid",
    "Hasty",
    "Serious",
    "Jolly",
    "Naive",
    "Modest",
    "Mild",
    "Quiet",
    "Bashful",
    "Rash",
    "Calm",
    "Gentle",
    "Sassy",
    "Careful",
    "Quirky",
  ];
  const NatStats = {
    stats: {},
  };
  const NatStatsName = [
    {
      stats: "hp",
      name: "hp",
    },
    {
      stats: "attack",
      name: "attack",
    },
    {
      stats: "defense",
      name: "defense",
    },
    {
      stats: "special-attack",
      name: "specialAttack",
    },
    {
      stats: "special-defense",
      name: "specialDefense",
    },
    {
      stats: "speed",
      name: "speed",
    },
  ];
  //  "hp", "attack", "defense", "specialAttack", "", "speed"
  const randomNum = Math.floor(Math.random() * natureList.length);

  const randomNat = natureList[randomNum];

  try {
    const natureDetail = await axios.get(
      `https://pokeapi.co/api/v2/nature/${randomNat.toLowerCase()}`
    );

    NatStats.name = randomNat;

    console.log(randomNat);
    for (let i = 0; i < NatStatsName.length; i++) {
      if (
        natureDetail.data.decreased_stat !== null &&
        NatStatsName[i].stats === natureDetail.data.decreased_stat.name
      ) {
        NatStats.stats[NatStatsName[i].name] = -10;
      }
    }
    for (let i = 0; i < NatStatsName.length; i++) {
      if (
        natureDetail.data.increased_stat !== null &&
        NatStatsName[i].stats === natureDetail.data.increased_stat.name
      ) {
        NatStats.stats[NatStatsName[i].name] = 10;
      }
    }

    return NatStats;
  } catch (err) {
    console.log(err);
  }
}

async function getExperience(level, pokeName) {
  try {
    const growthRate = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${pokeName}`
    );

    const growthRateName = growthRate.data.growth_rate.name;
    let totalExp = 0;

    switch (growthRateName) {
      case "fast": {
        totalExp = Math.floor(0.8 * Math.pow(level, 3));
        return totalExp;
      }
      case "medium-fast": {
        totalExp = Math.floor(level ** 3);
        return totalExp;
      }
      case "medium-slow": {
        totalExp = Math.floor(
          1.2 * Math.pow(level, 3) - 15 * Math.pow(level, 2) + 100 * level - 140
        );
        return totalExp;
      }
      case "slow": {
        totalExp = Math.floor(1.25 * Math.pow(level, 3));
        return totalExp;
      }
      default: {
        return "Invalid growth Rate Name";
      }
    }
  } catch (err) {
    console.log(err);
  }
}

async function getInventory(bot, msg, match) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  try {
    const { pokeDollars, pokeBalls, pokeItems } = await userInvModal.findOne({
      owner: userId,
    });

    let message = `<b>Poke Dollars 💵: ${pokeDollars}</b>
  
`;

    for (let i = 0; i < pokeBalls.length; i++) {
      let [firstName, secondName] = pokeBalls[i].name.split(" ");
      firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      secondName = secondName.charAt(0).toUpperCase() + secondName.slice(1);

      const name = `${firstName} ${secondName}`;

      message += `${name}: ${pokeBalls[i].stock} \n`;
    }

    if (pokeItems.length !== 0) {
      message += `<b>————————————</b>\n<b>Items</b>:\n\n`;
      pokeItems.forEach((userItem) => {
        let [firstName, secondName] = userItem.name.split(" ");
        firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

        if (secondName !== undefined) {
          secondName = secondName.charAt(0).toUpperCase() + secondName.slice(1);
        }

        const name = `${firstName} ${
          secondName !== undefined ? secondName : ""
        }`;

        message += `${name.trim()}: ${userItem.stock} \n`;
      });
    }

    const keyboard = {
      inline_keyboard: [
        [
          { text: "Mega Stones", callback_data: "mymegastones" },
          { text: "TM", callback_data: "mytm" },
        ],
      ],
    };

    bot.sendMessage(chatId, message, {
      reply_to_message_id: msg.message_id,
      reply_markup: keyboard,
      parse_mode: "HTML",
    });
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  choosePokemon,
  getInventory,
  getTypes,
  getMoves,
  getAbilites,
  getBaseStats,
  generateIVs,
  generateNat,
  getExperience
};

// const pokeTypes = getTypes(types);
//     const pokeMoves = await getMoves(moves, pokeLvl);
//     const pokeAbilities = await getAbilites(abilities);
//     const pokeBaseStats = getBaseStats(stats);
//     const pokeNat = await generateNat();
//     const pokeIVs = generateIVs();
//     const pokeExp = await getExperience(pokeLvl, pokemonName);
