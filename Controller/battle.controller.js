const axios = require('axios');
const fs = require('fs')
const { userPokeModal } = require('../model/userPoke');
const { mainPokemonStats, calculateDamage } = require('./pokemonStats.controller');
const { getBaseStats, generateIVs, generateNat, getMoves, getTypes, getExperience, getAbilites } = require("./user.controller");
let { getPreviousMessageId } = require('./controller');
let opponentPokemon = null
let trainerPokemon = null

let isBattleActive = false



  const baseStats = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

function generateEVs() {
    return {
  hp: 0,
  attack: 0,
  defense: 0,
  specialAttack: 0,
  specialDefense: 0,
  speed: 0
}
}


async function battle(bot, query) {
  
  const battle_id = query.message.message_id
  const chatId = query.message.chat.id
  const userId = query.from.id
  const pokemonName = query.data.trim().split(" ")[1];
  const pokeLvl = query.data.trim().split(" ").map(Number)[2];
  const prevMessageId = getPreviousMessageId()
  
  
   console.log(prevMessageId)
  
  
  if(!isBattleActive && prevMessageId !== battle_id) {
    bot.answerCallbackQuery(query.id , 'The Pokemon has fled')
    return
  } else if (isBattleActive) {
    bot.answerCallbackQuery(query.id , "You're Currently in Pokemon Battle")
    return
  }
  
  // if(hunt_id !== battle_id) {
  //   bot.sendMessage(chatId , 'Cannot hunt while battling' , {
  //      reply_to_message_id: query.message.message_id, 
  //   })
  // }

  const pokeDetail = await axios.get(
    `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
  );
  
  
  opponentPokemon = await getOpponentPokemon(pokeDetail , pokeLvl , pokemonName)
  trainerPokemon = await getTrainerPokemon(userId)
  // pokemonJSON[userId] = {
  //   opponent : opponentPokemon,
  //   trainer : trainerPokemon,
  //   prevMessageId,
  //   isBattleActive : true
  // }
  
  
  const inline_keyboard = []
  // const Damage1 = calculateDamage(trainerPokemon , opponentPokemon)
  
  
  let moves_message = ""
  let trainerPokemonMoves = []
  trainerPokemon.moves.forEach((ele) => {
    let [first , second] = ele.name.split("-")
    first = first.charAt(0).toUpperCase() + first.slice(1)
     const text = `${second ? first+" "+second : first}`
     const callback_data = `fight ${ele.power} ${ele.type} ${ele.accuracy} ${text}`
     
     moves_message+=`${text} [${ele.type}]
Power:   ${ele.power},     Accuracy: ${ele.accuracy}
`
     
     
        trainerPokemonMoves.push({
       text,
       callback_data
     })
     if(trainerPokemonMoves.length%2 === 0 ) {
       inline_keyboard.push(trainerPokemonMoves)
       trainerPokemonMoves = [] 
     }
      
  })
  
  inline_keyboard.push([
    {text : 'Poke Balls' , callback_data : 'mypokeballs' },
    {text : 'Run' , callback_data : 'game_left' },
    {text : 'Pokemon' , callback_data : 'mypokemonTeam' },
  ])
  
   
await bot.sendMessage(chatId , `Battle begins!

Wild <b>${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}</b> [${opponentPokemon.type.join(", ")}]
Lv. ${pokeLvl}  •  HP ${opponentPokemon.stats.totalhp}/${opponentPokemon.stats.totalhp}
███████████

Current turn: <a href="tg://user?id=${query.from.id}">${query.from.first_name}</a>
<b>${trainerPokemon.name}</b> [${trainerPokemon.type.join(", ")}]
Lv. ${trainerPokemon.level}  •  HP ${trainerPokemon.stats.totalhp}/${trainerPokemon.stats.totalhp}
███████████

${moves_message}` , {
  reply_markup : {
    inline_keyboard : inline_keyboard
  },
  parse_mode : 'HTML'
}).then((res) => {
  isBattleActive = true
  // fs.writeFile('opponentPokemon.json' , JSON.stringify(pokemonJSON) , 'utf-8' , (data, err) => {
  //   // if(err) return 'something wrong'
  //   console.log(data)
  // })
  bot.answerCallbackQuery(query.id, `Lower ${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)}'s HP for a batter chance of catching it`);
})
}

