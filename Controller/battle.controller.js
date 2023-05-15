const axios = require("axios");
const { userPokeModal } = require("../model/userPoke");
const {
  mainPokemonStats,
  calculateDamage,
} = require("./pokemonStats.controller");
const {
  getBaseStats,
  generateIVs,
  generateNat,
  getMoves,
  getTypes,
  getExperience,
  getAbilites,
} = require("./user.controller");
let { getPreviousMessageId, setPreviousMessageId } = require("./controller");
const { canHunt, startBattle, endBattle } = require("./battle.fnc");
const {
  trainerBattlePokemon,
  getBattleWildPokemon,
  dealtDamage,
  getWildPokemon,
  selectPokemon,
  getPokemonMoves,
  makeProperName,
  previousPokemonname,
  myPokemonTeam,
} = require("./pokemon.controller");
const { battleBeginMsg, fledPokemonMsg, movesMsg, battleBeginMoves, WildPokemonOutMsg, changePokemonMsgAttack, choosePokemonMsgwhileBattle } = require("../Message Format/BattleMsg");

let isMoving;

const baseStats = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

function generateEVs() {
  return {
    hp: 0,
    attack: 0,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
  };
}

async function battle(bot, query) {
  const battle_id =
    query.message &&
    query.message.reply_to_message &&
    query.message.reply_to_message.message_id;
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const pokemonName = query.data.trim().split(" ")[1];
  const pokeLvl = query.data.trim().split(" ").map(Number)[2];
  const prevMessageId = getPreviousMessageId();

  try {
    if (!canHunt(userId) && prevMessageId !== battle_id) {
      bot.answerCallbackQuery(query.id, "The Pokemon has fled");
    } else if (!canHunt(userId)) {
      bot.answerCallbackQuery(query.id, "You're Currently in Pokemon Battle");
    } else {
      const pokeDetail = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
      );

      const opponentPokemon = await getOpponentPokemon(
        pokeDetail,
        pokeLvl,
        pokemonName
      );
      const trainerPokemon = await getTrainerPokemon(userId);
      const pokeBattleDetail = getBattleWildPokemon(
        trainerPokemon,
        opponentPokemon,
        userId
      );
      const trainerBattlePokemon = pokeBattleDetail.selectPokemon;
      const wildPokemon = pokeBattleDetail.wildPokemon;

      const inline_keyboard = [];

      let moves_message = "";
      let trainerPokemonMoves = [];
      trainerBattlePokemon.moves.forEach((ele) => {
        let [first, second] = ele.name.split("-");
        first = first.charAt(0).toUpperCase() + first.slice(1);
        const text = `${second ? first + " " + second : first}`;
        const callback_data = `fight ${ele.power} ${ele.type} ${ele.accuracy} ${text}`;

        moves_message += `${text} [${ele.type}]
  Power:   ${ele.power},     Accuracy: ${ele.accuracy}
  `;

        trainerPokemonMoves.push({
          text,
          callback_data,
        });
        if (trainerPokemonMoves.length % 2 === 0) {
          inline_keyboard.push(trainerPokemonMoves);
          trainerPokemonMoves = [];
        }
      });

      inline_keyboard.push([
        { text: "Poke Balls", callback_data: "mypokeballs" },
        { text: "Run", callback_data: "game_left" },
        { text: "Pokemon", callback_data: "mypokemonTeam" },
      ]);

      await bot
        .sendMessage(
          chatId,
          battleBeginMsg({pokemonName , wildPokemon , trainerBattlePokemon , query , pokeLvl , moves_message}),
          {
            reply_markup: {
              inline_keyboard: inline_keyboard,
            },
            parse_mode: "HTML",
          }
        )
        .then((res) => {
          startBattle(userId);
          isPlayingMove(bot, chatId, res.message_id, userId);
          bot.answerCallbackQuery(
            query.id,
            fledPokemonMsg(pokemonName)
          );
        });
    }
  } catch (err) {
    console.log(err);
  }
}

