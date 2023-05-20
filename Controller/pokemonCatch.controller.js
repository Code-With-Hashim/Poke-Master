const axios = require("axios");
const ballModifiers = require("../ballModifier.json");
const { userModel } = require("../model/userDetail");
const { userInvModal } = require("../model/userInventory");
const { userPokeModal } = require("../model/userPoke");
const {
  wildPokemon,
  ProperMoveName,
  battleBeginFight,
} = require("./battle.controller");
const { endBattle } = require("./battle.fnc");
const { selectPokemon, getWildPokemon } = require("./pokemon.controller");

let reply_markup;

async function MyListPokeballs(bot, query) {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const messageId = query.message.message_id;
  reply_markup = query.message.reply_markup.inline_keyboard;


  try {
    const inline_pokeBalls = await makeMyPokeBallList(userId)
    

    bot.editMessageReplyMarkup(
      { inline_keyboard: inline_pokeBalls },
      {
        chat_id: chatId,
        message_id: messageId,
      }
    );
  } catch (err) {
    console.log(err);
  }
}


async function makeMyPokeBallList(userId) {
  
      const { pokeBalls } = await userInvModal.findOne({ owner: userId });

  
  const inline_pokeBalls = [];

    let trainerBalls = [];

    for (let i = 0; i < pokeBalls.length; i++) {
      trainerBalls.push(isMake(pokeBalls[i].name));

      if (pokeBalls.length % 3 === 0) {
        if (trainerBalls.length % 3 === 0) {
          inline_pokeBalls.push(trainerBalls);
          trainerBalls = [];
        }
      } else if (pokeBalls.length % 2 === 0) {
        inline_pokeBalls.push(trainerBalls);
        trainerBalls = [];
      } else {
        inline_pokeBalls.push(trainerBalls);
        trainerBalls = [];
      }
    }

    inline_pokeBalls.push([
      {
        text: "🔙",
        callback_data: `poke-back`,
      },
    ]);
    
    return inline_pokeBalls
}

function isMake(ballName) {
  let first = ballName.trim().split(" ")[0];
  let fullName = ballName.trim().split(" ").join("-");
  first = first.charAt(0).toUpperCase() + first.slice(1);
  return {
    text: first,
    callback_data: `catchPokemon ${fullName}`,
  };
}

async function pokemonCatch(bot, query) {
  // ballName, level, wildLevel, hasCaught, baseSpeed, types
  // maxHP, currentHP, catchRate, ballModifier, statusModifier

  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const message_id = query.message.message_id;
  const usePokeBall = query.data.trim().split(" ")[1]; //ballName

  try {
    const userPokemonLevel = selectPokemon(userId).level; // level
    const wildPokemonLevel = getWildPokemon(userId).level; //wildLevel
    const hasCaught = await userHavePokemon(getWildPokemon(userId).name, userId); // hasCaught
    const wildBaseSpeed = getWildPokemon(userId).baseStats.speed; // baseSpeed
    const wildTypes = getWildPokemon(userId).type; // types
    const maxHP = getWildPokemon(userId).stats.totalhp; //maxHP
    const currentHP = getWildPokemon(userId).stats.currenthp;
    const catchRate = await getWildCatchRate(getWildPokemon(userId).name);
    const ballModifier = calculateBallModifier(
      usePokeBall,
      userPokemonLevel,
      wildPokemonLevel,
      hasCaught,
      wildBaseSpeed,
      wildTypes
    );
    const statusModifier = 1;
    const randomMove = Math.floor(
      Math.random() * (getWildPokemon(userId).moves.length - 1)
    );

    const catchChance = calculateCatchRate(
      maxHP,
      currentHP,
      catchRate,
      ballModifier,
      statusModifier
    );

    // makeAuserBallName(usePokeBall)
    userInvModal
      .updateOne(
        { owner: userId, "pokeBalls.name": makeAuserBallName(usePokeBall) },
        { $inc: { "pokeBalls.$.stock": -1 } },
        {
          new: true,
        }
      )
      .then( async (res) => {
        const response = await userInvModal.updateOne(
          { owner: userId, "pokeBalls.stock": 0 },
          { $pull: { pokeBalls: { stock: 0 } } },
          { new: true }
        );


        if (res.matchedCount >= 1) {
          const isCaught = isPokemonCaught(catchChance);

          let message = `You used one ${ProperMoveName(usePokeBall)} \n`;

          let MakeCount = isCaught ? 4 : Math.floor(Math.random() * 4);
          let count = 0;
          const delay = calculateThrowTime();
          const InterValId = setInterval(() => {
            count++;
            if (count >= MakeCount && isCaught) {
              isCaughtSuccess(bot, usePokeBall, chatId, message_id, userId);
              endBattle(userId);
              clearInterval(InterValId);
            } else if (count >= MakeCount && !isCaught) {
              isCaughtFailed(wildPokemon, usePokeBall, bot, chatId, message_id , delay , userId , query);
              //  setInActiveBattle()
              clearInterval(InterValId);
            } else {
              message = message + " " + "•";
              bot.editMessageText(message, {
                chat_id: chatId,
                message_id,
              });
            }
          }, delay);
        }
      });

    // console.log(isCaught)
  } catch (err) {
    console.log(err);
  }
}

function makeAuserBallName(useBall) {
  const ballName = useBall.trim().split("-").join(" ");
  return ballName;
}

function calculateThrowTime() {
  const randomTimer = Math.floor(Math.random() * 4000 + 1) + 1000;

  return randomTimer;
}

function isPokemonCaught(calculatedCatchRate) {
  const randomValue = Math.random() * 100; // Generate a random number between 0 and 100
  return randomValue <= calculatedCatchRate; // Compare the random value with the calculated catch rate
}