async function battleBeginFight(bot , query) {
  
   const Prevkeyboard = query.message.reply_markup.inline_keyboard

  const userId = query.from.id
  const chatId = query.message.chat.id
  const messageId = query.message.message_id
   
   
  // console.log(trainerPokemon , opponentPokemon , movePower , moveType)
  const botTotalHP = opponentPokemon.stats.totalhp
  const trainerTotalHP = trainerPokemon.stats.totalhp
  const movePower = query.data.split(" ").map(Number)[1]
  const moveType = query.data.trim().split(" ")[2]
  const moveName = query.data.trim().split(" ")[4]
  const randomMove = Math.floor(Math.random() * (opponentPokemon.moves.length-1 - 0) + 0)
  const botMovePower = opponentPokemon.moves[randomMove].power
  const botMoveType = opponentPokemon.moves[randomMove].type
  const botMoveName = opponentPokemon.moves[randomMove].name
  // const moveAccuracy = query.data.trim().split(" ")[3].map(Number)


  const myDamage = await calculateDamage(trainerPokemon , opponentPokemon ,movePower , moveType)
  const botDamage = await calculateDamage(opponentPokemon , trainerPokemon , botMovePower , botMoveType)
  
  opponentPokemon.stats.currenthp = opponentPokemon.stats.currenthp - myDamage.Damage
  trainerPokemon.stats.currenthp = trainerPokemon.stats.currenthp - botDamage.Damage
  
  if(trainerPokemon.stats.currenthp < 0) {
    trainerPokemon.stats.currenthp = 0
  }
  if(opponentPokemon.stats.currenthp < 0) {
    opponentPokemon.stats.currenthp = 0
  }
  
  const botHP = opponentPokemon.stats.currenthp / botTotalHP * 100
  const trainerHP = trainerPokemon.stats.currenthp / trainerTotalHP * 100
  let moves_message = ""
  trainerPokemon.moves.forEach((ele) => {
    let [first , second] = ele.name.split("-")
    first = first.charAt(0).toUpperCase() + first.slice(1)
     const text = `${second ? first+" "+second : first}`
     
     moves_message+=`${text} [${ele.type}]
Power:   ${ele.power},     Accuracy: ${ele.accuracy}
`
      
  })
  
  
  const trainerProgressBar = progressBar(trainerHP)
  const BotProgressBar =  progressBar(botHP)

  
  let Prev_message = `${opponentPokemon.name.charAt(0).toUpperCase() + opponentPokemon.name.slice(1)} used <b>${botMoveName}</b>.
${botDamage.message}.
Dealt ${botDamage.Damage} damage.

Wild <b>${opponentPokemon.name}</b> [${opponentPokemon.type.join(", ")}]
Lv. ${opponentPokemon.level}  •  HP <b>${opponentPokemon.stats.currenthp}/${botTotalHP}</b>
${BotProgressBar}

Current turn: <a href="tg://user?id=${query.from.id}">${query.from.first_name}</a>
<b>${trainerPokemon.name}</b> [${trainerPokemon.type.join(", ")}]
Lv. ${trainerPokemon.level}  •  HP <b>${trainerPokemon.stats.currenthp}/${trainerTotalHP}</b>
${trainerProgressBar}

${moves_message}`
  
  
  const myDamageMsg = `${trainerPokemon.name} used <b>${ProperMoveName(moveName)}</b>.
${myDamage.message}.
Dealt ${myDamage.Damage} damage.

${opponentPokemon.name.charAt(0).toUpperCase()+opponentPokemon.name.slice(1)} attacking...
`
  
  bot.editMessageText(myDamageMsg , {
    chat_id : chatId ,
    message_id: query.message.message_id,
    parse_mode : 'HTML'
  })
  
  setTimeout(() => {
    
    
    if(trainerPokemon.stats.currenthp === 0) {
      isBattleActive = false
      getPreviousMessageId(() => {
        return null
      })
      let botWinMessage = `${opponentPokemon.name.charAt(0).toUpperCase()+opponentPokemon.name.slice(1)} used <b>${ProperMoveName(botMoveName)}</b>.
${trainerPokemon.name.charAt(0).toUpperCase()+trainerPokemon.name.slice(1)} fainted.

Your entire team has fainted and the wild ${opponentPokemon.name.charAt(0).toUpperCase()+opponentPokemon.name.slice(1)} has fled.`
      
      bot.editMessageText(botWinMessage , {
    chat_id : chatId ,
    message_id: messageId,
    parse_mode : 'HTML'
     })
     
    } else if (opponentPokemon.stats.currenthp === 0) {
      isBattleActive = false
      getPreviousMessageId(() => {
        return null
      })
      let weWinMessage = `${trainerPokemon.name.charAt(0).toUpperCase()+trainerPokemon.name.slice(1)} used <b>${ProperMoveName(moveName)}</b>.
<i>${myDamage.message}</i>

The wild ${opponentPokemon.name.charAt(0).toUpperCase()+opponentPokemon.name.slice(1)} fainted.

+7 💵` 
          
       bot.editMessageText(weWinMessage , {
    chat_id : chatId ,
    message_id: messageId,
    parse_mode : 'HTML'
  })
    }
     else {
      
        bot.editMessageText(Prev_message , {
    chat_id : chatId ,
    message_id: messageId,
    parse_mode : 'HTML'
  }).then(async () => {
    await bot.editMessageReplyMarkup({
      inline_keyboard : Prevkeyboard
    } , {
      chat_id : chatId,
      message_id : messageId
    })
  })
        
    }
    
  } , 2000)
  
  bot.answerCallbackQuery(query.id)
  
  
 
 




// Bulbasaur is attacking...
 
  
}


