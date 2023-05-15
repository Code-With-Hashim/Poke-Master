const { endBattle } = require("../Controller/battle.fnc")
const { makeProperName, getPokemonMoves, previousPokemonname } = require("../Controller/pokemon.controller")

function battleBeginMsg({pokemonName , wildPokemon , trainerBattlePokemon , query , pokeLvl , moves_message}) {
      const BattleBeginMsg =  ` Battle begins!
    
    Wild <b>${makeProperName(pokemonName)}</b> [${wildPokemon.type.join(", ")}]
    Lv. ${pokeLvl}  •  HP ${wildPokemon.stats.totalhp}/${
              wildPokemon.stats.totalhp
            }
    ███████████
    
    Current turn: <a href="tg://user?id=${query.from.id}">${
              query.from.first_name
            }</a>
    <b>${makeProperName(trainerBattlePokemon.name)}</b> [${trainerBattlePokemon.type.join(", ")}]
    Lv. ${trainerBattlePokemon.level}  •  HP ${
              trainerBattlePokemon.stats.totalhp
            }/${trainerBattlePokemon.stats.totalhp}
    ███████████
    
    ${moves_message}`
  
  
  return BattleBeginMsg
}

function fledPokemonMsg(pokemonName) {
   let pokeMonChanceMsg =  `Lower ${makeProperName(pokemonName)}'s HP for a batter chance of catching it`
   
   return pokeMonChanceMsg
}

function movesMsg(pokemonMoves) {
    
    let moves_message = ""
    
    pokemonMoves.forEach((ele) => {
      let [first, second] = ele.name.split("-");
      first = first.charAt(0).toUpperCase() + first.slice(1);
      const text = `${second ? first + " " + second : first}`;

      moves_message += `${text} [${ele.type}]
  Power:   ${ele.power},     Accuracy: ${ele.accuracy}
  `;
    })
    
    return moves_message
}

function battleBeginMoves({  wildPokemon , userId , botMoveName , botDamage , botTotalHP , BotProgressBar , query , trainerBattlePokemon , moves_message , trainerProgressBar , command }) {
  
  let firstline = ""
  let battleBeginMovesMsg =  `${makeProperName(wildPokemon.name)} used <b>${botMoveName}</b>.
  ${botDamage.message}.
  Dealt ${botDamage.Damage} damage.
  
  Wild <b>${makeProperName(wildPokemon.name)}</b> [${wildPokemon.type.join(", ")}]
  Lv. ${wildPokemon.level}  •  HP <b>${
      wildPokemon.stats.currenthp
    }/${botTotalHP}</b>
  ${BotProgressBar}
  
  Current turn: <a href="tg://user?id=${query.from.id}">${
      query.from.first_name
    }</a>
  <b>${makeProperName(trainerBattlePokemon.name)}</b> [${trainerBattlePokemon.type.join(", ")}]
  Lv. ${trainerBattlePokemon.level}  •  HP <b>${
      trainerBattlePokemon.stats.currenthp
    }/${ trainerBattlePokemon.stats.totalhp}</b>
  ${trainerProgressBar}
  
  ${moves_message}`;
  
  if(command === 'changePokemon') {
      if(trainerBattlePokemon.stats.speed > wildPokemon.stats.speed) {
          firstline+=`${makeProperName(previousPokemonname(userId).name)} switched out, ${makeProperName(trainerBattlePokemon.name)} is now on the battle field.\n ${makeProperName(trainerBattlePokemon.name)}'s speed advantage allows it to move first. \n\n`
          firstline+=`Wild <b>${makeProperName(wildPokemon.name)}</b> [${wildPokemon.type.join(", ")}]
  Lv. ${wildPokemon.level}  •  HP <b>${
      wildPokemon.stats.currenthp
    }/${botTotalHP}</b>
  ${BotProgressBar}
  
  Current turn: <a href="tg://user?id=${query.from.id}">${
      query.from.first_name
    }</a>
  <b>${makeProperName(trainerBattlePokemon.name)}</b> [${trainerBattlePokemon.type.join(", ")}]
  Lv. ${trainerBattlePokemon.level}  •  HP <b>${
      trainerBattlePokemon.stats.currenthp
    }/${ trainerBattlePokemon.stats.totalhp}</b>
  ${trainerProgressBar}
  
  ${moves_message}`
  return firstline
      } else {
           firstline+=`${makeProperName(previousPokemonname(userId).name)} switched out, ${makeProperName(trainerBattlePokemon.name)} is now on the battle field.
          ${makeProperName(wildPokemon.name)}'s speed advantage allows it to move first. \n\n`
          battleBeginMoves+=firstline
      }
  }
  
  
  return battleBeginMovesMsg
}