async function battleBeginFight(bot, query, command, pokeId) {
  let Prevkeyboard = query.message.reply_markup.inline_keyboard;

  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const messageId = query.message.message_id;
  const wildPokemon = getWildPokemon(userId);
  const trainerBattlePokemon = selectPokemon(userId, pokeId);

  if (pokeId) {
    bot.answerCallbackQuery(query.id , `Go ${makeProperName(trainerBattlePokemon.name)}`)
    Prevkeyboard = getPokemonMoves(trainerBattlePokemon.moves);
  }

  try {
    const botTotalHP = wildPokemon.stats.totalhp;
    const trainerTotalHP = trainerBattlePokemon.stats.totalhp;
    const movePower = query.data.split(" ").map(Number)[1];
    const moveType = query.data.trim().split(" ")[2];
    const moveName = query.data.trim().split(" ")[4];
    const moveAccuracy = query.data.trim().split(" ").map(Number)[3];
    const randomMove = Math.floor(
      Math.random() * (wildPokemon.moves.length - 1)
    );
    const botMovePower = wildPokemon.moves[randomMove].power;
    const botMoveType = wildPokemon.moves[randomMove].type;
    const botMoveName = wildPokemon.moves[randomMove].name;
    const botMoveAccuracy = wildPokemon.moves[randomMove].accuracy;

    const botChance = calculateHitChance(botMoveAccuracy);
    const myChance = calculateHitChance(moveAccuracy);

    let myDamage =
      command !== "catchPokemon" &&
      !pokeId &&
      (await calculateDamage(
        trainerBattlePokemon,
        wildPokemon,
        movePower,
        moveType
      ));
    let botDamage = await calculateDamage(
      wildPokemon,
      trainerBattlePokemon,
      botMovePower,
      botMoveType
    );

    if(command !== 'catchPokemon' && command !== 'changePokemon') {
       dealtDamage(bot, query, botDamage, myDamage, userId, pokeId);
    }
     

    // if (!botChance) {
    //   botDamage.Damage = 0;
    //   const randomMsg = [
    //     `The ${wildPokemon.name} <b>${botMoveName}'s</b> Attack Misseed`,
    //     `The ${trainerBattlePokemon.name} dodged <b>${botMoveName}</b> Attack`,
    //   ];
    //   const val = Math.floor(Math.random() * randomMsg.length - 0) + 0;
    //   botDamage.message = randomMsg[val];
    // } else if (!myChance) {
    //   myDamage.Damage = 0;
    //   const randomMsg = [
    //     `The ${trainerBattlePokemon.name} <b>${moveName}'s</b> Attack Misseed`,
    //     `The ${wildPokemon.name} dodged <b>${moveName}</b> Attack`,
    //   ];
    //   const val = Math.floor(Math.random() * randomMsg.length - 0) + 0;
    //   myDamage.message = randomMsg[val];
    // }

    if (command === "changePokemon" || command === 'catchPokemon' && previousPokemonname(userId).currenthp > 0) {
        dealtDamage(bot, query, botDamage, { Damage: 0 }, userId, pokeId);
        
    } else if (command === "changePokemon"  && previousPokemonname(userId).currenthp <= 0) {
       if(wildPokemon.stats.speed > trainerBattlePokemon.stats.speed) {
        dealtDamage(bot, query, botDamage, { Damage: 0 }, userId, pokeId);
       } else {
        dealtDamage(bot, query, { Damage: 0 }, { Damage: 0 }, userId, pokeId);
       }
    }

    if (trainerBattlePokemon.stats.currenthp <= 0) {
      trainerBattlePokemon.stats.currenthp = 0;
    }
    if (wildPokemon.stats.currenthp <= 0) {
      wildPokemon.stats.currenthp = 0;
    }

    const botHP = (wildPokemon.stats.currenthp / botTotalHP) * 100;
    const trainerHP =
      (trainerBattlePokemon.stats.currenthp / trainerTotalHP) * 100;
    const moves_message = movesMsg(trainerBattlePokemon.moves);

    const trainerProgressBar = progressBar(trainerHP);
    const BotProgressBar = progressBar(botHP);

    let Prev_message = battleBeginMoves({ trainerProgressBar , userId ,wildPokemon , botMoveName , botDamage , botTotalHP , BotProgressBar , query , trainerBattlePokemon , moves_message})
    
    if(command === 'changePokemon') {
       Prev_message = battleBeginMoves({ trainerProgressBar , userId ,wildPokemon , botMoveName , botDamage , botTotalHP , BotProgressBar , query , trainerBattlePokemon , moves_message , command})
    }


    if (command !== "catchPokemon" && command !== "changePokemon") {
    let myDamageMsg = WildPokemonOutMsg({myDamage , moveName , trainerBattlePokemon , wildPokemon , userId})
      
      await bot
        .editMessageText(myDamageMsg, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: "HTML",
        })
        .then(() => {
          clearTimeout(isMoving);
          isPlayingMove(bot, chatId, messageId);
        });
        
    }

    if (command === "changePokemon") {
      
     const message = changePokemonMsgAttack({userId , trainerBattlePokemon , wildPokemon})
    
      if(previousPokemonname(userId).currenthp > 0) {
         await bot
        .editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: "HTML",
        })
        .then(() => {
          clearTimeout(isMoving);
          isPlayingMove(bot, chatId, messageId);
        });
      } else if (wildPokemon.stats.speed > trainerBattlePokemon.stats.speed) {
          await bot
        .editMessageText(message, {
          chat_id: chatId,
          message_id: query.message.message_id,
          parse_mode: "HTML",
        })
        .then(() => {
          clearTimeout(isMoving);
          isPlayingMove(bot, chatId, messageId);
        });
      }
      
    }


    setTimeout(() => {
      
      if(wildPokemon.stats.currenthp <= 0) {
        endBattle(userId)
      } else if (trainerBattlePokemon.stats.currenthp === 0) {
         
        let message = choosePokemonMsgwhileBattle({trainerBattlePokemon , trainerProgressBar , wildPokemon , userId , botMoveName , BotProgressBar , query })

         myPokemonTeam(bot , query , message)
         
      } else {
        !canHunt(userId) && bot
          .editMessageText(Prev_message, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "HTML",
          })
          .then(async () => {
            await bot.editMessageReplyMarkup(
              {
                inline_keyboard: Prevkeyboard,
              },
              {
                chat_id: chatId,
                message_id: messageId,
              }
            );
          });
      }
    }, 2000);

    bot.answerCallbackQuery(query.id);
  } catch (err) {
    console.log(err);
    // bot.sendMessage(chatId , "Something went wrong Please try again")
  }
}