async function getWildCatchRate(pokeName) {
  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon-species/${pokeName}`
    );

    const catchRate = response.data.capture_rate;

    return catchRate;
  } catch (err) {
    console.log(err);
  }
}
async function isCaughtSuccess(bot, usePokeBall, chatId, message_id, userId) {
  message = `You used one ${ProperMoveName(usePokeBall)} \n ☆ ☆ ☆`;
  bot.editMessageText(message, {
    chat_id: chatId,
    message_id,
  });

  try {
    
    const pokeLimit = await userPokeModal.find({trainer : userId , group : 1 })
    
    if(pokeLimit.length < 6) {    
    await userPokeModal
      .create({ ...getWildPokemon(userId), trainer: userId , group : 1 })
      .then(() => {
        bot
          .editMessageText("You Caught Wild Pokemon", {
            chat_id: chatId,
            message_id,
          })
          .then(() => {
            bot.editMessageReplyMarkup(
              {
                inline_keyboard: [
                  [
                    { text: "View Poke Stats", callback_data: "viewPokeStats" },
                    { text: "View Pokedex", callback_data: "viewPokedex" },
                  ],
                  [
                    { text: "Nickname", callback_data: "nickname" },
                    { text: "Release", callback_data: "relasePoke" },
                  ],
                ],
              },
              {
                chat_id: chatId,
                message_id,
              }
            );
          });
      });
    } else {
      await userPokeModal
      .create({ ...getWildPokemon(userId), trainer: userId })
      .then(() => {
        bot
          .editMessageText("You Caught Wild Pokemon", {
            chat_id: chatId,
            message_id,
          })
          .then(() => {
            bot.editMessageReplyMarkup(
              {
                inline_keyboard: [
                  [
                    { text: "View Poke Stats", callback_data: "viewPokeStats" },
                    { text: "View Pokedex", callback_data: "viewPokedex" },
                  ],
                  [
                    { text: "Nickname", callback_data: "nickname" },
                    { text: "Release", callback_data: "relasePoke" },
                  ],
                ],
              },
              {
                chat_id: chatId,
                message_id,
              }
            );
          });
      });
    }
    
  } catch (err) {
    console.log(err);
  }
}

async function isCaughtFailed(wildPokemon, usePokeBall, bot, chatId, message_id , delay , userId , query) {
  const myPokeList = await makeMyPokeBallList(userId)
    
  message = `You're ${ProperMoveName(
    usePokeBall
  )} has failed \n\n ${ProperMoveName(getWildPokemon(userId).name)} attacking...`;
  bot.editMessageText(message, {
    chat_id: chatId,
    message_id,
  });
  query.message.reply_markup.inline_keyboard = myPokeList
  setTimeout(() => {
   battleBeginFight(bot, query, "catchPokemon");
   }, delay);
}

async function userHavePokemon(pokeName, userId) {
  try {
    const hasCaught = await userPokeModal.findOne({
      trainer: userId,
      name: pokeName,
    });

    return hasCaught ? true : false;
  } catch (err) {
    console.log(err);
  }
}

function calculateCatchRate(
  maxHP,
  currentHP,
  catchRate,
  ballRate,
  statusModifier
) {
  const numerator = (1 / maxHP) * 3 + catchRate * ballRate * statusModifier;
  const denominator =
    (currentHP * 2 * catchRate * ballRate * statusModifier) / (maxHP * 3);
  const catchRatePercentage = (numerator - denominator) / 256;

  return Math.floor(catchRatePercentage * 100);
}

// Example usage
// const maxHP = 100;
// const currentHP = 50;
// const catchRate = 30;
// const ballModifier = 1.5; // Let's say we're using a Great Ball
// const statusModifier = 1; // No status effect

function calculateBallModifier(
  ballName,
  level,
  wildLevel,
  hasCaught,
  baseSpeed,
  types
) {
  const ballModifier = ballModifiers[ballName];

  if (ballModifier) {
    if (ballName === "level-ball") {
      let { multiplier } =
        ballModifier.find(({ threshold }) => level >= wildLevel * threshold) ||
        {};
      return (multiplier = multiplier ? multiplier : 1);
    } else if (ballName === "fast-ball") {
      if (baseSpeed >= ballModifier.speedThreshold) {
        return ballModifier.modifier;
      }
    } else if (ballName === "repeat-ball") {
      return hasCaught ? ballModifier.hasCaught : ballModifier.modifier;
    } else if (ballName === "nest-ball") {
      if (wildLevel <= ballModifier.maxLevel) {
        return ballModifier.modifier[1];
      } else if (wildLevel <= ballModifier.maxLevel * 2) {
        return ballModifier.modifier[2];
      } else {
        return ballModifier.modifier[3];
      }
    } else if (ballName === "net-ball") {
      if (types.includes(...ballModifier.typeThreshold)) {
        return ballModifier.modifier;
      }
    }

    return ballModifier;
  }

  return 1; // Default modifier if ball name is not found
}

// Usage example
// const ballName = "level-ball";
// const level = 50;
// const wildLevel = 60;
// const hasCaught = false;
// const baseSpeed = 120;
// const types = ["water", "bug"];

// const ballModifier = calculateBallModifier(ballName, level, wildLevel, hasCaught, baseSpeed, types);

function pokeBack(bot, query) {
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;

  bot.editMessageReplyMarkup(
    {
      inline_keyboard: reply_markup,
    },
    {
      chat_id: chatId,
      message_id: messageId,
    }
  );
}

module.exports = { MyListPokeballs, pokeBack, pokemonCatch };
