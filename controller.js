const axios = require('axios')

async function fetchKantoPokemon () {
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=151'
    try {
        
        const kantoPokemon = await axios.get(url)

        console.log(kantoPokemon)

    } catch (error) {
        console.log(error)
    }
}

module.exports = {fetchKantoPokemon}