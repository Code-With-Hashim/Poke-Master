const { userPokeModal } = require("../model/userPoke")
const { canHunt, isBattleActive } = require("./battle.fnc")

const usersPokemon = {}

// const emptyArray = Array(3).fill(Array(2).fill({text : '' , callback_data : 'empty'}))

function getBattleWildPokemon (trainerPokemon , opponentPokemon , userId) {
    usersPokemon[userId] = {
        wildPokemon : opponentPokemon,
        trainerPokemons : trainerPokemon,
        selectPokemon : trainerPokemon[0],
        teamLoad :  [],
        allFeint : [],
        previousPokemon : null
    }
    
    return usersPokemon[userId]
    
}

function selectPokemon(userId , pokeId) {
     usersPokemon[userId].previousPokemon = usersPokemon[userId].selectPokemon

   
    if(pokeId) {
        const selectPokemon = usersPokemon[userId].trainerPokemons.filter(el => el.poke_id === pokeId)[0]
        usersPokemon[userId].selectPokemon = selectPokemon
        
         return usersPokemon[userId].selectPokemon
    } else {
        
        return usersPokemon[userId].selectPokemon
        
    }
}

function previousPokemonname(userId) {
    const name = usersPokemon[userId].previousPokemon.nickname ? usersPokemon[userId].previousPokemon.nickname : usersPokemon[userId].previousPokemon.name
    const currenthp = usersPokemon[userId].previousPokemon.stats.currenthp
    
    return {
        name , 
        currenthp
    }
}

function dealtDamage(bot , query ,  botDamage , myDamage , userId , pokeId) {
        
    const selectPokemonId = usersPokemon[userId].selectPokemon.poke_id
    
    // console.log('line : 50', botDamage.Damage , myDamage.Damage)
    
    usersPokemon[userId].trainerPokemons.forEach((el) => {
        if(el.poke_id === selectPokemonId) {
          el.stats.currenthp =  el.stats.currenthp - botDamage.Damage
        }
    })
    
    usersPokemon[userId].wildPokemon.stats.currenthp = usersPokemon[userId].wildPokemon.stats.currenthp - myDamage.Damage
    
    usersPokemon[userId].trainerPokemons.forEach((el) => {
        if(el.stats.currenthp <= 0) {
           el.isFeint = true
        }
    })
    
    usersPokemon[userId].trainerPokemons.forEach((el) => {
        if(el.isFeint) {
            usersPokemon[userId].allFeint.forEach((ele , index ) => {
                if(ele === el.poke_id) {
                    usersPokemon[userId].allFeint.splice(index , 1)
                }
            })
            usersPokemon[userId].allFeint.push(el.poke_id)
            
        }
    })
    
    
    
}

function getPokemonMoves(selectPokemon)  {
    const moves_list = [
        [],
        []
    ]
    selectPokemon.forEach(ele => {
         let [first, second] = ele.name.split("-");
          first = first.charAt(0).toUpperCase() + first.slice(1);
          const text = `${second ? first + " " + second : first}`;
          const callback_data = `fight ${ele.power} ${ele.type} ${ele.accuracy} ${text}`;
          
          if (moves_list[0].length !== 2) {
            moves_list[0].push({
            text,
            callback_data,
          });
          } else if(moves_list[1].length !== 2) {
            moves_list[1].push({
            text,
            callback_data,
          }); 
           }
    })
    
    moves_list.push([
          { text: "Poke Balls", callback_data: "mypokeballs" },
          { text: "Run", callback_data: "game_left" },
          { text: "Pokemon", callback_data: "mypokemonTeam" },
        ]);
    
    return moves_list
}

function getWildPokemon(userId) {
    
    const wildPokemon = usersPokemon[userId].wildPokemon
    
    return wildPokemon
}

function getPokemonTrainerList(userId) {
    const trainerPokemons = usersPokemon[userId].trainerPokemons

    
    return trainerPokemons
}