function progressBar(hp) {
  

  const progressBarLength = 10; // Length of the progress bar
  const progressBarFilled = Math.round((hp / 100) * (progressBarLength)); // Calculate the filled portion of the progress bar
  const progressBarEmpty = progressBarLength - progressBarFilled; // Calculate the empty portion of the progress bar

  const progressBar = '█'.repeat(progressBarFilled) + '▒'.repeat(progressBarEmpty);
  
  return progressBar
}

async function getTrainerPokemon(userId) {
  
    const pokeDetail = await userPokeModal.findOne({trainer : userId}).maxTime(30000)
  
     const level = pokeDetail.level
     const pokeMoves = pokeDetail.moves;
      const types = pokeDetail.type;
      const abilities = pokeDetail.abilities;
      const baseStats = pokeDetail.baseStats;
      const pokeEVs = pokeDetail.ev
      const experience = pokeDetail.experience
      const pokeNat = pokeDetail.nature
      const pokeIVs = pokeDetail.iv
      
  const mainStats = mainPokemonStats(baseStats , pokeIVs , pokeEVs , level , pokeNat)
  
   const myPokemon = {
      name : pokeDetail.nickname ? pokeDetail.nickname : pokeDetail.name,
      level,
      type : types,
      stats : mainStats,
      moves : pokeMoves,
   }
    
    return myPokemon
    
  
}

async function getOpponentPokemon(pokeDetail , pokeLvl , pokemonName) {
  
      const moves = pokeDetail.data.moves;
      const types = pokeDetail.data.types;
      const abilities = pokeDetail.data.abilities;
      const stats = pokeDetail.data.stats;
      

  const pokeTypes = getTypes(types);
  const pokeMoves = await getMoves(moves, pokeLvl);
  const pokeAbilities = await getAbilites(abilities);
  const pokeBaseStats = getBaseStats(stats);
  const pokeNat = await generateNat();
  const pokeIVs = generateIVs();
  const pokeEVs = generateEVs()
  const pokeExp = await getExperience(pokeLvl, pokemonName);
  const mainStats = mainPokemonStats(pokeBaseStats , pokeIVs , pokeEVs , pokeLvl , pokeNat)
  

   const BattlePokemon = {
      name : pokemonName,
      level : pokeLvl,
      iv : pokeIVs,
      ev : pokeEVs,
      experience : pokeExp,
      type : pokeTypes,
      stats : mainStats,
      moves : pokeMoves,
      
   }
   
   return BattlePokemon
}

function ProperMoveName(moveName) {
  let [first , second] = moveName.trim().split("-")
  
  first = first.charAt(0).toUpperCase()+first.slice(1)
  second = second && second.charAt(0).toUpperCase()+second.slice(1)

  const fullMoveName = second ? `${first} ${second}` : first
  
  return fullMoveName
}

module.exports = { battle  , battleBeginFight , 
 statusBattleActive : () => isBattleActive
};
