const { default: axios } = require("axios");
const { userPokeModal } = require("../model/userPoke");
const { makeProperName } = require("./pokemon.controller");

async function evolveCommand(bot , msg , match) {
    const userId = msg.from.id
    const chatId = msg.chat.id
    
    const product = match.input.trim().split(" ")[1].toLowerCase();
    
    
    if(!product) {
      return bot.sendMessage(chatId , "Format: /evolve <pokemon name>" , {
          reply_to_message_id : msg.message_id
      })
    } 
    
    const evolve_pokemon = await userPokeModal.find({trainer : userId })
    
    const suggestPokemon = evolve_pokemon.filter(el => {
        return el.nickname ? el.nickname.toLowerCase().includes(product) :  el.name.toLowerCase().includes(product)
    }).map((el) => {
        return {
            name : el.name,
            poke_id : String(el._id)
        }
    })
    
    if(suggestPokemon.length === 0) {
        bot.sendMessage(chatId , 'You do not have this pokemon/invalid pokemon' , {
            reply_to_message_id : msg.message_id
        })
    } else if(suggestPokemon.length !== 0 && suggestPokemon[0].name !== product) {
        bot.sendMessage(chatId , `Did you mean: <b>${makeProperName(suggestPokemon[0].name)}</b>` , {
            reply_to_message_id : msg.message_id,
            parse_mode :'HTML',
            reply_markup : {
                inline_keyboard : [
                    [
                    {text : 'Yes' , callback_data : `suggest evolve ${suggestPokemon[0].name}`},
                    {text : 'No' , callback_data : 'suggest no'}
                    ]
                ]
            }
        })
    }
    
  
    
    
}
async function suggestPokemon(bot , query) {

    const NoAnySuggest = query.data.trim().split(" ")[1]
    const chatId = query.message.chat.id
    const userId = query.from.id
    
    if(NoAnySuggest === 'no') {
       bot.deleteMessage(chatId, query.message.message_id);
        const evolve_pokemon = await userPokeModal.find({trainer : userId , $or : [ 
    } else if(NoAnySuggest === 'evolve') {
        const pokeName = query.data.trim().split(" ")[2]
            {nickname : pokeName},
            {name : pokeName}
        ]})
        
        if(evolve_pokemon.length === 1) {
            if(evolve_pokemon[0].isReadytoEvolve.ready) {
                const pokeDetail = await axios.get(`https://pokeapi.co/api/v2/pokemon/${evolve_pokemon[0].name }`)
                const evolvePoke_name = evolve_pokemon[0].name
                const stats = pokeDetail.data.stats
                
            }
        }
    }
}

module.exports = {evolveCommand , suggestPokemon}