async function myPokemonTeam(bot , query , message) {
    
    const userId = query.from.id
    const chatId = query.message.chat.id
    const messageId = query.message.message_id
    
    
    
    const inline_team = getPokemonTeam(userId)
       isBattleActive(userId) && bot.editMessageText(message , {
            chat_id : chatId,
            message_id : messageId,
            parse_mode : 'HTML'
        }).then(() => {
            bot.editMessageReplyMarkup({inline_keyboard : inline_team} , {
                chat_id : chatId,
                message_id : query.message.message_id
            })
        })


}


function getPokemonTeam(userId) {
    const numRows = 3; // Number of rows
    const numColumns = 2; // Number of columns

    let count = 0;
    usersPokemon[userId].teamLoad = [];

    for (let i = 0; i < numRows; i++) {
        const row = [];
        for (let j = 0; j < numColumns; j++) {
            if (count < usersPokemon[userId].trainerPokemons.length) {
                const pokemon = usersPokemon[userId].trainerPokemons[count];
                row.push({
                    text: pokemon.isFeint ? " " : pokemon.nickname ? makeProperName(pokemon.nickname) : makeProperName(pokemon.name),
                    callback_data: pokemon.isFeint ? 'feint' : `changepokemon ${pokemon.poke_id}`
                });
            } else {
                row.push({
                    text: ' ',
                    callback_data: 'empty'
                });
            }
            count++;
        }
        usersPokemon[userId].teamLoad.push(row);
    }

    return usersPokemon[userId].teamLoad
    // return { trainerPokemons, teamLoadPokemon }
}


function makeProperName(pokeName) {
    const name = pokeName.charAt(0).toUpperCase() + pokeName.slice(1)
    
    return name
}

function getCurrentPokemon(userId) {
    const currentPokemon = usersPokemon[userId].selectPokemon
    
    return currentPokemon
}

// userId , mypokeId , myPokeLvl , myPokecurrentExp , newMoves+

function getGainPokeExp(userId , pokeId , newLevel , gainExp , newMoves) {
    
    
   if(pokeId !== 'wild') {     
    usersPokemon[userId].trainerPokemons.forEach(async(el) => {
        if(el.poke_id === pokeId) {
             const newUpdate = {
               experience :  el.experience = gainExp,
            level : el.level = newLevel,
            moves : el.moves = newMoves
             } 
            
            userPokeModal.findByIdAndUpdate({_id : el.poke_id} , {...newUpdate}, {new : true}).then(() => console.log("Update thing"))
        }
    })
    } else {
        usersPokemon[userId].wildPokemon.experience = gainExp
        usersPokemon[userId].wildPokemon.level = newLevel
        usersPokemon[userId].wildPokemon.moves = newMoves
    }
    
}

function isAllTeamFaint(userId) {
    
    console.log('line : 217' , usersPokemon[userId].allFeint)
    
    if(usersPokemon[userId].allFeint.length === usersPokemon[userId].trainerPokemons.length) {
        return true
    }
    
    
}


function gainEvsWild(userId , wildPokemon) {
    usersPokemon[userId].wildPokemon = {...wildPokemon}
}

function gainEVstrainer(userId , currentPokemon) {
    const poke_id = currentPokemon.poke_id
    
    usersPokemon[userId].trainerPokemons.forEach(el => {
        if(el.poke_id === poke_id) {
            el.ev = {...currentPokemon.ev}
      
             userPokeModal.findByIdAndUpdate({_id : el.poke_id} , {...el}, {new : true}).then(() => console.log("Update EV Successfully"))
        }
    })
    
}

module.exports = {previousPokemonname , 
getBattleWildPokemon , 
getPokemonMoves , 
selectPokemon , 
dealtDamage , 
getWildPokemon , 
getPokemonTeam , 
makeProperName , 
myPokemonTeam,
getCurrentPokemon,
getPokemonTrainerList,
getGainPokeExp,
isAllTeamFaint,
gainEvsWild,
gainEVstrainer
}