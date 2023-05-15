const {userPokeModal} = require('../model/userPoke')
const { ProperMoveName, battleBeginFight } = require('./battle.controller')
const { getPokemonTeam, selectPokemon, getPokemonMoves, getCurrentPokemon } = require('./pokemon.controller')


async function myPokemonTeam(bot , query) {
    
    const userTeamLoad = 1
    const chatId = query.message.chat.id
    const userId = query.from.id
    
    
    try {
        
         const inline_team = getPokemonTeam(userId)
        
        inline_team.push([{
            text : "🔙",
            callback_data : 'poke-back'
        }])

        
        // if(mypokemonteam.length <= 1 ) {
        //     bot.answerCallbackQuery(query.id  , 'You have no more pokemon')
        // } else {
            bot.editMessageReplyMarkup({inline_keyboard : inline_team} , {
                chat_id : chatId,
                message_id : query.message.message_id
            })

        // }
        

        
    }
     catch(err) {
         console.log(err)
     }
}

function changeBattlePokemon(bot , query) {
    const pokeId = query.data.trim().split(" ")[1]
    const userId = query.from.id
     const currentPokemon = getCurrentPokemon(userId)
    
    try {
        
        if(currentPokemon.poke_id === pokeId) {
            bot.answerCallbackQuery(query.id , "You're already play with pokemon")
        } else {
            battleBeginFight(bot , query , 'changePokemon' , pokeId)
        }
        
    } catch(err) {
        console.log(err )
    }
}

module.exports = {myPokemonTeam , changeBattlePokemon}