function progressBar(hp) {
  const progressBarLength = 10; // Length of the progress bar
  const progressBarFilled = Math.round((hp / 100) * progressBarLength); // Calculate the filled portion of the progress bar
  const progressBarEmpty = progressBarLength - progressBarFilled; // Calculate the empty portion of the progress bar

  const progressBar =
    "█".repeat(progressBarFilled) + "▒".repeat(progressBarEmpty);

  return progressBar;
}

async function getTrainerPokemon(userId) {
  const teamLoad = 1;
  const pokeDetail = await userPokeModal
    .find({ trainer: userId, group: teamLoad })
    .maxTime(30000);

  let myTeamArray = pokeDetail.map((pokes) => {
    const level = pokes.level;
    const pokeMoves = pokes.moves;
    const types = pokes.type;
    const abilities = pokes.abilities;
    const baseStats = pokes.baseStats;
    const pokeEVs = pokes.ev;
    const experience = pokes.experience;
    const pokeNat = pokes.nature;
    const pokeIVs = pokes.iv;

    const mainStats = mainPokemonStats(
      baseStats,
      pokeIVs,
      pokeEVs,
      level,
      pokeNat
    );

    const myPokemon = {
      name: pokes.name,
      nickname: pokes.nickname ? pokes.nickname : null,
      poke_id: `${pokes._id}`,
      level,
      type: types,
      stats: mainStats,
      moves: pokeMoves,
    };
    return myPokemon;
  });

  return myTeamArray;
}

async function getOpponentPokemon(pokeDetail, pokeLvl, pokemonName) {
  const moves = pokeDetail.data.moves;
  const types = pokeDetail.data.types;
  const abilities = pokeDetail.data.abilities;
  const stats = pokeDetail.data.stats;

  try {
    const pokeTypes = getTypes(types);
    const pokeMoves = await getMoves(moves, pokeLvl);
    const pokeAbilities = await getAbilites(abilities);
    const pokeBaseStats = getBaseStats(stats);
    const pokeNat = await generateNat();
    const pokeIVs = generateIVs();
    const pokeEVs = generateEVs();
    const pokeExp = await getExperience(pokeLvl, pokemonName);
    const mainStats = mainPokemonStats(
      pokeBaseStats,
      pokeIVs,
      pokeEVs,
      pokeLvl,
      pokeNat
    );

    return {
      name: pokemonName,
      level: pokeLvl,
      iv: pokeIVs,
      ev: pokeEVs,
      abilities: pokeAbilities,
      baseStats: pokeBaseStats,
      nature: pokeNat,
      experience: pokeExp,
      type: pokeTypes,
      stats: mainStats,
      moves: pokeMoves,
    };
  } catch (err) {
    console.log(err);
  }
}

function ProperMoveName(moveName) {
  // console.log(moveName)
  let [first, second] = moveName.trim().split("-");

  first = first.charAt(0).toUpperCase() + first.slice(1);
  second = second && second.charAt(0).toUpperCase() + second.slice(1);

  const fullMoveName = second ? `${first} ${second}` : first;

  return fullMoveName;
}

function isPlayingMove(bot, chatId, message_id, userId) {
  isMoving = setTimeout(() => {
    canHunt(userId) &&
      bot.editMessageText("The Pokemon has fled", {
        chat_id: chatId,
        message_id,
      });
    endBattle(userId);
    setPreviousMessageId();
  }, 60000);
}

function calculateHitChance(moveAccuracy) {
  const baseAccuracy = moveAccuracy;
  const evasionStage = 0; // Assuming no evasion stage modification
  const accuracyModifier = (3 - evasionStage) / 3; // Calculate accuracy modifier

  const hitChance = baseAccuracy * accuracyModifier;

  const randomNum = Math.random() * 100;

  // Check if the move hits based on the calculated hit chance
  if (randomNum <= hitChance) {
    return true;
  } else {
    return false;
  }
  // In this example, the randomNum variable is a randomly generated number between 0 and 100. By comparing it to the calculated hit chance (chanceOfHitting), you can determine whether the move hits or misses.

  // You can integrate this code into your existing battle or game logic to handle move accuracy and determine the outcome of moves.
}

module.exports = {
  battle,
  battleBeginFight,
  ProperMoveName,
  calculateDamage,
};