function WildPokemonOutMsg({trainerBattlePokemon , wildPokemon , userId , moveName , myDamage}) {
     if(wildPokemon.stats.currenthp <= 0) {
         const wildPokemonfaint = `${makeProperName(trainerBattlePokemon.name)} used <b>${makeProperMoveName(moveName)}</b>.
  <i>${myDamage.message}</i>
  
  The wild ${makeProperName(wildPokemon.name)} fainted.
  
  +7 💵`
  endBattle(userId)
  return wildPokemonfaint
     } else {
         const wildPokemonAttackingMsg = `${makeProperName(trainerBattlePokemon.name)} used <b>${makeProperMoveName(moveName)}</b>. \n ${myDamage.message}. \n Dealt ${myDamage.Damage} damage.
  
${makeProperName(wildPokemon.name)} attacking...`

return wildPokemonAttackingMsg
     }
     
}

function changePokemonMsgAttack({userId , trainerBattlePokemon , wildPokemon}) {
    
    if(previousPokemonname(userId).currenthp > 0) {
        const changePokemessage = `${makeProperName(
        previousPokemonname(userId).name
      )} switched out, ${makeProperName(
        trainerBattlePokemon.name
      )} is now on the battle field. \n\n ${makeProperName(
        wildPokemon.name
      )} is attacking...`;
      
      return changePokemessage
    } else if(wildPokemon.stats.speed > trainerBattlePokemon.stats.speed) {
        const changePokemessage = `${makeProperName(
        previousPokemonname(userId).name
      )} switched out, ${makeProperName(
        trainerBattlePokemon.name
      )} is now on the battle field. \n\n ${makeProperName(
        wildPokemon.name
      )} is attacking...`;
      
      return changePokemessage
    }
      
      
}


function makeProperMoveName(moveName) {
  // console.log(moveName)
  console.log(moveName)
  let [first, second] = moveName.trim().split("-");

  first = first.charAt(0).toUpperCase() + first.slice(1);
  second = second && second.charAt(0).toUpperCase() + second.slice(1);

  const fullMoveName = second ? `${first} ${second}` : first;

  return fullMoveName;
}


function choosePokemonMsgwhileBattle({trainerBattlePokemon , trainerProgressBar , wildPokemon , userId , botMoveName , BotProgressBar , query })  {
    let firstLine = ""
        
    let message = `${makeProperName(wildPokemon.name)} used <b>${makeProperMoveName(botMoveName)}</b>.
${makeProperName(previousPokemonname(userId).name)} fainted.

Wild <b>${makeProperName(wildPokemon.name)}</b> [${wildPokemon.type.join(", ")}]
  Lv. ${wildPokemon.level}  •  HP <b>${
      wildPokemon.stats.currenthp
    }/${wildPokemon.stats.totalhp}</b>
  ${BotProgressBar}
  
  Current turn: <a href="tg://user?id=${query.from.id}">${
      query.from.first_name
    }</a>
  <b>${makeProperName(previousPokemonname(userId).name)}</b> [${trainerBattlePokemon.type.join(", ")}]
  Lv. ${trainerBattlePokemon.level}  •  HP <b>${
      trainerBattlePokemon.stats.currenthp
    }/${trainerBattlePokemon.stats.totalhp}</b>
  ${trainerProgressBar}

Choose your next pokemon.`

return message

}



module.exports = {battleBeginMsg ,
 fledPokemonMsg , 
 movesMsg , 
 battleBeginMoves , 
 WildPokemonOutMsg , 
 changePokemonMsgAttack,
 choosePokemonMsgwhileBattle
 }