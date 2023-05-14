const {userPokeModal} = require('../model/userPoke')
const { ProperMoveName, battle, battleBeginFight } = require('./battle.controller')

async function myPokemonTeam(bot , query) {
    
    const userTeamLoad = 1
    const chatId = query.message.chat.id
    const userId = query.from.id
    
    
    try {
        
        const myPokemonTeam = await userPokeModal.find({trainer : userId , group : userTeamLoad}).limit(6)
        const inline_team = []
        
        let trainerPoke = []
        myPokemonTeam.forEach((el) => {
            trainerPoke.push({
                text : el.nickname ? ProperMoveName(el.name) : ProperMoveName(el.name),
                callback_data : `changepokemon ${el._id}`
            })
            
            if(trainerPoke.length%2 == 0) {
                inline_team.push(trainerPoke)
                trainerPoke = []
            } 
        })
        inline_team.push([{
            text : "🔙",
            callback_data : 'poke-back'
        }])
        
        
        if(myPokemonTeam.length <= 1 ) {
            bot.answerCallbackQuery(query.id  , 'You have no more pokemon')
        } else {
            bot.editMessageReplyMarkup({inline_keyboard : inline_team} , {
                chat_id : chatId,
                message_id : query.message.message_id
            })

        }
        

        
    }
     catch(err) {
         console.log(err)
     }
}

function changeBattlePokemon(bot , query) {
    const pokeId = query.data.trim().split(" ")[1]
    
    
    
    try {
        battleBeginFight(bot , query , 'changePokemon' , pokeId)
    } catch(err) {
        console.log(err )
    }
}

module.exports = {myPokemonTeam , changeBattlePokemon}